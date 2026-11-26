import "server-only";
import { getServerClient } from "@/lib/supabase/server";

/** Lecturas del panel: usan la sesión del admin, por lo que RLS devuelve también lo no publicado. */
export async function adminList<T>(table: string, order: { column: string; ascending?: boolean }[] = [{ column: "sort_order" }]) {
  const supabase = await getServerClient();
  let q = supabase.from(table).select("*");
  for (const o of order) q = q.order(o.column, { ascending: o.ascending ?? true });
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as T[];
}

export interface AdminStats {
  projects: number;
  projects_published: number;
  certificates: number;
  certificates_published: number;
  technologies: number;
  technologies_active: number;
  categories: number;
  timeline: number;
  messages: number;
  messages_unread: number;
}

export async function adminStats() {
  const supabase = await getServerClient();
  const { data, error } = await supabase.rpc("admin_stats");
  if (error) throw new Error(error.message);
  return data as AdminStats;
}
