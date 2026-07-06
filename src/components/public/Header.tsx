"use client";

// Шапка сайта: логотип, навигация, переключатель темы, CTA, мобильное меню.

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/public/ThemeToggle";

const LINKS: [string, string][] = [
  ["Туры", "/tours"],
  ["О компании", "/about"],
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/tours" ? pathname.startsWith("/tours") : pathname === href;

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "var(--header-bg)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div
        className="wrap"
        style={{ display: "flex", alignItems: "center", gap: 24, height: 74 }}
      >
        <Logo size={38} />
        <nav
          className="desk-nav"
          style={{ display: "flex", gap: 28, marginLeft: "auto" }}
        >
          {LINKS.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: isActive(href) ? "var(--gold)" : "var(--txt-2)",
                transition: "color .15s",
              }}
            >
              {label}
            </Link>
          ))}
        </nav>
        <ThemeToggle />
        <Link href="/tours" className="btn btn-gold btn-sm desk-cta">
          Смотреть туры
        </Link>
        <button
          className="burger"
          onClick={() => setOpen(true)}
          aria-label="Открыть меню"
          style={{
            display: "none",
            background: "none",
            border: "none",
            cursor: "pointer",
            flexDirection: "column",
            gap: 5,
            padding: 6,
          }}
        >
          <span style={{ width: 24, height: 2, background: "var(--txt)" }} />
          <span style={{ width: 24, height: 2, background: "var(--txt)" }} />
          <span style={{ width: 24, height: 2, background: "var(--txt)" }} />
        </button>
      </div>

      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            background: "var(--overlay-bg)",
            display: "flex",
            flexDirection: "column",
            padding: "28px 24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <Logo size={36} sub={false} />
            <button
              onClick={() => setOpen(false)}
              aria-label="Закрыть меню"
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                color: "var(--txt)",
                fontSize: 30,
                cursor: "pointer",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
          <nav
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              marginTop: 40,
            }}
          >
            {LINKS.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                style={{
                  fontFamily: "var(--d-font)",
                  textTransform: "uppercase",
                  fontSize: 30,
                  letterSpacing: ".03em",
                  color: "var(--txt)",
                  padding: "10px 0",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                {label}
              </Link>
            ))}
          </nav>
          <Link
            href="/tours"
            className="btn btn-gold"
            style={{ marginTop: 28 }}
            onClick={() => setOpen(false)}
          >
            Смотреть туры
          </Link>
        </div>
      )}
    </header>
  );
}
