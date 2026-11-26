"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink, FolderOpen } from "lucide-react";
import { SectionHead } from "@/components/ui/SectionHead";
import { Modal } from "@/components/ui/Modal";
import { ProjectCard, type TiltPhysics } from "@/components/projects/ProjectCard";
import { ProjectDetail } from "@/components/ProjectDetail";
import { useI18n } from "@/i18n/LocaleProvider";
import { type Project, type ProjectCategory, type SectionContent } from "@/types/content";

type Filter = "all" | ProjectCategory;

export function ProjectFilters({ projects, filter, setFilter }: { projects: Project[]; filter: Filter; setFilter: (f: Filter) => void }) {
  const { t } = useI18n();
  return (
    <div role="tablist" aria-label={t.projects.filter} className="scrollbar-none -mx-4 mb-6 flex gap-2 overflow-x-auto px-4" data-reveal>
      {(["all", "fullstack", "frontend", "backend", "mobile", "other"] as Filter[]).map((c) => {
        const count = c === "all" ? projects.length : projects.filter((p) => p.category === c).length;
        return (
          <button key={c} role="tab" aria-selected={filter === c} onClick={() => setFilter(c)} data-guide="filter" disabled={count === 0 && c !== "all"} className="nn-chip shrink-0 disabled:opacity-40">
            {c === "all" ? `${t.projects.all} (${projects.length})` : t.projects.cat[c]}
          </button>
        );
      })}
    </div>
  );
}

export function ProjectModal({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const { t } = useI18n();
  return (
    <Modal open={!!project} onClose={onClose} title={project?.title ?? ""} size="xl" hideTitle>
      {project && (
        <>
          <ProjectDetail project={project} />
          <div className="border-t border-outline-variant px-6 py-4 text-right md:px-10">
            <a href={`/projects/${project.slug}`} className="nn-label inline-flex items-center gap-1.5 text-mist hover:text-pink">
              {t.projects.openPage} <ExternalLink className="size-3.5" />
            </a>
          </div>
        </>
      )}
    </Modal>
  );
}

export function useProjectDeepLink(projects: Project[]) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("project");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincronización inicial con la URL
    if (slug) setOpenSlug(slug);
  }, []);
  function select(slug: string | null) {
    setOpenSlug(slug);
    const url = new URL(window.location.href);
    if (slug) url.searchParams.set("project", slug);
    else url.searchParams.delete("project");
    window.history.replaceState(null, "", url);
  }
  return { open: projects.find((p) => p.slug === openSlug) ?? null, select };
}

const STAGE_PHYSICS: TiltPhysics = { tilt: 25, damping: 0.08 };

/** Vitrina 3D: carrusel con profundidad; la tarjeta central se inclina con fuerza 25° y poca amortiguación. */
export function Projects({ projects, section }: { projects: Project[]; section: SectionContent }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [active, setActive] = useState(0);
  const { t, tr } = useI18n();
  const P = t.projects;
  const { open, select } = useProjectDeepLink(projects);
  const list = useMemo(() => (filter === "all" ? projects : projects.filter((p) => p.category === filter)), [filter, projects]);
  const current = Math.min(active, Math.max(0, list.length - 1));
  const stage = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ x: number; id: number } | null>(null);

  const go = (d: number) => setActive((a) => Math.max(0, Math.min(list.length - 1, Math.min(a, list.length - 1) + d)));

  // Flechas del teclado cuando la vitrina está en pantalla.
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input, textarea, select, [role=dialog]")) return;
      const r = stage.current?.getBoundingClientRect();
      if (!r || r.bottom < 0 || r.top > window.innerHeight) return;
      if (e.key === "ArrowRight") setActive((a) => Math.min(a + 1, list.length - 1));
      if (e.key === "ArrowLeft") setActive((a) => Math.max(a - 1, 0));
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [list.length]);

  return (
    <section id="projects" className="nn-section overflow-hidden bg-ink-2">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHead title={tr(section, "title")} subtitle={tr(section, "subtitle")} />
        <ProjectFilters
          projects={projects}
          filter={filter}
          setFilter={(f) => {
            setFilter(f);
            setActive(0);
          }}
        />

        {list.length === 0 ? (
          <div className="nn-card grid place-items-center py-20 text-mist">
            <FolderOpen className="mb-3 size-8" /> {P.empty}
          </div>
        ) : (
          <div className="relative">
            <div
              ref={stage}
              className="relative mx-auto h-[600px] touch-pan-y [perspective:1400px] sm:h-[540px]"
              role="region"
              aria-roledescription="carousel"
              aria-label={tr(section, "title")}
              onPointerDown={(e) => {
                if (e.pointerType !== "mouse") swipe.current = { x: e.clientX, id: e.pointerId };
              }}
              onPointerUp={(e) => {
                const s = swipe.current;
                swipe.current = null;
                if (!s || s.id !== e.pointerId) return;
                const dx = e.clientX - s.x;
                if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
              }}
            >
              {list.map((p, i) => {
                const off = i - current;
                const abs = Math.abs(off);
                return (
                  <motion.div
                    key={p.id}
                    className="absolute left-1/2 top-2 w-[min(560px,84vw)]"
                    style={{ zIndex: 50 - abs, transformStyle: "preserve-3d", pointerEvents: abs > 2 ? "none" : undefined }}
                    initial={false}
                    animate={{
                      x: `calc(-50% + ${off * 62}%)`,
                      rotateY: off * -32,
                      z: -abs * 180,
                      opacity: abs > 2 ? 0 : 1 - abs * 0.28,
                      scale: 1 - abs * 0.06,
                    }}
                    transition={{ type: "spring", stiffness: 160, damping: 8 + STAGE_PHYSICS.damping * 60 }}
                    onClick={() => off !== 0 && setActive(i)}
                    aria-hidden={off !== 0}
                    inert={off !== 0}
                  >
                    <ProjectCard
                      project={p}
                      onInspect={() => select(p.slug)}
                      physics={off === 0 ? STAGE_PHYSICS : { tilt: 0, damping: STAGE_PHYSICS.damping }}
                      showCategory={off === 0}
                      inspectLabel={P.inspect3d}
                    />
                  </motion.div>
                );
              })}
            </div>
            <div className="mt-2 flex items-center justify-center gap-3">
              <button onClick={() => go(-1)} disabled={current === 0} className="grid size-11 place-items-center rounded-full border border-outline bg-surface hover:border-pink disabled:opacity-30" aria-label={P.prev}>
                <ChevronLeft className="size-5" />
              </button>
              <span className="nn-label tabular-nums text-mist" aria-live="polite">
                {current + 1} / {list.length}
              </span>
              <button onClick={() => go(1)} disabled={current === list.length - 1} className="grid size-11 place-items-center rounded-full border border-outline bg-surface hover:border-pink disabled:opacity-30" aria-label={P.next}>
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>
        )}
      </div>
      <ProjectModal project={open} onClose={() => select(null)} />
    </section>
  );
}
