"use client";

// Форма создания / редактирования тура.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tourSchema, type TourInput } from "@/lib/validation";
import { slugify } from "@/lib/utils";
import { DIFFICULTIES, SCENES } from "@/lib/constants";
import RichTextEditor from "@/components/admin/RichTextEditor";
import ImageUploader from "@/components/admin/ImageUploader";
import BrochureUploader from "@/components/admin/BrochureUploader";

type Props = {
  mode: "create" | "edit";
  tourId?: string;
  initial: TourInput;
  categories: string[];
};

export default function TourForm({ mode, tourId, initial, categories }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TourInput>({
    resolver: zodResolver(tourSchema),
    defaultValues: initial,
  });

  const unlimited = watch("unlimitedSeats");

  const onSubmit = async (data: TourInput) => {
    setServerError("");
    const url = mode === "create" ? "/api/admin/tours" : `/api/admin/tours/${tourId}`;
    const method = mode === "create" ? "POST" : "PUT";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      router.push("/admin/tours");
      router.refresh();
    } else {
      const json = await res.json().catch(() => ({}));
      if (json.issues?.slug) setError("slug", { message: json.issues.slug[0] });
      setServerError(json.error || "Не удалось сохранить тур");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ maxWidth: 880 }}>
      {/* Основное */}
      <div className="acard" style={{ marginBottom: 22 }}>
        <h3 style={{ fontSize: 17, marginBottom: 16 }}>Основное</h3>

        <div className="afield">
          <label className="alabel">Название тура</label>
          <input
            className={`ainput ${errors.title ? "err" : ""}`}
            {...register("title", {
              onChange: (e) => {
                if (!slugTouched) setValue("slug", slugify(e.target.value));
              },
            })}
          />
          {errors.title && <span className="aerr">{errors.title.message}</span>}
        </div>

        <div className="afield">
          <label className="alabel">URL (slug)</label>
          <input
            className={`ainput ${errors.slug ? "err" : ""}`}
            {...register("slug", { onChange: () => setSlugTouched(true) })}
          />
          <p className="ahint" style={{ marginTop: 6 }}>
            Адрес страницы: /tours/<b>{"{slug}"}</b>. Генерируется из названия автоматически.
          </p>
          {errors.slug && <span className="aerr">{errors.slug.message}</span>}
        </div>

        <div className="agrid-2">
          <div className="afield">
            <label className="alabel">Категория</label>
            <select className={`aselect ${errors.category ? "err" : ""}`} {...register("category")}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.category && <span className="aerr">{errors.category.message}</span>}
          </div>
          <div className="afield">
            <label className="alabel">Длительность</label>
            <input className="ainput" placeholder="5 дней / 4 ночи" {...register("duration")} />
          </div>
        </div>

        <div className="afield">
          <label className="alabel">Краткое описание (для карточки)</label>
          <textarea className={`atextarea ${errors.shortDesc ? "err" : ""}`} {...register("shortDesc")} />
          {errors.shortDesc && <span className="aerr">{errors.shortDesc.message}</span>}
        </div>
      </div>

      {/* Цена и параметры */}
      <div className="acard" style={{ marginBottom: 22 }}>
        <h3 style={{ fontSize: 17, marginBottom: 16 }}>Цена и параметры</h3>
        <div className="agrid-2">
          <div className="afield">
            <label className="alabel">Цена, ₽</label>
            <input className="ainput" type="number" min={0} {...register("price")} />
          </div>
          <div className="afield" style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 26 }}>
            <Controller
              control={control}
              name="priceOnReq"
              render={({ field }) => (
                <Toggle on={field.value} onClick={() => field.onChange(!field.value)} />
              )}
            />
            <span style={{ fontSize: 14 }}>Цена «по запросу»</span>
          </div>
        </div>
        <div className="agrid-2">
          <div className="afield">
            <label className="alabel">Сложность</label>
            <select className="aselect" {...register("difficulty")}>
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="afield">
            <label className="alabel">Возрастное ограничение</label>
            <input className="ainput" placeholder="0+" {...register("ageLimit")} />
          </div>
        </div>
        <div className="agrid-2">
          <div className="afield">
            <label className="alabel">📅 Дата ближайшего выезда</label>
            <input className="ainput" type="date" {...register("startDate")} />
            <p className="ahint" style={{ marginTop: 6 }}>
              <b>Главное поле дат.</b> Именно по нему тур попадает в «Ближайшие» на главной и в фильтр.
              Если оставить пустым — тур считается «по запросу» и в «Ближайших» не показывается.
            </p>
          </div>
          <div className="afield">
            <label className="alabel">Подпись к дате (необязательно)</label>
            <input className="ainput" placeholder="каждую субботу / вт, чт, сб" {...register("nearestDate")} />
            <p className="ahint" style={{ marginTop: 6 }}>
              Текст вместо даты — для регулярных выездов. Если пусто, на сайте покажем дату из календаря.
            </p>
          </div>
        </div>
      </div>

      {/* Свободные места */}
      <div className="acard" style={{ marginBottom: 22 }}>
        <h3 style={{ fontSize: 17, marginBottom: 6 }}>Свободные места</h3>
        <p className="ahint">
          Сколько мест ещё можно забронировать на этот тур. Управляет доступностью брони на сайте.
        </p>
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 16 }}>
          <Controller
            control={control}
            name="unlimitedSeats"
            render={({ field }) => <Toggle on={field.value} onClick={() => field.onChange(!field.value)} />}
          />
          <span style={{ fontSize: 14 }}>Места не ограничены</span>
        </label>
        {!unlimited && (
          <div className="afield" style={{ maxWidth: 240, marginBottom: 0 }}>
            <label className="alabel">Свободных мест</label>
            <input className="ainput" type="number" min={0} {...register("seats")} />
            <p className="ahint" style={{ marginTop: 6 }}>
              На сайте показывается «Осталось N мест». Когда 0 — тур помечается «Мест нет» и убирается
              из «Ближайших» на главной.
            </p>
          </div>
        )}
      </div>

      {/* Контент */}
      <div className="acard" style={{ marginBottom: 22 }}>
        <h3 style={{ fontSize: 17, marginBottom: 16 }}>Содержание страницы</h3>
        <div className="afield">
          <label className="alabel">Полное описание</label>
          <Controller
            control={control}
            name="fullDesc"
            render={({ field }) => (
              <RichTextEditor value={field.value || ""} onChange={field.onChange} placeholder="Подробное описание тура…" />
            )}
          />
        </div>
        <div className="afield">
          <label className="alabel">Программа тура (по дням)</label>
          <Controller
            control={control}
            name="program"
            render={({ field }) => (
              <RichTextEditor value={field.value || ""} onChange={field.onChange} placeholder="День 1 — …" />
            )}
          />
        </div>
        <div className="afield">
          <label className="alabel">Условия тура</label>
          <Controller
            control={control}
            name="conditions"
            render={({ field }) => (
              <RichTextEditor value={field.value || ""} onChange={field.onChange} placeholder="Что включено, отмена, оплата…" />
            )}
          />
        </div>
      </div>

      {/* Фото */}
      <div className="acard" style={{ marginBottom: 22 }}>
        <h3 style={{ fontSize: 17, marginBottom: 6 }}>Фотографии</h3>
        <p className="ahint">Первое фото используется как обложка карточки и hero страницы.</p>
        <Controller
          control={control}
          name="images"
          render={({ field }) => <ImageUploader value={field.value || []} onChange={field.onChange} />}
        />
        <div className="afield" style={{ marginTop: 16 }}>
          <label className="alabel">Градиент-заглушка (если нет фото)</label>
          <select className="aselect" {...register("scene")} style={{ maxWidth: 220 }}>
            {SCENES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Буклет */}
      <div className="acard" style={{ marginBottom: 22 }}>
        <h3 style={{ fontSize: 17, marginBottom: 6 }}>Буклет тура (PDF)</h3>
        <p className="ahint" style={{ marginBottom: 12 }}>
          PDF с программой тура. Появится кнопкой «Скачать буклет» в карточке и на странице тура.
        </p>
        <Controller
          control={control}
          name="brochure"
          render={({ field }) => (
            <BrochureUploader value={field.value || ""} onChange={field.onChange} />
          )}
        />
      </div>

      {/* SEO + публикация */}
      <div className="acard" style={{ marginBottom: 22 }}>
        <h3 style={{ fontSize: 17, marginBottom: 16 }}>Публикация и SEO</h3>
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap", marginBottom: 18 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => <Toggle on={field.value} onClick={() => field.onChange(!field.value)} />}
            />
            <span style={{ fontSize: 14 }}>Активен (виден на сайте)</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <Controller
              control={control}
              name="showOnHome"
              render={({ field }) => <Toggle on={field.value} onClick={() => field.onChange(!field.value)} />}
            />
            <span style={{ fontSize: 14 }}>Показывать на главной</span>
          </label>
        </div>
        <div className="afield">
          <label className="alabel">Порядок сортировки</label>
          <input className="ainput" type="number" style={{ maxWidth: 140 }} {...register("sortOrder")} />
        </div>
        <div className="afield">
          <label className="alabel">SEO Title (необязательно)</label>
          <input className="ainput" {...register("metaTitle")} />
        </div>
        <div className="afield">
          <label className="alabel">SEO Description (необязательно)</label>
          <textarea className="atextarea" style={{ minHeight: 60 }} {...register("metaDescription")} />
        </div>
      </div>

      {serverError && (
        <div
          style={{
            background: "rgba(181,70,47,0.1)",
            color: "#b5462f",
            padding: "10px 14px",
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 14,
          }}
        >
          {serverError}
        </div>
      )}

      <div style={{ display: "flex", gap: 12, position: "sticky", bottom: 0, paddingBottom: 8 }}>
        <button type="submit" className="abtn abtn-gold" disabled={isSubmitting}>
          {isSubmitting ? "Сохранение…" : "Сохранить тур"}
        </button>
        <button type="button" className="abtn abtn-ghost" onClick={() => router.push("/admin/tours")}>
          Отмена
        </button>
      </div>
    </form>
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button type="button" className={`atoggle ${on ? "on" : ""}`} onClick={onClick} aria-pressed={on}>
      <span className="knob" />
    </button>
  );
}
