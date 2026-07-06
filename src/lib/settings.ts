// Доступ к настройкам сайта и конфигу AI с гарантированными значениями по умолчанию.

import { prisma } from "@/lib/prisma";
import type { SiteSettings, AiConfig } from "@prisma/client";

/**
 * Возвращает настройки сайта. Если записи ещё нет (свежая БД),
 * создаёт её с дефолтами из schema.prisma.
 */
export async function getSettings(): Promise<SiteSettings> {
  const existing = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  if (existing) return existing;
  return prisma.siteSettings.create({ data: { id: "main" } });
}

/** Конфиг AI-консультанта (создаёт запись с дефолтами при отсутствии). */
export async function getAiConfig(): Promise<AiConfig> {
  const existing = await prisma.aiConfig.findUnique({ where: { id: "main" } });
  if (existing) return existing;
  return prisma.aiConfig.create({ data: { id: "main" } });
}
