// Раздел «Туры»: таблица всех туров.

import Link from "next/link";
import Topbar from "@/components/admin/Topbar";
import ToursTable from "@/components/admin/ToursTable";
import { prisma } from "@/lib/prisma";
import { parseImages, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminToursPage() {
  const tours = await prisma.tour.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  const rows = tours.map((t) => ({
    id: t.id,
    title: t.title,
    slug: t.slug,
    duration: t.duration,
    category: t.category,
    priceLabel: formatPrice(t.price, t.priceOnReq),
    cover: parseImages(t.images)[0] ?? null,
    scene: t.scene,
    isActive: t.isActive,
  }));

  return (
    <>
      <Topbar
        title="Туры"
        action={
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/admin/tours/categories" className="abtn abtn-ghost abtn-sm">
              Категории
            </Link>
            <Link href="/admin/tours/new" className="abtn abtn-gold abtn-sm">
              + Добавить тур
            </Link>
          </div>
        }
      />
      <div className="admin-body">
        <ToursTable initial={rows} />
      </div>
    </>
  );
}
