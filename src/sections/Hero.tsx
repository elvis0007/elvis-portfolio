"use client";
import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { ArrowDownRight, Download, MessageCircle } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { getGsap, heroScroll } from "@/animations/gsap";
import { safeUrl } from "@/lib/utils";
import { useI18n } from "@/i18n/LocaleProvider";
import type { Profile } from "@/types/content";

const HeroScene = dynamic(() => import("@/three/HeroScene"), {
  ssr: false,
  loading: () => <HeroFallback />,
});

function HeroFallback() {
  return (
    <div className="absolute inset-0 grid place-items-center md:place-items-end md:pr-[12%]" aria-hidden>
      <div className="size-64 animate-pulse rounded-full bg-[radial-gradient(circle_at_35%_30%,#F8D7E5,#EFA3C2_45%,transparent_70%)] opacity-60 blur-2xl md:size-96" />
    </div>
  );
}

/** Hero 3D: núcleo digital rosa, letras que entran en cascada y salida cinematográfica al hacer scroll. */
export function Hero({ profile }: { profile: Profile }) {
  const root = useRef<HTMLElement>(null);
  const { t, tr, locale } = useI18n();
  const cv = safeUrl(profile.cv_url);
  const letters = profile.brand_name.split("");
  const spaceIdx = letters.indexOf(" ");
  const tagline = tr(profile, "hero_tagline");

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const { gsap, ScrollTrigger } = getGsap();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      // Progreso del scroll dentro del hero → la escena 3D lo lee en cada frame.
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom top",
        onUpdate: (self) => {
          heroScroll.progress = self.progress;
        },
      });
      if (reduce) return;

      // Espera a que termine la pantalla de inicio para lanzar la entrada.
      const tl = gsap.timeline({ defaults: { ease: "expo.out" }, delay: document.documentElement.dataset.booted ? 0.1 : 1.6 });
      tl.from("[data-hero-eyebrow]", { opacity: 0, y: 16, duration: 0.9 })
        .from("[data-hero-letter]", { yPercent: 120, opacity: 0, rotateX: -80, stagger: 0.045, duration: 1.2 }, "-=0.6")
        .from("[data-hero-tagline] .split-word", { yPercent: 120, stagger: 0.06, duration: 1 }, "-=0.9")
        .from("[data-hero-fade]", { opacity: 0, y: 20, stagger: 0.1, duration: 1 }, "-=0.7");

      // Salida cinematográfica del contenido al hacer scroll.
      gsap.to("[data-hero-content]", {
        yPercent: -18,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom 30%", scrub: true },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="top" data-hero className="relative isolate flex min-h-[calc(100svh-4rem)] items-center overflow-hidden">
      {/* Fondo: rejilla, halo rosado y ruido */}
      <div className="grid-bg pointer-events-none absolute inset-0 -z-20" aria-hidden />
      <div
        className="pointer-events-none absolute -z-20 h-[60rem] w-[60rem] rounded-full opacity-40 blur-3xl md:right-[-20rem] md:top-[-10rem]"
        style={{ background: "radial-gradient(circle, rgb(244 182 204 / 0.18), transparent 60%)" }}
        aria-hidden
      />
      <div className="noise pointer-events-none absolute inset-0 -z-10 opacity-[0.04]" aria-hidden />

      <div className="absolute inset-0 -z-10">
        <HeroScene />
      </div>

      <div data-hero-content className="container-x relative pb-28 pt-[34vh] md:pb-24 md:pt-0">
        <p data-hero-eyebrow className="eyebrow mb-6 inline-flex items-center gap-2 rounded-full border border-pink/20 bg-pink/[0.06] px-3.5 py-1.5 backdrop-blur">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-pink opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-pink" />
          </span>
          {tr(profile, "availability") || tr(profile, "role")}
        </p>

        <h1 className="sr-only">
          {profile.full_name}. {tagline}
        </h1>
        <div aria-hidden className="font-display text-[clamp(3.4rem,12vw,9.5rem)] font-bold leading-[0.88] tracking-[-0.05em] [perspective:800px]">
          {letters.map((ch, i) => (
            <span key={i} className="inline-block overflow-hidden pb-[0.06em] align-bottom">
              <span data-hero-letter className={`inline-block ${spaceIdx > -1 && i > spaceIdx ? "text-gradient" : ""}`}>
                {ch === " " ? " " : ch}
              </span>
            </span>
          ))}
        </div>

        {/* key: al cambiar de idioma se vuelven a montar las palabras */}
        <p key={locale} data-hero-tagline aria-hidden className="mt-5 font-display text-2xl font-light text-snow/90 md:text-4xl">
          {tagline.split(" ").map((w, i) => (
            <span key={i} className="inline-block overflow-hidden align-bottom">
              <span className="split-word inline-block">{w}&nbsp;</span>
            </span>
          ))}
        </p>

        <p data-hero-fade className="mt-6 max-w-xl text-base leading-relaxed text-mist md:text-lg">
          {tr(profile, "hero_subtitle")}
        </p>

        <div data-hero-fade className="mt-10 flex flex-wrap items-center gap-3">
          <LinkButton href="#projects" size="lg" data-guide="projects">
            {t.hero.explore} <ArrowDownRight className="size-4" />
          </LinkButton>
          {cv && (
            <LinkButton href={cv} variant="outline" size="lg" external download>
              <Download className="size-4" /> {t.hero.cv}
            </LinkButton>
          )}
          <LinkButton href="#contact" variant="ghost" size="lg" data-guide="contact">
            <MessageCircle className="size-4" /> {t.hero.talk}
          </LinkButton>
        </div>
      </div>

      <a
        href="#about"
        data-hero-fade
        className="group absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.25em] text-mist hover:text-pink"
        aria-label={t.hero.scrollLabel}
      >
        <span className="relative flex h-11 w-6 justify-center rounded-full border border-white/20 group-hover:border-pink/60">
          <span className="mt-2 h-2 w-1 animate-bounce rounded-full bg-pink" />
        </span>
        {t.hero.scroll}
      </a>
    </section>
  );
}
