// Доступ к категориям туров (из БД). С автозаполнением дефолтами на пустой базе.

import { prisma } from "@/lib/prisma";
import type { Category } from "@prisma/client";

/** Цвета бейджей, доступные для категории. */
export const BADGE_CLASSES = ["b-green", "b-amber", "b-blue", "b-purple", "b-terra"] as const;

/** Стартовый набор категорий (используется в seed и как fallback). */
export const DEFAULT_CATEGORIES: Omit<Category, "id" | "createdAt" | "updatedAt">[] = [
  { name: "Однодневные туры", description: "Каньоны, водопады и аулы за один выезд", glyph: "☀", badgeClass: "b-green", sortOrder: 1 },
  { name: "Экскурсии", description: "Города, крепости и культурное наследие", glyph: "◈", badgeClass: "b-green", sortOrder: 2 },
  { name: "Сборные туры", description: "Многодневные маршруты в малых группах", glyph: "⛰", badgeClass: "b-blue", sortOrder: 3 },
  { name: "Тематические туры", description: "Гастрономия, история, ремёсла", glyph: "✦", badgeClass: "b-purple", sortOrder: 4 },
  { name: "Спортивный туризм", description: "Восхождения, треккинг, экспедиции", glyph: "▲", badgeClass: "b-amber", sortOrder: 5 },
  { name: "Туры под запрос", description: "Индивидуальные программы под вас", glyph: "✎", badgeClass: "b-amber", sortOrder: 6 },
];

/** Все категории по порядку. Если таблица пуста — создаёт дефолтные. */
export async function getCategories(): Promise<Category[]> {
  const list = await prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  if (list.length > 0) return list;
  await prisma.category.createMany({ data: DEFAULT_CATEGORIES });
  return prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
}

/** Карта «имя → категория» для быстрого доступа к цвету/иконке. */
export async function getCategoryMap(): Promise<Record<string, Category>> {
  const list = await getCategories();
  return Object.fromEntries(list.map((c) => [c.name, c]));
}
