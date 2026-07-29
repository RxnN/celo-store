"use client";

import { useRef, useState } from "react";
import Image from "next/image";

export function ImageUploader({
  name,
  label,
  initialUrl,
  hint,
}: {
  name: string;
  label: string;
  initialUrl?: string | null;
  hint?: string;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Falha ao enviar a imagem.");
        return;
      }

      setUrl(data.url);
    } catch {
      setError("Erro de conexão ao enviar a imagem.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-text-muted">{label}</label>
      <input type="hidden" name={name} value={url} />

      <div className="flex items-center gap-3">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-surface-2">
          {url ? (
            <Image src={url} alt="" width={80} height={80} className="h-full w-full object-cover" />
          ) : (
            <span className="text-[10px] text-text-faint">sem imagem</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="neon-interactive rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-text-muted hover:text-cyan"
            >
              {uploading ? "enviando..." : url ? "trocar imagem" : "enviar imagem"}
            </button>
            {url ? (
              <button
                type="button"
                onClick={() => setUrl("")}
                className="text-xs text-text-faint hover:text-red"
              >
                remover
              </button>
            ) : null}
          </div>
          {hint ? <p className="text-[11px] text-text-faint">{hint}</p> : null}
          {error ? <p className="text-[11px] text-red">{error}</p> : null}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
