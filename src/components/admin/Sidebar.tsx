"use client";

// Боковое меню админки + выход.

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ADMIN_SECTIONS,
  canAccess,
  canManageUsers,
  USERS_PATH,
  type Role,
  type SectionKey,
} from "@/lib/permissions";

export default function Sidebar({
  userName,
  userLogin,
  role,
  perms,
}: {
  userName: string;
  userLogin: string;
  role: Role;
  perms: SectionKey[];
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Пункты меню по правам доступа.
  const nav = ADMIN_SECTIONS.filter((s) => canAccess(role, perms, s.key));

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <nav className="admin-sidebar">
      <div className="admin-brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/logo-mark.png" alt="" />
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Крылья Кавказа</div>
          <div style={{ fontSize: 10.5, color: "#9a8a6a", letterSpacing: ".08em" }}>
            Панель управления
          </div>
        </div>
      </div>

      {nav.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} className={`admin-navitem ${active ? "active" : ""}`}>
            <span className="ico">{item.ico}</span>
            {item.label}
          </Link>
        );
      })}

      {canManageUsers(role) && (
        <Link
          href={USERS_PATH}
          className={`admin-navitem ${pathname.startsWith(USERS_PATH) ? "active" : ""}`}
        >
          <span className="ico">👤</span>
          Сотрудники
        </Link>
      )}

      <Link href="/" target="_blank" className="admin-navitem" style={{ marginTop: 12 }}>
        <span className="ico">↗</span>
        Открыть сайт
      </Link>

      <div className="admin-user">
        <span className="admin-avatar">{initials || "А"}</span>
        <div style={{ fontSize: 13, minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 600 }}>{userName}</div>
          <div style={{ color: "#9aa0ac", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis" }}>
            {role === "owner" ? "Владелец" : "Менеджер"} · {userLogin}
          </div>
        </div>
        <button onClick={logout} className="alink" title="Выйти" style={{ fontSize: 12 }}>
          Выйти
        </button>
      </div>
    </nav>
  );
}
