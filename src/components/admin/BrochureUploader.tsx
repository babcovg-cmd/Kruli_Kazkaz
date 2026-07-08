"use client";

// Загрузчик PDF-буклета тура. Хранит один путь к файлу (или пустую строку).
// Загружает на /api/admin/upload (тот же роут, что и для фото).

import { useRef, useState } from "react";

type Props = {
  value: string;
  onChange: (url: string) => void;
};

export default function BrochureUploader({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setError("");
    if (file.type !== "application/pdf") {
      setError("Нужен файл в формате PDF");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("files", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Ошибка загрузки");
      onChange(json.urls[0]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      {value ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 14px",
            border: "1px solid var(--aline, #e3e8e4)",
            borderRadius: 8,
            fontSize: 14,
          }}
        >
          <span style={{ fontSize: 20 }}>📄</span>
          <a href={value} target="_blank" rel="noopener noreferrer" style={{ flex: 1, color: "#2f7d4f" }}>
            Буклет загружен — открыть
          </a>
          <button type="button" className="abtn abtn-ghost" onClick={() => onChange("")}>
            Удалить
          </button>
        </div>
      ) : (
        <div
          className="adrop"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files);
          }}
        >
          {uploading ? "Загрузка…" : "Перетащите PDF-буклет или нажмите для загрузки"}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files)}
      />
      {error && <span className="aerr">{error}</span>}
    </div>
  );
}
