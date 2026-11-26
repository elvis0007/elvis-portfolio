import { getSiteData } from "@/services/content";
import { JsonLd } from "@/components/JsonLd";
import { SiteShell, type NavItem } from "@/components/layout/SiteShell";
import { Hero } from "@/sections/Hero";
import { About } from "@/sections/About";
import { TechStack } from "@/sections/TechStack";
import { Projects } from "@/sections/Projects";
import { Certifications } from "@/sections/Certifications";
import { Journey } from "@/sections/Journey";
import { Contact } from "@/sections/Contact";
import type { SectionKey } from "@/types/content";

// ISR: el contenido se regenera como máximo cada 60 s, y al instante tras cada cambio en /admin.
export const revalidate = 60;

const HOME_SECTIONS = ["about", "stack", "projects", "certifications", "journey", "contact"] as const;

export default async function HomePage() {
  const site = await getSiteData();
  const { sections, profile } = site;
  const order = HOME_SECTIONS.filter((k) => sections[k]?.is_visible !== false).sort(
    (a, b) => (sections[a]?.sort_order ?? 0) - (sections[b]?.sort_order ?? 0),
  );

  const nav: NavItem[] = order.map((k) => ({ href: `#${k}`, key: k }));
  // La sección "playground" del panel controla si el minijuego de BLUE está disponible.
  const gameEnabled = sections.playground?.is_visible !== false;

  const render: Partial<Record<SectionKey, React.ReactNode>> = {
    about: (
      <About
        profile={profile}
        section={sections.about}
        stats={{ projects: site.projects.length, technologies: site.technologies.length, certificates: site.certificates.length }}
      />
    ),
    stack: <TechStack technologies={site.technologies} section={sections.stack} />,
    projects: <Projects projects={site.projects} section={sections.projects} />,
    certifications: <Certifications certificates={site.certificates} section={sections.certifications} />,
    journey: <Journey entries={site.timeline} section={sections.journey} />,
    contact: <Contact profile={profile} socials={site.socials} section={sections.contact} />,
  };

  return (
    <SiteShell name={profile.full_name} sections={["top", ...order]} nav={nav} gameEnabled={gameEnabled}>
      <JsonLd profile={profile} socials={site.socials} />
      <Hero profile={profile} />
      {order.map((k) => (
        <div key={k}>{render[k]}</div>
      ))}
    </SiteShell>
  );
}
