// Карточка тура для каталога и блока «Ближайшие туры».

import Link from "next/link";
import Scene from "@/components/Scene";
import type { TourView } from "@/lib/data";

export default function TourCard({ tour }: { tour: TourView }) {
  return (
    <Link
      href={`/tours/${tour.slug}`}
      className="tour-card"
      style={{ display: "block", transition: "transform .25s var(--ease)" }}
    >
      <article
        className="tc card"
        style={{ overflow: "hidden", transition: "box-shadow .25s", height: "100%" }}
      >
        <Scene
          scene={tour.scene}
          image={tour.cover}
          alt={tour.title}
          style={{ height: 188 }}
        >
          <span
            className={`badge ${tour.badgeClass}`}
            style={{ position: "absolute", top: 12, left: 12, zIndex: 3 }}
          >
            {tour.category}
          </span>
        </Scene>
        <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          <h3 style={{ fontSize: 21, color: "var(--txt)" }}>{tour.title}</h3>
          <p
            className="muted"
            style={{ fontSize: 13.5, lineHeight: 1.5, margin: 0, minHeight: 42 }}
          >
            {tour.shortDesc}
          </p>
          <div
            style={{
              display: "flex",
              gap: 14,
              fontSize: 12.5,
              color: "var(--txt-3)",
              flexWrap: "wrap",
            }}
          >
            <span>◷ {tour.duration}</span>
            <span>◆ {tour.difficulty}</span>
            {tour.dateLabel && <span>⊙ {tour.dateLabel}</span>}
          </div>
          {tour.seatsLabel && (
            <span
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: tour.hasSeats ? "var(--gold-2)" : "var(--txt-3)",
              }}
            >
              {tour.hasSeats ? "● " : "○ "}
              {tour.seatsLabel}
            </span>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 6,
              paddingTop: 14,
              borderTop: "1px solid var(--line)",
            }}
          >
            <span>
              {!tour.priceOnReq && tour.price > 0 && (
                <span className="muted" style={{ fontSize: 12 }}>
                  от{" "}
                </span>
              )}
              <span
                className="mono"
                style={{ fontSize: 20, fontWeight: 500, color: "var(--gold-2)" }}
              >
                {tour.priceLabel}
              </span>
            </span>
            <span className="btn btn-sm btn-gold">Оставить заявку</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
