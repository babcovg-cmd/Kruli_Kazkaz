// Слой доступа к данным для серверных компонентов.
// Возвращает «обогащённые» объекты тура с распарсенными фото и форматированной ценой.

import { prisma } from "@/lib/prisma";
import { parseImages, formatPrice, formatDateRu } from "@/lib/utils";
import { getCategoryMap } from "@/lib/categories";
import type { Tour } from "@prisma/client";
import type { TourInput } from "@/lib/validation";

export type TourView = Tour & {
  imageList: string[];
  cover: string | null;
  priceLabel: string;
  badgeClass: string;
  /** Дата для показа: текст-подпись, иначе авто-формат из startDate. */
  dateLabel: string;
  /** Дата выезда в виде timestamp (для клиентской фильтрации); null = «по запросу». */
  startTs: number | null;
  /** Есть ли свободные места (без ограничения или seats > 0). */
  hasSeats: boolean;
  /** Подпись о местах: «Осталось N мест» / «Мест нет» / null (без ограничения). */
  seatsLabel: string | null;
};

/** Склонение слова «место» по числу. */
function seatsWord(n: number): string {
  const a = Math.abs(n) % 100;
  const b = n % 10;
  if (a > 10 && a < 20) return "мест";
  if (b > 1 && b < 5) return "места";
  if (b === 1) return "место";
  return "мест";
}

/** Преобразует ввод формы тура в данные для Prisma (фото → JSON, дата → Date|null). */
export function tourInputToData(data: TourInput) {
  const { startDate, images, ...rest } = data;
  return {
    ...rest,
    images: JSON.stringify(images),
    startDate: startDate ? new Date(startDate) : null,
  };
}

/** Преобразует запись Tour в удобный для отрисовки объект. badgeClass — цвет из категории. */
export function toTourView(t: Tour, badgeClass = "b-amber"): TourView {
  const imageList = parseImages(t.images);
  const hasSeats = t.unlimitedSeats || t.seats > 0;
  const seatsLabel = t.unlimitedSeats
    ? null
    : t.seats > 0
      ? `Осталось ${t.seats} ${seatsWord(t.seats)}`
      : "Мест нет";
  return {
    ...t,
    imageList,
    cover: imageList[0] ?? null,
    priceLabel: formatPrice(t.price, t.priceOnReq),
    badgeClass,
    dateLabel: t.nearestDate || formatDateRu(t.startDate),
    startTs: t.startDate ? t.startDate.getTime() : null,
    hasSeats,
    seatsLabel,
  };
}

/** Цвет бейджа категории по карте категорий. */
function badgeFor(map: Awaited<ReturnType<typeof getCategoryMap>>, category: string): string {
  return map[category]?.badgeClass ?? "b-amber";
}

/** Все активные туры (для каталога), отсортированные. */
export async function getActiveTours(): Promise<TourView[]> {
  const [tours, map] = await Promise.all([
    prisma.tour.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    getCategoryMap(),
  ]);
  return tours.map((t) => toTourView(t, badgeFor(map, t.category)));
}

/**
 * Туры для блока «Ближайшие туры» на главной.
 * Сайт сам определяет самые близкие выезды: берём активные туры с датой
 * выезда в будущем и сортируем по возрастанию даты. Если таких меньше лимита —
 * добавляем туры без даты («по запросу») и помеченные «показывать на главной».
 */
export async function getHomeTours(limit = 4): Promise<TourView[]> {
  const now = new Date();

  // Только туры со свободными местами: без ограничения ИЛИ seats > 0.
  const available = { OR: [{ unlimitedSeats: true }, { seats: { gt: 0 } }] };

  // 1. Ближайшие предстоящие выезды (по дате), где есть места.
  const upcoming = await prisma.tour.findMany({
    where: { isActive: true, startDate: { gte: now }, ...available },
    orderBy: { startDate: "asc" },
    take: limit,
  });

  const map = await getCategoryMap();

  if (upcoming.length >= limit) {
    return upcoming.map((t) => toTourView(t, badgeFor(map, t.category)));
  }

  // 2. Добор: остальные активные туры с местами (приоритет — отмеченным «на главной»),
  //    исключая уже выбранные.
  const usedIds = upcoming.map((t) => t.id);
  const filler = await prisma.tour.findMany({
    where: { isActive: true, id: { notIn: usedIds }, ...available },
    orderBy: [{ showOnHome: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    take: limit - upcoming.length,
  });

  return [...upcoming, ...filler].map((t) => toTourView(t, badgeFor(map, t.category)));
}

/** Один тур по slug (только активный — для публичной страницы). */
export async function getTourBySlug(slug: string): Promise<TourView | null> {
  const tour = await prisma.tour.findUnique({ where: { slug } });
  if (!tour || !tour.isActive) return null;
  const map = await getCategoryMap();
  return toTourView(tour, badgeFor(map, tour.category));
}

/** Все slug-и активных туров (для sitemap и generateStaticParams). */
export async function getActiveTourSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  return prisma.tour.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });
}
