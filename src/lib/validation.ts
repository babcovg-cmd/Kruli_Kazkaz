// Zod-схемы валидации. Используются и на клиенте (react-hook-form),
// и на сервере (API-роуты) — единый источник правды.

import { z } from "zod";

const phoneRegex = /^[\d\s()+\-]{7,20}$/;

/** Заявка с сайта: бронирование тура, запрос или форма обратной связи. */
export const leadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Укажите имя")
    .max(100, "Слишком длинное имя"),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, "Укажите корректный телефон"),
  email: z
    .string()
    .trim()
    .email("Некорректный e-mail")
    .max(150)
    .optional()
    .or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  people: z.coerce.number().int().min(1).max(100).optional(),
  date: z.string().trim().max(100).optional().or(z.literal("")),
  type: z.enum(["purchase", "request", "contact"]).default("contact"),
  tourId: z.string().optional().or(z.literal("")),
  source: z.string().max(200).optional().or(z.literal("")),
});

export type LeadInput = z.infer<typeof leadSchema>;

/** Вход в админку. */
export const loginSchema = z.object({
  login: z.string().trim().min(1, "Введите логин"),
  password: z.string().min(1, "Введите пароль"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/** Сообщение в AI-консультанта. */
export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(40),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

/** Тест-чат в админке: сообщения + опциональный промт/контекст для проверки. */
export const chatTestSchema = chatRequestSchema.extend({
  systemPrompt: z.string().max(8000).optional(),
  toursContext: z.string().max(8000).optional(),
});

/** Тур (создание/редактирование в админке). */
export const tourSchema = z.object({
  title: z.string().trim().min(2, "Укажите название").max(200),
  slug: z
    .string()
    .trim()
    .min(1, "Укажите URL")
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Только латиница, цифры и дефис"),
  category: z.string().trim().min(1, "Выберите категорию"),
  shortDesc: z.string().trim().min(1, "Добавьте краткое описание").max(500),
  fullDesc: z.string().max(20000).optional().default(""),
  program: z.string().max(20000).optional().default(""),
  conditions: z.string().max(20000).optional().default(""),
  price: z.coerce.number().int().min(0).max(100_000_000).default(0),
  priceOnReq: z.boolean().default(false),
  duration: z.string().trim().max(100).optional().default(""),
  difficulty: z.string().trim().max(50).default("Лёгкая"),
  ageLimit: z.string().trim().max(20).default("0+"),
  nearestDate: z.string().trim().max(100).optional().default(""),
  // Дата ближайшего выезда в формате YYYY-MM-DD (для сортировки/фильтра). Пусто = «по запросу».
  startDate: z.string().trim().max(20).optional().default(""),
  // Свободные места: либо без ограничения, либо конкретное число.
  unlimitedSeats: z.boolean().default(true),
  seats: z.coerce.number().int().min(0).max(100000).default(0),
  scene: z.string().trim().max(40).default("s-dusk"),
  images: z.array(z.string()).max(30).default([]),
  paymentMode: z.enum(["online", "request"]).default("request"),
  isActive: z.boolean().default(true),
  showOnHome: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
  metaTitle: z.string().max(200).optional().default(""),
  metaDescription: z.string().max(400).optional().default(""),
});

export type TourInput = z.infer<typeof tourSchema>;

/** Конфиг AI-консультанта (сохранение из админки). */
export const aiConfigSchema = z.object({
  systemPrompt: z.string().trim().min(1, "Промт не может быть пустым").max(8000),
  toursContext: z.string().max(8000).optional().default(""),
  enabled: z.boolean().default(true),
  // Ключ API: пустая строка = «не менять» (сохраняем прежний). Передаётся только при изменении.
  apiKey: z.string().trim().max(200).optional().default(""),
  model: z.string().trim().max(80).optional().default(""),
});

export type AiConfigInput = z.infer<typeof aiConfigSchema>;

/** Настройки сайта (сохранение из админки). */
export const settingsSchema = z.object({
  phone: z.string().trim().max(50).default(""),
  whatsapp: z.string().trim().max(50).default(""),
  telegram: z.string().trim().max(80).default(""),
  email: z.string().trim().max(150).default(""),
  address: z.string().trim().max(300).default(""),
  mapEmbed: z.string().max(4000).optional().default(""),
  heroTitle: z.string().trim().max(300).default(""),
  heroSubtitle: z.string().trim().max(800).default(""),
  aboutText: z.string().max(5000).optional().default(""),
  seoHomeTitle: z.string().max(200).default(""),
  seoHomeDesc: z.string().max(400).default(""),
  seoHomeKeywords: z.string().max(400).default(""),
  seoCatalogTitle: z.string().max(200).default(""),
  seoCatalogDesc: z.string().max(400).default(""),
  seoCatalogKeywords: z.string().max(400).default(""),
  seoTourTitle: z.string().max(200).optional().default(""),
  seoTourDesc: z.string().max(400).optional().default(""),
  yandexMetrika: z.string().trim().max(40).optional().default(""),
});

export type SettingsInput = z.infer<typeof settingsSchema>;

/* ─────────── Управление командой (админ-аккаунты) ─────────── */

const sectionKey = z.enum(["tours", "ai", "leads", "settings"]);
const roleEnum = z.enum(["owner", "manager"]);

/** Создание нового сотрудника (владельцем). */
export const adminUserCreateSchema = z.object({
  name: z.string().trim().min(2, "Укажите имя").max(80),
  login: z
    .string()
    .trim()
    .min(3, "Логин не короче 3 символов")
    .max(40)
    .regex(/^[a-zA-Z0-9._-]+$/, "Только латиница, цифры и . _ -"),
  password: z.string().min(6, "Пароль не короче 6 символов").max(100),
  role: roleEnum.default("manager"),
  permissions: z.array(sectionKey).default([]),
});

export type AdminUserCreateInput = z.infer<typeof adminUserCreateSchema>;

/** Обновление сотрудника. Пустой пароль = не менять. */
export const adminUserUpdateSchema = z.object({
  name: z.string().trim().min(2, "Укажите имя").max(80),
  password: z
    .string()
    .max(100)
    .refine((v) => v === "" || v.length >= 6, "Пароль не короче 6 символов")
    .optional()
    .default(""),
  role: roleEnum.default("manager"),
  permissions: z.array(sectionKey).default([]),
});

export type AdminUserUpdateInput = z.infer<typeof adminUserUpdateSchema>;

/* ─────────── Категории туров ─────────── */

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Укажите название").max(60),
  description: z.string().trim().max(200).optional().default(""),
  glyph: z.string().trim().max(4).optional().default("✦"),
  badgeClass: z
    .enum(["b-green", "b-amber", "b-blue", "b-purple", "b-terra"])
    .default("b-amber"),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export type CategoryInput = z.infer<typeof categorySchema>;
