// Уведомления о новых заявках в Telegram (Bot API).
// Токен бота и chat ID задаются в админке (Настройки → Уведомления в Telegram)
// либо через переменные окружения TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID.
// Сбой отправки никогда не ломает приём заявки — только пишется в лог сервера.

import type { Lead } from "@prisma/client";
import { getSettings } from "@/lib/settings";
import { LEAD_TYPES } from "@/lib/constants";

const API = "https://api.telegram.org";

/** Экранирование пользовательского текста для parse_mode=HTML. */
function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Отправка одного сообщения. Возвращает ok/описание ошибки Telegram. */
export async function sendTelegram(
  token: string,
  chatId: string,
  text: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    const json = await res.json().catch(() => null);
    if (json?.ok) return { ok: true };
    return { ok: false, error: json?.description || `HTTP ${res.status}` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "network error" };
  }
}

/** Данные бота по токену (для deep-link привязки нужен username). */
export async function getBotInfo(
  token: string
): Promise<{ ok: boolean; username?: string; error?: string }> {
  try {
    const res = await fetch(`${API}/bot${token}/getMe`);
    const json = await res.json().catch(() => null);
    if (!json?.ok) return { ok: false, error: json?.description || `HTTP ${res.status}` };
    return { ok: true, username: json.result?.username };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "network error" };
  }
}

/**
 * Ищет чат, который нажал Start по deep-ссылке с одноразовым кодом
 * (сообщение вида «/start КОД»). Так привязывается именно чат админа.
 */
export async function findChatByStartCode(
  token: string,
  code: string
): Promise<{ ok: boolean; chat?: { id: string; name: string }; error?: string }> {
  try {
    const res = await fetch(`${API}/bot${token}/getUpdates`);
    const json = await res.json().catch(() => null);
    if (!json?.ok) return { ok: false, error: json?.description || `HTTP ${res.status}` };
    for (const u of [...(json.result ?? [])].reverse()) {
      const msg = u.message;
      if (!msg?.chat || typeof msg.text !== "string") continue;
      if (msg.text.trim() === `/start ${code}`) {
        const chat = msg.chat;
        const name =
          chat.title || [chat.first_name, chat.last_name].filter(Boolean).join(" ") || chat.username || "чат";
        return { ok: true, chat: { id: String(chat.id), name } };
      }
    }
    return { ok: true }; // ещё не нажал Start
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "network error" };
  }
}

/**
 * Список чатов, которые писали боту (для подсказки chat ID в админке).
 * Требует, чтобы пользователь сначала отправил боту любое сообщение.
 */
export async function getBotChats(
  token: string
): Promise<{ ok: boolean; chats?: { id: string; name: string }[]; error?: string }> {
  try {
    const res = await fetch(`${API}/bot${token}/getUpdates`);
    const json = await res.json().catch(() => null);
    if (!json?.ok) return { ok: false, error: json?.description || `HTTP ${res.status}` };
    const seen = new Map<string, string>();
    for (const u of json.result ?? []) {
      const chat = u.message?.chat ?? u.my_chat_member?.chat;
      if (!chat) continue;
      const name =
        chat.title || [chat.first_name, chat.last_name].filter(Boolean).join(" ") || chat.username || "чат";
      seen.set(String(chat.id), name);
    }
    return { ok: true, chats: [...seen].map(([id, name]) => ({ id, name })) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "network error" };
  }
}

/** Текст уведомления о заявке. */
export function leadMessage(lead: Lead, tourTitle: string | null): string {
  const typeLabel = LEAD_TYPES[lead.type as keyof typeof LEAD_TYPES] || lead.type;
  const lines = [
    "🔔 <b>Новая заявка с сайта</b>",
    "",
    `Тип: ${esc(typeLabel)}`,
    tourTitle ? `Тур: <b>${esc(tourTitle)}</b>` : "",
    `Имя: ${esc(lead.name)}`,
    `Телефон: ${esc(lead.phone)}`,
    lead.email ? `E-mail: ${esc(lead.email)}` : "",
    lead.people > 1 ? `Человек: ${lead.people}` : "",
    lead.date ? `Желаемая дата: ${esc(lead.date)}` : "",
    lead.message ? `Комментарий: ${esc(lead.message)}` : "",
    lead.source ? `Источник: ${esc(lead.source)}` : "",
  ];
  return lines.filter(Boolean).join("\n");
}

/** Уведомить менеджеров о новой заявке (во все указанные чаты). */
export async function notifyNewLead(lead: Lead, tourTitle: string | null): Promise<void> {
  try {
    const s = await getSettings();
    const token = s.tgBotToken || process.env.TELEGRAM_BOT_TOKEN || "";
    const chatIds = (s.tgChatId || process.env.TELEGRAM_CHAT_ID || "")
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    if (!token || chatIds.length === 0) return; // уведомления не настроены

    const text = leadMessage(lead, tourTitle);
    const results = await Promise.all(chatIds.map((id) => sendTelegram(token, id, text)));
    for (const [i, r] of results.entries()) {
      if (!r.ok) console.error(`Telegram: не доставлено в чат ${chatIds[i]}: ${r.error}`);
    }
  } catch (e) {
    console.error("Telegram: ошибка уведомления о заявке:", e);
  }
}
