// AI-консультант (публичный виджет): прокси к DeepSeek API со стримингом.
// Системный промт и контекст туров берутся из БД (заданы в админке).
// Ключ API используется только на сервере и не попадает в браузер.

import { getAiConfig, getSettings } from "@/lib/settings";
import { chatRequestSchema } from "@/lib/validation";
import { buildToursContext, buildCompanyContext, buildSystemPrompt, streamDeepSeek } from "@/lib/ai";

export const runtime = "nodejs";

// Простой лимит частоты по IP: защита от спама и слива токенов DeepSeek.
// Хранится в памяти процесса (подходит для одного Node-сервера / VPS).
const RATE_LIMIT = 20; // сообщений
const RATE_WINDOW_MS = 60_000; // за 1 минуту
const hits = new Map<string, number[]>();

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  // Изредка подчищаем старые записи, чтобы Map не рос бесконечно.
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(k);
  }
  return arr.length > RATE_LIMIT;
}

export async function POST(req: Request) {
  if (rateLimited(clientIp(req))) {
    return new Response("Слишком много сообщений подряд. Немного подождите и напишите снова 🙏", {
      status: 429,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

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
  const companyContext = buildCompanyContext(settings);
  const systemPrompt = buildSystemPrompt({
    systemPrompt: ai.systemPrompt,
    extraContext: ai.toursContext,
    toursContext,
    companyContext,
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
