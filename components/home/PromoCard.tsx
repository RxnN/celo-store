import Link from "next/link";
import Image from "next/image";
import { PROMO_THEME_CLASSES } from "./promo-theme";

export type PromoCardData = {
  id: string;
  title: string | null;
  subtitle: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  theme: string;
  imageUrl: string | null;
  imageOnly: boolean;
};

const SIZE_CLASSES = {
  card: {
    shape: "min-h-[150px] sm:min-h-[170px] rounded-2xl",
    padding: "p-4 sm:p-6",
    eyebrow: "mb-2 sm:mb-2.5 text-[10px] sm:text-[11px]",
    title: "mb-3 sm:mb-4 max-w-[180px] sm:max-w-[220px] text-base sm:text-xl",
    cta: "px-3.5 py-2 sm:px-4 sm:py-2.5 text-[11px] sm:text-[12.5px]",
  },
  slide: {
    shape: "min-h-[200px] sm:min-h-[220px] rounded-xl",
    padding: "p-4 sm:p-5",
    eyebrow: "mb-2 text-[10px] sm:text-[10.5px]",
    title: "mb-3 text-sm sm:text-base",
    cta: "px-3 py-1.5 sm:px-3.5 sm:py-2 text-[10.5px] sm:text-[11.5px]",
  },
};

export function PromoCard({
  promo,
  size = "card",
}: {
  promo: PromoCardData;
  size?: "card" | "slide";
}) {
  const theme = PROMO_THEME_CLASSES[promo.theme] ?? PROMO_THEME_CLASSES.cyan;
  const sizeClasses = SIZE_CLASSES[size];

  if (promo.imageOnly && promo.imageUrl) {
    const image = (
      <Image
        src={promo.imageUrl}
        alt={promo.title ?? ""}
        width={480}
        height={600}
        className="h-full w-full object-cover"
      />
    );
    const boxClass = `neon-lift block h-full overflow-hidden border border-line ${sizeClasses.shape}`;
    return promo.ctaHref ? (
      <Link href={promo.ctaHref} className={boxClass}>
        {image}
      </Link>
    ) : (
      <div className={boxClass}>{image}</div>
    );
  }

  const content = (
    <>
      {promo.subtitle ? (
        <p className={`font-extrabold tracking-[2px] ${sizeClasses.eyebrow} ${theme.eyebrow}`}>
          {promo.subtitle}
        </p>
      ) : null}
      {promo.title ? (
        <h3 className={`font-display leading-tight tracking-wide text-balance ${sizeClasses.title}`}>
          {promo.title}
        </h3>
      ) : null}
      {promo.ctaLabel ? (
        <span
          className={`inline-flex w-fit rounded-lg font-extrabold transition-transform duration-200 group-hover:scale-105 ${sizeClasses.cta} ${theme.btn}`}
        >
          {promo.ctaLabel}
        </span>
      ) : null}
    </>
  );

  const className = `neon-lift group flex h-full flex-col justify-center border transition-[box-shadow,transform] duration-200 hover:shadow-[var(--banner-glow)] ${sizeClasses.shape} ${sizeClasses.padding} ${theme.bg}`;
  const style = { "--banner-glow": theme.glow } as React.CSSProperties;

  return promo.ctaHref ? (
    <Link href={promo.ctaHref} style={style} className={className}>
      {content}
    </Link>
  ) : (
    <div style={style} className={className}>
      {content}
    </div>
  );
}
