"use client";

import { useState } from "react";
import { useMounted } from "@/lib/use-mounted";

const COLORS = ["#4d8dff", "#ff4d5e", "#b98bff", "#4de08a"];

type Piece = {
  id: number;
  left: number;
  color: string;
  width: number;
  height: number;
  duration: number;
  delay: number;
  rotate: number;
};

function createPieces(count: number): Piece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: COLORS[i % COLORS.length],
    width: 6 + Math.random() * 5,
    height: 10 + Math.random() * 6,
    duration: 2.6 + Math.random() * 1.6,
    delay: Math.random() * 0.5,
    rotate: 360 + Math.random() * 360,
  }));
}

/**
 * Confete client-only (CSS puro, sem dependência nova) — as posições são
 * aleatórias, então só renderiza depois de montar, pra não gerar HTML
 * diferente entre servidor e cliente.
 */
export function Confetti({ pieceCount = 80 }: { pieceCount?: number }) {
  const mounted = useMounted();
  const [pieces] = useState(() => createPieces(pieceCount));

  if (!mounted) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={
            {
              left: `${p.left}%`,
              width: p.width,
              height: p.height,
              backgroundColor: p.color,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              "--confetti-rotate": `${p.rotate}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
