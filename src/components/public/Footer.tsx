// Подвал сайта. Контакты берутся из настроек (БД).

import Link from "next/link";
import Logo from "@/components/Logo";
import { getSettings } from "@/lib/settings";
import { getSocialLinks } from "@/lib/social";
import { digitsOnly } from "@/lib/utils";

function FCol({
  title,
  items,
}: {
  title: string;
  items: [string, string][];
}) {
  return (
    <div>
      <h4 style={{ fontSize: 13, letterSpacing: ".16em", color: "var(--txt)", marginBottom: 14 }}>
        {title}
      </h4>
      {items.map(([label, href]) => (
        <Link
          key={label}
          href={href}
          style={{ display: "block", fontSize: 14, color: "var(--txt-2)", lineHeight: 2.2 }}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}

export default async function Footer() {
  const s = await getSettings();
  const tel = digitsOnly(s.phone);
  const socials = getSocialLinks(s);

  return (
    <footer style={{ background: "var(--bg-2)", borderTop: "1px solid var(--line)" }}>
      <div
        className="wrap"
        style={{
          padding: "56px 24px 28px",
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr 1fr 1.2fr",
          gap: 32,
        }}
      >
        <div>
          <Logo size={40} />
          <p className="muted" style={{ maxWidth: 300, marginTop: 18, fontSize: 14 }}>
            Туроператор по Дагестану и республикам Северного Кавказа. Авторские туры — 17 лет в горах.
          </p>
        </div>
        <FCol
          title="Туры"
          items={[
            ["Однодневные", "/tours?cat=Однодневные%20туры"],
            ["Экскурсии", "/tours?cat=Экскурсии"],
            ["Сборные", "/tours?cat=Сборные%20туры"],
            ["Спортивные", "/tours?cat=Спортивный%20туризм"],
          ]}
        />
        <FCol
          title="Компания"
          items={[
            ["О нас", "/about"],
            ["Все туры", "/tours"],
            ["Политика конфиденциальности", "/privacy"],
            ["Согласие на обработку ПДн", "/consent"],
          ]}
        />
        <div>
          <h4 style={{ fontSize: 13, letterSpacing: ".16em", color: "var(--txt)", marginBottom: 14 }}>
            Контакты
          </h4>
          <p style={{ fontSize: 14, color: "var(--txt-2)", lineHeight: 1.9, margin: 0 }}>
            {s.address}
            <br />
            <a href={`tel:+${tel}`} className="mono" style={{ color: "var(--gold-2)" }}>
              {s.phone}
            </a>
            <br />
            <span style={{ display: "inline-flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
              {socials.whatsapp && (
                <a href={socials.whatsapp} target="_blank" rel="noopener noreferrer" style={{ color: "var(--txt-2)" }}>
                  WhatsApp
                </a>
              )}
              {socials.max && (
                <a href={socials.max} target="_blank" rel="noopener noreferrer" style={{ color: "var(--txt-2)" }}>
                  MAX
                </a>
              )}
              {socials.telegram && (
                <a href={socials.telegram} target="_blank" rel="noopener noreferrer" style={{ color: "var(--txt-2)" }}>
                  Telegram
                </a>
              )}
            </span>
          </p>
        </div>
      </div>
      <div
        className="wrap"
        style={{
          padding: "16px 24px 28px",
          borderTop: "1px solid var(--line)",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <span className="mono muted" style={{ fontSize: 12 }}>
          РТО № В031-00161-77/01570006
        </span>
        <Link href="/privacy" className="muted" style={{ fontSize: 12 }}>
          Политика обработки персональных данных
        </Link>
        <span className="muted" style={{ fontSize: 12 }}>
          © 2008–2026 Крылья Кавказа. Все права защищены.
        </span>
      </div>
    </footer>
  );
}
