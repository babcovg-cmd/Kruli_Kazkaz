// Базовый layout админки: подключает светлую тему. Конкретные оболочки
// (панель с сайдбаром / страница входа) описаны ниже по дереву.

import type { Metadata } from "next";
import "@/styles/admin.css";

export const metadata: Metadata = {
  title: "Админ-панель — Крылья Кавказа",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
