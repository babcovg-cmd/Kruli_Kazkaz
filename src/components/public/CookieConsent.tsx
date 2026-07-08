"use client";

// Уведомление об использовании cookie (152-ФЗ, практика РКН).
// Строгий режим: Яндекс.Метрика подключается ТОЛЬКО после нажатия «Принять».
// Выбор хранится в localStorage; «Отклонить» — сайт работает без аналитики.

import { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";

const STORAGE_KEY = "kk-cookie-consent";

type Choice = "accepted" | "declined" | null;

export default function CookieConsent({ metrikaId }: { metrikaId?: string }) {
  const [choice, setChoice] = useState<Choice>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "accepted" || saved === "declined") setChoice(saved);
    } catch {
      /* localStorage недоступен — просто показываем баннер каждый раз */
    }
  }, []);

  const decide = (value: Exclude<Choice, null>) => {
    setChoice(value);
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
  };

  // До монтирования ничего не рисуем (избегаем расхождения SSR/клиента).
  if (!mounted) return null;

  return (
    <>
      {/* Метрика — только после явного согласия */}
      {choice === "accepted" && metrikaId && (
        <Script id="yandex-metrika" strategy="afterInteractive">
          {`
            (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
            (window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
            ym(${metrikaId}, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true });
          `}
        </Script>
      )}

      {choice === null && (
        <div
          role="dialog"
          aria-label="Уведомление об использовании cookie"
          style={{
            position: "fixed",
            left: 16,
            right: 16,
            bottom: 16,
            zIndex: 200,
            maxWidth: 680,
            margin: "0 auto",
            background: "var(--bg-2)",
            border: "1px solid var(--line-2)",
            borderRadius: "var(--r-sm)",
            boxShadow: "var(--sh-card)",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "var(--txt-2)", flex: "1 1 320px" }}>
            Мы используем cookie-файлы для работы сайта и сбора обезличенной статистики
            (Яндекс.Метрика). Подробнее — в{" "}
            <Link href="/privacy" style={{ color: "var(--gold-2)", textDecoration: "underline" }}>
              Политике обработки персональных данных
            </Link>
            .
          </p>
          <span style={{ display: "flex", gap: 10, flexShrink: 0 }}>
            <button className="btn btn-gold btn-sm" onClick={() => decide("accepted")}>
              Принять
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => decide("declined")}>
              Отклонить
            </button>
          </span>
        </div>
      )}
    </>
  );
}
