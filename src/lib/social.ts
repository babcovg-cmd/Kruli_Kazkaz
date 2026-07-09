// Единый источник ссылок на мессенджеры для всех соцкнопок сайта.
// Приоритет — прямые ссылки из настроек (админка → Настройки → Мессенджеры);
// если ссылка не задана, WhatsApp/Telegram собираются из старых полей
// (номер / логин), а MAX просто скрывается.

import type { SiteSettings } from "@prisma/client";
import { digitsOnly } from "@/lib/utils";

export type SocialLinks = {
  whatsapp: string;
  telegram: string;
  max: string;
};

export function getSocialLinks(s: SiteSettings): SocialLinks {
  const waDigits = digitsOnly(s.whatsapp);
  const tgLogin = s.telegram.replace(/^@/, "");
  return {
    whatsapp: s.whatsappUrl || (waDigits ? `https://wa.me/${waDigits}` : ""),
    telegram: s.telegramUrl || (tgLogin ? `https://t.me/${tgLogin}` : ""),
    max: s.maxUrl,
  };
}
