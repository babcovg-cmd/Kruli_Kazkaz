// Управление категориями туров (раздел «Туры»).

import Link from "next/link";
import Topbar from "@/components/admin/Topbar";
import CategoriesManager from "@/components/admin/CategoriesManager";
import { getCategories } from "@/lib/categories";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategories();

  // Сколько туров в каждой категории — чтобы показать и защитить от удаления.
  const grouped = await prisma.tour.groupBy({ by: ["category"], _count: { _all: true } });
  const counts: Record<string, number> = {};
  grouped.forEach((g) => (counts[g.category] = g._count._all));

  const rows = categories.map((c) => ({ ...c, createdAt: c.createdAt.toISOString(), count: counts[c.name] ?? 0 }));

  return (
    <>
      <Topbar
        title="Категории туров"
        action={
          <Link href="/admin/tours" className="abtn abtn-ghost abtn-sm">
            ← К турам
          </Link>
        }
      />
      <div className="admin-body">
        <CategoriesManager initial={rows} />
      </div>
    </>
  );
}
