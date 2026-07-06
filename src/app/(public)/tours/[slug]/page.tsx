// Страница тура (/tours/[slug]).

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Scene from "@/components/Scene";
import TourTabs from "@/components/public/TourTabs";
import TourBooking from "@/components/public/TourBooking";
import { getTourBySlug } from "@/lib/data";
import { SCENES } from "@/lib/constants";

// Контент управляется из админки — рендерим динамически, чтобы правки
// отображались сразу без пересборки.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
  if (!tour) return { title: "Тур не найден" };

  const title = tour.metaTitle || tour.title;
  const description = tour.metaDescription || tour.shortDesc;

  return {
    title,
    description,
    alternates: { canonical: `/tours/${tour.slug}` },
    openGraph: {
      title,
      description,
      url: `/tours/${tour.slug}`,
      type: "article",
      images: tour.cover ? [{ url: tour.cover }] : undefined,
    },
  };
}

export default async function TourPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
  if (!tour) notFound();

  // Галерея: реальные фото, либо набор градиент-сцен как в макете.
  const gallery =
    tour.imageList.length > 0
      ? tour.imageList
      : null;

  const facts: [string, string][] = [
    ["Длительность", tour.duration || "—"],
    ["Сложность", tour.difficulty],
    ["Возраст", tour.ageLimit],
  ];

  return (
    <>
      {/* Hero-фото */}
      <Scene
        scene={tour.scene}
        image={tour.cover}
        alt={tour.title}
        style={{ height: 420, display: "flex", alignItems: "flex-end" }}
      >
        <div className="wrap" style={{ position: "relative", zIndex: 3, paddingBottom: 36, width: "100%" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            <span className={`badge ${tour.badgeClass}`}>{tour.category}</span>
            <span className="badge b-terra">{tour.duration}</span>
            <span className="badge b-blue">{tour.ageLimit}</span>
          </div>
          <h1 style={{ fontSize: "clamp(34px,5.5vw,56px)", color: "#F4F1E7", margin: 0, maxWidth: 760 }}>
            {tour.title}
          </h1>
          <p style={{ color: "rgba(244,241,231,0.85)", fontSize: 17, margin: "12px 0 0" }}>
            {tour.shortDesc}
          </p>
        </div>
      </Scene>

      <div
        className="wrap tour-layout"
        style={{ padding: "48px 24px 80px", display: "grid", gridTemplateColumns: "1fr 360px", gap: 40 }}
      >
        <div>
          <TourTabs
            fullDesc={tour.fullDesc}
            program={tour.program}
            conditions={tour.conditions}
            facts={facts}
          />

          <h3 style={{ fontSize: 24, color: "var(--txt)", margin: "48px 0 18px" }}>Галерея</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {gallery
              ? gallery.map((src, i) => (
                  <Scene key={i} image={src} alt={`${tour.title} — фото ${i + 1}`} style={{ height: 130, borderRadius: "var(--r-md)" }} />
                ))
              : SCENES.map((s, i) => (
                  <Scene key={i} scene={s} style={{ height: 130, borderRadius: "var(--r-md)" }} />
                ))}
          </div>
        </div>

        <TourBooking
          tourId={tour.id}
          title={tour.title}
          price={tour.price}
          priceOnReq={tour.priceOnReq}
          nearestDate={tour.dateLabel}
          unlimitedSeats={tour.unlimitedSeats}
          seats={tour.seats}
          hasSeats={tour.hasSeats}
          seatsLabel={tour.seatsLabel}
        />
      </div>
    </>
  );
}
