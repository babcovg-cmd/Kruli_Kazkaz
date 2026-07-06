"use client";

// Переключатель светлой / тёмной темы. Сохраняет выбор в localStorage.

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const current =
      (document.documentElement.dataset.theme as "dark" | "light") || "dark";
    setTheme(current);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("kk-theme", next);
    } catch {
      /* localStorage может быть недоступен */
    }
    setTheme(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label="Сменить тему"
      title="Светлая / тёмная тема"
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        border: "1px solid var(--line-2)",
        background: "transparent",
        color: "var(--txt)",
        cursor: "pointer",
        fontSize: 16,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        transition: "all .15s",
      }}
    >
      {theme === "dark" ? "☀" : "☾"}
    </button>
  );
}
