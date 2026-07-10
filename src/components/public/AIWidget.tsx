"use client";

// Плавающий виджет AI-консультанта.
// По умолчанию свёрнут в круглую кнопку (FAB) в правом нижнем углу.
// По клику чат-панель плавно выезжает (slide + fade), повторный клик — сворачивает.
// История хранится только в рамках сессии. Запросы идут на /api/chat со стримингом.

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content: "Здравствуйте! Я подберу тур по Кавказу. Куда хотите поехать и на сколько дней?",
};

const STORAGE_KEY = "kk-chat-history";

export default function AIWidget({ phone }: { phone: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Память между перезагрузками: восстанавливаем историю из localStorage.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Msg[];
        if (Array.isArray(parsed) && parsed.length > 0) setMessages([GREETING, ...parsed]);
      }
    } catch {
      /* хранилище недоступно — работаем без сохранения */
    }
  }, []);

  // Сохраняем историю (без приветствия) при каждом изменении.
  useEffect(() => {
    try {
      const toSave = messages.filter((m) => m !== GREETING);
      if (toSave.length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave.slice(-40)));
    } catch {
      /* игнорируем ошибки записи */
    }
  }, [messages]);

  // Автопрокрутка к последнему сообщению.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Фокус на поле ввода при открытии.
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 280);
  }, [open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.filter((m) => m !== GREETING) }),
      });

      if (!res.ok || !res.body) throw new Error("fail");

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
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: `Извините, не удалось получить ответ. Напишите нашему менеджеру — он поможет с подбором тура: ${phone}.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-widget">
      {/* Чат-панель: всегда в DOM, видимость управляется классом .open */}
      <div className={`ai-panel ${open ? "open" : ""}`} role="dialog" aria-label="ИИ-консультант" aria-hidden={!open}>
        <div className="ai-head">
          <span className="ai-ava">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/emblem-gold.png" alt="" style={{ height: 22 }} />
          </span>
          <span style={{ lineHeight: 1.2 }}>
            <b style={{ fontSize: 14 }}>ИИ-консультант</b>
            <br />
            <span className="muted" style={{ fontSize: 11 }}>
              обычно отвечает сразу
            </span>
          </span>
          <button onClick={() => setOpen(false)} aria-label="Свернуть чат" className="ai-close">
            ×
          </button>
        </div>

        <div ref={scrollRef} className="ai-scroll">
          {messages.map((m, i) => (
            <div key={i} className={`ai-msg ${m.role === "user" ? "me" : "bot"}`}>
              {m.content || (
                <span className="typing">
                  <i />
                  <i />
                  <i />
                </span>
              )}
            </div>
          ))}
          {loading && messages[messages.length - 1]?.role === "user" && (
            <div className="ai-msg bot">
              <span className="typing">
                <i />
                <i />
                <i />
              </span>
            </div>
          )}
        </div>

        <div className="ai-inputbar">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Напишите сообщение…"
            className="ai-input"
          />
          <button onClick={send} className="btn btn-gold btn-sm" style={{ padding: "0 16px" }} disabled={loading} aria-label="Отправить">
            →
          </button>
        </div>
      </div>

      {/* Круглая кнопка-переключатель */}
      <button
        className={`ai-fab ${open ? "open" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Свернуть консультанта" : "Открыть ИИ-консультанта"}
        aria-expanded={open}
      >
        <span className="ai-fab-icon ai-fab-chat">💬</span>
        <span className="ai-fab-icon ai-fab-x">×</span>
      </button>
    </div>
  );
}
