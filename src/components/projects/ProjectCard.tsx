"use client";
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ProjectCover } from "@/components/ProjectCover";
import { useI18n } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/content";

export interface TiltPhysics {
  /** Inclinación máxima en grados */
  tilt: number;
  /** Amortiguación del resorte (0.05–0.5) */
  damping: number;
}

/** Tarjeta de proyecto Neon Noir con inclinación 3D por resorte y parallax en Z. */
export function ProjectCard({
  project,
  onInspect,
  physics = { tilt: 10, damping: 0.18 },
  showCategory = true,
  inspectLabel,
  className,
}: {
  project: Project;
  onInspect: () => void;
  physics?: TiltPhysics;
  showCategory?: boolean;
  inspectLabel?: string;
  className?: string;
}) {
  const { t, tr } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const spring = { stiffness: 260, damping: 8 + physics.damping * 60 };
  const rx = useSpring(useTransform(my, (v) => -v * physics.tilt), spring);
  const ry = useSpring(useTransform(mx, (v) => v * physics.tilt), spring);

  function move(e: React.PointerEvent) {
    if (e.pointerType === "touch" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
    mx.set(nx);
    my.set(ny);
  }
  function leave() {
    mx.set(0);
    my.set(0);
  }

  const pending = !project.cover_url && project.gallery.length === 0 && !project.demo_url;
  const tags = project.technologies.slice(0, 3);

  return (
    <motion.article
      ref={ref}
      onPointerMove={move}
      onPointerLeave={leave}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1100, transformStyle: "preserve-3d" }}
      className={cn("nn-card nn-card-hover group flex h-full flex-col overflow-hidden will-change-transform", className)}
    >
      <div className="relative aspect-[16/7] overflow-hidden border-b border-outline-variant" style={{ transform: "translateZ(30px)" }}>
        <ProjectCover project={project} className="absolute inset-0 transition-transform duration-700 group-hover:scale-105" />
        {showCategory && (
          <span className="nn-label absolute right-3 top-3 rounded-full border border-pink/60 bg-ink/80 px-2 py-0.5 text-pink-soft">{t.projects.cat[project.category]}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-6" style={{ transform: "translateZ(20px)" }}>
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-2xl font-semibold leading-8">{project.title}</h3>
        </div>
        <p className="line-clamp-3 text-base text-mist">{tr(project, "summary")}</p>
        {pending && <p className="nn-label text-pink">{t.projects.soon}</p>}
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-outline-variant px-6 py-4" style={{ transform: "translateZ(14px)" }}>
        <ul className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <li key={tag} className="nn-label rounded-md bg-surface-high px-2 py-1 text-snow/80">
              {tag}
            </li>
          ))}
        </ul>
        <button
          onClick={onInspect}
          data-guide="inspect"
          aria-label={t.projects.details(project.title)}
          className="shrink-0 rounded-full border border-pink/40 bg-surface-high px-4 py-2 text-sm font-semibold text-snow transition-colors duration-[180ms] hover:border-pink hover:bg-pink hover:text-on-pink"
        >
          {inspectLabel ?? t.projects.inspect}
        </button>
      </div>
    </motion.article>
  );
}
