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

// Ключ старой «памяти чата» (сохранение отключено; ключ чистим у посетителей).
const LEGACY_STORAGE_KEY = "kk-chat-history";

// Модели просят отвечать без Markdown, но подстраховываемся: **текст** рисуем
// жирным, «* » / «- » в начале строки превращаем в «• », ссылки делаем
// кликабельными — и markdown-формат [текст](/tours/...), и голые пути /tours/….
const linkStyle: React.CSSProperties = { color: "inherit", textDecoration: "underline", fontWeight: 600 };

// Жирный **…** + автоссылки на страницы туров в обычном тексте.
function renderBoldAndPaths(text: string, keyBase: string): React.ReactNode[] {
  return text.split(/\*\*([^*]+)\*\*/g).map((seg, i) => {
    if (i % 2) return <b key={`${keyBase}-b${i}`}>{seg}</b>;
    // Голые пути вида /tours/slug превращаем в ссылки.
    return seg.split(/(\/tours\/[a-z0-9-]+)/g).map((p, j) =>
      j % 2 ? (
        <a key={`${keyBase}-p${i}-${j}`} href={p} style={linkStyle}>
          {p}
        </a>
      ) : (
        p
      )
    );
  });
}

// Markdown-ссылки [текст](url) → <a>, остальное — через renderBoldAndPaths.
function renderInline(text: string, keyBase: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^()\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(...renderBoldAndPaths(text.slice(last, m.index), `${keyBase}-t${k}`));
    out.push(
      <a key={`${keyBase}-l${k}`} href={m[2]} style={linkStyle}>
        {m[1].replace(/\*\*/g, "")}
      </a>
    );
    last = m.index + m[0].length;
    k += 1;
  }
  if (last < text.length) out.push(...renderBoldAndPaths(text.slice(last), `${keyBase}-e`));
  return out;
}

function renderContent(text: string): React.ReactNode {
  return text.split("\n").map((rawLine, li, lines) => {
    const line = rawLine.replace(/^(\s*)[*-]\s+/, "$1• ");
    return (
      <span key={li}>
        {renderInline(line, `l${li}`)}
        {li < lines.length - 1 ? "\n" : null}
      </span>
    );
  });
}

export default function AIWidget({ phone }: { phone: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // История живёт только до перезагрузки страницы: каждый визит — новый чат.
  // Подчищаем историю, сохранённую старой версией виджета.
  useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      /* хранилище недоступно — и не нужно */
    }
  }, []);

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
              {m.content ? (
                renderContent(m.content)
              ) : (
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
        <p className="muted" style={{ fontSize: 10, textAlign: "center", margin: "0 12px 8px", lineHeight: 1.4 }}>
          Не указывайте в чате персональные данные — для заявки используйте формы сайта.
        </p>
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
