"use client";

// Всплывающее уведомление (автоскрытие через 3 сек).

import { useEffect } from "react";

export default function Toast({
  kind,
  text,
  onClose,
}: {
  kind: "ok" | "err";
  text: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`atoast ${kind}`} onClick={onClose}>
      {kind === "ok" ? "✓ " : "✕ "}
      {text}
    </div>
  );
}
