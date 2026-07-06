// Авторизация админки: подпись/проверка JWT-сессии (jose, edge-совместимо)
// и хранение токена в httpOnly-cookie.

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { parsePermissions, canAccess, type Role, type SectionKey } from "@/lib/permissions";

export const SESSION_COOKIE = "kk_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 дней

export type SessionPayload = {
  sub: string; // id администратора
  login: string;
  name: string;
  role: Role;
  perms: SectionKey[];
};

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET не задан в переменных окружения");
  return new TextEncoder().encode(secret);
}

/** Подписывает JWT с данными администратора. */
export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(getSecret());
}

/** Проверяет токен и возвращает payload либо null. Используется и в middleware. */
export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const role: Role = payload.role === "owner" ? "owner" : "manager";
    const perms = Array.isArray(payload.perms)
      ? parsePermissions(JSON.stringify(payload.perms))
      : [];
    return {
      sub: String(payload.sub),
      login: String(payload.login),
      name: String(payload.name),
      role,
      perms,
    };
  } catch {
    return null;
  }
}

/** Текущая сессия из cookie (для server components и API). */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

/** Устанавливает cookie сессии. */
export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

/** Удаляет cookie сессии (выход). */
export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/**
 * Защита API-роутов: возвращает сессию или бросает Response 401.
 * Использование: `const session = await requireAuth();`
 */
export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Response(JSON.stringify({ error: "Требуется авторизация" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return session;
}

function forbidden(): Response {
  return new Response(JSON.stringify({ error: "Недостаточно прав" }), {
    status: 403,
    headers: { "Content-Type": "application/json" },
  });
}

/** Защита API-роута раздела: требует доступ к указанному разделу. */
export async function requirePermission(section: SectionKey): Promise<SessionPayload> {
  const session = await requireAuth();
  if (!canAccess(session.role, session.perms, section)) throw forbidden();
  return session;
}

/** Защита API управления командой: только владелец. */
export async function requireOwner(): Promise<SessionPayload> {
  const session = await requireAuth();
  if (session.role !== "owner") throw forbidden();
  return session;
}
