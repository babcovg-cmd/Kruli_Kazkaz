"use client";

// Таблица туров в админке: переключение статуса, редактирование, удаление.

import { useState } from "react";
import Link from "next/link";

type Row = {
  id: string;
  title: string;
  slug: string;
  duration: string;
  category: string;
  priceLabel: string;
  cover: string | null;
  scene: string;
  isActive: boolean;
};

export default function ToursTable({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initial);
  const [toDelete, setToDelete] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);

  const toggle = async (row: Row) => {
    // Оптимистично обновляем UI.
    setRows((r) => r.map((x) => (x.id === row.id ? { ...x, isActive: !x.isActive } : x)));
    const res = await fetch(`/api/admin/tours/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !row.isActive }),
    });
    if (!res.ok) {
      // Откат при ошибке.
      setRows((r) => r.map((x) => (x.id === row.id ? { ...x, isActive: row.isActive } : x)));
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setBusy(true);
    const res = await fetch(`/api/admin/tours/${toDelete.id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) {
      setRows((r) => r.filter((x) => x.id !== toDelete.id));
      setToDelete(null);
    }
  };

  if (rows.length === 0) {
    return (
      <div className="acard" style={{ textAlign: "center", padding: 60, color: "#9aa0ac" }}>
        Туров пока нет. Нажмите «Добавить тур», чтобы создать первый.
      </div>
    );
  }

  return (
    <>
      <div className="acard acard-pad0">
        <div style={{ overflowX: "auto" }}>
          <table className="atable">
            <thead>
              <tr>
                <th>Фото</th>
                <th>Название</th>
                <th>Категория</th>
                <th>Цена</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id}>
                  <td>
                    {t.cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.cover} alt="" className="athumb" />
                    ) : (
                      <div className={`scene ${t.scene} athumb`} />
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{t.title}</div>
                    <div style={{ color: "#9aa0ac", fontSize: 12 }}>{t.duration}</div>
                  </td>
                  <td>
                    <span className="abadge abadge-blue">{t.category}</span>
                  </td>
                  <td style={{ fontFamily: "var(--m-font)", color: "#8a6320" }}>{t.priceLabel}</td>
                  <td>
                    <button
                      className={`atoggle ${t.isActive ? "on" : ""}`}
                      onClick={() => toggle(t)}
                      aria-pressed={t.isActive}
                      title={t.isActive ? "Активен" : "Скрыт"}
                    >
                      <span className="knob" />
                    </button>
                  </td>
                  <td>
                    <span style={{ display: "inline-flex", gap: 14 }}>
                      <Link href={`/admin/tours/${t.id}/edit`} className="alink">
                        Изменить
                      </Link>
                      <button className="alink alink-danger" onClick={() => setToDelete(t)}>
                        Удалить
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {toDelete && (
        <div className="amodal-backdrop" onClick={() => setToDelete(null)}>
          <div className="amodal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, marginBottom: 10 }}>Удалить тур?</h2>
            <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 22 }}>
              Тур «{toDelete.title}» будет удалён безвозвратно.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button className="abtn abtn-ghost" onClick={() => setToDelete(null)} disabled={busy}>
                Отмена
              </button>
              <button
                className="abtn abtn-gold"
                style={{ background: "#b5462f", borderColor: "#b5462f" }}
                onClick={confirmDelete}
                disabled={busy}
              >
                {busy ? "Удаление…" : "Удалить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
