"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useSpring, useTransform, useVelocity } from "framer-motion";
import { Gamepad2, X } from "lucide-react";
import { useI18n } from "@/i18n/LocaleProvider";
import { useCoarsePointer, usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { useGuide, type Message, type Mood } from "./GuideProvider";
import { BlueFace } from "./BlueFace";

const Cat3D = dynamic(() => import("@/three/Cat3D"), {
  ssr: false,
  loading: () => <BlueFace className="size-14" />,
});

const HEADER = 72;
const MARGIN = 10;

function useMessageText(m: Message | null) {
  const { t } = useI18n();
  if (!m) return "";
  const c = t.cat;
  switch (m.kind) {
    case "greeting":
      return c.greeting(m.game);
    case "section":
      return c.sections[m.id] ?? "";
    case "tip":
      return c.tips[m.key] ?? "";
    case "pet":
      return c.petReplies[m.i % c.petReplies.length];
    case "gameOver":
      return c.gameOver(m.score, m.best, m.record);
  }
}

function useTypewriter(text: string, key: number) {
  const reduced = usePrefersReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (reduced) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reinicia la animación por mensaje
    setN(0);
    const id = window.setInterval(() => setN((v) => (v >= text.length ? (window.clearInterval(id), v) : v + 2)), 18);
    return () => window.clearInterval(id);
  }, [text, key, reduced]);
  return reduced ? text : text.slice(0, n);
}

/**
 * BLUE: gato blanco 3D (ojos azules, collar rojo) que recorre la página.
 * - Con ratón: camina detrás del cursor (se queda a un lado para no tapar lo que vas a pulsar).
 * - Al hacer clic: salta hasta ese punto y, si es un elemento con `data-guide`, lo explica.
 * - Al entrar en una sección: se sienta junto a su título y la presenta.
 * - En pantallas táctiles va a donde tocas; con "reducir movimiento" se queda en la esquina.
 */
export function CatGuide() {
  const g = useGuide();
  const { t } = useI18n();
  const reduced = usePrefersReducedMotion();
  const coarse = useCoarsePointer();
  const text = useMessageText(g.message);
  const typed = useTypewriter(text, g.messageId);
  const showBubble = g.bubbleOpen && !!g.message;

  const [ready, setReady] = useState(false);
  const [above, setAbove] = useState(true);
  const [hop, setHop] = useState(false);
  const [bubbleWidth, setBubbleWidth] = useState(288);
  const size = useRef(72);
  const vw = useRef(1280);
  const vh = useRef(800);
  const parkUntil = useRef(0);
  const dir = useRef({ x: 1, y: 0 });
  const last = useRef<{ x: number; y: number } | null>(null);
  const hopTimer = useRef<number | undefined>(undefined);
  const homeTimer = useRef<number | undefined>(undefined);

  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const spring = reduced ? { stiffness: 1000, damping: 100 } : { stiffness: 70, damping: 14, mass: 0.9 };
  const x = useSpring(tx, spring);
  const y = useSpring(ty, spring);
  const vx = useVelocity(x);
  const lean = useTransform(vx, (v) => Math.max(-14, Math.min(14, v / 70)));

  const bubbleW = useRef(288);
  const bx = useTransform(x, (v) => Math.max(MARGIN, Math.min(vw.current - bubbleW.current - MARGIN, v + size.current / 2 - bubbleW.current / 2)));
  const by = useTransform(y, (v) => (v > 230 ? v - 10 : v + size.current + 10));
  useMotionValueEvent(y, "change", (v) => {
    const next = v > 230;
    if (next !== above) setAbove(next);
  });

  /** Mueve a BLUE a (px, py) — esquina superior izquierda del avatar — dentro de la pantalla. */
  const moveTo = useCallback(
    (px: number, py: number, instant = false) => {
      const s = size.current;
      const cx = Math.max(MARGIN, Math.min(vw.current - s - MARGIN, px));
      const cy = Math.max(HEADER, Math.min(vh.current - s - MARGIN, py));
      tx.set(cx);
      ty.set(cy);
      if (instant) {
        x.jump(cx);
        y.jump(cy);
      }
    },
    [tx, ty, x, y],
  );

  const corner = useCallback(() => moveTo(vw.current - size.current - 20, vh.current - size.current - 20), [moveTo]);

  // Medidas de la ventana y posición inicial (esquina inferior derecha).
  useEffect(() => {
    const measure = () => {
      vw.current = window.innerWidth;
      vh.current = window.innerHeight;
      size.current = window.innerWidth < 768 ? 60 : 72;
      bubbleW.current = Math.min(288, window.innerWidth - MARGIN * 2);
      setBubbleWidth(bubbleW.current);
    };
    measure();
    moveTo(vw.current - size.current - 20, vh.current - size.current - 20, true);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- la posición depende de la ventana (solo cliente)
    setReady(true);
    const onResize = () => {
      measure();
      moveTo(tx.get(), ty.get());
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [moveTo, tx, ty]);

  const doHop = useCallback(() => {
    window.clearTimeout(hopTimer.current);
    setHop(true);
    hopTimer.current = window.setTimeout(() => setHop(false), 1000);
  }, []);

  // Seguir al cursor: se coloca detrás de la dirección del movimiento.
  useEffect(() => {
    if (reduced || coarse) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const p = { x: e.clientX, y: e.clientY };
      if (last.current) {
        const dx = p.x - last.current.x;
        const dy = p.y - last.current.y;
        const len = Math.hypot(dx, dy);
        if (len > 2) {
          dir.current = { x: dir.current.x * 0.85 + (dx / len) * 0.15, y: dir.current.y * 0.85 + (dy / len) * 0.15 };
        }
      }
      last.current = p;
      if (performance.now() < parkUntil.current) return;
      const s = size.current;
      const n = Math.hypot(dir.current.x, dir.current.y) || 1;
      const back = 64 + s / 2;
      moveTo(p.x - (dir.current.x / n) * back - s / 2, p.y - (dir.current.y / n) * back - s / 2 + 18);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced, coarse, moveTo]);

  // Clics: BLUE salta hacia el punto y comenta los elementos marcados con data-guide.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      if (!el || el.closest("[data-blue], [data-game], [role=dialog]")) return;
      const guide = el.closest<HTMLElement>("[data-guide]")?.dataset.guide;
      if (guide) g.say({ kind: "tip", key: guide }, "happy");
      if (reduced) return;
      doHop();
      const s = size.current;
      const right = e.clientX < vw.current - s * 2.2;
      parkUntil.current = performance.now() + 1600;
      moveTo(right ? e.clientX + 26 : e.clientX - s - 26, e.clientY - s / 2);
      // En pantallas táctiles vuelve a su esquina para no tapar el contenido.
      window.clearTimeout(homeTimer.current);
      if (coarse) homeTimer.current = window.setTimeout(corner, 2200);
    };
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("click", onClick);
      window.clearTimeout(homeTimer.current);
    };
  }, [g, reduced, coarse, doHop, moveTo, corner]);

  // Al presentar una sección, BLUE se sienta junto a su título (cuando el scroll se detiene).
  useEffect(() => {
    const m = g.message;
    // En móvil se queda en su esquina: junto al título taparía el texto.
    if (!m || m.kind !== "section" || reduced || vw.current < 768) return;
    let tries = 0;
    let lastY = -1;
    let timer: number | undefined;
    const park = () => {
      const y = window.scrollY;
      const moving = y !== lastY;
      lastY = y;
      if (moving && tries++ < 20) {
        timer = window.setTimeout(park, 150);
        return;
      }
      const section = document.getElementById(m.id);
      const head = section?.querySelector<HTMLElement>("h2, h1") ?? section;
      const r = head?.getBoundingClientRect();
      if (!head || !r || r.bottom < HEADER || r.top > vh.current - size.current) return;
      const s = size.current;
      const textRight = Math.min(r.right, r.left + measureText(head));
      parkUntil.current = performance.now() + 3500;
      moveTo(textRight + 18, r.top + r.height / 2 - s / 2);
    };
    // Mientras tanto no sigue al cursor (el scroll genera movimientos falsos del ratón).
    parkUntil.current = performance.now() + 3500;
    park();
    return () => window.clearTimeout(timer);
  }, [g.message, g.messageId, reduced, moveTo]);

  // Al abrir el juego BLUE "entra" en él; al volver, regresa a su esquina.
  useEffect(() => {
    if (!g.gameOpen) corner();
  }, [g.gameOpen, corner]);

  if (g.gameOpen) return null;
  const mood: Mood = hop ? "jump" : g.mood;

  return (
    <aside aria-label={t.cat.aside} data-blue className="pointer-events-none fixed inset-0 z-[70]" style={{ opacity: ready ? 1 : 0 }}>
      <AnimatePresence>
        {showBubble && (
          <motion.div key="bubble-pos" className="absolute left-0 top-0" style={{ x: bx, y: by, width: bubbleWidth }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              style={{ translateY: above ? "-100%" : "0%", transformOrigin: above ? "bottom center" : "top center" }}
              className="pointer-events-auto flex flex-col gap-1 rounded-2xl border border-pink/50 bg-ink-2/95 p-4 shadow-[0_18px_50px_-20px_rgb(244_182_204/0.55)] backdrop-blur-md"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="nn-label flex items-center gap-1.5 text-pink">
                  <span className="size-2 rounded-full bg-crimson" aria-hidden />
                  {t.cat.label}
                </span>
                <button onClick={() => g.setBubbleOpen(false)} className="grid size-6 place-items-center rounded-full text-mist hover:bg-white/10 hover:text-snow" aria-label={t.cat.close}>
                  <X className="size-3.5" />
                </button>
              </div>
              <p className="sr-only" aria-live="polite">
                {text}
              </p>
              <p aria-hidden className="min-h-[3.75rem] text-sm leading-5 text-snow">
                {typed}
                {typed.length < text.length && <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse bg-pink" />}
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <button onClick={g.nextHint} className="nn-label text-pink hover:underline">
                  {t.cat.nextHint}
                </button>
                <span className="flex items-center gap-3">
                  <button onClick={g.pet} className="nn-label text-pink-soft hover:underline">
                    {t.cat.pet}
                  </button>
                  {g.gameEnabled && (
                    <button onClick={() => g.setGameOpen(true)} className="nn-label inline-flex items-center gap-1 rounded-full bg-pink px-2.5 py-1 text-on-pink hover:bg-pink-soft">
                      <Gamepad2 className="size-3.5" aria-hidden /> {t.cat.play}
                    </button>
                  )}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => (showBubble ? g.setBubbleOpen(false) : g.message ? g.setBubbleOpen(true) : g.pet())}
        aria-label={t.cat.avatar}
        aria-expanded={showBubble}
        style={{ x, y, rotate: lean }}
        className="pointer-events-auto absolute left-0 top-0 grid size-[60px] place-items-center overflow-hidden rounded-full border-2 border-crimson bg-surface shadow-lg shadow-pink/25 transition-[scale] duration-[180ms] hover:scale-110 md:size-[72px]"
      >
        <Cat3D mood={mood} look={0} framing="bust" />
      </motion.button>
    </aside>
  );
}

/** Ancho real del texto de un título (no del bloque completo), para sentar a BLUE justo al lado. */
function measureText(el: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(el);
  const r = range.getBoundingClientRect();
  return r.width || el.getBoundingClientRect().width;
}
