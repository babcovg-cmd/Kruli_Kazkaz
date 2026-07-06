// Главная страница (/).

import Link from "next/link";
import Scene from "@/components/Scene";
import TourCard from "@/components/public/TourCard";
import LeadForm from "@/components/public/LeadForm";
import Reveal from "@/components/public/Reveal";
import { getHomeTours } from "@/lib/data";
import { getSettings } from "@/lib/settings";
import { WHY_US } from "@/lib/constants";
import { getCategories } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [tours, settings, categories] = await Promise.all([
    getHomeTours(4),
    getSettings(),
    getCategories(),
  ]);

  return (
    <>
      {/* ───────── Hero ───────── */}
      <Scene
        scene="s-dusk"
        video="/assets/hero.mp4"
        videoLoop={false}
        className="hero-scene"
        style={{ minHeight: "88vh", display: "flex", alignItems: "center" }}
      >
        <div
          className="wrap hero-in"
          style={{
            position: "relative",
            zIndex: 3,
            width: "100%",
            paddingTop: 60,
            paddingBottom: 60,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 24,
          }}
        >
          <span className="eyebrow" style={{ whiteSpace: "nowrap" }}>
            17 лет в горах Кавказа
          </span>
          <h1
            className="hero-h1"
            style={{
              fontSize: "clamp(40px,6vw,66px)",
              lineHeight: 1.1,
              color: "#F4F1E7",
              margin: 0,
              maxWidth: 820,
            }}
          >
            {settings.heroTitle}
          </h1>
          <p
            style={{
              fontSize: 19,
              color: "rgba(244,241,231,0.85)",
              maxWidth: 560,
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            {settings.heroSubtitle}
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 6 }}>
            <Link href="/tours" className="btn btn-gold">
              Смотреть туры
            </Link>
            <a
              href="#contact"
              className="btn btn-ghost"
              style={{ color: "#F4F1E7", borderColor: "rgba(244,241,231,0.42)" }}
            >
              Написать нам
            </a>
          </div>
        </div>
        <span className="scroll-cue" aria-hidden="true">
          Листайте
          <span className="chev" />
        </span>
      </Scene>

      {/* ───────── Категории ───────── */}
      <section className="wrap" style={{ padding: "90px 24px" }}>
        <Reveal className="section-head">
          <span className="eyebrow">Направления</span>
          <h2>Чем мы занимаемся</h2>
        </Reveal>
        <div
          className="grid-cat"
          style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}
        >
          {categories.map((c, i) => (
            <Reveal key={c.id} delay={((i % 3) + 1) as 1 | 2 | 3}>
            <Link
              href={`/tours?cat=${encodeURIComponent(c.name)}`}
              className="cat-card card"
              style={{ display: "block", padding: 28 }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "var(--r-md)",
                  background: "var(--gold-soft)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  color: "var(--gold-2)",
                  marginBottom: 18,
                }}
              >
                {c.glyph}
              </div>
              <h3 style={{ fontSize: 21, color: "var(--txt)", marginBottom: 8 }}>{c.name}</h3>
              <p className="muted" style={{ fontSize: 14, margin: 0, lineHeight: 1.5 }}>
                {c.description}
              </p>
            </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ───────── Ближайшие туры ───────── */}
      {tours.length > 0 && (
        <section
          style={{
            background: "var(--bg-2)",
            borderTop: "1px solid var(--line)",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div className="wrap" style={{ padding: "80px 24px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                marginBottom: 34,
                flexWrap: "wrap",
                gap: 16,
              }}
            >
              <div>
                <span className="eyebrow">Расписание</span>
                <h2 style={{ fontSize: 40, color: "var(--txt)", marginTop: 12 }}>
                  Ближайшие туры
                </h2>
              </div>
              <Link href="/tours" className="btn btn-ghost btn-sm">
                Все туры →
              </Link>
            </div>
            <Reveal
              className="grid-3"
              style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}
            >
              {tours.map((t) => (
                <TourCard key={t.id} tour={t} />
              ))}
            </Reveal>
          </div>
        </section>
      )}

      {/* ───────── Почему мы ───────── */}
      <section className="wrap" style={{ padding: "90px 24px" }}>
        <Reveal className="section-head">
          <span className="eyebrow">Почему мы</span>
          <h2>С нами спокойно</h2>
        </Reveal>
        <div
          className="grid-cat"
          style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 28 }}
        >
          {WHY_US.map((it, i) => (
            <Reveal key={it.title} delay={((i % 3) + 1) as 1 | 2 | 3} style={{ textAlign: "center", padding: "8px 12px" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  border: "1.5px solid var(--gold)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 18px",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/emblem-gold.png" alt="" style={{ height: 34 }} />
              </div>
              <h3 style={{ fontSize: 18, color: "var(--txt)", marginBottom: 8 }}>{it.title}</h3>
              <p className="muted" style={{ fontSize: 13.5, margin: 0, lineHeight: 1.5 }}>
                {it.desc}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ───────── Форма обратной связи ───────── */}
      <section
        id="contact"
        style={{ background: "var(--bg-2)", borderTop: "1px solid var(--line)" }}
      >
        <div className="wrap" style={{ padding: "80px 24px", maxWidth: 760 }}>
          <Reveal className="section-head" style={{ marginBottom: 32 }}>
            <span className="eyebrow">Свяжитесь с нами</span>
            <h2>Не нашли что искали?</h2>
            <p className="muted" style={{ marginTop: 12 }}>
              Оставьте заявку — подберём тур под ваши даты, бюджет и интересы.
            </p>
          </Reveal>
          <Reveal>
            <LeadForm type="contact" source="Главная — форма обратной связи" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
