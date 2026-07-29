import { ReactNode } from "react";

type Tone = "cyan" | "red" | "violet" | "green" | "amber";

const toneClasses: Record<Tone, string> = {
  cyan: "bg-cyan text-cyan-ink",
  red: "bg-red text-white",
  violet: "bg-violet text-white",
  green: "bg-green text-green-ink",
  amber: "bg-amber text-amber-ink",
};

export function Badge({ tone = "cyan", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`absolute top-2.5 left-2.5 rounded-md px-2 py-1 text-[10px] font-extrabold tracking-wide ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
