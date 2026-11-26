"use client";
import { getBrowserClient } from "@/lib/supabase/browser";

/**
 * Identificador aleatorio corto. `crypto.randomUUID` solo existe en contextos seguros
 * (https o localhost): al abrir el panel desde la IP de la red (http://192.168.x.x) no está.
 * `getRandomValues` sí funciona en cualquier contexto.
 */
function randomId() {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export type Bucket = "media" | "documents";

export const UPLOAD_RULES: Record<string, { mime: string[]; ext: string[]; maxMB: number; bucket: Bucket }> = {
  image: { mime: ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "image/svg+xml"], ext: ["jpg", "jpeg", "png", "webp", "avif", "gif", "svg"], maxMB: 5, bucket: "media" },
  document: { mime: ["application/pdf", "image/jpeg", "image/png", "image/webp"], ext: ["pdf", "jpg", "jpeg", "png", "webp"], maxMB: 10, bucket: "documents" },
  pdf: { mime: ["application/pdf"], ext: ["pdf"], maxMB: 10, bucket: "documents" },
};

export type UploadKind = keyof typeof UPLOAD_RULES;

function safeName(name: string) {
  const dot = name.lastIndexOf(".");
  const base = (dot > 0 ? name.slice(0, dot) : name)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50)
    .toLowerCase();
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase() : "";
  return { base: base || "archivo", ext };
}

/** Valida tipo, extensión y tamaño en el cliente (el bucket vuelve a validarlo en el servidor). */
export function validateFile(file: File, kind: UploadKind): string | null {
  const rule = UPLOAD_RULES[kind];
  const { ext } = safeName(file.name);
  if (!rule.mime.includes(file.type) || !rule.ext.includes(ext)) return `Formato no permitido. Usa: ${rule.ext.join(", ")}.`;
  if (file.size > rule.maxMB * 1024 * 1024) return `El archivo supera ${rule.maxMB} MB.`;
  return null;
}

export async function uploadFile(file: File, kind: UploadKind, folder: string): Promise<{ url: string; type: "pdf" | "image" }> {
  const invalid = validateFile(file, kind);
  if (invalid) throw new Error(invalid);
  const rule = UPLOAD_RULES[kind];
  const { base, ext } = safeName(file.name);
  const path = `${folder.replace(/[^a-z0-9-_/]/gi, "")}/${randomId()}-${base}.${ext}`;
  const supabase = getBrowserClient();
  const { error } = await supabase.storage.from(rule.bucket).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(error.message.includes("row-level") ? "Sin permisos para subir archivos." : "No se pudo subir el archivo.");
  const { data } = supabase.storage.from(rule.bucket).getPublicUrl(path);
  return { url: data.publicUrl, type: file.type === "application/pdf" ? "pdf" : "image" };
}
