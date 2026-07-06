"use client";

// Форма входа: логин + пароль → /api/auth/login → редирект в панель.

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validation";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const from = params.get("from") || "/admin/tours";
      router.push(from);
      router.refresh();
    } else {
      const json = await res.json().catch(() => ({}));
      setError(json.error || "Не удалось войти");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="afield">
        <label className="alabel">Логин</label>
        <input className={`ainput ${errors.login ? "err" : ""}`} autoFocus {...register("login")} />
        {errors.login && <span className="aerr">{errors.login.message}</span>}
      </div>
      <div className="afield">
        <label className="alabel">Пароль</label>
        <input
          type="password"
          className={`ainput ${errors.password ? "err" : ""}`}
          {...register("password")}
        />
        {errors.password && <span className="aerr">{errors.password.message}</span>}
      </div>
      {error && (
        <div
          style={{
            background: "rgba(181,70,47,0.1)",
            color: "#b5462f",
            fontSize: 13,
            padding: "10px 12px",
            borderRadius: 8,
            marginBottom: 14,
          }}
        >
          {error}
        </div>
      )}
      <button type="submit" className="abtn abtn-gold" style={{ width: "100%" }} disabled={isSubmitting}>
        {isSubmitting ? "Входим…" : "Войти"}
      </button>
    </form>
  );
}
