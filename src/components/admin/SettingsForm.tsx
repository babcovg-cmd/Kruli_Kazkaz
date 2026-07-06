"use client";

// Форма настроек сайта: контакты, тексты, SEO, аналитика.

import { useState } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingsSchema, type SettingsInput } from "@/lib/validation";
import Toast from "@/components/admin/Toast";

export default function SettingsForm({ initial }: { initial: SettingsInput }) {
  const [toast, setToast] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SettingsInput>({ resolver: zodResolver(settingsSchema), defaultValues: initial });

  const onSubmit = async (data: SettingsInput) => {
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setToast(
      res.ok ? { kind: "ok", text: "Настройки сохранены" } : { kind: "err", text: "Ошибка сохранения" }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: 880 }}>
      {/* Контакты */}
      <div className="acard" style={{ marginBottom: 22 }}>
        <h3 style={{ fontSize: 17, marginBottom: 16 }}>Контакты</h3>
        <div className="agrid-2">
          <Field label="Телефон" reg={register("phone")} />
          <Field label="E-mail" reg={register("email")} />
          <Field label="WhatsApp (номер, цифры)" reg={register("whatsapp")} hint="Например: 79886506669" />
          <Field label="Telegram (логин без @)" reg={register("telegram")} hint="Например: krylia_kavkaza" />
        </div>
        <Field label="Адрес" reg={register("address")} />
        <div className="afield">
          <label className="alabel">Код карты (Яндекс/Google embed)</label>
          <textarea className="atextarea" style={{ minHeight: 80, fontFamily: "var(--m-font)", fontSize: 12 }} {...register("mapEmbed")} />
          <p className="ahint" style={{ marginTop: 6 }}>
            Вставьте HTML-код встраивания карты (iframe). Он отобразится на странице контактов.
          </p>
        </div>
      </div>

      {/* Тексты главной */}
      <div className="acard" style={{ marginBottom: 22 }}>
        <h3 style={{ fontSize: 17, marginBottom: 16 }}>Тексты главной страницы</h3>
        <Field label="Заголовок Hero" reg={register("heroTitle")} />
        <div className="afield">
          <label className="alabel">Подзаголовок Hero</label>
          <textarea className="atextarea" style={{ minHeight: 70 }} {...register("heroSubtitle")} />
        </div>
        <div className="afield">
          <label className="alabel">Текст «О нас»</label>
          <textarea className="atextarea" style={{ minHeight: 100 }} {...register("aboutText")} />
        </div>
      </div>

      {/* SEO */}
      <div className="acard" style={{ marginBottom: 22 }}>
        <h3 style={{ fontSize: 17, marginBottom: 16 }}>SEO</h3>
        <h4 style={{ fontSize: 14, color: "#6b7280", margin: "0 0 10px" }}>Главная</h4>
        <Field label="Meta Title" reg={register("seoHomeTitle")} />
        <div className="afield">
          <label className="alabel">Meta Description</label>
          <textarea className="atextarea" style={{ minHeight: 60 }} {...register("seoHomeDesc")} />
        </div>
        <Field label="Keywords" reg={register("seoHomeKeywords")} />

        <h4 style={{ fontSize: 14, color: "#6b7280", margin: "18px 0 10px" }}>Каталог</h4>
        <Field label="Meta Title" reg={register("seoCatalogTitle")} />
        <div className="afield">
          <label className="alabel">Meta Description</label>
          <textarea className="atextarea" style={{ minHeight: 60 }} {...register("seoCatalogDesc")} />
        </div>
        <Field label="Keywords" reg={register("seoCatalogKeywords")} />
      </div>

      {/* Аналитика */}
      <div className="acard" style={{ marginBottom: 22 }}>
        <h3 style={{ fontSize: 17, marginBottom: 16 }}>Аналитика</h3>
        <Field
          label="Номер счётчика Яндекс.Метрики"
          reg={register("yandexMetrika")}
          hint="Только номер, например 12345678. Оставьте пустым, чтобы отключить."
        />
      </div>

      <div style={{ position: "sticky", bottom: 0, paddingBottom: 8 }}>
        <button type="submit" className="abtn abtn-gold" disabled={isSubmitting}>
          {isSubmitting ? "Сохранение…" : "Сохранить настройки"}
        </button>
      </div>

      {toast && <Toast kind={toast.kind} text={toast.text} onClose={() => setToast(null)} />}
    </form>
  );
}

function Field({
  label,
  reg,
  hint,
}: {
  label: string;
  reg: UseFormRegisterReturn;
  hint?: string;
}) {
  return (
    <div className="afield">
      <label className="alabel">{label}</label>
      <input className="ainput" {...reg} />
      {hint && <p className="ahint" style={{ marginTop: 6 }}>{hint}</p>}
    </div>
  );
}
