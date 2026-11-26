"use client";
import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2, ChevronLeft, ChevronRight, Lightbulb, Puzzle, UserRound } from "lucide-react";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { LinkButton } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ProjectCover } from "@/components/ProjectCover";
import { safeUrl } from "@/lib/utils";
import { useI18n } from "@/i18n/LocaleProvider";
import type { Project } from "@/types/content";

const fade = (i: number) => ({ initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0, transition: { delay: 0.1 + i * 0.07, ease: [0.16, 1, 0.3, 1] as const, duration: 0.7 } } });

export function ProjectDetail({ project, standalone = false }: { project: Project; standalone?: boolean }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const { t, tr } = useI18n();
  const P = t.projects;
  const features = tr(project, "features");
  const description = tr(project, "description");
  const repo = safeUrl(project.repo_url);
  const demo = safeUrl(project.demo_url);
  const gallery = project.gallery.map((g) => safeUrl(g)).filter((g): g is string => !!g);
  const blocks = [
    { icon: Puzzle, title: P.problem, text: tr(project, "problem") },
    { icon: Lightbulb, title: P.solution, text: tr(project, "solution") },
    { icon: UserRound, title: P.role, text: tr(project, "role") },
  ].filter((b) => b.text);

  return (
    <article>
      <div className="relative">
        <ProjectCover project={project} className="relative h-[38vh] min-h-64 w-full md:h-[48vh]" sizes="100vw" priority={standalone} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-2 via-ink-2/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
          <motion.p {...fade(0)} className="nn-label text-cyan">
            {P.cat[project.category]} {project.year && `· ${project.year}`}
          </motion.p>
          <motion.h1 {...fade(1)} className="mt-3 text-4xl font-semibold md:text-6xl">
            {project.title}
          </motion.h1>
        </div>
      </div>

      <div className="grid gap-10 p-6 md:grid-cols-[1.4fr_0.6fr] md:p-10">
        <div className="space-y-8">
          <motion.p {...fade(2)} className="text-lg leading-relaxed text-snow/90 md:text-xl">
            {tr(project, "summary")}
          </motion.p>
          {description && (
            <motion.p {...fade(3)} className="whitespace-pre-line leading-relaxed text-mist">
              {description}
            </motion.p>
          )}

          {blocks.map((b, i) => (
            <motion.section key={b.title} {...fade(4 + i)} className="nn-card p-6">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <b.icon className="size-5 text-pink" /> {b.title}
              </h2>
              <p className="whitespace-pre-line leading-relaxed text-snow/85">{b.text}</p>
            </motion.section>
          ))}

          {features.length > 0 && (
            <motion.section {...fade(7)}>
              <h2 className="mb-4 text-lg font-semibold">{P.features}</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {features.map((f) => (
                  <li key={f} className="flex gap-3 rounded-xl border border-outline-variant bg-surface p-4 text-sm">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-cyan" /> {f}
                  </li>
                ))}
              </ul>
            </motion.section>
          )}

          {gallery.length > 0 && (
            <motion.section {...fade(8)}>
              <h2 className="mb-4 text-lg font-semibold">{P.gallery}</h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {gallery.map((src, i) => (
                  <button
                    key={src}
                    onClick={() => setLightbox(i)}
                    className="group relative aspect-video overflow-hidden rounded-xl border border-white/10"
                    aria-label={P.enlarge(i + 1, project.title)}
                  >
                    <Image src={src} alt={P.shot(i + 1, project.title)} fill sizes="(max-width: 768px) 50vw, 300px" className="object-cover transition duration-700 group-hover:scale-110" />
                  </button>
                ))}
              </div>
            </motion.section>
          )}

          {blocks.length === 0 && features.length === 0 && !description && (
            <p className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-mist">{P.pending}</p>
          )}
        </div>

        <motion.aside {...fade(3)} className="space-y-6 md:sticky md:top-6 md:self-start">
          {project.technologies.length > 0 && (
            <div className="nn-card p-5">
              <p className="nn-label mb-3 text-cyan">{P.technologies}</p>
              <ul className="flex flex-wrap gap-2">
                {project.technologies.map((t) => (
                  <li key={t} className="rounded-full border border-pink/20 bg-pink/[0.06] px-3 py-1 text-sm text-pink-soft">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {(repo || demo) && (
            <div className="flex flex-col gap-3">
              {demo && (
                <LinkButton href={demo} external className="w-full">
                  {P.demo} <ArrowUpRight className="size-4" />
                </LinkButton>
              )}
              {repo && (
                <LinkButton href={repo} external variant="outline" className="w-full">
                  <BrandIcon platform="github" className="size-4" /> {P.repo}
                </LinkButton>
              )}
            </div>
          )}
        </motion.aside>
      </div>

      <Modal open={lightbox !== null} onClose={() => setLightbox(null)} title={P.shot(1, project.title)} size="full" hideTitle>
        {lightbox !== null && gallery[lightbox] && (
          <div className="relative aspect-video w-full bg-ink">
            <Image src={gallery[lightbox]} alt={P.shot(lightbox + 1, project.title)} fill sizes="96vw" className="object-contain" />
            {gallery.length > 1 && (
              <>
                <button
                  className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-ink/70 hover:bg-pink hover:text-ink"
                  onClick={() => setLightbox((lightbox - 1 + gallery.length) % gallery.length)}
                  aria-label={P.prev}
                >
                  <ChevronLeft />
                </button>
                <button
                  className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-ink/70 hover:bg-pink hover:text-ink"
                  onClick={() => setLightbox((lightbox + 1) % gallery.length)}
                  aria-label={P.next}
                >
                  <ChevronRight />
                </button>
              </>
            )}
          </div>
        )}
      </Modal>
    </article>
  );
}
