import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "surface";

const variantClasses: Record<Variant, string> = {
  primary: "bg-cyan text-cyan-ink font-bold shadow-[var(--glow-cyan-sm)] hover:shadow-[var(--glow-cyan-md)]",
  ghost: "border border-line text-text font-semibold hover:border-cyan hover:text-cyan",
  surface:
    "bg-surface-2 border border-line text-cyan font-semibold hover:border-cyan",
};

const base =
  "neon-interactive neon-lift inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm tracking-wide active:scale-[0.97]";

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; children: ReactNode }) {
  return (
    <button className={`${base} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "primary",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={`${base} ${variantClasses[variant]} ${className}`}>
      {children}
    </Link>
  );
}
