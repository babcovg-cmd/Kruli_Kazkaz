"use client";

// Редактор настроек AI-консультанта + тест-чат справа.

import { useEffect, useRef, useState } from "react";
import Toast from "@/components/admin/Toast";

type Config = { systemPrompt: string; toursContext: string; enabled: boolean; model: string };
type Msg = { role: "user" | "assistant"; content: string };

const MODELS = [
  { value: "", label: "По умолчанию (из .env)" },
  { value: "deepseek-chat", label: "DeepSeek-V3 (deepseek-chat) — рекомендуется" },
  { value: "deepseek-reasoner", label: "DeepSeek-R1 (deepseek-reasoner) — рассуждающая, медленнее" },
];

export default function AIConfigEditor({
  initial,
  tourCount,
  hasKey,
  keySource,
  envModel,
}: {
  initial: Config;
  tourCount: number;
  hasKey: boolean;
  keySource: "admin" | "env" | "none";
  envModel: string;
}) {
  const [cfg, setCfg] = useState<Config>(initial);
  const [apiKey, setApiKey] = useState(""); // новый ключ (пусто = не менять)
  const [keySet, setKeySet] = useState(hasKey);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  // Тест-чат
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/ai", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      // apiKey отправляем только если пользователь ввёл новый.
      body: JSON.stringify({ ...cfg, apiKey: apiKey.trim() }),
    });
    setSaving(false);
    if (res.ok) {
      if (apiKey.trim()) {
        setKeySet(true);
        setApiKey("");
      }
      setToast({ kind: "ok", text: "Настройки сохранены" });
    } else {
      setToast({ kind: "err", text: "Не удалось сохранить" });
    }
  };

  const send = async () => {
    const t = input.trim();
    if (!t || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: t }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ai/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Тестируем с текущими (несохранёнными) значениями редактора.
        body: JSON.stringify({
          messages: next,
          systemPrompt: cfg.systemPrompt,
          toursContext: cfg.toursContext,
        }),
      });
      if (!res.ok || !res.body) throw new Error();
      setMessages((m) => [...m, { role: "assistant", content: "" }]);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Ошибка запроса к API." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18 }}>
        <button className="abtn abtn-gold abtn-sm" onClick={save} disabled={saving}>
          {saving ? "Сохранение…" : "Сохранить"}
        </button>
      </div>

      {/* Подключение нейросети */}
      <div className="acard" style={{ marginBottom: 22 }}>
        <h3 style={{ fontSize: 17, marginBottom: 6 }}>Подключение нейросети (DeepSeek)</h3>
        <p className="ahint">
          Укажите свой API-ключ с{" "}
          <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener noreferrer" style={{ color: "#8a6320", textDecoration: "underline" }}>
            platform.deepseek.com
          </a>
          . Ключ хранится в базе и используется только на сервере.
        </p>

        {keySet ? (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(63,138,91,0.12)",
              color: "#3f8a5b",
              padding: "7px 12px",
              borderRadius: 8,
              fontSize: 13,
              marginBottom: 12,
            }}
          >
            ✓ Ключ задан{keySource === "env" && !apiKey ? " (из .env)" : ""}. Введите новый, чтобы заменить.
          </div>
        ) : (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(176,127,42,0.12)",
              color: "#8a6320",
              padding: "7px 12px",
              borderRadius: 8,
              fontSize: 13,
              marginBottom: 12,
            }}
          >
            ⚠ Ключ не задан — консультант не отвечает.
          </div>
        )}

        <div className="agrid-2">
          <div className="afield" style={{ marginBottom: 0 }}>
            <label className="alabel">API-ключ</label>
            <input
              className="ainput"
              type="password"
              autoComplete="off"
              placeholder={keySet ? "•••••••••• (оставьте пустым, чтобы не менять)" : "sk-..."}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          <div className="afield" style={{ marginBottom: 0 }}>
            <label className="alabel">Модель</label>
            <select className="aselect" value={cfg.model} onChange={(e) => setCfg({ ...cfg, model: e.target.value })}>
              {MODELS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                  {m.value === "" ? ` — ${envModel}` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="agrid-ai" style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24 }}>
        {/* Левая колонка — настройки */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div className="acard">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <h3 style={{ fontSize: 17 }}>Системный промт</h3>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                <button
                  type="button"
                  className={`atoggle ${cfg.enabled ? "on" : ""}`}
                  onClick={() => setCfg({ ...cfg, enabled: !cfg.enabled })}
                >
                  <span className="knob" />
                </button>
                Консультант включён
              </label>
            </div>
            <p className="ahint">Задаёт тон и поведение консультанта на сайте.</p>
            <textarea
              className="atextarea"
              rows={8}
              value={cfg.systemPrompt}
              onChange={(e) => setCfg({ ...cfg, systemPrompt: e.target.value })}
              style={{ lineHeight: 1.6 }}
            />
          </div>

          <div className="acard">
            <h3 style={{ fontSize: 17, marginBottom: 6 }}>Контекст о турах</h3>
            <p className="ahint">
              Дополнительная информация для ИИ (акции, особенности, FAQ). Список активных туров ({tourCount})
              подставляется автоматически.
            </p>
            <textarea
              className="atextarea"
              rows={6}
              value={cfg.toursContext}
              onChange={(e) => setCfg({ ...cfg, toursContext: e.target.value })}
              placeholder="Например: скидка 10% при раннем бронировании; детям до 5 лет бесплатно…"
            />
          </div>
        </div>

        {/* Правая колонка — тест */}
        <div className="acard acard-pad0" style={{ height: "fit-content", position: "sticky", top: 24 }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--aline)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(176,127,42,0.14)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/logo-mark.png" alt="" style={{ height: 20, mixBlendMode: "multiply" }} />
            </span>
            <b style={{ fontSize: 14 }}>Тест консультанта</b>
          </div>
          <div ref={scrollRef} className="achat-msgs">
            {messages.length === 0 && (
              <p style={{ color: "#9aa0ac", fontSize: 13, margin: "auto", textAlign: "center" }}>
                Напишите сообщение, чтобы проверить ответы консультанта с текущими настройками.
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`achat-bubble ${m.role === "user" ? "me" : "bot"}`}>
                {m.content || "…"}
              </div>
            ))}
            {loading && messages[messages.length - 1]?.role === "user" && (
              <div className="achat-bubble bot">…</div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, padding: 12, borderTop: "1px solid var(--aline)" }}>
            <input
              className="ainput"
              style={{ borderRadius: 999 }}
              placeholder="Спросите что-нибудь…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button
              onClick={send}
              disabled={loading}
              style={{ background: "#b07f2a", border: "none", borderRadius: 999, width: 42, color: "#fff", fontSize: 16, cursor: "pointer", flexShrink: 0 }}
            >
              →
            </button>
          </div>
        </div>
      </div>

      {toast && <Toast kind={toast.kind} text={toast.text} onClose={() => setToast(null)} />}
    </>
  );
}
