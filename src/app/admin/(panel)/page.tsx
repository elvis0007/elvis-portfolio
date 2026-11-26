import Link from "next/link";
import { ArrowUpRight, Award, Code2, FolderKanban, GitCommitVertical, Layers, Mail } from "lucide-react";
import { adminList, adminStats } from "@/services/admin";
import type { Profile, Project } from "@/types/content";

export default async function Dashboard() {
  const [stats, projects, profileRows] = await Promise.all([
    adminStats(),
    adminList<Project>("projects"),
    adminList<Profile>("profile", [{ column: "id" }]),
  ]);
  const profile = profileRows[0];

  const cards = [
    { label: "Proyectos", value: stats.projects, sub: `${stats.projects_published} publicados`, icon: FolderKanban, href: "/admin/projects" },
    { label: "Certificados", value: stats.certificates, sub: `${stats.certificates_published} publicados`, icon: Award, href: "/admin/certificates" },
    { label: "Tecnologías", value: stats.technologies, sub: `${stats.technologies_active} activas`, icon: Code2, href: "/admin/technologies" },
    { label: "Categorías", value: stats.categories, sub: "proyectos, stack y certificados", icon: Layers, href: "/admin/technologies" },
    { label: "Trayectoria", value: stats.timeline, sub: "entradas en la línea de tiempo", icon: GitCommitVertical, href: "/admin/timeline" },
    { label: "Mensajes", value: stats.messages, sub: `${stats.messages_unread} sin leer`, icon: Mail, href: "/admin/messages" },
  ];

  const checklist = [
    { done: !!profile?.photo_url, label: "Fotografía profesional", href: "/admin/profile" },
    { done: !!profile?.bio, label: "Descripción personal (bio)", href: "/admin/profile" },
    { done: !!profile?.cv_url, label: "CV en PDF", href: "/admin/profile" },
    { done: !!profile?.whatsapp, label: "WhatsApp de contacto", href: "/admin/profile" },
    { done: !!profile?.education_summary, label: "Formación académica", href: "/admin/profile" },
    { done: projects.every((p) => p.cover_url), label: "Portadas de todos los proyectos", href: "/admin/projects" },
    { done: projects.every((p) => p.problem && p.solution && p.role), label: "Problema, solución y participación en proyectos", href: "/admin/projects" },
    { done: stats.certificates > 0, label: "Al menos un certificado", href: "/admin/certificates" },
  ];
  const completed = checklist.filter((c) => c.done).length;

  return (
    <div className="space-y-10">
      <header>
        <p className="eyebrow">Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold md:text-4xl">Hola{profile ? `, ${profile.full_name.split(" ")[0]}` : ""} 👋</h1>
        <p className="mt-1 text-mist">Resumen del contenido de tu portafolio. Los cambios se publican al instante.</p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <li key={c.label}>
            <Link href={c.href} className="glass group flex items-start justify-between rounded-2xl p-5 transition hover:border-pink/30">
              <div>
                <p className="text-sm text-mist">{c.label}</p>
                <p className="mt-2 font-display text-4xl font-semibold">{c.value}</p>
                <p className="mt-1 text-xs text-mist">{c.sub}</p>
              </div>
              <span className="grid size-10 place-items-center rounded-xl bg-pink/10 text-pink transition group-hover:bg-pink group-hover:text-ink">
                <c.icon className="size-5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <section className="glass rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Contenido pendiente</h2>
          <span className="font-mono text-sm text-pink">
            {completed}/{checklist.length}
          </span>
        </div>
        <div className="mb-5 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-pink-accent to-pink-soft" style={{ width: `${(completed / checklist.length) * 100}%` }} />
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {checklist.map((c) => (
            <li key={c.label}>
              <Link href={c.href} className="flex items-center justify-between rounded-xl px-3 py-2 text-sm hover:bg-white/5">
                <span className="flex items-center gap-2.5">
                  <span className={`grid size-5 place-items-center rounded-full text-[0.65rem] ${c.done ? "bg-emerald-300/20 text-emerald-200" : "bg-amber-300/10 text-amber-200"}`}>{c.done ? "✓" : "!"}</span>
                  <span className={c.done ? "text-mist line-through" : ""}>{c.label}</span>
                </span>
                {!c.done && <ArrowUpRight className="size-4 text-mist" />}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
