"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import {
  RESOURCE_SCHEMAS,
  RESOURCE_TABLES,
  VISIBILITY_FIELD,
  profileSchema,
  sectionSchema,
  type ResourceTable,
} from "@/lib/validation/admin";

export type ActionResult<T = unknown> = { ok: true; data?: T } | { ok: false; error: string; fieldErrors?: Record<string, string> };

/** Verifica sesión + rol admin en el servidor. RLS lo vuelve a imponer en la base de datos. */
async function requireAdmin() {
  if (!isSupabaseConfigured) throw new Error("Supabase no está configurado.");
  const supabase = await getServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Sesión expirada. Vuelve a iniciar sesión.");
  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || !isAdmin) throw new Error("No tienes permisos de administrador.");
  return supabase;
}

function publish() {
  // Refleja los cambios en el sitio público sin redeploy (ISR on-demand).
  revalidatePath("/", "layout");
}

function zodErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    out[key] ??= issue.message;
  }
  return out;
}

function dbError(message: string) {
  if (message.includes("duplicate key")) return "Ya existe un registro con ese valor único (nombre o slug).";
  if (message.includes("row-level security")) return "Operación denegada por las políticas de seguridad.";
  if (message.includes("violates check constraint")) return "Algún valor no cumple las reglas de la base de datos.";
  return "No se pudo guardar. Revisa los datos e inténtalo de nuevo.";
}

const tableSchema = z.enum(RESOURCE_TABLES as [ResourceTable, ...ResourceTable[]]);
const idSchema = z.uuid();

export async function saveRecord(table: ResourceTable, id: string | null, input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const t = tableSchema.parse(table);
    if (id !== null) idSchema.parse(id);
    const parsed = RESOURCE_SCHEMAS[t].safeParse(input);
    if (!parsed.success) return { ok: false, error: "Revisa los campos marcados.", fieldErrors: zodErrors(parsed.error) };

    const supabase = await requireAdmin();
    const row = parsed.data as Record<string, unknown>;
    const query = id
      ? supabase.from(t).update(row).eq("id", id).select("id").single()
      : supabase.from(t).insert(row).select("id").single();
    const { data, error } = await query;
    if (error) {
      console.error(`[admin] save ${t}`, error.message);
      return { ok: false, error: dbError(error.message) };
    }
    publish();
    return { ok: true, data: { id: data.id as string } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error inesperado." };
  }
}

export async function deleteRecord(table: ResourceTable, id: string): Promise<ActionResult> {
  try {
    const t = tableSchema.parse(table);
    idSchema.parse(id);
    const supabase = await requireAdmin();
    const { error } = await supabase.from(t).delete().eq("id", id);
    if (error) return { ok: false, error: dbError(error.message) };
    publish();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error inesperado." };
  }
}

export async function setVisibility(table: ResourceTable, id: string, visible: boolean): Promise<ActionResult> {
  try {
    const t = tableSchema.parse(table);
    idSchema.parse(id);
    z.boolean().parse(visible);
    const supabase = await requireAdmin();
    const { error } = await supabase
      .from(t)
      .update({ [VISIBILITY_FIELD[t]]: visible })
      .eq("id", id);
    if (error) return { ok: false, error: dbError(error.message) };
    publish();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error inesperado." };
  }
}

export async function reorder(table: ResourceTable, ids: string[]): Promise<ActionResult> {
  try {
    const t = tableSchema.parse(table);
    z.array(idSchema).max(500).parse(ids);
    const supabase = await requireAdmin();
    const results = await Promise.all(ids.map((id, i) => supabase.from(t).update({ sort_order: i + 1 }).eq("id", id)));
    const failed = results.find((r) => r.error);
    if (failed?.error) return { ok: false, error: dbError(failed.error.message) };
    publish();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error inesperado." };
  }
}

export async function saveProfile(input: unknown): Promise<ActionResult> {
  try {
    const parsed = profileSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Revisa los campos marcados.", fieldErrors: zodErrors(parsed.error) };
    const supabase = await requireAdmin();
    const { error } = await supabase.from("profile").update(parsed.data).eq("id", 1);
    if (error) return { ok: false, error: dbError(error.message) };
    publish();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error inesperado." };
  }
}

export async function saveSection(input: unknown): Promise<ActionResult> {
  try {
    const parsed = sectionSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Revisa los campos marcados.", fieldErrors: zodErrors(parsed.error) };
    const supabase = await requireAdmin();
    const { key, ...rest } = parsed.data;
    const { error } = await supabase.from("sections").update(rest).eq("key", key);
    if (error) return { ok: false, error: dbError(error.message) };
    publish();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error inesperado." };
  }
}

export async function markMessage(id: string, isRead: boolean): Promise<ActionResult> {
  try {
    idSchema.parse(id);
    const supabase = await requireAdmin();
    const { error } = await supabase.from("contact_messages").update({ is_read: isRead }).eq("id", id);
    if (error) return { ok: false, error: dbError(error.message) };
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error inesperado." };
  }
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  try {
    idSchema.parse(id);
    const supabase = await requireAdmin();
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) return { ok: false, error: dbError(error.message) };
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error inesperado." };
  }
}

/** Elimina archivos de Storage que ya no se usan (solo dentro de los buckets del portafolio). */
export async function removeStorageFiles(urls: string[]): Promise<ActionResult> {
  try {
    z.array(z.string().max(2048)).max(50).parse(urls);
    const supabase = await requireAdmin();
    const byBucket: Record<string, string[]> = {};
    for (const url of urls) {
      const m = url.match(/\/storage\/v1\/object\/public\/(media|documents)\/(.+)$/);
      if (m) (byBucket[m[1]] ??= []).push(decodeURIComponent(m[2]));
    }
    for (const [bucket, paths] of Object.entries(byBucket)) {
      const { error } = await supabase.storage.from(bucket).remove(paths);
      if (error) return { ok: false, error: "No se pudieron eliminar algunos archivos." };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error inesperado." };
  }
}

export async function signOut() {
  const supabase = await getServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
