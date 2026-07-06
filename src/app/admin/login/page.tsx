// Страница входа в админку.

import { Suspense } from "react";
import LoginForm from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="admin-auth">
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/logo-mark.png"
            alt="Крылья Кавказа"
            style={{ height: 64, margin: "0 auto", mixBlendMode: "multiply" }}
          />
          <h1 style={{ fontSize: 22, color: "#23262c", marginTop: 14, fontFamily: "var(--t-font)" }}>
            Панель управления
          </h1>
          <p style={{ color: "#8a8f99", fontSize: 14, marginTop: 6 }}>Крылья Кавказа</p>
        </div>
        <div
          className="acard"
          style={{
            padding: 28,
            boxShadow: "0 20px 50px rgba(40,30,10,0.18)",
            border: "1px solid #ddd8c8",
          }}
        >
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
