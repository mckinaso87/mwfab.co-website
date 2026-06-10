"use client";

import { useEffect, useState } from "react";

type Options = {
  enabled?: boolean;
};

export function useScrollProgress({ enabled = true }: Options = {}) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      setScrollY(window.scrollY);
    };

    const onScroll = () => {
      if (raf !== 0) {
        return;
      }
      raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf !== 0) {
        window.cancelAnimationFrame(raf);
      }
    };
  }, [enabled]);

  return scrollY;
}
