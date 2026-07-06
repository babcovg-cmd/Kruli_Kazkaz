// AI-консультант (публичный виджет): прокси к DeepSeek API со стримингом.
// Системный промт и контекст туров берутся из БД (заданы в админке).
// Ключ API используется только на сервере и не попадает в браузер.

import { getAiConfig, getSettings } from "@/lib/settings";
import { chatRequestSchema } from "@/lib/validation";
import { buildToursContext, buildSystemPrompt, streamDeepSeek } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const [ai, settings] = await Promise.all([getAiConfig(), getSettings()]);

  // Ключ и модель: приоритет — заданным в админке, затем переменные окружения.
  const apiKey = ai.apiKey || process.env.DEEPSEEK_API_KEY;
  const model = ai.model || process.env.DEEPSEEK_MODEL || "deepseek-chat";

  const fallback = `Напишите нашему менеджеру — он быстро поможет с подбором тура: ${settings.phone}.`;

  // Без ключа консультант недоступен — отдаём понятное сообщение.
  if (!apiKey) {
    return text(`Консультант временно недоступен. ${fallback}`);
  }
  if (!ai.enabled) {
    return text(`Консультант сейчас отключён. ${fallback}`);
  }

  const body = await req.json().catch(() => null);
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response("Некорректные сообщения", { status: 422 });
  }

  const toursContext = await buildToursContext();
  const systemPrompt = buildSystemPrompt({
    systemPrompt: ai.systemPrompt,
    extraContext: ai.toursContext,
    toursContext,
    phone: settings.phone,
  });

  return streamDeepSeek({ apiKey, model, systemPrompt, messages: parsed.data.messages, fallback });
}

/** Простой текстовый ответ (не стрим). */
function text(body: string) {
  return new Response(body, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
