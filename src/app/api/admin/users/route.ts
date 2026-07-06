// Управление командой (только владелец): список сотрудников и создание новых.

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";
import { adminUserCreateSchema } from "@/lib/validation";

/** Список сотрудников без хэшей паролей. */
export async function GET() {
  try {
    await requireOwner();
  } catch (res) {
    return res as Response;
  }

  const users = await prisma.adminUser.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: { id: true, login: true, name: true, role: true, permissions: true, createdAt: true },
  });
  return NextResponse.json(users);
}

/** Создание нового сотрудника. */
export async function POST(req: Request) {
  try {
    await requireOwner();
  } catch (res) {
    return res as Response;
  }

  const body = await req.json().catch(() => null);
  const parsed = adminUserCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Проверьте поля", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }
  const { name, login, password, role, permissions } = parsed.data;

  const exists = await prisma.adminUser.findUnique({ where: { login } });
  if (exists) {
    return NextResponse.json(
      { error: "Логин занят", issues: { login: ["Такой логин уже есть"] } },
      { status: 409 }
    );
  }

  const user = await prisma.adminUser.create({
    data: {
      name,
      login,
      password: await bcrypt.hash(password, 10),
      role,
      // У владельца доступ ко всему — список разрешений не используется.
      permissions: role === "owner" ? "[]" : JSON.stringify(permissions),
    },
    select: { id: true, login: true, name: true, role: true, permissions: true, createdAt: true },
  });

  return NextResponse.json(user, { status: 201 });
}
