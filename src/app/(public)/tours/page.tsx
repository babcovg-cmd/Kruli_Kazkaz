// Каталог туров (/tours).

import type { Metadata } from "next";
import CatalogClient from "@/components/public/CatalogClient";
import { getActiveTours } from "@/lib/data";
import { getSettings } from "@/lib/settings";
import { getCategories } from "@/lib/categories";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: s.seoCatalogTitle,
    description: s.seoCatalogDesc,
    keywords: s.seoCatalogKeywords,
    alternates: { canonical: "/tours" },
    openGraph: {
      title: s.seoCatalogTitle,
      description: s.seoCatalogDesc,
      url: "/tours",
    },
  };
}

export default async function ToursPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const [tours, categories, { cat }] = await Promise.all([
    getActiveTours(),
    getCategories(),
    searchParams,
  ]);

  return (
    <>
      <section style={{ borderBottom: "1px solid var(--line)", background: "var(--bg-2)" }}>
        <div className="wrap" style={{ padding: "48px 24px 40px" }}>
          <span className="eyebrow">Каталог</span>
          <h1 style={{ fontSize: "clamp(34px,5vw,52px)", color: "var(--txt)", margin: "12px 0 8px" }}>
            Туры по Северному Кавказу
          </h1>
          <p className="muted" style={{ fontSize: 16, margin: 0, maxWidth: 560 }}>
            {tours.length} авторских программ по Дагестану и Северной Осетии. Фильтруйте по категории,
            сложности и бюджету.
          </p>
        </div>
      </section>

      <CatalogClient tours={tours} categories={categories.map((c) => c.name)} initialCategory={cat} />
    </>
  );
}
