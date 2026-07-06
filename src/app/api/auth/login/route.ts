// Вход в админку: проверка логина/пароля (bcrypt) и установка JWT-cookie.

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";
import { signSession, setSessionCookie } from "@/lib/auth";
import { parsePermissions, type Role } from "@/lib/permissions";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Введите логин и пароль" }, { status: 422 });
  }

  const { login, password } = parsed.data;
  const user = await prisma.adminUser.findUnique({ where: { login } });

  // Одинаковый ответ при неверном логине и пароле — не раскрываем, что именно неверно.
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 });
  }

  const role: Role = user.role === "owner" ? "owner" : "manager";
  const token = await signSession({
    sub: user.id,
    login: user.login,
    name: user.name,
    role,
    perms: role === "owner" ? [] : parsePermissions(user.permissions),
  });
  await setSessionCookie(token);

  return NextResponse.json({ ok: true });
}
