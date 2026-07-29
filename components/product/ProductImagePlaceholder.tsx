import { ReactNode } from "react";
import Image from "next/image";

export function ProductImagePlaceholder({
  className = "",
  src,
  alt = "",
  children,
  outOfStock = false,
}: {
  className?: string;
  src?: string | null;
  alt?: string;
  children?: ReactNode;
  outOfStock?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-[#0a1122] ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="300px"
          className={`object-cover ${outOfStock ? "grayscale opacity-50" : ""}`}
        />
      ) : (
        <>
          <div
            className={`absolute inset-0 bg-gradient-to-br from-[#141f38] to-[#0a1122] ${outOfStock ? "grayscale opacity-50" : ""}`}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(77,141,255,0.14),transparent_60%)]" />
        </>
      )}
      {outOfStock ? (
        <div className="pointer-events-none absolute left-[-40%] top-[18%] w-[180%] -rotate-45 bg-red py-1 text-center text-[10px] font-extrabold uppercase tracking-[2px] text-red-ink shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
          esgotado
        </div>
      ) : null}
      {children}
    </div>
  );
}
