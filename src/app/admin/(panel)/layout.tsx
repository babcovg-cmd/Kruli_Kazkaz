// Оболочка панели администратора: сайдбар + основная область.
// Сессия гарантирована middleware; дополнительно берём имя пользователя.

import { redirect } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import { getSession } from "@/lib/auth";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="admin-shell">
      <Sidebar
        userName={session.name}
        userLogin={session.login}
        role={session.role}
        perms={session.perms}
      />
      <div className="admin-main">{children}</div>
    </div>
  );
}
