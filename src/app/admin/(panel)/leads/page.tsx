// Раздел «Заявки».

import Topbar from "@/components/admin/Topbar";
import LeadsTable from "@/components/admin/LeadsTable";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: { tour: { select: { title: true } } },
  });

  const rows = leads.map((l) => ({
    id: l.id,
    createdAt: l.createdAt.toISOString(),
    name: l.name,
    phone: l.phone,
    email: l.email,
    message: l.message,
    people: l.people,
    date: l.date,
    type: l.type,
    status: l.status,
    source: l.source,
    tourTitle: l.tour?.title ?? "",
  }));

  return (
    <>
      <Topbar title="Заявки" />
      <div className="admin-body">
        <LeadsTable initial={rows} />
      </div>
    </>
  );
}
