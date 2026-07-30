"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "./ImageUploader";
import { BannerFormState } from "@/app/admin/banners/actions";
import { useAdminToastStore } from "@/lib/admin-toast-store";

const PIXEL_HINTS: Record<string, string> = {
  CARD: "recomendado 800×500px (proporção ~16:10)",
  CAROUSEL: "recomendado 480×600px (proporção ~4:5)",
  HERO: "recomendado 1920×700px (faixa larga, ~2.7:1)",
  CATEGORY_ICON:
    "recomendado 400×500px, fundo transparente (PNG) e o assunto encostado na base — a imagem \"vaza\" pra cima da bolinha",
};

const initialState: BannerFormState = {};

export type BannerDefaultValues = {
  placement: string;
  theme: string;
  position: number;
  imageUrl: string | null;
  imageUrlMobile: string | null;
  imageOnly: boolean;
  title: string | null;
  subtitle: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  categoryId: string | null;
};

export function BannerForm({
  categories,
  action,
  defaultValues,
  submitLabel = "adicionar promoção",
  onSuccess,
}: {
  categories: { id: string; name: string }[];
  action: (prevState: BannerFormState, formData: FormData) => Promise<BannerFormState>;
  defaultValues?: BannerDefaultValues;
  submitLabel?: string;
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [placement, setPlacement] = useState(defaultValues?.placement ?? "CARD");
  const [imageOnly, setImageOnly] = useState(defaultValues?.imageOnly ?? false);
  const [imageKey, setImageKey] = useState(0);
  const isHero = placement === "HERO";
  const isCategoryIcon = placement === "CATEGORY_ICON";
  const isEditing = Boolean(defaultValues);

  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);
  const showToast = useAdminToastStore((s) => s.show);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      showToast(isEditing ? "Promoção salva com sucesso!" : "Promoção adicionada com sucesso!");
      if (!isEditing) {
        formRef.current?.reset();
        setPlacement("CARD");
        setImageOnly(false);
        setImageKey((k) => k + 1);
      }
      onSuccess?.();
    }
    wasPending.current = pending;
  }, [pending, state, isEditing, onSuccess, showToast]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mb-8 flex flex-col gap-3 rounded-xl border border-line bg-surface p-4"
    >
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
          <option value="CATEGORY_ICON">ícone de categoria (bolinha da home)</option>
        </select>
        <select
          name="theme"
          defaultValue={defaultValues?.theme ?? "cyan"}
          disabled={isHero || isCategoryIcon}
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
          defaultValue={defaultValues?.position ?? 0}
          className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
        />
      </div>

      {isCategoryIcon ? (
        <select
          name="categoryId"
          required
          defaultValue={defaultValues?.categoryId ?? ""}
          className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
        >
          <option value="" disabled>
            escolha a categoria
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      ) : null}

      <ImageUploader
        key={`image-${imageKey}`}
        name="imageUrl"
        label="Imagem"
        hint={PIXEL_HINTS[placement]}
        initialUrl={defaultValues?.imageUrl}
      />

      {isHero ? (
        <ImageUploader
          key={`image-mobile-${imageKey}`}
          name="imageUrlMobile"
          label="Imagem mobile (opcional)"
          hint="recomendado 1080×830px (~1.3:1) — se não enviar, usa a imagem acima também no celular"
          initialUrl={defaultValues?.imageUrlMobile}
        />
      ) : null}

      {isHero ? (
        <>
          <p className="text-xs text-text-faint">
            Banner cheio é sempre só imagem — passa automaticamente a cada 3s se houver mais de um.
          </p>
          <input
            name="title"
            placeholder="Descrição da imagem (opcional, acessibilidade)"
            defaultValue={defaultValues?.title ?? ""}
            className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
          />
        </>
      ) : isCategoryIcon ? (
        <p className="text-xs text-text-faint">
          Ícone de categoria é só a imagem + o link — sem título, subtítulo ou botão.
        </p>
      ) : (
        <label className="flex items-center gap-2 text-sm text-text-muted">
          <input
            type="checkbox"
            name="imageOnly"
            checked={imageOnly}
            onChange={(e) => setImageOnly(e.target.checked)}
          />
          Somente imagem (sem título/texto por cima)
        </label>
      )}

      {!isHero && !isCategoryIcon && !imageOnly ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              name="title"
              placeholder="Título"
              defaultValue={defaultValues?.title ?? ""}
              className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
            />
            <input
              name="subtitle"
              placeholder="Subtítulo (opcional)"
              defaultValue={defaultValues?.subtitle ?? ""}
              className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              name="ctaLabel"
              placeholder="Texto do botão (opcional)"
              defaultValue={defaultValues?.ctaLabel ?? ""}
              className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
            />
          </div>
        </>
      ) : null}

      <input
        name="ctaHref"
        placeholder={
          isCategoryIcon
            ? "Link ao clicar (opcional — se vazio, vai pra página da categoria)"
            : "Link ao clicar (opcional, ex: /categoria/camisetas)"
        }
        defaultValue={defaultValues?.ctaHref ?? ""}
        className="h-10 rounded-lg border border-line bg-surface-2 px-3 text-sm focus:border-cyan focus:outline-none"
      />

      {state.error ? <p className="text-sm text-red">{state.error}</p> : null}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "salvando..." : submitLabel}
      </Button>
    </form>
  );
}
