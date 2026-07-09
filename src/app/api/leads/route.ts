// Приём заявок с сайта (форма обратной связи, бронирование, запрос тура).

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { leadSchema } from "@/lib/validation";
import { OPERATOR } from "@/lib/legal";
import { logConsent } from "@/lib/consent-log";
import { notifyNewLead } from "@/lib/telegram";

/** IP клиента из заголовков прокси (первый в x-forwarded-for) или x-real-ip. */
function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "";
}

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
  let tourTitle: string | null = null;
  if (data.tourId) {
    const tour = await prisma.tour.findUnique({
      where: { id: data.tourId },
      select: { id: true, title: true },
    });
    tourId = tour?.id ?? null;
    tourTitle = tour?.title ?? null;
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
      // Фиксируем согласие на обработку ПДн: заявка не проходит валидацию без него.
      consentAt: new Date(),
      consentVersion: OPERATOR.policyDate,
      consentIp: clientIp(req),
    },
  });

  // Уведомляем менеджеров в Telegram (сбой не ломает приём заявки).
  await notifyNewLead(lead, tourTitle);

  // Дублируем согласие в append-only журнал: он переживёт удаление заявки.
  await logConsent({
    ts: (lead.consentAt ?? lead.createdAt).toISOString(),
    version: lead.consentVersion,
    ip: lead.consentIp,
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    type: lead.type,
    source: lead.source,
    leadId: lead.id,
  });

  return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
}
