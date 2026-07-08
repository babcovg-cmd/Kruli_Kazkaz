// Загрузка файлов туров (фото и PDF-буклеты). Сохраняет в public/uploads
// и возвращает их публичные пути. Только для авторизованных.

import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import { requirePermission } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_IMAGE = 8 * 1024 * 1024; // 8 МБ — фото
const MAX_PDF = 25 * 1024 * 1024; // 25 МБ — PDF-буклет
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// Тип файла → расширение и лимит размера.
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "application/pdf": "pdf",
};

const MAX_SIZE: Record<string, number> = {
  "application/pdf": MAX_PDF,
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
    const ext = EXT[file.type];
    if (!ext) {
      return NextResponse.json({ error: `Недопустимый тип файла: ${file.type}` }, { status: 415 });
    }
    const limit = MAX_SIZE[file.type] ?? MAX_IMAGE;
    if (file.size > limit) {
      return NextResponse.json(
        { error: `Файл больше ${Math.round(limit / 1024 / 1024)} МБ` },
        { status: 413 }
      );
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const name = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
    await writeFile(path.join(UPLOAD_DIR, name), buffer);
    urls.push(`/uploads/${name}`);
  }

  return NextResponse.json({ urls });
}
