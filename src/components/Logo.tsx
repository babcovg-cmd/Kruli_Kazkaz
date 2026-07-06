// Логотип «Крылья Кавказа»: эмблема (крыло + горы) + название.

import Link from "next/link";

type LogoProps = {
  size?: number;
  /** Показывать ли подпись «Туристическое агентство». */
  sub?: boolean;
  href?: string;
};

export default function Logo({ size = 38, sub = true, href = "/" }: LogoProps) {
  return (
    <Link href={href} style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/emblem-gold.png" alt="Крылья Кавказа" style={{ height: size }} />
      <span style={{ lineHeight: 1 }}>
        <span
          style={{
            display: "block",
            fontFamily: "var(--d-font)",
            textTransform: "uppercase",
            fontWeight: 700,
            letterSpacing: ".04em",
            fontSize: size * 0.45,
            color: "var(--txt)",
          }}
        >
          Крылья Кавказа
        </span>
        {sub && (
          <span
            style={{
              display: "block",
              fontFamily: "var(--d-font)",
              textTransform: "uppercase",
              letterSpacing: ".22em",
              fontSize: size * 0.21,
              color: "var(--gold)",
              marginTop: 4,
            }}
          >
            Туристическое агентство
          </span>
        )}
      </span>
    </Link>
  );
}
