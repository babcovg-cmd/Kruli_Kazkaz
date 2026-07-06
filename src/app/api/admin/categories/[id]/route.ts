// Обновление / удаление категории. При переименовании синхронизируем туры.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { categorySchema } from "@/lib/validation";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("tours");
  } catch (res) {
    return res as Response;
  }
  const { id } = await params;

  const current = await prisma.category.findUnique({ where: { id } });
  if (!current) return NextResponse.json({ error: "Категория не найдена" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Проверьте поля", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }
  const data = parsed.data;

  // Имя должно оставаться уникальным.
  if (data.name !== current.name) {
    const clash = await prisma.category.findUnique({ where: { name: data.name } });
    if (clash) {
      return NextResponse.json(
        { error: "Название занято", issues: { name: ["Название занято"] } },
        { status: 409 }
      );
    }
  }

  // Транзакция: обновляем категорию и (при переименовании) все туры этой категории.
  const [category] = await prisma.$transaction([
    prisma.category.update({ where: { id }, data }),
    ...(data.name !== current.name
      ? [prisma.tour.updateMany({ where: { category: current.name }, data: { category: data.name } })]
      : []),
  ]);

  return NextResponse.json(category);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("tours");
  } catch (res) {
    return res as Response;
  }
  const { id } = await params;

  const current = await prisma.category.findUnique({ where: { id } });
  if (!current) return NextResponse.json({ error: "Категория не найдена" }, { status: 404 });

  // Нельзя удалить категорию, в которой есть туры.
  const used = await prisma.tour.count({ where: { category: current.name } });
  if (used > 0) {
    return NextResponse.json(
      { error: `Нельзя удалить: в категории ${used} тур(ов). Сначала перенесите их в другую категорию.` },
      { status: 400 }
    );
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
