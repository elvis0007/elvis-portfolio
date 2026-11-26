import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { BackLink } from "./BackLink";
import { getProjectBySlug, getSiteData } from "@/services/content";
import { ProjectDetail } from "@/components/ProjectDetail";

export const revalidate = 60;

export async function generateStaticParams() {
  const { projects } = await getSiteData();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { project } = await getProjectBySlug(slug);
  if (!project) return { title: "Proyecto no encontrado" };
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { title: project.title, description: project.summary, images: project.cover_url ? [project.cover_url] : undefined },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { project } = await getProjectBySlug(slug);
  if (!project) notFound();
  return (
    <LocaleProvider>
      <main className="min-h-screen bg-ink-2">
        <div className="mx-auto max-w-6xl">
          <BackLink slug={project.slug} />
          <ProjectDetail project={project} standalone />
        </div>
      </main>
    </LocaleProvider>
  );
}
