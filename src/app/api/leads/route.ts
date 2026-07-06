// Приём заявок с сайта (форма обратной связи, бронирование, запрос тура).

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { leadSchema } from "@/lib/validation";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Проверьте поля формы", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const data = parsed.data;

  // Привязываем к туру, только если такой существует.
  let tourId: string | null = null;
  if (data.tourId) {
    const tour = await prisma.tour.findUnique({ where: { id: data.tourId }, select: { id: true } });
    tourId = tour?.id ?? null;
  }

  const lead = await prisma.lead.create({
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email || "",
      message: data.message || "",
      people: data.people ?? 1,
      date: data.date || "",
      type: data.type,
      source: data.source || "",
      status: "new",
      tourId,
    },
  });

  return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
}
