// Загрузка фотографий туров. Сохраняет файлы в public/uploads
// и возвращает их публичные пути. Только для авторизованных.

import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import { requirePermission } from "@/lib/auth";

export const runtime = "nodejs";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
const MAX_SIZE = 8 * 1024 * 1024; // 8 МБ
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export async function POST(req: Request) {
  try {
    await requirePermission("tours");
  } catch (res) {
    return res as Response;
  }

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });

  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "Файлы не переданы" }, { status: 400 });
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const urls: string[] = [];
  for (const file of files) {
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json({ error: `Недопустимый тип файла: ${file.type}` }, { status: 415 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Файл больше 8 МБ" }, { status: 413 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const name = `${Date.now()}-${randomBytes(6).toString("hex")}.${EXT[file.type]}`;
    await writeFile(path.join(UPLOAD_DIR, name), buffer);
    urls.push(`/uploads/${name}`);
  }

  return NextResponse.json({ urls });
}
