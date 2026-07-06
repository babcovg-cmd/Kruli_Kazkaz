// Страница 404.

import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: 24,
        gap: 18,
      }}
    >
      <div className="mono" style={{ fontSize: 80, color: "var(--gold-2)", lineHeight: 1 }}>
        404
      </div>
      <h1 style={{ fontSize: 32, color: "var(--txt)" }}>Страница не найдена</h1>
      <p className="muted" style={{ maxWidth: 420, margin: 0 }}>
        Возможно, тур завершён или ссылка устарела. Вернитесь на главную или посмотрите каталог туров.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/" className="btn btn-gold">
          На главную
        </Link>
        <Link href="/tours" className="btn btn-ghost">
          Все туры
        </Link>
      </div>
    </div>
  );
}
