// Append-only журнал согласий на обработку персональных данных (152-ФЗ).
// Пишется ОТДЕЛЬНО от БД, чтобы доказательство согласия пережило удаление заявки
// менеджером и очистку базы — РКН может запросить его и спустя длительное время.
// Формат JSON Lines (.jsonl): одна запись-согласие на строку — удобно дописывать
// и выгружать без перезаписи файла.
//
// ⚠ Файл содержит персональные данные: он вне репозитория (.gitignore) и должен
// бэкапиться вместе с базой. На VPS с постоянным диском запись надёжна; на
// serverless-хостинге (эфемерная ФС) журнал нужно вести иначе.

import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

const LOG_DIR = path.join(process.cwd(), "data");
const LOG_FILE = path.join(LOG_DIR, "consents.log.jsonl");

export type ConsentLogEntry = {
  ts: string; // ISO-время получения согласия
  version: string; // редакция текста согласия (lib/legal.ts policyDate)
  ip: string; // IP отправителя (техническое подтверждение)
  name: string;
  phone: string;
  email: string;
  type: string; // тип заявки (contact/request/purchase)
  source: string; // страница/контекст отправки
  leadId: string; // связь с заявкой в БД (может быть удалена — запись останется)
};

/**
 * Дописывает запись о согласии в журнал. Намеренно не пробрасывает исключения:
 * заявка и её consent-поля уже сохранены в БД, поэтому сбой записи в файл не
 * должен ломать отправку формы — только пишем ошибку в лог сервера.
 */
export async function logConsent(entry: ConsentLogEntry): Promise<void> {
  try {
    await mkdir(LOG_DIR, { recursive: true });
    await appendFile(LOG_FILE, JSON.stringify(entry) + "\n", "utf8");
  } catch (err) {
    console.error("Не удалось записать согласие в журнал:", err);
  }
}
