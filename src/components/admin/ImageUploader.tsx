"use client";

// Загрузчик фотографий тура. Первое фото — обложка.
// Загружает файлы на /api/admin/upload и хранит массив путей.

import { useRef, useState } from "react";

type Props = {
  value: string[];
  onChange: (urls: string[]) => void;
};

export default function ImageUploader({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("files", f));
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Ошибка загрузки");
      onChange([...value, ...json.urls]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = (url: string) => onChange(value.filter((u) => u !== url));
  const makeCover = (url: string) => onChange([url, ...value.filter((u) => u !== url)]);

  return (
    <div>
      <div
        className="adrop"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
      >
        {uploading ? "Загрузка…" : "Перетащите изображения или нажмите для загрузки"}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={(e) => handleFiles(e.target.files)}
      />
      {error && <span className="aerr">{error}</span>}

      {value.length > 0 && (
        <div className="athumbs">
          {value.map((url, i) => (
            <div key={url} className="athumb-box" title={i === 0 ? "Обложка" : "Нажмите, чтобы сделать обложкой"}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" onClick={() => makeCover(url)} style={{ cursor: i === 0 ? "default" : "pointer" }} />
              <button type="button" className="rm" onClick={() => remove(url)} title="Удалить">
                ×
              </button>
              {i === 0 && <span className="cover-tag">Обложка</span>}
            </div>
          ))}
        </div>
      )}
      {value.length > 0 && (
        <p className="ahint" style={{ marginTop: 8 }}>
          Первое фото — обложка. Нажмите на другое фото, чтобы сделать его обложкой.
        </p>
      )}
    </div>
  );
}
