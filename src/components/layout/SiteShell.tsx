"use client";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import { LocaleProvider, useI18n } from "@/i18n/LocaleProvider";
import { GuideProvider, useGuide } from "@/guide/GuideProvider";
import { CatGuide } from "@/guide/CatGuide";
import { ScrollAnimations } from "@/animations/ScrollAnimations";
import { ScrollProgress } from "@/animations/ScrollProgress";
import type { Dictionary } from "@/i18n/dictionary";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SkipLink } from "./SkipLink";
import { Preloader } from "./Preloader";

// El juego 3D solo se descarga cuando el visitante lo abre.
const BlueArcade = dynamic(() => import("@/components/game/BlueArcade").then((m) => m.BlueArcade), { ssr: false });

export type NavKey = keyof Dictionary["nav"];
export interface NavItem {
  href: string;
  key: NavKey;
}

interface ShellProps {
  name: string;
  page?: string;
  sections: string[];
  nav: NavItem[];
  gameEnabled?: boolean;
  children: React.ReactNode;
}

function Inner({ name, nav, children }: Omit<ShellProps, "page" | "sections" | "gameEnabled">) {
  const { t } = useI18n();
  const g = useGuide();
  const links = nav.map((n) => ({ href: n.href, label: t.nav[n.key] as string }));
  return (
    <>
      <Preloader name={name} />
      <SkipLink />
      <ScrollProgress />
      <ScrollAnimations />
      <Header brand={name} links={links} />
      <main id="main" className="flex flex-col">
        {children}
      </main>
      <Footer name={name} />
      <CatGuide />
      <AnimatePresence>{g.gameOpen && <BlueArcade key="arcade" />}</AnimatePresence>
    </>
  );
}

/** Estructura común de las páginas públicas: idioma, BLUE, cabecera, pie, juego y animaciones. */
export function SiteShell({ page = "home", sections, gameEnabled = true, ...rest }: ShellProps) {
  return (
    <LocaleProvider>
      <GuideProvider page={page} sections={sections} gameEnabled={gameEnabled}>
        <Inner {...rest} />
      </GuideProvider>
    </LocaleProvider>
  );
}
