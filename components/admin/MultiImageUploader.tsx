"use client";

import { useRef, useState } from "react";
import Image from "next/image";

const MAX_IMAGES = 6;

export function MultiImageUploader({ initial = [] }: { initial?: string[] }) {
  const [urls, setUrls] = useState<string[]>(initial);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function openPicker() {
    if (urls.length >= MAX_IMAGES) return;
    inputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const slotIndex = urls.length;
    setUploadingIndex(slotIndex);
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

      setUrls((prev) => [...prev, data.url]);
    } catch {
      setError("Erro de conexão ao enviar a imagem.");
    } finally {
      setUploadingIndex(null);
    }
  }

  function removeAt(index: number) {
    setUrls((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div>
      <input type="hidden" name="imagesJson" value={JSON.stringify(urls)} />

      <div className="flex flex-wrap gap-2.5">
        {urls.map((url, i) => (
          <div
            key={url + i}
            className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-line"
          >
            <Image src={url} alt="" width={80} height={80} className="h-full w-full object-cover" />
            {i === 0 ? (
              <span className="absolute bottom-0 left-0 right-0 bg-cyan py-0.5 text-center text-[9px] font-bold text-cyan-ink">
                capa
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => removeAt(i)}
              aria-label="Remover imagem"
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-[11px] text-white opacity-0 group-hover:opacity-100"
            >
              ✕
            </button>
          </div>
        ))}

        {urls.length < MAX_IMAGES ? (
          <button
            type="button"
            onClick={openPicker}
            disabled={uploadingIndex !== null}
            className="neon-interactive flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-line text-text-faint hover:text-cyan"
          >
            <span className="text-lg leading-none">+</span>
            <span className="text-[10px]">{uploadingIndex !== null ? "enviando..." : "adicionar"}</span>
          </button>
        ) : null}
      </div>

      <p className="mt-2 text-[11px] text-text-faint">
        Até {MAX_IMAGES} imagens · a primeira é usada como capa nos cards · recomendado 1000×1250px
        (proporção 4:5)
      </p>
      {error ? <p className="mt-1 text-[11px] text-red">{error}</p> : null}

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
