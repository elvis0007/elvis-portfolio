"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, Code2, ExternalLink, FileText, FolderKanban, GitCommitVertical, LayoutDashboard, LogOut, Mail, Menu, UserRound, X } from "lucide-react";
import { signOut } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Proyectos", icon: FolderKanban },
  { href: "/admin/certificates", label: "Certificados", icon: Award },
  { href: "/admin/technologies", label: "Tecnologías", icon: Code2 },
  { href: "/admin/timeline", label: "Trayectoria", icon: GitCommitVertical },
  { href: "/admin/profile", label: "Perfil y redes", icon: UserRound },
  { href: "/admin/content", label: "Contenido", icon: FileText },
  { href: "/admin/messages", label: "Mensajes", icon: Mail },
];

export function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex h-full flex-col">
      <Link href="/admin" className="mb-8 flex items-center gap-2.5 px-3 font-display font-semibold">
        <span className="grid size-8 place-items-center rounded-lg bg-pink font-mono text-xs font-semibold text-ink">EF</span>
        Panel de control
      </Link>
      <ul className="space-y-1">
        {NAV.map((n) => {
          const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
          return (
            <li key={n.href}>
              <Link
                href={n.href}
                onClick={() => setOpen(false)}
                className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition", active ? "bg-pink/10 text-pink" : "text-mist hover:bg-white/5 hover:text-snow")}
                aria-current={active ? "page" : undefined}
              >
                <n.icon className="size-4" /> {n.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto space-y-2 border-t border-white/[0.06] pt-4">
        <a href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-mist hover:bg-white/5 hover:text-snow">
          <ExternalLink className="size-4" /> Ver portafolio
        </a>
        <p className="truncate px-3 text-xs text-mist/70" title={email}>{email}</p>
        <form action={signOut}>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-mist hover:bg-red-400/10 hover:text-red-200">
            <LogOut className="size-4" /> Cerrar sesión
          </button>
        </form>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-ink lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-white/[0.06] bg-ink-2 p-4 lg:block">{nav}</aside>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/[0.06] bg-ink-2/90 px-4 py-3 backdrop-blur lg:hidden">
        <span className="font-display font-semibold">Panel de control</span>
        <button onClick={() => setOpen(true)} aria-label="Abrir menú" className="grid size-10 place-items-center rounded-lg bg-white/5">
          <Menu className="size-5" />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/70" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-ink-2 p-4">
            <button onClick={() => setOpen(false)} aria-label="Cerrar menú" className="absolute right-3 top-3 grid size-9 place-items-center rounded-lg bg-white/5">
              <X className="size-4" />
            </button>
            {nav}
          </aside>
        </div>
      )}
      <main className="min-w-0 p-5 md:p-10">{children}</main>
    </div>
  );
}
