"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/i18n/LocaleProvider";

/** Solo una vez por carga completa de la página (no al navegar entre páginas). */
let bootedOnce = false;

/**
 * Pantalla de inicio "Initializing Elvis Flores…" en rosa pastel.
 * Se renderiza en el HTML del servidor para que no haya parpadeo, y una animación CSS la oculta
 * sola a los 7 s aunque JavaScript falle.
 */
export function Preloader({ name }: { name: string }) {
  const { t } = useI18n();
  const [show, setShow] = useState(true);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const finish = () => {
      bootedOnce = true;
      document.documentElement.dataset.booted = "1";
      setShow(false);
    };
    if (bootedOnce) {
      finish();
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduce ? 350 : 1700;
    const start = performance.now();
    let raf = 0;
    let loaded = document.readyState === "complete";
    const onLoad = () => (loaded = true);
    window.addEventListener("load", onLoad);
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      // Se queda en 92 % hasta que la página termina de cargar (máx. 4 s).
      const cap = loaded || now - start > 4000 ? 1 : 0.92;
      const eased = Math.min(cap, 1 - Math.pow(1 - p, 3));
      setPct(Math.round(eased * 100));
      if (eased >= 1) window.setTimeout(finish, 220);
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = show ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  const steps = t.boot.steps;
  const step = pct >= 100 ? steps[steps.length - 1] : steps[Math.min(steps.length - 2, Math.floor((pct / 100) * (steps.length - 1)))];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="boot"
          role="status"
          aria-live="polite"
          aria-label={t.boot.title(name)}
          className="boot-screen fixed inset-0 z-[200] grid place-items-center bg-ink"
          exit={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="grid-bg pointer-events-none absolute inset-0 opacity-60" aria-hidden />
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, rgb(244 182 204 / 0.22), transparent 62%)" }}
            aria-hidden
          />

          <div className="relative flex w-[min(26rem,86vw)] flex-col items-center text-center">
            {/* Núcleo: anillos girando alrededor de una esfera rosa */}
            <div className="relative mb-10 size-28" aria-hidden>
              <span className="absolute inset-0 animate-[spin_2.4s_linear_infinite] rounded-full border border-pink/25 border-t-pink" />
              <span className="absolute inset-3 animate-[spin_3.6s_linear_infinite_reverse] rounded-full border border-pink-soft/20 border-b-pink-soft" />
              <span className="absolute inset-[34%] rounded-full bg-[radial-gradient(circle_at_35%_30%,#F8D7E5,#F4B6CC_45%,#EFA3C2)] shadow-[0_0_50px_6px_rgb(244_182_204/0.55)]" />
            </div>

            <p className="font-mono text-xs uppercase tracking-[0.3em] text-pink/80">{t.boot.kicker}</p>
            <p className="mt-3 font-display text-2xl font-semibold tracking-tight text-snow md:text-3xl">
              {t.boot.initializing} <span className="text-gradient">{name}</span>
              <span className="ml-1 inline-block animate-pulse text-pink">…</span>
            </p>

            <div className="mt-8 h-[3px] w-full overflow-hidden rounded-full bg-white/[0.07]">
              <div className="h-full rounded-full bg-gradient-to-r from-pink-soft via-pink to-pink-accent shadow-[0_0_14px_rgb(244_182_204/0.8)] transition-[width] duration-100" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-3 flex w-full justify-between font-mono text-[11px] text-mist">
              <span>&gt; {step}</span>
              <span className="tabular-nums text-pink-soft">{pct}%</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
