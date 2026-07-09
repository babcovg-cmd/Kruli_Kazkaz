"use client";

// Sticky-сайдбар на странице тура.
// Онлайн-оплаты нет: единственное действие — «Оставить заявку».
// Менеджер связывается с клиентом и обсуждает тур и условия оплаты.

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadSchema, type LeadInput } from "@/lib/validation";
import { formatPrice } from "@/lib/utils";
import ConsentCheckbox from "@/components/public/ConsentCheckbox";
import type { SocialLinks } from "@/lib/social";

type TourBookingProps = {
  tourId: string;
  title: string;
  price: number;
  priceOnReq: boolean;
  nearestDate: string;
  unlimitedSeats: boolean;
  seats: number;
  hasSeats: boolean;
  seatsLabel: string | null;
  brochure?: string;
  socials: SocialLinks;
};

export default function TourBooking({
  tourId,
  title,
  price,
  priceOnReq,
  nearestDate,
  unlimitedSeats,
  seats,
  hasSeats,
  seatsLabel,
  brochure,
  socials,
}: TourBookingProps) {
  // Максимум человек ограничен числом свободных мест (если места ограничены).
  const maxPeople = unlimitedSeats ? Infinity : seats;
  const [people, setPeople] = useState(() => (unlimitedSeats ? 2 : Math.min(2, Math.max(1, seats))));
  const [open, setOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const hasSocials = !!(socials.whatsapp || socials.telegram || socials.max);

  const hasPrice = !priceOnReq && price > 0;
  const total = hasPrice ? price * people : 0;

  return (
    <aside className="booking-sticky" style={{ position: "sticky", top: 90, alignSelf: "start" }}>
      <div
        className="card"
        style={{ padding: 24, borderColor: "var(--line-2)", boxShadow: "var(--sh-card)" }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
          <span className="mono" style={{ fontSize: 30, fontWeight: 500, color: "var(--gold-2)" }}>
            {formatPrice(price, priceOnReq)}
          </span>
          {hasPrice && (
            <span className="muted" style={{ fontSize: 13 }}>
              / человек
            </span>
          )}
        </div>
        {nearestDate && (
          <p className="muted" style={{ fontSize: 13, margin: "0 0 10px" }}>
            Ближайший выезд — {nearestDate}
          </p>
        )}

        {seatsLabel && (
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              margin: "0 0 18px",
              color: hasSeats ? "var(--gold-2)" : "var(--txt-3)",
            }}
          >
            {hasSeats ? "● " : "○ "}
            {seatsLabel}
          </p>
        )}

        <label style={{ display: "block", fontSize: 13, color: "var(--txt-2)", margin: "4px 0 6px" }}>
          Количество человек
        </label>
        <div className="stepper">
          <button onClick={() => setPeople((p) => Math.max(1, p - 1))} aria-label="Меньше" disabled={!hasSeats}>
            −
          </button>
          <span>{people}</span>
          <button
            onClick={() => setPeople((p) => Math.min(maxPeople, p + 1))}
            aria-label="Больше"
            disabled={!hasSeats || people >= maxPeople}
          >
            +
          </button>
        </div>
        {!unlimitedSeats && hasSeats && people >= maxPeople && (
          <p className="muted" style={{ fontSize: 11, margin: "6px 0 0" }}>
            Доступно мест: {seats}
          </p>
        )}

        {hasPrice && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              margin: "20px 0",
              paddingTop: 16,
              borderTop: "1px solid var(--line)",
            }}
          >
            <span className="muted">Примерно</span>
            <span className="mono" style={{ fontSize: 20, color: "var(--txt)" }}>
              {total.toLocaleString("ru-RU")} ₽
            </span>
          </div>
        )}

        {hasSeats ? (
          <button
            className="btn btn-gold"
            style={{ width: "100%", marginTop: hasPrice ? 0 : 20 }}
            onClick={() => setOpen(true)}
          >
            Оставить заявку
          </button>
        ) : (
          <>
            <button className="btn btn-ghost" style={{ width: "100%", marginTop: 20 }} disabled>
              Мест нет
            </button>
            <button
              className="btn btn-gold"
              style={{ width: "100%", marginTop: 10 }}
              onClick={() => setOpen(true)}
            >
              Записаться в лист ожидания
            </button>
          </>
        )}

        {hasSocials && (
          <button
            className="btn btn-ghost"
            style={{ width: "100%", marginTop: 10 }}
            onClick={() => setContactOpen(true)}
          >
            💬 Написать напрямую
          </button>
        )}

        {brochure && (
          <a
            href={brochure}
            download={`Буклет — ${title}.pdf`}
            className="btn btn-ghost"
            style={{ width: "100%", marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            📄 Скачать буклет (PDF)
          </a>
        )}

        <p className="muted" style={{ fontSize: 11, textAlign: "center", margin: "14px 0 0", lineHeight: 1.4 }}>
          Менеджер свяжется с вами, ответит на вопросы и обсудит условия оплаты.
        </p>
      </div>

      {open && (
        <BookingModal
          tourId={tourId}
          title={title}
          defaultPeople={people}
          defaultDate={nearestDate}
          waitlist={!hasSeats}
          onClose={() => setOpen(false)}
        />
      )}

      {contactOpen && <ContactModal socials={socials} onClose={() => setContactOpen(false)} />}
    </aside>
  );
}

/* ─────────── Окно «Написать напрямую»: WhatsApp / MAX / Telegram ─────────── */

const MESSENGERS: {
  key: keyof SocialLinks;
  label: string;
  icon: string; // путь к иконке приложения в /assets/icons
  bg: string;
}[] = [
  { key: "whatsapp", label: "WhatsApp", icon: "/assets/icons/whatsapp.png", bg: "rgba(79,164,107,0.16)" },
  { key: "max", label: "MAX", icon: "/assets/icons/max.png", bg: "rgba(146,119,184,0.18)" },
  { key: "telegram", label: "Telegram", icon: "/assets/icons/telegram.png", bg: "rgba(90,143,192,0.16)" },
];

function ContactModal({ socials, onClose }: { socials: SocialLinks; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!mounted) return null;

  const items = MESSENGERS.filter((m) => socials[m.key]);

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 380 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <h2 style={{ fontSize: 22, color: "var(--txt)" }}>Написать напрямую</h2>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            style={{ background: "none", border: "none", fontSize: 26, cursor: "pointer", color: "var(--txt-3)", lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
          <p className="muted" style={{ fontSize: 14, margin: "0 0 4px" }}>
            Выберите удобный мессенджер — менеджер ответит в рабочее время.
          </p>
          {items.map((m) => (
            <a
              key={m.key}
              href={socials[m.key]}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 16px",
                borderRadius: "var(--r-md)",
                border: "1px solid var(--line-2)",
                background: m.bg,
                fontWeight: 600,
                fontSize: 16,
                color: "var(--txt)",
                transition: "border-color .15s var(--ease)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.icon}
                alt=""
                width={38}
                height={38}
                style={{ borderRadius: "50%", flexShrink: 0 }}
              />
              {m.label}
            </a>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}

function BookingModal({
  tourId,
  title,
  defaultPeople,
  defaultDate,
  waitlist,
  onClose,
}: {
  tourId: string;
  title: string;
  defaultPeople: number;
  defaultDate: string;
  waitlist: boolean;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [mounted, setMounted] = useState(false);

  // Портал монтируем только на клиенте; блокируем прокрутку фона, пока открыто.
  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      type: "request",
      tourId,
      people: defaultPeople,
      date: defaultDate,
      source: `Страница тура: ${title}`,
      consent: false,
    },
  });

  const onSubmit = async (data: LeadInput) => {
    setStatus("sending");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type: "request", tourId, source: `Страница тура: ${title}` }),
      });
      if (!res.ok) throw new Error("fail");
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <h2 style={{ fontSize: 22, color: "var(--txt)" }}>
            {waitlist ? "Лист ожидания" : "Оставить заявку"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            style={{
              background: "none",
              border: "none",
              fontSize: 26,
              cursor: "pointer",
              color: "var(--txt-3)",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {status === "ok" ? (
          <div style={{ padding: "36px 26px", textAlign: "center", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 38 }}>✓</div>
            <h3 style={{ fontSize: 22, color: "var(--txt)" }}>Заявка принята!</h3>
            <p className="muted" style={{ margin: 0 }}>
              {waitlist
                ? "Мы сообщим вам, как только появятся свободные места."
                : "Менеджер свяжется с вами в ближайшее время, чтобы обсудить детали тура и удобный способ оплаты."}
            </p>
            <button className="btn btn-gold" style={{ marginTop: 8, alignSelf: "center" }} onClick={onClose}>
              Хорошо
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} style={{ padding: 24, display: "grid", gap: 14 }} noValidate>
            <p className="muted" style={{ fontSize: 14, margin: 0 }}>
              Тур: <b style={{ color: "var(--txt)" }}>{title}</b>
            </p>

            <div className="field">
              <label>Имя</label>
              <input className={`input ${errors.name ? "has-error" : ""}`} placeholder="Ваше имя" {...register("name")} />
              {errors.name && <span className="field-error">{errors.name.message}</span>}
            </div>

            <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="field">
                <label>Телефон</label>
                <input className={`input ${errors.phone ? "has-error" : ""}`} placeholder="+7 ___ ___ __ __" {...register("phone")} />
                {errors.phone && <span className="field-error">{errors.phone.message}</span>}
              </div>
              <div className="field">
                <label>E-mail</label>
                <input className={`input ${errors.email ? "has-error" : ""}`} placeholder="email@example.com" {...register("email")} />
                {errors.email && <span className="field-error">{errors.email.message}</span>}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="field">
                <label>Человек</label>
                <input className="input" type="number" min={1} {...register("people")} />
              </div>
              <div className="field">
                <label>Желаемая дата</label>
                <input className="input" placeholder="Когда удобно" {...register("date")} />
              </div>
            </div>

            <div className="field">
              <label>Комментарий</label>
              <textarea className="textarea" placeholder="Пожелания к туру" {...register("message")} />
            </div>

            <div
              style={{
                background: "var(--gold-soft)",
                border: "1px solid var(--line-2)",
                borderRadius: "var(--r-sm)",
                padding: "12px 14px",
                fontSize: 13,
                color: "var(--txt-2)",
                lineHeight: 1.5,
              }}
            >
              ℹ После отправки заявки менеджер свяжется с вами, уточнит детали тура и предложит удобный способ оплаты. Оплата онлайн на сайте не требуется.
            </div>

            <ConsentCheckbox registration={register("consent")} error={errors.consent?.message} />

            {status === "error" && (
              <span className="form-note form-fail">Не удалось отправить. Попробуйте ещё раз.</span>
            )}

            <button type="submit" className="btn btn-gold" style={{ width: "100%" }} disabled={status === "sending"}>
              {status === "sending" ? "Отправляем…" : "Отправить заявку"}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
