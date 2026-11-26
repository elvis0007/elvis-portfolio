"use client";
import Image from "next/image";
import { useI18n } from "@/i18n/LocaleProvider";
import { cn, safeUrl } from "@/lib/utils";
import type { Project } from "@/types/content";

/** Portada del proyecto: imagen real o portada generativa Neon Noir. */
export function ProjectCover({ project, className, sizes = "(max-width: 768px) 100vw, 50vw", priority }: { project: Project; className?: string; sizes?: string; priority?: boolean }) {
  const cover = safeUrl(project.cover_url);
  const { t } = useI18n();
  if (cover) {
    return (
      <div className={cn("overflow-hidden", className)}>
        <Image src={cover} alt={t.projects.cover(project.title)} fill sizes={sizes} className="object-cover" priority={priority} />
      </div>
    );
  }
  const seed = [...project.slug].reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue = seed % 2 === 0;
  return (
    <div className={cn("overflow-hidden bg-ink-2", className)} aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at ${25 + (seed % 50)}% 120%, ${hue ? "rgb(244 182 204 / 0.32)" : "rgb(0 229 255 / 0.22)"}, transparent 60%), linear-gradient(180deg, #121212, #0b0b0c)`,
        }}
      />
      <svg className="absolute inset-0 size-full opacity-60" preserveAspectRatio="none" viewBox="0 0 400 175">
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 50} y1="0" x2={200 + (i * 50 - 200) * 2.2} y2="175" stroke="#2E272B" strokeWidth="1" />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={60 + i * i * 4.6} x2="400" y2={60 + i * i * 4.6} stroke="#2E272B" strokeWidth="1" />
        ))}
        <polygon points="200,28 236,48 236,88 200,108 164,88 164,48" fill="none" stroke={hue ? "#F4B6CC" : "#00E5FF"} strokeWidth="1.4" />
        <path d="M200 28 L200 68 L236 88 M200 68 L164 88" fill="none" stroke={hue ? "#F4B6CC" : "#00E5FF"} strokeWidth="1" opacity="0.6" />
      </svg>
      <span className="nn-label absolute bottom-3 left-4 text-pink/70">{`<${project.slug} />`}</span>
    </div>
  );
}
