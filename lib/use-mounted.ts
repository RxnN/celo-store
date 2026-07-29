"use client";

import { useEffect, useState } from "react";

// Guards client-only rendering (e.g. zustand state hydrated from localStorage)
// so the server-rendered markup matches the client's first paint.
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  return mounted;
}
