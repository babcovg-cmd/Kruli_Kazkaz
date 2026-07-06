// CRUD туров (админка). GET — список, POST — создание.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { tourSchema } from "@/lib/validation";
import { tourInputToData } from "@/lib/data";

export async function GET() {
  try {
    await requirePermission("tours");
  } catch (res) {
    return res as Response;
  }

  const tours = await prisma.tour.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(tours);
}

export async function POST(req: Request) {
  try {
    await requirePermission("tours");
  } catch (res) {
    return res as Response;
  }

  const body = await req.json().catch(() => null);
  const parsed = tourSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Проверьте поля", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const data = parsed.data;

  // Slug должен быть уникальным.
  const exists = await prisma.tour.findUnique({ where: { slug: data.slug } });
  if (exists) {
    return NextResponse.json(
      { error: "Тур с таким URL уже существует", issues: { slug: ["URL занят"] } },
      { status: 409 }
    );
  }

  const tour = await prisma.tour.create({ data: tourInputToData(data) });
  return NextResponse.json(tour, { status: 201 });
}
