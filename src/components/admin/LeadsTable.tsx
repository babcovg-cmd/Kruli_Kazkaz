"use client";

// Таблица заявок с фильтрами по статусу и типу, сменой статуса и удалением.

import { useMemo, useState } from "react";
import { LEAD_STATUSES, LEAD_TYPES } from "@/lib/constants";

type Row = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  people: number;
  date: string;
  type: string;
  status: string;
  source: string;
  tourTitle: string;
  consentAt: string;
  consentVersion: string;
  consentIp: string;
};

const STATUS_BADGE: Record<string, string> = {
  new: "abadge-gold",
  in_progress: "abadge-blue",
  closed: "abadge-gray",
};
const TYPE_BADGE: Record<string, string> = {
  purchase: "abadge-green",
  request: "abadge-gold",
  contact: "abadge-gray",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LeadsTable({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initial);
  const [fStatus, setFStatus] = useState("all");
  const [fType, setFType] = useState("all");
  const [open, setOpen] = useState<Row | null>(null);

  const list = useMemo(
    () =>
      rows.filter(
        (r) => (fStatus === "all" || r.status === fStatus) && (fType === "all" || r.type === fType)
      ),
    [rows, fStatus, fType]
  );

  const setStatus = async (id: string, status: string) => {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
    setOpen((o) => (o && o.id === id ? { ...o, status } : o));
    await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };

  const remove = async (id: string) => {
    await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
    setRows((r) => r.filter((x) => x.id !== id));
    setOpen(null);
  };

  return (
    <>
      {/* Фильтры */}
      <div style={{ display: "flex", gap: 24, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <label className="alabel">Статус</label>
          <select className="aselect" value={fStatus} onChange={(e) => setFStatus(e.target.value)} style={{ minWidth: 160 }}>
            <option value="all">Все статусы</option>
            {Object.entries(LEAD_STATUSES).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="alabel">Тип</label>
          <select className="aselect" value={fType} onChange={(e) => setFType(e.target.value)} style={{ minWidth: 160 }}>
            <option value="all">Все типы</option>
            {Object.entries(LEAD_TYPES).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="acard" style={{ textAlign: "center", padding: 60, color: "#9aa0ac" }}>
          Заявок нет.
        </div>
      ) : (
        <div className="acard acard-pad0">
          <div style={{ overflowX: "auto" }}>
            <table className="atable">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Имя</th>
                  <th>Телефон</th>
                  <th>Тур</th>
                  <th>Тип</th>
                  <th>Статус</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {list.map((l) => (
                  <tr key={l.id}>
                    <td style={{ whiteSpace: "nowrap", color: "#6b7280", fontSize: 13 }}>{fmtDate(l.createdAt)}</td>
                    <td style={{ fontWeight: 600 }}>{l.name}</td>
                    <td style={{ fontFamily: "var(--m-font)", fontSize: 13 }}>{l.phone}</td>
                    <td style={{ fontSize: 13 }}>{l.tourTitle || "—"}</td>
                    <td>
                      <span className={`abadge ${TYPE_BADGE[l.type] || "abadge-gray"}`}>
                        {LEAD_TYPES[l.type as keyof typeof LEAD_TYPES] || l.type}
                      </span>
                    </td>
                    <td>
                      <span className={`abadge ${STATUS_BADGE[l.status] || "abadge-gray"}`}>
                        {LEAD_STATUSES[l.status as keyof typeof LEAD_STATUSES] || l.status}
                      </span>
                    </td>
                    <td>
                      <button className="alink" onClick={() => setOpen(l)}>
                        Открыть
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Карточка заявки */}
      {open && (
        <div className="amodal-backdrop" onClick={() => setOpen(null)}>
          <div className="amodal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 20 }}>Заявка</h2>
              <button className="alink" onClick={() => setOpen(null)} style={{ fontSize: 22, color: "#9aa0ac" }}>
                ×
              </button>
            </div>

            <dl style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "10px 14px", fontSize: 14, margin: 0 }}>
              <Dt>Дата</Dt><Dd>{fmtDate(open.createdAt)}</Dd>
              <Dt>Имя</Dt><Dd>{open.name}</Dd>
              <Dt>Телефон</Dt><Dd>{open.phone}</Dd>
              {open.email && (<><Dt>E-mail</Dt><Dd>{open.email}</Dd></>)}
              {open.tourTitle && (<><Dt>Тур</Dt><Dd>{open.tourTitle}</Dd></>)}
              <Dt>Человек</Dt><Dd>{open.people}</Dd>
              {open.date && (<><Dt>Дата выезда</Dt><Dd>{open.date}</Dd></>)}
              <Dt>Тип</Dt><Dd>{LEAD_TYPES[open.type as keyof typeof LEAD_TYPES] || open.type}</Dd>
              {open.source && (<><Dt>Источник</Dt><Dd>{open.source}</Dd></>)}
              {open.message && (<><Dt>Сообщение</Dt><Dd>{open.message}</Dd></>)}
            </dl>

            {/* Согласие на обработку ПДн (152-ФЗ): подтверждение для оператора. */}
            <div
              style={{
                marginTop: 18,
                padding: "12px 14px",
                background: "#f3f6f4",
                border: "1px solid #e3e8e4",
                borderRadius: 8,
                fontSize: 13,
                lineHeight: 1.6,
                color: "#3a4149",
              }}
            >
              {open.consentAt ? (
                <>
                  <b style={{ color: "#2f7d4f" }}>✓ Согласие на обработку ПДн получено</b>
                  <br />
                  {fmtDate(open.consentAt)}
                  {open.consentVersion && <> · редакция от {open.consentVersion}</>}
                  {open.consentIp && <> · IP {open.consentIp}</>}
                </>
              ) : (
                <span style={{ color: "#9aa0ac" }}>
                  Согласие не зафиксировано (заявка создана до внедрения учёта согласий).
                </span>
              )}
            </div>

            <div style={{ marginTop: 22 }}>
              <label className="alabel">Статус</label>
              <select
                className="aselect"
                value={open.status}
                onChange={(e) => setStatus(open.id, e.target.value)}
              >
                {Object.entries(LEAD_STATUSES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-start", marginTop: 24 }}>
              <button className="abtn abtn-danger" onClick={() => remove(open.id)}>
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Dt({ children }: { children: React.ReactNode }) {
  return <dt style={{ color: "#9aa0ac" }}>{children}</dt>;
}
function Dd({ children }: { children: React.ReactNode }) {
  return <dd style={{ margin: 0, color: "#23262c" }}>{children}</dd>;
}
