// Операции с одним туром: GET, PUT (полное обновление),
// PATCH (частичное — переключение статуса), DELETE.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { tourSchema } from "@/lib/validation";
import { tourInputToData } from "@/lib/data";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("tours");
  } catch (res) {
    return res as Response;
  }
  const { id } = await params;
  const tour = await prisma.tour.findUnique({ where: { id } });
  if (!tour) return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  return NextResponse.json(tour);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("tours");
  } catch (res) {
    return res as Response;
  }
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = tourSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Проверьте поля", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }
  const data = parsed.data;

  // Slug уникален среди других туров.
  const clash = await prisma.tour.findFirst({
    where: { slug: data.slug, NOT: { id } },
    select: { id: true },
  });
  if (clash) {
    return NextResponse.json(
      { error: "URL занят другим туром", issues: { slug: ["URL занят"] } },
      { status: 409 }
    );
  }

  const tour = await prisma.tour.update({ where: { id }, data: tourInputToData(data) });
  return NextResponse.json(tour);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("tours");
  } catch (res) {
    return res as Response;
  }
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  // Поддерживаем переключение видимых флагов.
  const data: Record<string, boolean> = {};
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;
  if (typeof body.showOnHome === "boolean") data.showOnHome = body.showOnHome;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Нет данных для обновления" }, { status: 400 });
  }

  const tour = await prisma.tour.update({ where: { id }, data });
  return NextResponse.json(tour);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("tours");
  } catch (res) {
    return res as Response;
  }
  const { id } = await params;
  await prisma.tour.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
