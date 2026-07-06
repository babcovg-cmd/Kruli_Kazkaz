// Общие помощники AI-консультанта: сбор контекста о турах, системного промта
// и стриминг ответа модели DeepSeek (OpenAI-совместимый API).

import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

/** Базовый URL DeepSeek API (можно переопределить через .env). */
export const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";

/** Компактный контекст об активных турах для модели. */
export async function buildToursContext(): Promise<string> {
  const tours = await prisma.tour.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      title: true,
      slug: true,
      category: true,
      shortDesc: true,
      price: true,
      priceOnReq: true,
      duration: true,
      difficulty: true,
      ageLimit: true,
      nearestDate: true,
    },
  });

  return tours
    .map(
      (t) =>
        `• ${t.title} (${t.category}) — ${formatPrice(t.price, t.priceOnReq)}, ${t.duration}, ` +
        `сложность: ${t.difficulty}, возраст: ${t.ageLimit}, ближайшая дата: ${t.nearestDate || "по запросу"}. ` +
        `${t.shortDesc} Ссылка: /tours/${t.slug}.`
    )
    .join("\n") +
    "\n\nОплата онлайн на сайте недоступна. По любому туру клиент оставляет заявку — менеджер связывается, обсуждает детали и предлагает удобный способ оплаты.";
}

/** Итоговый системный промт = настройка из админки + контекст туров + правила. */
export function buildSystemPrompt(opts: {
  systemPrompt: string;
  extraContext?: string;
  toursContext: string;
  phone: string;
}): string {
  return [
    opts.systemPrompt,
    "",
    "АКТУАЛЬНЫЕ ТУРЫ (используй только эти данные, не выдумывай цены и даты):",
    opts.toursContext || "(список туров пуст)",
    opts.extraContext ? `\nДополнительный контекст:\n${opts.extraContext}` : "",
    "",
    `Контакты для передачи менеджеру: телефон ${opts.phone} (WhatsApp/Telegram).`,
    "Если не знаешь точного ответа или вопрос вне темы туров по Кавказу — вежливо предложи написать менеджеру по указанному телефону. Не обещай того, чего нет в списке туров.",
  ].join("\n");
}

/**
 * Стриминг ответа DeepSeek в виде text/plain.
 * DeepSeek использует OpenAI-совместимый формат (chat/completions, SSE),
 * поэтому ходим обычным fetch без дополнительного SDK.
 */
export function streamDeepSeek(opts: {
  apiKey: string;
  model: string;
  systemPrompt: string;
  messages: { role: "user" | "assistant"; content: string }[];
  fallback: string;
  baseUrl?: string;
}) {
  const encoder = new TextEncoder();
  const base = (opts.baseUrl || DEEPSEEK_BASE_URL).replace(/\/+$/, "");

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const res = await fetch(`${base}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${opts.apiKey}`,
          },
          body: JSON.stringify({
            model: opts.model,
            stream: true,
            max_tokens: 1024,
            // Системный промт идёт первым сообщением с ролью system.
            messages: [
              { role: "system", content: opts.systemPrompt },
              ...opts.messages.map((m) => ({ role: m.role, content: m.content })),
            ],
          }),
        });

        if (!res.ok || !res.body) {
          const detail = await res.text().catch(() => "");
          throw new Error(`DeepSeek API ${res.status}: ${detail.slice(0, 300)}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        // Разбираем поток SSE: события вида «data: {json}\n», конец — «data: [DONE]».
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          // Последняя строка может быть неполной — оставляем её в буфере до следующего чанка.
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (!data || data === "[DONE]") continue;
            try {
              const json = JSON.parse(data);
              const delta: string | undefined = json.choices?.[0]?.delta?.content;
              if (delta) controller.enqueue(encoder.encode(delta));
            } catch {
              // Служебный/неполный фрагмент — пропускаем.
            }
          }
        }
        controller.close();
      } catch (err) {
        console.error("Ошибка AI-консультанта (DeepSeek):", err);
        controller.enqueue(encoder.encode(`\n\nИзвините, произошла ошибка. ${opts.fallback}`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
  });
}
