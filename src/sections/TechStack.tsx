"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SectionHead } from "@/components/ui/SectionHead";
import { Modal } from "@/components/ui/Modal";
import { TiltCard } from "@/components/ui/TiltCard";
import { TechIcon } from "@/components/ui/TechIcon";
import { TechDetailBody } from "@/components/tech/TechDetail";
import { useI18n } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { TECH_CATEGORIES, type SectionContent, type TechCategory, type Technology } from "@/types/content";

type Filter = "all" | TechCategory;

const RINGS = [
  { r: 150, d: "38s", dir: "normal", rev: "reverse" },
  { r: 230, d: "55s", dir: "reverse", rev: "normal" },
  { r: 305, d: "75s", dir: "normal", rev: "reverse" },
];

/** Logotipo original sobre una pastilla rosa pastel (así se ven también los logos oscuros). */
function TechTile({ tech, className }: { tech: Technology; className?: string }) {
  return (
    <span className={cn("grid shrink-0 place-items-center rounded-xl bg-[#FBEFF4] ring-1 ring-pink/40", className)}>
      <TechIcon name={tech.name} src={tech.icon_url} color className="size-[62%] text-pink" />
    </span>
  );
}

/** Ecosistema tecnológico: órbita viva de logotipos + tarjetas con inclinación 3D. */
export function TechStack({ technologies, section }: { technologies: Technology[]; section: SectionContent }) {
  const { t, tr } = useI18n();
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Technology | null>(null);

  const categories = useMemo(() => TECH_CATEGORIES.filter((c) => technologies.some((x) => x.category === c)), [technologies]);
  const visible = useMemo(() => (filter === "all" ? technologies : technologies.filter((x) => x.category === filter)), [filter, technologies]);

  // Reparte las tecnologías visibles en anillos según su capacidad.
  const rings = useMemo(() => {
    const caps = [6, 10, 14];
    const out: Technology[][] = [[], [], []];
    let ring = 0;
    for (const tech of visible) {
      while (ring < 2 && out[ring].length >= caps[ring]) ring++;
      out[ring].push(tech);
    }
    return out;
  }, [visible]);

  return (
    <section id="stack" className="relative overflow-hidden border-b border-outline-variant py-24 md:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pink/30 to-transparent" aria-hidden />
      <div className="container-x">
        {tr(section, "eyebrow") && (
          <p className="eyebrow mb-3" data-reveal>
            {tr(section, "eyebrow")}
          </p>
        )}
        <SectionHead title={tr(section, "title")} subtitle={tr(section, "subtitle")} />

        {/* Filtros por categoría */}
        <div role="tablist" aria-label={t.stack.categories} className="scrollbar-none -mx-5 mb-12 flex gap-2 overflow-x-auto px-5" data-reveal>
          {(["all", ...categories] as Filter[]).map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={filter === c}
              onClick={() => setFilter(c)}
              data-guide="filter"
              className={cn("relative shrink-0 rounded-full px-4 py-2 text-sm transition-colors", filter === c ? "text-on-pink" : "text-mist hover:text-snow")}
            >
              {filter === c && <motion.span layoutId="tech-filter" className="absolute inset-0 rounded-full bg-pink" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
              <span className="relative z-10">
                {c === "all" ? t.stack.all : t.stack.cat[c]}
                <span className="ml-1.5 font-mono text-[0.7rem] opacity-60">{c === "all" ? technologies.length : technologies.filter((x) => x.category === c).length}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="grid items-center gap-16 xl:grid-cols-[auto_1fr]">
          {/* Ecosistema orbital */}
          <div className="mx-auto" data-reveal>
            <div className="orbit" role="group" aria-label={t.stack.orbitLabel}>
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgb(244_182_204/0.12),transparent_60%)]" aria-hidden />
              <div className="absolute left-1/2 top-1/2 grid size-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-pink/30 bg-ink-2 shadow-[0_0_80px_-10px_rgb(244_182_204/0.6)] sm:size-32">
                <div className="absolute inset-2 animate-ping rounded-full border border-pink/20 [animation-duration:3s]" aria-hidden />
                <div className="text-center">
                  <p className="font-mono text-2xl text-pink">{"</>"}</p>
                  <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-mist">{t.stack.tools(visible.length)}</p>
                </div>
              </div>
              {RINGS.map((ring, ri) => (
                <div key={ri} className="orbit-ring" style={{ "--r": `${ring.r}px`, "--d": ring.d, "--dir": ring.dir } as React.CSSProperties}>
                  {rings[ri].map((tech, i) => (
                    <div
                      key={tech.id}
                      className="orbit-item"
                      style={{ "--a": `${(i / rings[ri].length) * 360}deg`, "--r": `${ring.r}px`, "--d": ring.d, "--rev": ring.rev } as React.CSSProperties}
                    >
                      <div className="orbit-upright">
                        <button
                          onClick={() => setSelected(tech)}
                          data-guide="tech"
                          className="group/orb relative -ml-6 -mt-6 block rounded-xl outline-offset-4 transition-transform duration-300 hover:scale-125 focus-visible:scale-125"
                          aria-label={t.stack.details(tr(tech, "name"))}
                        >
                          <TechTile tech={tech} className="size-12 shadow-[0_8px_30px_-6px_rgb(244_182_204/0.5)]" />
                          <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink-2 px-2 py-1 font-mono text-[0.65rem] text-pink-soft opacity-0 ring-1 ring-white/10 transition group-hover/orb:opacity-100 group-focus-visible/orb:opacity-100">
                            {tr(tech, "name")}
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Tarjetas con profundidad */}
          <motion.ul layout className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {visible.map((tech, i) => (
                <motion.li
                  key={tech.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: Math.min(i * 0.025, 0.4) } }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <TiltCard className="h-full rounded-2xl" intensity={14}>
                    <button onClick={() => setSelected(tech)} data-guide="tech" className="glass group flex h-full w-full items-center gap-3 rounded-2xl p-3.5 text-left transition-colors hover:border-pink/40">
                      <TechTile tech={tech} className="size-10 transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-110" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{tr(tech, "name")}</span>
                        <span className="block truncate font-mono text-[0.68rem] text-mist">{tech.level ? t.stack.levels[tech.level] : t.stack.cat[tech.category]}</span>
                      </span>
                    </button>
                  </TiltCard>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        </div>
      </div>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? tr(selected, "name") : ""}
        hideTitle
        size="md"
      >
        {selected && (
          <div className="px-6 pb-6 pt-6 md:px-8 md:pb-8">
            <TechDetailBody tech={selected} />
          </div>
        )}
      </Modal>
    </section>
  );
}
