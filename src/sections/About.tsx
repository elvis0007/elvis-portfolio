"use client";
import Image from "next/image";
import { Code2, Database, GraduationCap, MapPin, Rocket, ServerCog, UserRound } from "lucide-react";
import { TiltCard } from "@/components/ui/TiltCard";
import { safeUrl } from "@/lib/utils";
import { useI18n } from "@/i18n/LocaleProvider";
import type { Profile, SectionContent } from "@/types/content";

const FOCUS_ICONS = [Code2, ServerCog, Database];

interface AboutStats {
  projects: number;
  technologies: number;
  certificates: number;
}

export function About({ profile, section, stats }: { profile: Profile; section: SectionContent; stats?: AboutStats }) {
  const { t, tr } = useI18n();
  const photo = safeUrl(profile.photo_url);
  const bio = tr(profile, "bio") || tr(profile, "hero_subtitle");
  const interests = tr(profile, "interests");
  const goals = tr(profile, "goals");
  const education = tr(profile, "education_summary");
  const role = tr(profile, "role");

  return (
    <section id="about" className="nn-section bg-ink-2">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 md:px-8 lg:grid-cols-12">
        <div className="flex justify-center lg:col-span-5" data-reveal>
          <TiltCard className="w-full max-w-sm rounded-3xl border border-pink/40 bg-surface p-2" intensity={7} glare={false}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-ink">
              {photo ? (
                <Image src={photo} alt={t.about.photoAlt(profile.full_name)} fill sizes="(max-width: 1024px) 90vw, 380px" className="object-cover object-top" />
              ) : (
                <div className="grid size-full place-items-center">
                  <UserRound className="size-16 text-pink/60" />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/80 to-transparent p-4 pt-16">
                <p className="font-display text-xl font-semibold text-snow">{profile.full_name}</p>
                <p className="nn-label text-pink">{role}</p>
                {profile.location && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-mist">
                    <MapPin className="size-3.5 text-pink" aria-hidden /> {profile.location}
                  </p>
                )}
              </div>
            </div>
          </TiltCard>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-7">
          <h2 className="nn-h2" data-reveal>
            {tr(section, "title")}
          </h2>
          <p className="max-w-prose text-pretty text-lg leading-7 text-mist" data-reveal>
            {bio}
          </p>
          {tr(section, "subtitle") && <p className="text-mist">{tr(section, "subtitle")}</p>}

          {/* Cifras reales: salen del contenido publicado, no se escriben a mano */}
          {stats && (
            <dl className="grid grid-cols-3 gap-3" data-reveal>
              {(
                [
                  [stats.projects, t.about.stats.projects],
                  [stats.technologies, t.about.stats.technologies],
                  [stats.certificates, t.about.stats.certificates],
                ] as const
              )
                .filter(([n]) => n > 0)
                .map(([n, label]) => (
                  <div key={label} className="rounded-2xl border border-outline-variant bg-surface px-4 py-3">
                    <dt className="nn-label text-mist">{label}</dt>
                    <dd className="font-display text-3xl font-bold text-pink">{n}</dd>
                  </div>
                ))}
            </dl>
          )}

          <div>
            <h3 className="nn-label mb-3 text-pink" data-reveal>
              {t.about.focusTitle}
            </h3>
            <ul className="grid gap-3 sm:grid-cols-3">
              {t.about.focus.map((f, i) => {
                const Icon = FOCUS_ICONS[i % FOCUS_ICONS.length];
                return (
                  <li key={f.title} className="nn-card flex flex-col gap-2 p-5" data-reveal>
                    <Icon className="size-5 text-pink" aria-hidden />
                    <p className="font-display text-base font-semibold text-snow">{f.title}</p>
                    <p className="text-sm leading-5 text-mist">{f.text}</p>
                  </li>
                );
              })}
            </ul>
          </div>

          {(education || goals || interests.length > 0) && (
            <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2">
              {education && (
                <article className="nn-card flex h-full flex-col gap-2 p-6" data-reveal>
                  <div className="flex items-center gap-2 text-pink">
                    <GraduationCap className="size-5" aria-hidden />
                    <h3 className="font-display text-xl font-semibold text-snow">{t.about.education}</h3>
                  </div>
                  <p className="whitespace-pre-line text-sm leading-5 text-mist">{education}</p>
                </article>
              )}
              {(goals || interests.length > 0) && (
                <article className="nn-card flex h-full flex-col gap-2 p-6" data-reveal>
                  <div className="flex items-center gap-2 text-cyan">
                    <Rocket className="size-5" aria-hidden />
                    <h3 className="font-display text-xl font-semibold text-snow">{t.about.interests}</h3>
                  </div>
                  {goals && <p className="whitespace-pre-line text-sm leading-5 text-mist">{goals}</p>}
                  {interests.length > 0 && (
                    <ul className="mt-1 flex flex-wrap gap-1.5">
                      {interests.map((it) => (
                        <li key={it} className="nn-label rounded-full border border-outline-variant bg-surface-high px-2.5 py-1 text-snow/90">
                          {it}
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
