// Роли и права доступа в админке. Чистый модуль (без Node API) — используется
// и в middleware (edge), и на сервере, и на клиенте.

export type Role = "owner" | "manager";

export type SectionKey = "tours" | "ai" | "leads" | "notifications" | "settings";

/** Разделы панели с правами доступа (порядок = порядок в меню). */
export const ADMIN_SECTIONS: { key: SectionKey; label: string; href: string; ico: string }[] = [
  { key: "tours", label: "Туры", href: "/admin/tours", ico: "◧" },
  { key: "ai", label: "ИИ-консультант", href: "/admin/ai", ico: "✦" },
  { key: "leads", label: "Заявки", href: "/admin/leads", ico: "✉" },
  { key: "notifications", label: "Уведомления в ТГ", href: "/admin/notifications", ico: "🔔" },
  { key: "settings", label: "Настройки сайта", href: "/admin/settings", ico: "⚙" },
];

export const ALL_SECTION_KEYS: SectionKey[] = ADMIN_SECTIONS.map((s) => s.key);

/** Путь раздела управления командой (доступен только владельцу). */
export const USERS_PATH = "/admin/users";

/** Безопасно парсит JSON-массив разрешений. */
export function parsePermissions(json: string | null | undefined): SectionKey[] {
  if (!json) return [];
  try {
    const arr = JSON.parse(json);
    if (!Array.isArray(arr)) return [];
    return arr.filter((x): x is SectionKey => ALL_SECTION_KEYS.includes(x as SectionKey));
  } catch {
    return [];
  }
}

/** Может ли пользователь открыть раздел. Владелец — всё; менеджер — по списку. */
export function canAccess(role: Role | string, perms: SectionKey[], section: SectionKey): boolean {
  return role === "owner" || perms.includes(section);
}

/** Только владелец управляет командой. */
export function canManageUsers(role: Role | string): boolean {
  return role === "owner";
}

/** Определяет раздел по пути (для middleware). null — не привязан к разделу. */
export function sectionForPath(pathname: string): SectionKey | "users" | null {
  if (pathname.startsWith(USERS_PATH)) return "users";
  for (const s of ADMIN_SECTIONS) {
    if (pathname === s.href || pathname.startsWith(s.href + "/")) return s.key;
  }
  return null;
}

/** Первая доступная пользователю страница (куда вести после входа). */
export function firstAllowedPath(role: Role | string, perms: SectionKey[]): string {
  if (role === "owner") return "/admin/tours";
  const first = ADMIN_SECTIONS.find((s) => perms.includes(s.key));
  return first ? first.href : "/admin/no-access";
}
