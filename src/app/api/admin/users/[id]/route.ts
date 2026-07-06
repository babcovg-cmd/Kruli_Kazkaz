// Обновление и удаление сотрудника (только владелец).

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";
import { adminUserUpdateSchema } from "@/lib/validation";

/** Не даём остаться без единственного владельца. */
async function isLastOwner(userId: string): Promise<boolean> {
  const owners = await prisma.adminUser.findMany({ where: { role: "owner" }, select: { id: true } });
  return owners.length <= 1 && owners.some((o) => o.id === userId);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  let session;
  try {
    session = await requireOwner();
  } catch (res) {
    return res as Response;
  }
  const { id } = await params;

  const target = await prisma.adminUser.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "Сотрудник не найден" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = adminUserUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Проверьте поля", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }
  const { name, password, role, permissions } = parsed.data;

  // Нельзя снять роль владельца с самого себя или с последнего владельца.
  if (target.role === "owner" && role !== "owner") {
    if (target.id === session.sub) {
      return NextResponse.json({ error: "Нельзя снять права владельца с самого себя" }, { status: 400 });
    }
    if (await isLastOwner(target.id)) {
      return NextResponse.json({ error: "В системе должен остаться хотя бы один владелец" }, { status: 400 });
    }
  }

  const data: Record<string, unknown> = {
    name,
    role,
    permissions: role === "owner" ? "[]" : JSON.stringify(permissions),
  };
  if (password) data.password = await bcrypt.hash(password, 10);

  const user = await prisma.adminUser.update({
    where: { id },
    data,
    select: { id: true, login: true, name: true, role: true, permissions: true, createdAt: true },
  });
  return NextResponse.json(user);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  let session;
  try {
    session = await requireOwner();
  } catch (res) {
    return res as Response;
  }
  const { id } = await params;

  if (id === session.sub) {
    return NextResponse.json({ error: "Нельзя удалить собственный аккаунт" }, { status: 400 });
  }

  const target = await prisma.adminUser.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "Сотрудник не найден" }, { status: 404 });

  if (target.role === "owner" && (await isLastOwner(target.id))) {
    return NextResponse.json({ error: "Нельзя удалить последнего владельца" }, { status: 400 });
  }

  await prisma.adminUser.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
