// Защита админки: все маршруты /admin/* требуют валидной сессии,
// кроме страницы входа /admin/login. Проверка JWT выполняется на edge (jose).

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";
import { sectionForPath, canAccess, canManageUsers, firstAllowedPath } from "@/lib/permissions";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isLogin = pathname === "/admin/login";
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);

  // Неавторизованный пользователь на защищённой странице → на вход.
  if (!session && !isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Уже авторизован и открывает /admin/login → на первую доступную страницу.
  if (session && isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = firstAllowedPath(session.role, session.perms);
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Проверка прав на конкретный раздел.
  if (session) {
    const section = sectionForPath(pathname);
    const denied =
      (section === "users" && !canManageUsers(session.role)) ||
      (section && section !== "users" && !canAccess(session.role, session.perms, section));

    if (denied) {
      const url = req.nextUrl.clone();
      url.pathname = firstAllowedPath(session.role, session.perms);
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
