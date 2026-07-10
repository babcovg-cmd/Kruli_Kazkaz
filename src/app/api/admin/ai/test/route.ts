// Тест AI-консультанта в админке. Позволяет проверить ответы с текущим
// (возможно, ещё не сохранённым) промтом и контекстом.

import { requirePermission } from "@/lib/auth";
import { getAiConfig, getSettings } from "@/lib/settings";
import { chatTestSchema } from "@/lib/validation";
import { buildToursContext, buildCompanyContext, buildSystemPrompt, streamDeepSeek } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    await requirePermission("ai");
  } catch (res) {
    return res as Response;
  }

  const [ai, settings] = await Promise.all([getAiConfig(), getSettings()]);

  // Ключ и модель: приоритет — заданным в админке, затем .env.
  const apiKey = ai.apiKey || process.env.DEEPSEEK_API_KEY;
  const model = ai.model || process.env.DEEPSEEK_MODEL || "deepseek-chat";
  const fallback = `Менеджер: ${settings.phone}.`;

  if (!apiKey) {
    return new Response(
      "⚠ API-ключ не задан. Укажите ключ DeepSeek в поле выше (или в .env), чтобы протестировать консультанта.",
      { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = chatTestSchema.safeParse(body);
  if (!parsed.success) return new Response("Некорректный запрос", { status: 422 });

  const toursContext = await buildToursContext();
  const companyContext = buildCompanyContext(settings);
  const systemPrompt = buildSystemPrompt({
    // Если переданы значения из редактора — используем их, иначе сохранённые.
    systemPrompt: parsed.data.systemPrompt ?? ai.systemPrompt,
    extraContext: parsed.data.toursContext ?? ai.toursContext,
    toursContext,
    companyContext,
    phone: settings.phone,
  });

  return streamDeepSeek({ apiKey, model, systemPrompt, messages: parsed.data.messages, fallback });
}
