"use client";

// Форма настроек сайта: контакты, тексты, SEO, аналитика.

import { useState } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingsSchema, type SettingsInput } from "@/lib/validation";
import Toast from "@/components/admin/Toast";

export default function SettingsForm({ initial }: { initial: SettingsInput }) {
  const [toast, setToast] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [tgStatus, setTgStatus] = useState<{ kind: "ok" | "err" | "info"; text: string } | null>(null);
  const [tgTesting, setTgTesting] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { isSubmitting },
  } = useForm<SettingsInput>({ resolver: zodResolver(settingsSchema), defaultValues: initial });

  // Проверка Telegram: с chat ID шлёт тест, без него — подсказывает ID чатов.
  const testTelegram = async () => {
    setTgTesting(true);
    setTgStatus(null);
    try {
      const res = await fetch("/api/admin/telegram/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: getValues("tgBotToken"), chatId: getValues("tgChatId") }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setTgStatus({ kind: "err", text: json.error || "Ошибка проверки" });
      } else if (json.ok) {
        setTgStatus({ kind: "ok", text: "Тестовое сообщение отправлено — проверьте Telegram. Не забудьте сохранить настройки." });
      } else if (json.chats?.length > 0) {
        const first = json.chats[0];
        setValue("tgChatId", first.id);
        setTgStatus({
          kind: "info",
          text: `Найден чат: ${json.chats.map((c: { id: string; name: string }) => `${c.name} (${c.id})`).join(", ")}. Подставил ID — нажмите «Проверить» ещё раз.`,
        });
      } else {
        setTgStatus({ kind: "info", text: json.hint || "Напишите боту любое сообщение и повторите." });
      }
    } catch {
      setTgStatus({ kind: "err", text: "Не удалось выполнить проверку" });
    } finally {
      setTgTesting(false);
    }
  };

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

      {/* Мессенджеры: кнопки «Написать напрямую» и соцссылки по всему сайту */}
      <div className="acard" style={{ marginBottom: 22 }}>
        <h3 style={{ fontSize: 17, marginBottom: 6 }}>Мессенджеры</h3>
        <p className="ahint" style={{ marginBottom: 14 }}>
          Прямые ссылки для кнопки «Написать напрямую» на странице тура и всех кнопок
          мессенджеров на сайте (футер, контакты). Если поле пустое, WhatsApp и Telegram
          собираются из номера и логина выше, а кнопка MAX не показывается.
        </p>
        <Field label="Ссылка WhatsApp" reg={register("whatsappUrl")} hint="Например: https://wa.me/79886506669" />
        <Field label="Ссылка MAX" reg={register("maxUrl")} hint="Например: https://max.ru/u/ваш_профиль" />
        <Field label="Ссылка Telegram" reg={register("telegramUrl")} hint="Например: https://t.me/krylia_kavkaza" />
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

      {/* Уведомления в Telegram */}
      <div className="acard" style={{ marginBottom: 22 }}>
        <h3 style={{ fontSize: 17, marginBottom: 6 }}>Уведомления о заявках в Telegram</h3>
        <p className="ahint" style={{ marginBottom: 14 }}>
          Бот присылает сообщение о каждой новой заявке с сайта. Как подключить: 1) создайте
          бота у @BotFather командой /newbot и вставьте сюда токен; 2) напишите своему боту
          любое сообщение; 3) нажмите «Проверить» — chat ID подставится сам.
        </p>
        <Field
          label="Токен бота"
          reg={register("tgBotToken")}
          hint="Выдаёт @BotFather, вида 123456789:AA…"
        />
        <Field
          label="Chat ID"
          reg={register("tgChatId")}
          hint="Куда слать уведомления. Несколько чатов — через запятую."
        />
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <button type="button" className="abtn abtn-ghost" onClick={testTelegram} disabled={tgTesting}>
            {tgTesting ? "Проверяем…" : "Проверить"}
          </button>
          {tgStatus && (
            <span
              style={{
                fontSize: 13,
                color: tgStatus.kind === "ok" ? "#2f7d4f" : tgStatus.kind === "err" ? "#b5462f" : "#6b7280",
              }}
            >
              {tgStatus.text}
            </span>
          )}
        </div>
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
