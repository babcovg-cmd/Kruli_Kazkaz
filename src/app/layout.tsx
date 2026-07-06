// Корневой layout: <html>/<body>, подключение темы, базовые метаданные SEO,
// предзагрузка сохранённой темы (чтобы не было «вспышки» при загрузке),
// и счётчик Яндекс.Метрики (если задан в настройках).

import type { Metadata } from "next";
import Script from "next/script";
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const s = await getSettings();
  return (
    <html lang="ru" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body>
        {children}

        {/* Яндекс.Метрика — подключается только если указан номер счётчика */}
        {s.yandexMetrika && (
          <>
            <Script id="yandex-metrika" strategy="afterInteractive">
              {`
                (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
                (window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
                ym(${s.yandexMetrika}, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true });
              `}
            </Script>
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://mc.yandex.ru/watch/${s.yandexMetrika}`}
                style={{ position: "absolute", left: "-9999px" }}
                alt=""
              />
            </noscript>
          </>
        )}
      </body>
    </html>
  );
}
