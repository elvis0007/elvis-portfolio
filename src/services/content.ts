import "server-only";
import { getPublicClient } from "@/lib/supabase/public";
import { defaultSiteData, defaultSections } from "@/lib/defaults";
import type { Certificate, Profile, Project, SectionContent, SectionKey, SiteData, SocialLink, Technology, TimelineEntry } from "@/types/content";

/**
 * Lee todo el contenido público del portafolio.
 * Con Supabase configurado, RLS garantiza que solo lleguen registros publicados.
 * Sin Supabase, devuelve el contenido inicial para poder previsualizar el sitio.
 */
export async function getSiteData(): Promise<SiteData> {
  const supabase = getPublicClient();
  if (!supabase) return defaultSiteData;

  const [profile, socials, technologies, projects, certificates, timeline, sections] = await Promise.all([
    supabase.from("profile").select("*").eq("id", 1).maybeSingle<Profile>(),
    supabase.from("social_links").select("*").eq("is_visible", true).order("sort_order"),
    supabase.from("technologies").select("*").eq("is_active", true).order("sort_order"),
    supabase.from("projects").select("*").eq("is_published", true).order("sort_order"),
    supabase.from("certificates").select("*").eq("is_published", true).order("sort_order").order("issued_at", { ascending: false }),
    supabase.from("timeline_entries").select("*").eq("is_published", true).order("sort_order"),
    supabase.from("sections").select("*").order("sort_order"),
  ]);

  const firstError = [profile, socials, technologies, projects, certificates, timeline, sections].find((r) => r.error)?.error;
  if (firstError) {
    console.error("[content] Supabase error:", firstError.message);
    // No rompemos el sitio público: devolvemos el respaldo y lo registramos.
    return defaultSiteData;
  }

  const sectionMap = { ...defaultSections };
  for (const s of (sections.data ?? []) as SectionContent[]) sectionMap[s.key as SectionKey] = s;

  return {
    profile: profile.data ?? defaultSiteData.profile,
    socials: (socials.data ?? []) as SocialLink[],
    technologies: (technologies.data ?? []) as Technology[],
    projects: (projects.data ?? []) as Project[],
    certificates: (certificates.data ?? []) as Certificate[],
    timeline: (timeline.data ?? []) as TimelineEntry[],
    sections: sectionMap,
    live: true,
  };
}

export async function getProjectBySlug(slug: string): Promise<{ project: Project | null; site: SiteData }> {
  const site = await getSiteData();
  return { project: site.projects.find((p) => p.slug === slug) ?? null, site };
}
