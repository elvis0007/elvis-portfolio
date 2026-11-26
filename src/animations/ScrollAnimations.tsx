"use client";
import { useEffect } from "react";
import { getGsap } from "./gsap";

/**
 * Animaciones globales vinculadas al scroll:
 *  - [data-reveal]       aparición con desplazamiento
 *  - [data-split]        palabras que emergen de una máscara
 *  - [data-parallax=n]   parallax con scrub (n = intensidad)
 *  - [data-section]      transición de profundidad al entrar en cada sección
 * Con "prefers-reduced-motion" no se ejecuta nada y todo queda visible.
 */
export function ScrollAnimations() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const { gsap, ScrollTrigger } = getGsap();
    document.documentElement.classList.add("js-ready");

    const ctx = gsap.context(() => {
      gsap.set("[data-reveal]", { opacity: 0, y: 28 });
      ScrollTrigger.batch("[data-reveal]", {
        start: "top 90%",
        once: true,
        onEnter: (els) =>
          gsap.to(els, { opacity: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.08, overwrite: true }),
      });

      gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
        if (el.closest("[data-hero]")) return; // el hero tiene su propia secuencia
        gsap.from(el.querySelectorAll(".split-word"), {
          yPercent: 115,
          rotate: 4,
          duration: 1.05,
          ease: "expo.out",
          stagger: 0.06,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const strength = Number(el.dataset.parallax) || 0.2;
        gsap.to(el, {
          yPercent: -strength * 100,
          ease: "none",
          scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-section]").forEach((el) => {
        gsap.fromTo(
          el,
          { "--section-glow": 0 },
          {
            "--section-glow": 1,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top 80%", end: "top 20%", scrub: true },
          },
        );
      });
    });

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    return () => {
      window.removeEventListener("load", refresh);
      ctx.revert();
      document.documentElement.classList.remove("js-ready");
    };
  }, []);

  return null;
}
