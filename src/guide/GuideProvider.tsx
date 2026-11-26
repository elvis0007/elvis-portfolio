"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

/**
 * Estado de BLUE, el gato guía. BLUE acompaña al visitante por la página: comenta cada sección
 * al entrar, reacciona a los clics y abre el minijuego 3D sobre la propia página.
 * Los mensajes son descriptores (no texto) para que cambien con el idioma.
 */

export type Mood = "idle" | "talk" | "happy" | "jump" | "sleep";

export type Message =
  | { kind: "greeting"; game: boolean }
  | { kind: "section"; id: string }
  | { kind: "tip"; key: string }
  | { kind: "pet"; i: number }
  | { kind: "gameOver"; score: number; best: number; record: boolean };

interface GuideCtx {
  page: string;
  sections: string[];
  current: string;
  message: Message | null;
  messageId: number;
  mood: Mood;
  bubbleOpen: boolean;
  gameEnabled: boolean;
  gameOpen: boolean;
  setGameOpen: (open: boolean) => void;
  say: (m: Message | null, mood?: Mood) => void;
  setBubbleOpen: (o: boolean) => void;
  nextHint: () => void;
  pet: () => void;
}

const Ctx = createContext<GuideCtx | null>(null);

export function scrollToSection(id: string) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (id === "top") return window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

export function GuideProvider({
  sections,
  page = "home",
  gameEnabled = true,
  children,
}: {
  sections: string[];
  page?: string;
  gameEnabled?: boolean;
  children: React.ReactNode;
}) {
  const [current, setCurrent] = useState(sections[0] ?? "top");
  const [message, setMessage] = useState<Message | null>(null);
  const [messageId, setMessageId] = useState(0);
  const [mood, setMood] = useState<Mood>("idle");
  const [bubbleOpen, setBubbleOpen] = useState(true);
  const [gameOpen, setGameOpen] = useState(false);
  const moodTimer = useRef<number | undefined>(undefined);
  const bubbleTimer = useRef<number | undefined>(undefined);
  const petCount = useRef(0);
  const seen = useRef(new Set<string>());
  /** Momento del último comentario provocado por el visitante (clic, caricia, juego). */
  const lastUserMsg = useRef(0);
  const currentRef = useRef(current);
  useEffect(() => {
    currentRef.current = current;
  });

  const say = useCallback((m: Message | null, nextMood: Mood = "talk") => {
    window.clearTimeout(moodTimer.current);
    if (m && m.kind !== "section" && m.kind !== "greeting") lastUserMsg.current = performance.now();
    setMessage(m);
    setMessageId((n) => n + 1);
    if (m) setBubbleOpen(true);
    setMood(m ? nextMood : "idle");
    window.clearTimeout(bubbleTimer.current);
    if (m) bubbleTimer.current = window.setTimeout(() => setBubbleOpen(false), m.kind === "greeting" || m.kind === "gameOver" ? 12000 : 7500);
    moodTimer.current = window.setTimeout(() => setMood("idle"), nextMood === "jump" ? 1100 : 2400);
  }, []);

  // Saludo inicial (después de la pantalla de inicio).
  useEffect(() => {
    const t = window.setTimeout(() => {
      seen.current.add(sections[0] ?? "top");
      say(page === "home" ? { kind: "greeting", game: gameEnabled } : { kind: "section", id: page }, "happy");
    }, 2300);
    return () => window.clearTimeout(t);
  }, [page, say, sections, gameEnabled]);

  // Sección visible → consejo contextual (una vez por sección).
  useEffect(() => {
    if (page !== "home") return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const id = e.target.id;
          setCurrent(id);
          if (!seen.current.has(id)) {
            seen.current.add(id);
            // No pisa lo que BLUE acaba de responder a una acción del visitante.
            if (performance.now() - lastUserMsg.current > 3000) say({ kind: "section", id });
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [sections, say, page]);

  /** "Next hint →": lleva a la siguiente sección y la explica. */
  const nextHint = useCallback(() => {
    if (page !== "home") return say({ kind: "section", id: page });
    const idx = Math.max(0, sections.indexOf(currentRef.current));
    const next = sections[(idx + 1) % sections.length];
    seen.current.add(next);
    scrollToSection(next);
    setCurrent(next);
    say({ kind: "section", id: next });
  }, [page, sections, say]);

  const pet = useCallback(() => {
    say({ kind: "pet", i: petCount.current++ }, "happy");
  }, [say]);

  const value = useMemo<GuideCtx>(
    () => ({ page, sections, current, message, messageId, mood, bubbleOpen, gameEnabled, gameOpen, setGameOpen, say, setBubbleOpen, nextHint, pet }),
    [page, sections, current, message, messageId, mood, bubbleOpen, gameEnabled, gameOpen, say, nextHint, pet],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGuide() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useGuide debe usarse dentro de <GuideProvider>");
  return ctx;
}
