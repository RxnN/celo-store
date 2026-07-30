"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "./ImageUploader";
import { createBanner, BannerFormState } from "@/app/admin/banners/actions";

const PIXEL_HINTS: Record<string, string> = {
  CARD: "recomendado 800×500px (proporção ~16:10)",
  CAROUSEL: "recomendado 480×600px (proporção ~4:5)",
  HERO: "recomendado 1920×800px (~2.4:1) — evite texto muito perto do topo/rodapé, as bordas podem ser levemente cortadas em telas muito largas",
};

const initialState: BannerFormState = {};

export function BannerForm() {
  const [state, formAction, pending] = useActionState(createBanner, initialState);
  const [placement, setPlacement] = useState("CARD");
  const [imageOnly, setImageOnly] = useState(false);
  const isHero = placement === "HERO";

  return (
    <form action={formAction} className="mb-8 flex flex-col gap-3 rounded-xl border border-line bg-surface p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <select
          name="placement"
          value={placement}
          onChange={(e) => setPlacement(e.target.value)}
          className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
        >
          <option value="CARD">card</option>
          <option value="CAROUSEL">carrossel</option>
          <option value="HERO">banner cheio (topo, auto-rotativo)</option>
        </select>
        <select
          name="theme"
          disabled={isHero}
          className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none disabled:opacity-40"
        >
          <option value="cyan">azul</option>
          <option value="red">vermelho</option>
          <option value="green">verde</option>
        </select>
        <input
          name="position"
          type="number"
          placeholder="Ordem"
          defaultValue={0}
          className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
        />
      </div>

      <ImageUploader name="imageUrl" label="Imagem" hint={PIXEL_HINTS[placement]} />

      {!isHero ? (
        <label className="flex items-center gap-2 text-sm text-text-muted">
          <input
            type="checkbox"
            name="imageOnly"
            checked={imageOnly}
            onChange={(e) => setImageOnly(e.target.checked)}
          />
          Somente imagem (sem título/texto por cima)
        </label>
      ) : (
        <>
          <p className="text-xs text-text-faint">
            Banner cheio é sempre só imagem — passa automaticamente a cada 3s se houver mais de um.
          </p>
          <input
            name="title"
            placeholder="Descrição da imagem (opcional, acessibilidade)"
            className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
          />
        </>
      )}

      {!isHero && !imageOnly ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              name="title"
              placeholder="Título"
              className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
            />
            <input
              name="subtitle"
              placeholder="Subtítulo (opcional)"
              className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              name="ctaLabel"
              placeholder="Texto do botão (opcional)"
              className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
            />
          </div>
        </>
      ) : null}

      <input
        name="ctaHref"
        placeholder="Link ao clicar (opcional, ex: /categoria/camisetas)"
        className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
      />

      {state.error ? <p className="text-sm text-red">{state.error}</p> : null}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "salvando..." : "adicionar promoção"}
      </Button>
    </form>
  );
}
