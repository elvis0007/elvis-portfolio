import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { getServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { AdminShell } from "@/components/admin/AdminShell";
import { signOut } from "../actions";

export const metadata: Metadata = { title: "Panel", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured) redirect("/admin/login?setup=1");
  const supabase = await getServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/admin/login");
  const { data: isAdmin } = await supabase.rpc("is_admin");

  if (!isAdmin) {
    return (
      <main className="grid min-h-screen place-items-center px-6 text-center">
        <div className="glass-strong max-w-md rounded-3xl p-8">
          <ShieldAlert className="mx-auto size-10 text-pink" />
          <h1 className="mt-4 text-2xl font-semibold">Acceso restringido</h1>
          <p className="mt-2 text-sm text-mist">
            La cuenta <span className="text-snow">{data.user.email}</span> no está registrada como administradora. Añádela a la tabla <code className="text-pink">admins</code> en Supabase.
          </p>
          <form action={signOut} className="mt-6">
            <button className="rounded-full bg-pink px-5 py-2.5 text-sm font-medium text-ink">Cerrar sesión</button>
          </form>
        </div>
      </main>
    );
  }

  return <AdminShell email={data.user.email ?? ""}>{children}</AdminShell>;
}
