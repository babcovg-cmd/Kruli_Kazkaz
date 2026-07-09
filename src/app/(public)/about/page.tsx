// Объединённая страница «О компании и контакты» (/about).
// Содержит историю, достижения, реквизиты И блок контактов (телефон, мессенджеры,
// карта, форма обратной связи) с якорем #contacts.

import type { Metadata } from "next";
import Scene from "@/components/Scene";
import Reveal from "@/components/public/Reveal";
import CountUp from "@/components/public/CountUp";
import LeadForm from "@/components/public/LeadForm";
import { getSettings } from "@/lib/settings";
import { digitsOnly } from "@/lib/utils";
import { OPERATOR } from "@/lib/legal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "О компании и контакты",
  description:
    "Туроператор «Крылья Кавказа»: 17 лет опыта, более 60 авторских программ по Дагестану и Северному Кавказу. Реквизиты, лицензия и контакты — телефон, WhatsApp, Telegram.",
  alternates: { canonical: "/about" },
};

const STATS = [
  ["17 лет", "в горах Кавказа"],
  ["60+", "авторских программ"],
  ["100%", "по договору"],
  ["5★", "оценки гостей"],
];

const REQUISITES: [string, string][] = [
  ["Наименование", OPERATOR.name],
  ["ИНН", OPERATOR.inn],
  ["КПП", OPERATOR.kpp],
  ["ОГРН", OPERATOR.ogrn],
  ["Реестровый номер РТО", OPERATOR.rto],
  ["Юридический адрес", OPERATOR.address],
  ["Телефоны", OPERATOR.phones.join(", ")],
  ["E-mail", OPERATOR.email],
  ["Банк", OPERATOR.bank.name],
  ["Расчётный счёт", OPERATOR.bank.account],
  ["Корр. счёт", OPERATOR.bank.corrAccount],
  ["БИК", OPERATOR.bank.bik],
];

export default async function AboutPage() {
  const s = await getSettings();
  const tel = digitsOnly(s.phone);

  const channels: { label: string; value: string; href: string }[] = [
    { label: "Телефон", value: s.phone, href: `tel:+${tel}` },
    { label: "WhatsApp", value: s.phone, href: `https://wa.me/${digitsOnly(s.whatsapp)}` },
    {
      label: "Telegram",
      value: `@${s.telegram.replace(/^@/, "")}`,
      href: `https://t.me/${s.telegram.replace(/^@/, "")}`,
    },
    { label: "E-mail", value: s.email, href: `mailto:${s.email}` },
  ];

  return (
    <>
      {/* Hero со стоп-кадром (баннер) */}
      <Scene
        scene="s-peak"
        image="/assets/about-hero.jpg"
        alt="Горный хребет Кавказа"
        style={{ minHeight: 440, display: "flex", alignItems: "flex-end" }}
      >
        {/* Затемнение для читаемости заголовка: image идёт на z-index 1, поверх него */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            background:
              "linear-gradient(to top, rgba(8,10,14,0.85) 0%, rgba(8,10,14,0.3) 45%, rgba(8,10,14,0.05) 100%)",
          }}
        />
        <div className="wrap" style={{ position: "relative", zIndex: 3, paddingBottom: 40 }}>
          <span className="eyebrow">О компании</span>
          <h1 style={{ fontSize: "clamp(34px,5vw,52px)", color: "#F4F1E7", margin: "12px 0 0" }}>
            Крылья Кавказа
          </h1>
        </div>
      </Scene>

      {/* История */}
      <section className="wrap" style={{ padding: "72px 24px", maxWidth: 820 }}>
        <div className="rich" style={{ fontSize: 17 }}>
          <p>{s.aboutText || "«Крылья Кавказа» — туроператор по Дагестану и республикам Северного Кавказа."}</p>
          <p>
            Мы — команда местных гидов и организаторов, которые знают каждый аул, каньон и горную
            тропу. За 17 лет мы провели тысячи гостей по самым красивым и подлинным местам Кавказа,
            работая официально и по договору.
          </p>
          <p>
            Наша линейка — более 60 авторских программ: от однодневных выездов к Сулакскому каньону до
            многодневных восхождений и экспедиций по Дагестану и Северной Осетии.
          </p>
        </div>
      </section>

      {/* Достижения */}
      <section style={{ background: "var(--bg-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div
          className="wrap grid-cat"
          style={{ padding: "56px 24px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24 }}
        >
          {STATS.map(([num, label], i) => (
            <Reveal key={label} delay={((i % 4) + 1) as 1 | 2 | 3 | 4} style={{ textAlign: "center" }}>
              <div
                className="mono"
                style={{ fontSize: 40, fontWeight: 600, color: "var(--gold-2)", lineHeight: 1 }}
              >
                <CountUp value={num} />
              </div>
              <div className="muted" style={{ marginTop: 8, fontSize: 14 }}>
                {label}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Реквизиты и лицензия */}
      <section className="wrap" style={{ padding: "72px 24px", maxWidth: 820 }}>
        <div className="section-head" style={{ textAlign: "left", marginBottom: 28 }}>
          <span className="eyebrow">Документы</span>
          <h2 style={{ fontSize: 32, color: "var(--txt)", marginTop: 12 }}>Реквизиты и лицензия</h2>
        </div>
        <div className="card" style={{ padding: 28 }}>
          {REQUISITES.map(([k, v], i) => (
            <div
              key={k}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                padding: "14px 0",
                borderTop: i === 0 ? "none" : "1px solid var(--line)",
                flexWrap: "wrap",
              }}
            >
              <span className="muted">{k}</span>
              <span className="mono" style={{ color: "var(--txt)" }}>
                {v}
              </span>
            </div>
          ))}
        </div>
        <p className="muted" style={{ fontSize: 13, marginTop: 16, lineHeight: 1.6 }}>
          Компания включена в Единый федеральный реестр туроператоров. Все туры проводятся официально,
          по договору, с безналичным расчётом и юридической защитой клиента.
        </p>
      </section>

      {/* ───────── Контакты ───────── */}
      <section
        id="contacts"
        style={{ background: "var(--bg-2)", borderTop: "1px solid var(--line)", scrollMarginTop: 90 }}
      >
        <div className="wrap" style={{ padding: "72px 24px" }}>
          <div className="section-head" style={{ textAlign: "left", marginBottom: 32 }}>
            <span className="eyebrow">Контакты</span>
            <h2 style={{ fontSize: 32, color: "var(--txt)", marginTop: 12 }}>Свяжитесь с нами</h2>
            <p className="muted" style={{ marginTop: 12, maxWidth: 560 }}>
              Ответим на вопросы и поможем подобрать тур. Пишите в мессенджеры или оставьте заявку.
            </p>
          </div>

          <div
            className="tour-layout"
            style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 40 }}
          >
            {/* Каналы связи */}
            <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16, height: "fit-content" }}>
              {channels.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  style={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                  <span className="muted" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".1em" }}>
                    {c.label}
                  </span>
                  <span className="mono" style={{ fontSize: 17, color: "var(--gold-2)" }}>
                    {c.value}
                  </span>
                </a>
              ))}
              <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingTop: 4 }}>
                <span className="muted" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".1em" }}>
                  Адрес
                </span>
                <span style={{ fontSize: 15, color: "var(--txt)" }}>{s.address}</span>
              </div>
            </div>

            {/* Форма */}
            <div>
              <h3 style={{ fontSize: 24, color: "var(--txt)", marginBottom: 18 }}>Написать нам</h3>
              <LeadForm type="contact" source="Страница «О компании и контакты»" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
