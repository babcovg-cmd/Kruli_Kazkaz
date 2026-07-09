"use client";

// Каталог туров с фильтрами (категория, сложность, цена) и сеткой карточек.
// Данные приходят с сервера; фильтрация — на клиенте.

import { useMemo, useState } from "react";
import TourCard from "@/components/public/TourCard";
import type { TourView } from "@/lib/data";
import { DIFFICULTIES } from "@/lib/constants";

const DIFFS = ["Любая", ...DIFFICULTIES] as const;

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h4 style={{ fontSize: 13, letterSpacing: ".14em", color: "var(--txt)", marginBottom: 12 }}>
        {title}
      </h4>
      {children}
    </div>
  );
}

export default function CatalogClient({
  tours,
  categories,
  initialCategory,
}: {
  tours: TourView[];
  categories: string[];
  initialCategory?: string;
}) {
  const CATS = ["Все", ...categories];
  const initCat = initialCategory && CATS.includes(initialCategory) ? initialCategory : "Все";

  const [cat, setCat] = useState<string>(initCat);
  const [diff, setDiff] = useState<string>("Любая");
  const [maxPrice, setMaxPrice] = useState<number>(50000);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  // Мобильные: панель фильтров свёрнута по умолчанию (на десктопе всегда видна).
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Верхняя граница слайдера = максимальная цена среди туров (округлённая).
  const priceCap = useMemo(() => {
    const max = Math.max(5000, ...tours.map((t) => t.price));
    return Math.ceil(max / 1000) * 1000;
  }, [tours]);

  const list = useMemo(() => {
    const fromTs = dateFrom ? new Date(dateFrom).getTime() : null;
    // Конец выбранного дня «до», чтобы дата включалась целиком.
    const toTs = dateTo ? new Date(dateTo).getTime() + 24 * 3600 * 1000 - 1 : null;

    return tours.filter((t) => {
      if (cat !== "Все" && t.category !== cat) return false;
      if (diff !== "Любая" && t.difficulty !== diff) return false;
      // Туры «по запросу» не отсекаются по цене.
      if (!t.priceOnReq && t.price > 0 && t.price > maxPrice) return false;
      // Фильтр по датам: туры без даты («по запросу») остаются видимыми всегда.
      if (t.startTs !== null) {
        if (fromTs !== null && t.startTs < fromTs) return false;
        if (toTs !== null && t.startTs > toTs) return false;
      }
      return true;
    });
  }, [tours, cat, diff, maxPrice, dateFrom, dateTo]);

  const reset = () => {
    setCat("Все");
    setDiff("Любая");
    setMaxPrice(priceCap);
    setDateFrom("");
    setDateTo("");
  };

  // Сколько фильтров активно — для подписи мобильной кнопки «Фильтры».
  const activeCount =
    (cat !== "Все" ? 1 : 0) +
    (diff !== "Любая" ? 1 : 0) +
    (maxPrice < priceCap ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0);

  return (
    <div
      className="wrap tour-layout"
      style={{
        padding: "32px 24px 80px",
        display: "grid",
        gridTemplateColumns: "260px 1fr",
        gap: 32,
      }}
    >
      <aside
        className={`card filters ${filtersOpen ? "open" : ""}`}
        style={{ position: "sticky", top: 90, alignSelf: "start", padding: 22 }}
      >
        {/* Кнопка видна только на мобильных: раскрывает/сворачивает фильтры */}
        <button
          type="button"
          className="filters-toggle"
          onClick={() => setFiltersOpen((o) => !o)}
          aria-expanded={filtersOpen}
        >
          <span>
            Фильтры
            {activeCount > 0 && (
              <span className="filters-count">{activeCount}</span>
            )}
          </span>
          <span aria-hidden="true" style={{ fontSize: 12 }}>
            {filtersOpen ? "▲" : "▼"}
          </span>
        </button>

        <div className="filters-body">
        <FilterGroup title="Категория">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {CATS.map((c) => (
              <label
                key={c}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  cursor: "pointer",
                  fontSize: 14,
                  color: cat === c ? "var(--txt)" : "var(--txt-2)",
                }}
              >
                <input
                  type="radio"
                  name="cat"
                  checked={cat === c}
                  onChange={() => setCat(c)}
                  style={{ accentColor: "var(--gold)" }}
                />
                {c}
              </label>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup title="Сложность">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {DIFFS.map((d) => (
              <button
                key={d}
                className={`chip ${diff === d ? "active" : ""}`}
                onClick={() => setDiff(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup title="Цена до">
          <input
            type="range"
            min={5000}
            max={priceCap}
            step={1000}
            value={Math.min(maxPrice, priceCap)}
            onChange={(e) => setMaxPrice(+e.target.value)}
            style={{ width: "100%", accentColor: "var(--gold)" }}
          />
          <div className="mono" style={{ fontSize: 14, color: "var(--gold-2)", marginTop: 6 }}>
            {Math.min(maxPrice, priceCap).toLocaleString("ru-RU")} ₽
          </div>
        </FilterGroup>

        <FilterGroup title="Дата выезда">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "var(--txt-2)" }}>
              С
              <input
                type="date"
                className="input"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "var(--txt-2)" }}>
              По
              <input
                type="date"
                className="input"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </label>
          </div>
        </FilterGroup>

        <button onClick={reset} className="btn btn-ghost btn-sm" style={{ width: "100%", marginTop: 8 }}>
          Сбросить
        </button>
        </div>
      </aside>

      <main>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <span className="muted" style={{ fontSize: 14 }}>
            Найдено: <b style={{ color: "var(--txt)" }}>{list.length}</b>
          </span>
        </div>

        {list.length > 0 ? (
          <div
            className="grid-3"
            style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}
          >
            {list.map((t) => (
              <TourCard key={t.id} tour={t} />
            ))}
          </div>
        ) : (
          <div style={{ padding: "80px 0", textAlign: "center", color: "var(--txt-3)" }}>
            Ничего не найдено. Попробуйте сбросить фильтры.
          </div>
        )}
      </main>
    </div>
  );
}
