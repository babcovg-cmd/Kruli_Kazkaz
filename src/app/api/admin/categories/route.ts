// Категории туров (доступ — раздел «Туры»): список и создание.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { categorySchema } from "@/lib/validation";

export async function GET() {
  try {
    await requirePermission("tours");
  } catch (res) {
    return res as Response;
  }
  const list = await prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  try {
    await requirePermission("tours");
  } catch (res) {
    return res as Response;
  }

  const body = await req.json().catch(() => null);
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Проверьте поля", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const exists = await prisma.category.findUnique({ where: { name: parsed.data.name } });
  if (exists) {
    return NextResponse.json(
      { error: "Категория с таким названием уже есть", issues: { name: ["Название занято"] } },
      { status: 409 }
    );
  }

  const category = await prisma.category.create({ data: parsed.data });
  return NextResponse.json(category, { status: 201 });
}
