"use client";

// Управление категориями туров: список, создание, редактирование, удаление.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BADGE_CLASSES } from "@/lib/categories";

type Row = {
  id: string;
  name: string;
  description: string;
  glyph: string;
  badgeClass: string;
  sortOrder: number;
  count: number;
};

type Draft = {
  id: string | null;
  name: string;
  description: string;
  glyph: string;
  badgeClass: string;
  sortOrder: number;
};

const BADGE_LABEL: Record<string, string> = {
  "b-green": "Зелёный",
  "b-amber": "Золотой",
  "b-blue": "Синий",
  "b-purple": "Фиолетовый",
  "b-terra": "Терракот",
};

export default function CategoriesManager({ initial }: { initial: Row[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);

  const openNew = () =>
    setDraft({ id: null, name: "", description: "", glyph: "✦", badgeClass: "b-amber", sortOrder: (initial.at(-1)?.sortOrder ?? 0) + 1 });

  const openEdit = (r: Row) =>
    setDraft({ id: r.id, name: r.name, description: r.description, glyph: r.glyph, badgeClass: r.badgeClass, sortOrder: r.sortOrder });

  const remove = async (r: Row) => {
    if (!confirm(`Удалить категорию «${r.name}»?`)) return;
    const res = await fetch(`/api/admin/categories/${r.id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else {
      const j = await res.json().catch(() => ({}));
      alert(j.error || "Не удалось удалить");
    }
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18 }}>
        <button className="abtn abtn-gold" onClick={openNew}>
          + Добавить категорию
        </button>
      </div>

      <div className="acard acard-pad0">
        <table className="atable">
          <thead>
            <tr>
              <th>Категория</th>
              <th>Описание</th>
              <th>Цвет</th>
              <th>Туров</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {initial.map((r) => (
              <tr key={r.id}>
                <td style={{ fontWeight: 600 }}>
                  <span style={{ marginRight: 8 }}>{r.glyph}</span>
                  {r.name}
                </td>
                <td style={{ color: "#6b7280", maxWidth: 320 }}>{r.description || "—"}</td>
                <td>
                  <span className={`abadge abadge-${r.badgeClass.replace("b-", "")}`}>
                    {BADGE_LABEL[r.badgeClass] || r.badgeClass}
                  </span>
                </td>
                <td className="mono">{r.count}</td>
                <td>
                  <span style={{ display: "inline-flex", gap: 12 }}>
                    <button className="alink" onClick={() => openEdit(r)}>
                      Изменить
                    </button>
                    <button className="alink alink-danger" onClick={() => remove(r)}>
                      Удалить
                    </button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {draft && (
        <CategoryModal
          draft={draft}
          onClose={() => setDraft(null)}
          onSaved={() => {
            setDraft(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

function CategoryModal({ draft, onClose, onSaved }: { draft: Draft; onClose: () => void; onSaved: () => void }) {
  const isNew = draft.id === null;
  const [form, setForm] = useState<Draft>(draft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setSaving(true);
    setError("");
    const url = isNew ? "/api/admin/categories" : `/api/admin/categories/${draft.id}`;
    const res = await fetch(url, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) onSaved();
    else {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "Не удалось сохранить");
    }
  };

  return (
    <div className="amodal-backdrop" onClick={onClose}>
      <div className="amodal" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: 20, marginBottom: 18 }}>{isNew ? "Новая категория" : "Изменить категорию"}</h2>

        <div className="afield">
          <label className="alabel">Название</label>
          <input className="ainput" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          {!isNew && <p className="ahint" style={{ marginTop: 6 }}>При переименовании все туры этой категории обновятся автоматически.</p>}
        </div>

        <div className="afield">
          <label className="alabel">Описание (для карточки на главной)</label>
          <input className="ainput" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>

        <div className="agrid-2">
          <div className="afield">
            <label className="alabel">Иконка (символ)</label>
            <input className="ainput" maxLength={4} value={form.glyph} onChange={(e) => setForm({ ...form, glyph: e.target.value })} />
            <p className="ahint" style={{ marginTop: 6 }}>Например: ☀ ◈ ⛰ ✦ ▲ ✎ 🏔 🏕</p>
          </div>
          <div className="afield">
            <label className="alabel">Порядок</label>
            <input className="ainput" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: +e.target.value })} />
          </div>
        </div>

        <div className="afield">
          <label className="alabel">Цвет бейджа</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {BADGE_CLASSES.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setForm({ ...form, badgeClass: b })}
                className={`abadge abadge-${b.replace("b-", "")}`}
                style={{
                  cursor: "pointer",
                  border: form.badgeClass === b ? "2px solid #b07f2a" : "2px solid transparent",
                  padding: "6px 12px",
                }}
              >
                {BADGE_LABEL[b]}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ background: "rgba(181,70,47,0.1)", color: "#b5462f", padding: "10px 12px", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
          <button className="abtn abtn-ghost" onClick={onClose}>
            Отмена
          </button>
          <button className="abtn abtn-gold" onClick={save} disabled={saving}>
            {saving ? "Сохранение…" : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
}
