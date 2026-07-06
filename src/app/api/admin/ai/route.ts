// Сохранение конфигурации AI-консультанта.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { aiConfigSchema } from "@/lib/validation";

export async function PUT(req: Request) {
  try {
    await requirePermission("ai");
  } catch (res) {
    return res as Response;
  }

  const body = await req.json().catch(() => null);
  const parsed = aiConfigSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Проверьте поля", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { apiKey, ...rest } = parsed.data;

  // Ключ обновляем только если передана непустая строка — иначе сохраняем прежний.
  const update: Record<string, unknown> = { ...rest };
  if (apiKey && apiKey.trim()) update.apiKey = apiKey.trim();

  const config = await prisma.aiConfig.upsert({
    where: { id: "main" },
    update,
    create: { id: "main", ...rest, apiKey: apiKey?.trim() || "" },
  });

  // Не возвращаем сам ключ клиенту.
  return NextResponse.json({ ...config, apiKey: undefined, hasApiKey: Boolean(config.apiKey) });
}
