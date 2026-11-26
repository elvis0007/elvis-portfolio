"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Loader2, Pause, Play, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/i18n/LocaleProvider";
import { useGuide } from "@/guide/GuideProvider";
import type { ArcadeControls, ArcadeEvents, Phase } from "@/three/ArcadeScene";

const ArcadeScene = dynamic(() => import("@/three/ArcadeScene"), {
  ssr: false,
  loading: () => (
    <div className="grid size-full place-items-center">
      <Loader2 className="size-8 animate-spin text-pink" />
    </div>
  ),
});

const BEST_KEY = "elvis-flores:neon-catch:best";

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

/**
 * BLUE's Neon Catch: minijuego 3D que se juega encima de la propia página (la página sigue
 * visible detrás). Ratón/táctil o flechas para mover a BLUE; P o Esc para pausar.
 */
export function BlueArcade() {
  const g = useGuide();
  const { t } = useI18n();
  const G = t.game;
  const [phase, setPhase] = useState<Phase>("menu");
  const phaseRef = useRef<Phase>("menu");
  const controls = useRef<ArcadeControls>({ pointerX: null, keys: new Set() });
  const [hud, setHud] = useState({ score: 0, combo: 0, lives: 3 });
  const [best, setBest] = useState(0);
  const [record, setRecord] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const area = useRef<HTMLDivElement>(null);
  const primary = useRef<HTMLButtonElement>(null);
  const result = useRef({ score: 0, best: 0, record: false, played: false });

  const go = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  const start = useCallback(() => {
    setHud({ score: 0, combo: 0, lives: 3 });
    setRecord(false);
    setResetKey((k) => k + 1);
    controls.current.pointerX = null;
    go("playing");
    area.current?.focus();
  }, [go]);

  const close = useCallback(() => {
    const r = result.current;
    g.setGameOpen(false);
    if (r.played) g.say({ kind: "gameOver", score: r.score, best: r.best, record: r.record }, r.record ? "jump" : "happy");
  }, [g]);

  const togglePause = useCallback(() => {
    if (phaseRef.current === "playing") go("paused");
    else if (phaseRef.current === "paused") go("playing");
  }, [go]);

  const events = useMemo<ArcadeEvents>(
    () => ({
      onScore: (score, combo) => setHud((h) => ({ ...h, score, combo })),
      onLives: (lives) => setHud((h) => ({ ...h, lives })),
      onOver: (score) => {
        const prev = readBest();
        const isRecord = score > prev;
        const nextBest = Math.max(prev, score);
        try {
          if (isRecord) localStorage.setItem(BEST_KEY, String(score));
        } catch {
          /* almacenamiento no disponible */
        }
        setBest(nextBest);
        setRecord(isRecord && score > 0);
        result.current = { score, best: nextBest, record: isRecord && score > 0, played: true };
        go("over");
      },
    }),
    [go],
  );

  // Récord guardado, bloqueo del scroll y foco inicial.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- récord guardado en el navegador
    setBest(readBest());
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const id = window.setTimeout(() => primary.current?.focus(), 60);
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(id);
    };
  }, []);

  // Foco en el botón principal de cada pantalla.
  useEffect(() => {
    if (phase !== "playing") window.setTimeout(() => primary.current?.focus(), 40);
  }, [phase]);

  // Teclado
  useEffect(() => {
    const keys = controls.current.keys;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (["arrowleft", "arrowright", "a", "d"].includes(k)) {
        if (phaseRef.current === "playing") e.preventDefault();
        if (e.type === "keydown") keys.add(k);
        else keys.delete(k);
        return;
      }
      if (e.type !== "keydown") return;
      if (k === "p") togglePause();
      if (k === "escape") {
        e.preventDefault();
        if (phaseRef.current === "playing" || phaseRef.current === "paused") togglePause();
        else close();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
      keys.clear();
    };
  }, [togglePause, close]);

  // Pausa automática si se cambia de pestaña.
  useEffect(() => {
    const onHide = () => document.hidden && phaseRef.current === "playing" && go("paused");
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [go]);

  function onPointer(e: React.PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    controls.current.pointerX = ((e.clientX - r.left) / r.width) * 2 - 1;
  }

  const shownBest = Math.max(best, hud.score);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={G.title}
      data-game
      className="fixed inset-0 z-[90] bg-ink/55 backdrop-blur-[3px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/80 to-transparent" aria-hidden />

      {/* Zona de juego */}
      <div
        ref={area}
        tabIndex={-1}
        aria-label={G.canvas}
        className="absolute inset-0 touch-none outline-none"
        onPointerMove={onPointer}
        onPointerDown={onPointer}
      >
        <ArcadeScene phaseRef={phaseRef} controls={controls} events={events} resetKey={resetKey} />
      </div>

      {/* HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 md:p-6">
        <div className="pointer-events-auto rounded-2xl border border-pink/30 bg-ink-2/80 px-4 py-3 backdrop-blur-md">
          <p className="nn-label text-mist">{G.score}</p>
          <p className="font-display text-3xl font-bold tabular-nums text-snow" aria-live="polite">
            {hud.score}
          </p>
          <AnimatePresence>
            {hud.combo >= 2 && (
              <motion.p key={Math.floor(hud.combo / 5)} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="nn-label text-pink">
                {G.combo(hud.combo, 1 + Math.floor(hud.combo / 5))}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-pink/30 bg-ink-2/80 px-3 py-2 backdrop-blur-md" aria-label={G.livesLabel(hud.lives)} role="img">
            {[0, 1, 2].map((i) => (
              <Heart key={i} className={i < hud.lives ? "size-4 fill-crimson text-crimson" : "size-4 text-mist/50"} aria-hidden />
            ))}
          </div>
          <span className="nn-label hidden rounded-full border border-pink/30 bg-ink-2/80 px-3 py-2 text-pink-soft backdrop-blur-md sm:inline">
            {G.best} {shownBest}
          </span>
          {(phase === "playing" || phase === "paused") && (
            <button onClick={togglePause} className="grid size-10 place-items-center rounded-full border border-pink/30 bg-ink-2/80 hover:border-pink" aria-label={phase === "paused" ? G.resume : G.pause}>
              {phase === "paused" ? <Play className="size-4" /> : <Pause className="size-4" />}
            </button>
          )}
          <button onClick={close} className="grid size-10 place-items-center rounded-full border border-pink/30 bg-ink-2/80 hover:border-pink" aria-label={G.close}>
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Pantallas */}
      <AnimatePresence>
        {phase !== "playing" && (
          <motion.div
            key={phase}
            className="absolute inset-0 grid place-items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 16, scale: 0.97 }}
              animate={{ y: 0, scale: 1 }}
              className="w-[min(26rem,100%)] rounded-3xl border border-pink/40 bg-ink-2/90 p-6 text-center shadow-[0_30px_80px_-30px_rgb(244_182_204/0.6)] backdrop-blur-md md:p-8"
            >
              {phase === "menu" && (
                <>
                  <p className="nn-label text-pink">{G.kicker}</p>
                  <h2 className="mt-2 font-display text-3xl font-bold">{G.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-mist">{G.howTo}</p>
                  <ul className="mt-4 grid gap-1.5 text-left text-sm">
                    <li className="flex items-center gap-2"><span className="size-3 rotate-45 bg-pink" aria-hidden /> {G.legendSpark}</li>
                    <li className="flex items-center gap-2"><span className="size-3 rounded-full bg-cyan" aria-hidden /> {G.legendStar}</li>
                    <li className="flex items-center gap-2"><span className="size-3 bg-crimson" aria-hidden /> {G.legendGlitch}</li>
                  </ul>
                  <Button ref={primary} size="lg" className="mt-6 w-full" onClick={start}>
                    <Play className="size-4" /> {G.start}
                  </Button>
                </>
              )}
              {phase === "paused" && (
                <>
                  <h2 className="font-display text-3xl font-bold">{G.paused}</h2>
                  <div className="mt-6 flex flex-col gap-3">
                    <Button ref={primary} size="lg" onClick={togglePause}>
                      <Play className="size-4" /> {G.resume}
                    </Button>
                    <Button variant="ghost" onClick={close}>
                      {G.backToPage}
                    </Button>
                  </div>
                </>
              )}
              {phase === "over" && (
                <>
                  <p className="nn-label text-crimson">{G.over}</p>
                  <p className="mt-2 font-display text-6xl font-bold tabular-nums">{hud.score}</p>
                  <p className="mt-2 text-sm text-mist">
                    {record ? <span className="text-pink">{G.record}</span> : `${G.best}: ${best}`}
                  </p>
                  <div className="mt-6 flex flex-col gap-3">
                    <Button ref={primary} size="lg" onClick={start}>
                      <RotateCcw className="size-4" /> {G.again}
                    </Button>
                    <Button variant="ghost" onClick={close}>
                      {G.backToPage}
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
