"use client";
import { TechIcon } from "@/components/ui/TechIcon";
import { useI18n } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import type { Technology } from "@/types/content";

/** Detalle de una tecnología (se muestra en el modal del Tech Stack). */
export function TechDetailBody({ tech }: { tech: Technology }) {
  const { t, tr } = useI18n();
  const label = tech.level ? t.stack.levels[tech.level] : null;
  const description = tr(tech, "description");
  const usage = tr(tech, "usage");
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-xl bg-[#FBEFF4] ring-1 ring-pink/40">
          <TechIcon name={tech.name} src={tech.icon_url} color className="size-7 text-pink" />
        </span>
        <div>
          <p className="font-display text-2xl font-semibold leading-7">{tr(tech, "name")}</p>
          <p className="nn-label text-mist">
            {t.stack.cat[tech.category]}
            {label && ` · ${t.stack.level}: ${label}`}
          </p>
        </div>
      </div>
      {tech.level && (
        <div className="flex gap-1.5" role="meter" aria-valuemin={1} aria-valuemax={5} aria-valuenow={tech.level} aria-label={`${t.stack.level}: ${label}`}>
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} className={cn("h-1.5 flex-1 rounded-full", n <= tech.level! ? (n >= 4 ? "bg-cyan" : "bg-pink") : "bg-surface-highest")} />
          ))}
        </div>
      )}
      {description && <p className="leading-relaxed text-mist">{description}</p>}
      <div className="rounded-xl border border-outline-variant bg-surface-high/60 p-4">
        <p className="nn-label mb-1 text-pink">{t.stack.howIUse}</p>
        <p className="text-sm leading-relaxed text-snow/90">{usage || t.stack.noUsage}</p>
      </div>
    </div>
  );
}
