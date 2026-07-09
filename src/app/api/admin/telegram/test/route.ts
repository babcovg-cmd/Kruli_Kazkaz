// Проверка Telegram-уведомлений из админки.
// С chat ID — шлёт тестовое сообщение; без него — показывает чаты,
// которые писали боту (подсказка, какой chat ID вписать).

import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth";
import { sendTelegram, getBotChats } from "@/lib/telegram";
import { z } from "zod";

const testSchema = z.object({
  token: z.string().trim().max(100).default(""),
  chatId: z.string().trim().max(200).default(""),
});

export async function POST(req: Request) {
  try {
    await requirePermission("notifications");
  } catch (res) {
    return res as Response;
  }

  const body = await req.json().catch(() => null);
  const parsed = testSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 422 });
  }
  const { token, chatId } = parsed.data;

  if (!token) {
    return NextResponse.json({ error: "Укажите токен бота" }, { status: 422 });
  }

  // Без chat ID — ищем чаты, писавшие боту, и подсказываем их ID.
  if (!chatId) {
    const r = await getBotChats(token);
    if (!r.ok) return NextResponse.json({ error: `Telegram: ${r.error}` }, { status: 502 });
    if (!r.chats || r.chats.length === 0) {
      return NextResponse.json({
        chats: [],
        hint: "Бот отвечает, но чатов не видно. Напишите боту любое сообщение и нажмите «Проверить» ещё раз.",
      });
    }
    return NextResponse.json({ chats: r.chats });
  }

  // С chat ID — отправляем тест в каждый указанный чат.
  const ids = chatId.split(",").map((c) => c.trim()).filter(Boolean);
  const results = await Promise.all(
    ids.map((id) => sendTelegram(token, id, "✅ Тест: уведомления о заявках «Крылья Кавказа» подключены."))
  );
  const failed = results
    .map((r, i) => (r.ok ? null : `${ids[i]}: ${r.error}`))
    .filter(Boolean) as string[];

  if (failed.length > 0) {
    return NextResponse.json({ error: `Не доставлено — ${failed.join("; ")}` }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
