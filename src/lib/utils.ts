// Вспомогательные функции (формат цены, slug, парсинг фото и т.п.).

/** Транслитерация кириллицы в латиницу для семантических URL. */
const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
  з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
  п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts",
  ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu",
  я: "ya",
};

/**
 * Создаёт URL-slug из произвольной строки (например, названия тура).
 * «Сулакский каньон» → «sulakskiy-kanyon».
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .split("")
    .map((ch) => (ch in TRANSLIT ? TRANSLIT[ch] : ch))
    .join("")
    .replace(/[^a-z0-9]+/g, "-") // всё лишнее → дефис
    .replace(/^-+|-+$/g, "") // обрезаем дефисы по краям
    .replace(/-{2,}/g, "-"); // схлопываем повторы
}

/** Форматирует цену: 4900 → «4 900 ₽». 0 / priceOnReq → «по запросу». */
export function formatPrice(price: number, onRequest = false): string {
  if (onRequest || !price) return "по запросу";
  return `${price.toLocaleString("ru-RU")} ₽`;
}

/** Безопасно парсит JSON-массив путей к фото из поля Tour.images. */
export function parseImages(images: string | null | undefined): string[] {
  if (!images) return [];
  try {
    const arr = JSON.parse(images);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

const MONTHS_GENITIVE = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

/** Форматирует дату по-русски: 2026-06-25 → «25 июня». */
export function formatDateRu(date: Date | null | undefined): string {
  if (!date) return "";
  return `${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]}`;
}

/** Нормализация телефона для ссылок tel:/WhatsApp (только цифры). */
export function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** Абсолютный URL сайта (для SEO/OG/sitemap). */
export function siteUrl(path = ""): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return path ? `${base}${path.startsWith("/") ? path : `/${path}`}` : base;
}
