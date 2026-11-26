import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";
import { getSiteData } from "@/services/content";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects } = await getSiteData();
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    ...projects.map((p) => ({ url: `${SITE_URL}/projects/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
