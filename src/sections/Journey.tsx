"use client";
import { useEffect, useRef } from "react";
import { getGsap } from "@/animations/gsap";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/LocaleProvider";
import type { SectionContent, TimelineEntry } from "@/types/content";

const TONES = [
  { dot: "bg-pink", text: "text-pink" },
  { dot: "bg-cyan", text: "text-cyan" },
  { dot: "bg-crimson", text: "text-crimson" },
];

export function Journey({ entries, section }: { entries: TimelineEntry[]; section: SectionContent }) {
  const root = useRef<HTMLOListElement>(null);
  const { t, tr, formatDate } = useI18n();

  const period = (e: TimelineEntry) => {
    const start = formatDate(e.start_date);
    if (!start) return e.is_current ? t.journey.current : formatDate(e.end_date);
    const end = e.is_current ? t.journey.present : formatDate(e.end_date);
    return end ? `${start} — ${end}` : start;
  };

  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const { gsap } = getGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo("[data-line]", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: el, start: "top 75%", end: "bottom 60%", scrub: true } });
      gsap.utils.toArray<HTMLElement>("[data-tl]").forEach((item) =>
        gsap.from(item, { opacity: 0, x: 40, duration: 0.8, ease: "expo.out", scrollTrigger: { trigger: item, start: "top 88%", once: true } }),
      );
    }, el);
    return () => ctx.revert();
  }, [entries.length]);

  return (
    <section id="journey" className="nn-section bg-ink-2">
      <div className="mx-auto max-w-4xl px-4 md:px-8">
        <h2 className="nn-h2" data-reveal>
          {tr(section, "title")}
        </h2>
        {tr(section, "subtitle") && (
          <p className="mb-10 mt-2 text-mist" data-reveal>
            {tr(section, "subtitle")}
          </p>
        )}

        {entries.length === 0 ? (
          <p className="text-mist">{t.journey.empty}</p>
        ) : (
          <ol ref={root} className="relative ml-1 space-y-6 pl-8">
            <span className="absolute bottom-2 left-0 top-2 w-px bg-outline-variant" aria-hidden>
              <span data-line className="block h-full w-full origin-top bg-gradient-to-b from-pink via-cyan to-crimson" />
            </span>
            {entries.map((e, i) => {
              const tone = TONES[i % TONES.length];
              const when = period(e);
              return (
                <li key={e.id} data-tl className="relative">
                  <span className={cn("absolute -left-[2.2rem] top-6 size-2.5 rounded-full ring-4 ring-ink-2", tone.dot)} aria-hidden />
                  <article className="nn-card nn-card-hover p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className={cn("nn-label", tone.text)}>{t.journey.kinds[e.kind]}</p>
                      {when && <p className="nn-label text-mist">{when}</p>}
                    </div>
                    <h3 className="mt-1 font-display text-xl font-semibold">{tr(e, "title")}</h3>
                    {(e.organization || e.location) && <p className="text-sm text-mist">{[e.organization, e.location].filter(Boolean).join(" · ")}</p>}
                    {tr(e, "description") && <p className="mt-2 whitespace-pre-line text-sm leading-5 text-mist">{tr(e, "description")}</p>}
                  </article>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
