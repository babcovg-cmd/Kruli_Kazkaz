// Сохранение настроек сайта.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { settingsSchema } from "@/lib/validation";

export async function PUT(req: Request) {
  try {
    await requirePermission("settings");
  } catch (res) {
    return res as Response;
  }

  const body = await req.json().catch(() => null);
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Проверьте поля", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const settings = await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: parsed.data,
    create: { id: "main", ...parsed.data },
  });

  return NextResponse.json(settings);
}
