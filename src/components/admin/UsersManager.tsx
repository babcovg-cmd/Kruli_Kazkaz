"use client";

// Управление командой: список сотрудников, создание, изменение прав, удаление.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_SECTIONS, parsePermissions, type Role, type SectionKey } from "@/lib/permissions";

type UserRow = {
  id: string;
  login: string;
  name: string;
  role: string;
  permissions: string;
  createdAt: string;
};

type Draft = {
  id: string | null; // null = создание
  name: string;
  login: string;
  password: string;
  role: Role;
  permissions: SectionKey[];
};

export default function UsersManager({
  initial,
  currentUserId,
}: {
  initial: UserRow[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);

  const openNew = () =>
    setDraft({ id: null, name: "", login: "", password: "", role: "manager", permissions: [] });

  const openEdit = (u: UserRow) =>
    setDraft({
      id: u.id,
      name: u.name,
      login: u.login,
      password: "",
      role: u.role === "owner" ? "owner" : "manager",
      permissions: parsePermissions(u.permissions),
    });

  const remove = async (u: UserRow) => {
    if (!confirm(`Удалить сотрудника «${u.name}»?`)) return;
    const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      const j = await res.json().catch(() => ({}));
      alert(j.error || "Не удалось удалить");
    }
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18 }}>
        <button className="abtn abtn-gold" onClick={openNew}>
          + Добавить сотрудника
        </button>
      </div>

      <div className="acard acard-pad0">
        <table className="atable">
          <thead>
            <tr>
              <th>Сотрудник</th>
              <th>Логин</th>
              <th>Роль</th>
              <th>Доступ к разделам</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {initial.map((u) => {
              const perms = parsePermissions(u.permissions);
              const isOwner = u.role === "owner";
              return (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>
                    {u.name}
                    {u.id === currentUserId && (
                      <span className="ahint" style={{ marginLeft: 8 }}>
                        (вы)
                      </span>
                    )}
                  </td>
                  <td style={{ fontFamily: "var(--m-font)" }}>{u.login}</td>
                  <td>
                    <span className={`abadge ${isOwner ? "abadge-gold" : "abadge-blue"}`}>
                      {isOwner ? "Владелец" : "Менеджер"}
                    </span>
                  </td>
                  <td>
                    {isOwner ? (
                      <span className="ahint">Все разделы</span>
                    ) : perms.length ? (
                      <span style={{ display: "inline-flex", flexWrap: "wrap", gap: 6 }}>
                        {ADMIN_SECTIONS.filter((s) => perms.includes(s.key)).map((s) => (
                          <span key={s.key} className="abadge abadge-gray">
                            {s.label}
                          </span>
                        ))}
                      </span>
                    ) : (
                      <span className="ahint">Нет доступа</span>
                    )}
                  </td>
                  <td>
                    <span style={{ display: "inline-flex", gap: 12 }}>
                      <button className="alink" onClick={() => openEdit(u)}>
                        Изменить
                      </button>
                      {u.id !== currentUserId && (
                        <button className="alink alink-danger" onClick={() => remove(u)}>
                          Удалить
                        </button>
                      )}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {draft && (
        <UserModal
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

function UserModal({
  draft,
  onClose,
  onSaved,
}: {
  draft: Draft;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = draft.id === null;
  const [form, setForm] = useState<Draft>(draft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const togglePerm = (key: SectionKey) =>
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(key)
        ? f.permissions.filter((k) => k !== key)
        : [...f.permissions, key],
    }));

  const save = async () => {
    setSaving(true);
    setError("");
    const url = isNew ? "/api/admin/users" : `/api/admin/users/${draft.id}`;
    const method = isNew ? "POST" : "PUT";
    const payload = isNew
      ? {
          name: form.name,
          login: form.login,
          password: form.password,
          role: form.role,
          permissions: form.permissions,
        }
      : {
          name: form.name,
          password: form.password,
          role: form.role,
          permissions: form.permissions,
        };
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) {
      onSaved();
    } else {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "Не удалось сохранить");
    }
  };

  return (
    <div className="amodal-backdrop" onClick={onClose}>
      <div className="amodal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <h2 style={{ fontSize: 20, marginBottom: 18 }}>
          {isNew ? "Новый сотрудник" : "Изменить сотрудника"}
        </h2>

        <div className="afield">
          <label className="alabel">Имя</label>
          <input className="ainput" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>

        <div className="afield">
          <label className="alabel">Логин</label>
          <input
            className="ainput"
            value={form.login}
            disabled={!isNew}
            onChange={(e) => setForm({ ...form, login: e.target.value })}
          />
          {!isNew && <p className="ahint" style={{ marginTop: 6 }}>Логин изменить нельзя.</p>}
        </div>

        <div className="afield">
          <label className="alabel">{isNew ? "Пароль" : "Новый пароль"}</label>
          <input
            className="ainput"
            type="password"
            autoComplete="new-password"
            placeholder={isNew ? "Минимум 6 символов" : "Оставьте пустым, чтобы не менять"}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <div className="afield">
          <label className="alabel">Роль</label>
          <select
            className="aselect"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
          >
            <option value="manager">Менеджер (доступ по разделам)</option>
            <option value="owner">Владелец (полный доступ + команда)</option>
          </select>
        </div>

        {form.role === "manager" && (
          <div className="afield">
            <label className="alabel">Доступные разделы</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {ADMIN_SECTIONS.map((s) => (
                <label key={s.key} style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer", fontSize: 14 }}>
                  <input
                    type="checkbox"
                    checked={form.permissions.includes(s.key)}
                    onChange={() => togglePerm(s.key)}
                    style={{ accentColor: "var(--agold)", width: 16, height: 16 }}
                  />
                  {s.label}
                </label>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              background: "rgba(181,70,47,0.1)",
              color: "#b5462f",
              padding: "10px 12px",
              borderRadius: 8,
              fontSize: 13,
              marginBottom: 14,
            }}
          >
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
