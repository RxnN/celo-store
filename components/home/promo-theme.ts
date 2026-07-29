export const PROMO_THEME_CLASSES: Record<
  string,
  { bg: string; eyebrow: string; btn: string; glow: string }
> = {
  cyan: {
    bg: "border-[#1e3a66] bg-[radial-gradient(circle_at_75%_15%,rgba(77,141,255,0.35),transparent_55%),linear-gradient(135deg,#0a1633,#0c2352)]",
    eyebrow: "text-cyan",
    btn: "bg-cyan text-cyan-ink",
    glow: "var(--glow-cyan-md)",
  },
  red: {
    bg: "border-[#5a1524] bg-[radial-gradient(circle_at_80%_10%,rgba(255,77,94,0.4),transparent_55%),linear-gradient(135deg,#3a0710,#611022)]",
    eyebrow: "text-[#ffb3b9]",
    btn: "bg-white text-red-ink",
    glow: "var(--glow-red-sm)",
  },
  green: {
    bg: "border-[#12602f] bg-[radial-gradient(circle_at_80%_10%,rgba(77,224,138,0.35),transparent_55%),linear-gradient(135deg,#052e18,#0b4a29)]",
    eyebrow: "text-[#9cf3c1]",
    btn: "bg-white text-green-ink",
    glow: "var(--glow-green-sm)",
  },
};
