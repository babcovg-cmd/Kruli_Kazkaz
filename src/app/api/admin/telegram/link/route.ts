// Привязка Telegram-чата в один клик (админка).
// action=start: проверяет токен, возвращает username бота и одноразовый код
//   для deep-ссылки t.me/<бот>?start=<код>.
// action=poll: ищет чат, нажавший Start с этим кодом; найдя — сразу
//   сохраняет токен и chat ID в настройки сайта.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { getBotInfo, findChatByStartCode, sendTelegram } from "@/lib/telegram";
import { randomBytes } from "crypto";
import { z } from "zod";

const linkSchema = z.object({
  action: z.enum(["start", "poll"]),
  token: z.string().trim().min(1).max(100),
  code: z.string().trim().max(20).optional().default(""),
});

export async function POST(req: Request) {
  try {
    await requirePermission("notifications");
  } catch (res) {
    return res as Response;
  }

  const body = await req.json().catch(() => null);
  const parsed = linkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Укажите токен бота" }, { status: 422 });
  }
  const { action, token, code } = parsed.data;

  if (action === "start") {
    const info = await getBotInfo(token);
    if (!info.ok || !info.username) {
      return NextResponse.json(
        { error: `Токен не подошёл — Telegram ответил: ${info.error || "нет username"}` },
        { status: 502 }
      );
    }
    return NextResponse.json({
      username: info.username,
      code: randomBytes(4).toString("hex"),
    });
  }

  // action === "poll"
  if (!code) return NextResponse.json({ error: "Нет кода привязки" }, { status: 422 });
  const r = await findChatByStartCode(token, code);
  if (!r.ok) return NextResponse.json({ error: `Telegram: ${r.error}` }, { status: 502 });
  if (!r.chat) return NextResponse.json({ pending: true });

  // Чат найден — сохраняем настройки и шлём подтверждение в привязанный чат.
  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: { tgBotToken: token, tgChatId: r.chat.id },
    create: { id: "main", tgBotToken: token, tgChatId: r.chat.id },
  });
  await sendTelegram(
    token,
    r.chat.id,
    "✅ Telegram привязан: сюда будут приходить уведомления о заявках с сайта «Крылья Кавказа»."
  );

  return NextResponse.json({ ok: true, chat: r.chat });
}
