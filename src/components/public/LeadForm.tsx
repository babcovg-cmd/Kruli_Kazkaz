"use client";

// Универсальная форма заявки (обратная связь / запрос тура).
// Валидация через Zod + react-hook-form, отправка на /api/leads.

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { leadSchema, type LeadInput } from "@/lib/validation";
import ConsentCheckbox from "@/components/public/ConsentCheckbox";

type LeadFormProps = {
  /** Тип заявки. */
  type?: "contact" | "request";
  /** Привязка к туру (для запроса со страницы тура). */
  tourId?: string;
  source?: string;
  /** Показывать поле сообщения. */
  withMessage?: boolean;
  submitLabel?: string;
  compact?: boolean;
};

export default function LeadForm({
  type = "contact",
  tourId,
  source,
  withMessage = true,
  submitLabel = "Отправить",
  compact = false,
}: LeadFormProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: { type, tourId: tourId ?? "", source: source ?? "", consent: false },
  });

  const onSubmit = async (data: LeadInput) => {
    setStatus("sending");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type, tourId: tourId ?? "", source: source ?? "" }),
      });
      if (!res.ok) throw new Error("fail");
      setStatus("ok");
      reset({ type, tourId: tourId ?? "", source: source ?? "", consent: false });
    } catch {
      setStatus("error");
    }
  };

  if (status === "ok") {
    return (
      <div
        className="card"
        style={{ padding: 28, textAlign: "center", display: "flex", flexDirection: "column", gap: 10 }}
      >
        <div style={{ fontSize: 34 }}>✓</div>
        <h3 style={{ fontSize: 22, color: "var(--txt)" }}>Заявка отправлена!</h3>
        <p className="muted" style={{ margin: 0 }}>
          Менеджер свяжется с вами в ближайшее время.
        </p>
        <button
          className="btn btn-ghost btn-sm"
          style={{ marginTop: 8, alignSelf: "center" }}
          onClick={() => setStatus("idle")}
        >
          Отправить ещё одну
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={compact ? "" : "form-grid"}
      style={{ display: "grid", gap: 14, gridTemplateColumns: compact ? "1fr" : "1fr 1fr" }}
      noValidate
    >
      <div className="field">
        <label>Имя</label>
        <input
          className={`input ${errors.name ? "has-error" : ""}`}
          placeholder="Как к вам обращаться"
          {...register("name")}
        />
        {errors.name && <span className="field-error">{errors.name.message}</span>}
      </div>

      <div className="field">
        <label>Телефон</label>
        <input
          className={`input ${errors.phone ? "has-error" : ""}`}
          placeholder="+7 ___ ___ __ __"
          {...register("phone")}
        />
        {errors.phone && <span className="field-error">{errors.phone.message}</span>}
      </div>

      {withMessage && (
        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <label>Сообщение</label>
          <textarea
            className={`textarea ${errors.message ? "has-error" : ""}`}
            placeholder="Куда хотите поехать, на сколько человек и в какие даты?"
            {...register("message")}
          />
          {errors.message && <span className="field-error">{errors.message.message}</span>}
        </div>
      )}

      <ConsentCheckbox registration={register("consent")} error={errors.consent?.message} />

      <div
        style={{
          gridColumn: "1 / -1",
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <button type="submit" className="btn btn-gold" disabled={status === "sending"}>
          {status === "sending" ? "Отправляем…" : submitLabel}
        </button>
        {status === "error" && (
          <span className="form-note form-fail">
            Не удалось отправить. Попробуйте ещё раз или позвоните нам.
          </span>
        )}
      </div>
    </form>
  );
}
