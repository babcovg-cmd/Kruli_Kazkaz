// Раздел «Сотрудники» — управление админ-аккаунтами и правами (только владелец).

import { redirect } from "next/navigation";
import Topbar from "@/components/admin/Topbar";
import UsersManager from "@/components/admin/UsersManager";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "owner") redirect("/admin/no-access");

  const users = await prisma.adminUser.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: { id: true, login: true, name: true, role: true, permissions: true, createdAt: true },
  });

  // Сериализуем дату для клиента.
  const rows = users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }));

  return (
    <>
      <Topbar title="Сотрудники" />
      <div className="admin-body">
        <UsersManager initial={rows} currentUserId={session.sub} />
      </div>
    </>
  );
}
