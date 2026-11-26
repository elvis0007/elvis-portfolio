"use client";
import { cn } from "@/lib/utils";

/** Encabezado de sección Neon Noir: título Exo 2, subtítulo y acciones a la derecha. */
export function SectionHead({ title, subtitle, right, className, as: Tag = "h2" }: { title: string; subtitle?: string | null; right?: React.ReactNode; className?: string; as?: "h1" | "h2" }) {
  return (
    <div className={cn("mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end", className)}>
      <div className="max-w-2xl">
        <Tag className={Tag === "h1" ? "nn-h1" : "nn-h2"} data-reveal>
          {title}
        </Tag>
        {subtitle && (
          <p className="mt-2 text-base text-mist" data-reveal>
            {subtitle}
          </p>
        )}
      </div>
      {right && <div className="flex shrink-0 flex-wrap items-center gap-2">{right}</div>}
    </div>
  );
}

/** Chip de cabecera de página: "● TEXTO // TEXTO". */
export function PageChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="nn-label inline-flex items-center gap-2 self-start rounded-full border border-pink/40 bg-surface/90 px-4 py-1.5 text-pink-soft">
      <span className="size-2 rounded-full bg-cyan" aria-hidden />
      {children}
    </span>
  );
}
