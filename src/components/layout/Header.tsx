"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Gamepad2, Languages, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/LocaleProvider";
import { useGuide } from "@/guide/GuideProvider";

export interface NavLink {
  href: string;
  label: string;
}

/** Barra superior: marca, navegación, juego de BLUE y EN/ES. */
export function Header({ brand, links }: { brand: string; links: NavLink[] }) {
  const { t, locale, toggle } = useI18n();
  const g = useGuide();
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const ids = links.filter((l) => l.href.startsWith("#")).map((l) => l.href.slice(1));
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [links]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant bg-ink/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2 rounded-md" title={t.nav.home}>
          <span className="size-2.5 rounded-full bg-pink" aria-hidden />
          <span className="font-display text-xl font-semibold tracking-tight text-snow">{brand.toUpperCase()}</span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-6 lg:flex">
          {links.map((l) => {
            const on = active && l.href === `#${active}`;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn("text-sm font-semibold tracking-[0.01em] transition-colors duration-[180ms] hover:text-pink", on ? "text-pink" : "text-mist")}
                aria-current={on ? "true" : undefined}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {g.gameEnabled && (
            <button
              type="button"
              onClick={() => g.setGameOpen(true)}
              data-guide="game"
              className="nn-label inline-flex items-center gap-1.5 rounded-full border border-pink/50 bg-surface px-3.5 py-1.5 text-pink-soft transition-colors duration-[180ms] hover:border-pink hover:bg-pink hover:text-on-pink"
            >
              <Gamepad2 className="size-4" aria-hidden />
              <span className="hidden sm:inline">{t.nav.play}</span>
              <span className="sr-only sm:hidden">{t.nav.play}</span>
            </button>
          )}

          <button
            type="button"
            onClick={toggle}
            data-guide="lang"
            aria-label={t.langLabel}
            className="nn-label inline-flex items-center gap-1 rounded-full border border-outline-variant bg-surface px-3.5 py-1.5 text-snow transition-colors duration-[180ms] hover:border-pink"
          >
            <Languages className="size-4 text-pink" aria-hidden />
            <span className={locale === "en" ? "text-snow" : "text-mist"}>EN</span>
            <span className="text-mist">/</span>
            <span className={locale === "es" ? "text-snow" : "text-mist"}>ES</span>
          </button>

          <button
            className="grid size-10 place-items-center rounded-full border border-outline-variant bg-surface lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="absolute inset-x-4 top-[4.5rem] rounded-2xl border border-outline-variant bg-ink-2 p-3 shadow-2xl lg:hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ul className="grid gap-1">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 font-display text-lg hover:bg-surface">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
