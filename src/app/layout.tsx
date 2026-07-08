// Корневой layout: <html>/<body>, подключение темы, базовые метаданные SEO,
// предзагрузка сохранённой темы (чтобы не было «вспышки» при загрузке).
// Яндекс.Метрика подключается в публичном layout через CookieConsent —
// только после согласия посетителя на cookie (152-ФЗ).

import type { Metadata } from "next";
import "@/styles/theme.css";
import { getSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: s.seoHomeTitle,
      template: "%s — Крылья Кавказа",
    },
    description: s.seoHomeDesc,
    keywords: s.seoHomeKeywords,
    openGraph: {
      type: "website",
      locale: "ru_RU",
      siteName: "Крылья Кавказа",
      title: s.seoHomeTitle,
      description: s.seoHomeDesc,
    },
    icons: { icon: "/assets/emblem-gold.png" },
  };
}

// Применяем сохранённую тему до отрисовки, чтобы избежать мерцания.
const THEME_BOOTSTRAP = `try{document.documentElement.dataset.theme=localStorage.getItem('kk-theme')||'dark';}catch(e){document.documentElement.dataset.theme='dark';}`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
