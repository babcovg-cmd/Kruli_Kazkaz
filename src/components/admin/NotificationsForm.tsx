"use client";

// Раздел «Уведомления в ТГ»: токен бота, chat ID, привязка в один клик
// (deep-link + опрос) и тестовое сообщение.

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { notificationsSchema, type NotificationsInput } from "@/lib/validation";
import Toast from "@/components/admin/Toast";

type Status = { kind: "ok" | "err" | "info"; text: string } | null;

export default function NotificationsForm({ initial }: { initial: NotificationsInput }) {
  const [toast, setToast] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [status, setStatus] = useState<Status>(null);
  const [linking, setLinking] = useState(false);
  const [testing, setTesting] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { isSubmitting },
  } = useForm<NotificationsInput>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: initial,
  });

  const onSubmit = async (data: NotificationsInput) => {
    const res = await fetch("/api/admin/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setToast(
      res.ok ? { kind: "ok", text: "Настройки сохранены" } : { kind: "err", text: "Ошибка сохранения" }
    );
  };

  // Привязка в один клик: открываем чат с ботом по deep-ссылке с одноразовым
  // кодом и ждём нажатия Start — chat ID сохранится на сервере автоматически.
  const link = async () => {
    const token = getValues("tgBotToken");
    if (!token) {
      setStatus({ kind: "err", text: "Сначала вставьте токен бота (выдаёт @BotFather)" });
      return;
    }
    setLinking(true);
    setStatus(null);
    try {
      const startRes = await fetch("/api/admin/telegram/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", token }),
      });
      const start = await startRes.json().catch(() => ({}));
      if (!startRes.ok) {
        setStatus({ kind: "err", text: start.error || "Не удалось проверить токен" });
        return;
      }

      window.open(`https://t.me/${start.username}?start=${start.code}`, "_blank", "noopener");
      setStatus({ kind: "info", text: "Открыл чат с ботом — нажмите в нём Start. Жду привязку…" });

      for (let i = 0; i < 36; i++) {
        await new Promise((r) => setTimeout(r, 2500));
        const pollRes = await fetch("/api/admin/telegram/link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "poll", token, code: start.code }),
        });
        const poll = await pollRes.json().catch(() => ({}));
        if (!pollRes.ok) {
          setStatus({ kind: "err", text: poll.error || "Ошибка привязки" });
          return;
        }
        if (poll.ok && poll.chat) {
          setValue("tgChatId", poll.chat.id);
          setStatus({
            kind: "ok",
            text: `Готово! Привязан чат «${poll.chat.name}» — настройки сохранены, в Telegram пришло подтверждение.`,
          });
          return;
        }
      }
      setStatus({ kind: "err", text: "Не дождался нажатия Start. Попробуйте ещё раз." });
    } catch {
      setStatus({ kind: "err", text: "Не удалось выполнить привязку" });
    } finally {
      setLinking(false);
    }
  };

  // Тест: с chat ID шлёт сообщение; без него — подсказывает ID чатов.
  const test = async () => {
    setTesting(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/telegram/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: getValues("tgBotToken"), chatId: getValues("tgChatId") }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus({ kind: "err", text: json.error || "Ошибка проверки" });
      } else if (json.ok) {
        setStatus({ kind: "ok", text: "Тестовое сообщение отправлено — проверьте Telegram. Не забудьте сохранить." });
      } else if (json.chats?.length > 0) {
        const first = json.chats[0];
        setValue("tgChatId", first.id);
        setStatus({
          kind: "info",
          text: `Найден чат: ${json.chats.map((c: { id: string; name: string }) => `${c.name} (${c.id})`).join(", ")}. Подставил ID — нажмите «Проверить» ещё раз.`,
        });
      } else {
        setStatus({ kind: "info", text: json.hint || "Напишите боту любое сообщение и повторите." });
      }
    } catch {
      setStatus({ kind: "err", text: "Не удалось выполнить проверку" });
    } finally {
      setTesting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: 720 }}>
      <div className="acard" style={{ marginBottom: 22 }}>
        <h3 style={{ fontSize: 17, marginBottom: 6 }}>Telegram-бот</h3>
        <p className="ahint" style={{ marginBottom: 14 }}>
          Бот присылает сообщение о каждой новой заявке с сайта. Как подключить: 1) создайте
          бота у @BotFather командой /newbot и вставьте сюда токен; 2) нажмите «Привязать
          Telegram» и в открывшемся чате нажмите Start — chat ID подтянется и сохранится сам.
        </p>

        <div className="afield">
          <label className="alabel">Токен бота</label>
          <input className="ainput" {...register("tgBotToken")} />
          <p className="ahint" style={{ marginTop: 6 }}>Выдаёт @BotFather, вида 123456789:AA…</p>
        </div>

        <div className="afield">
          <label className="alabel">Chat ID</label>
          <input className="ainput" {...register("tgChatId")} />
          <p className="ahint" style={{ marginTop: 6 }}>
            Куда слать уведомления. Несколько чатов — через запятую. Групповой чат добавляется
            вручную: добавьте бота в группу, напишите там любое сообщение и нажмите «Проверить»
            с пустым полем — ID подскажется.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <button type="button" className="abtn abtn-gold" onClick={link} disabled={linking || testing}>
            {linking ? "Жду нажатия Start…" : "Привязать Telegram"}
          </button>
          <button type="button" className="abtn abtn-ghost" onClick={test} disabled={testing || linking}>
            {testing ? "Проверяем…" : "Проверить"}
          </button>
          {status && (
            <span
              style={{
                fontSize: 13,
                color: status.kind === "ok" ? "#2f7d4f" : status.kind === "err" ? "#b5462f" : "#6b7280",
              }}
            >
              {status.text}
            </span>
          )}
        </div>
      </div>

      <div style={{ position: "sticky", bottom: 0, paddingBottom: 8 }}>
        <button type="submit" className="abtn abtn-gold" disabled={isSubmitting}>
          {isSubmitting ? "Сохранение…" : "Сохранить"}
        </button>
      </div>

      {toast && <Toast kind={toast.kind} text={toast.text} onClose={() => setToast(null)} />}
    </form>
  );
}
