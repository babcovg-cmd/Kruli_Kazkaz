"use client";

// Чекбокс согласия на обработку персональных данных (152-ФЗ, ст. 9).
// Используется во всех формах, отправляющих данные на /api/leads.

import Link from "next/link";
import type { UseFormRegisterReturn } from "react-hook-form";

export default function ConsentCheckbox({
  registration,
  error,
}: {
  registration: UseFormRegisterReturn;
  error?: string;
}) {
  return (
    <div className="field" style={{ gridColumn: "1 / -1" }}>
      <label
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          fontSize: 13,
          lineHeight: 1.5,
          color: "var(--txt-2)",
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          {...registration}
          style={{ marginTop: 3, accentColor: "var(--gold-2)", width: 16, height: 16, flexShrink: 0 }}
        />
        <span>
          Я даю{" "}
          <Link href="/consent" target="_blank" style={{ color: "var(--gold-2)", textDecoration: "underline" }}>
            согласие на обработку персональных данных
          </Link>{" "}
          в соответствии с{" "}
          <Link href="/privacy" target="_blank" style={{ color: "var(--gold-2)", textDecoration: "underline" }}>
            Политикой обработки персональных данных
          </Link>
          .
        </span>
      </label>
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
