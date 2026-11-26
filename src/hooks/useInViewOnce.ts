"use client";
import { useEffect, useRef, useState } from "react";

/** true a partir de la primera vez que el elemento se acerca al viewport. */
export function useInViewOnce<T extends Element>(rootMargin = "400px") {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setSeen(true);
        io.disconnect();
      }
    }, { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, seen]);
  return [ref, seen] as const;
}
