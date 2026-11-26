import { z } from "zod";
import { PROJECT_CATEGORIES, SECTION_KEYS, TECH_CATEGORIES, TIMELINE_KINDS } from "@/types/content";

/* Utilidades: normalizan entradas de formularios (cadenas vacías → null, recorte, límites). */

const optText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres.`)
    .nullish()
    .transform((v) => (v ? v : null));

const reqText = (max: number, label = "Este campo") => z.string().trim().min(1, `${label} es obligatorio.`).max(max, `Máximo ${max} caracteres.`);

const httpUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((v) => /^https?:\/\/[^\s]+$/i.test(v), "Debe ser una URL http(s) válida.");

/** URL externa o ruta local (/icons/...), o vacío. */
const optUrlOrPath = z
  .string()
  .trim()
  .max(2048)
  .nullish()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || /^https?:\/\/[^\s]+$/i.test(v) || /^\/[\w\-./]+$/.test(v), "URL o ruta no válida.");

const optHttpUrl = z
  .string()
  .trim()
  .max(2048)
  .nullish()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || /^https?:\/\/[^\s]+$/i.test(v), "Debe ser una URL http(s) válida.");

const stringList = (maxItems: number, maxLen: number) =>
  z
    .array(z.string().trim().max(maxLen))
    .max(maxItems)
    .default([])
    .transform((arr) => [...new Set(arr.filter(Boolean))]);

const optDate = z
  .string()
  .trim()
  .nullish()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || /^\d{4}-\d{2}-\d{2}$/.test(v), "Fecha no válida.");

const sortOrder = z.coerce.number().int().min(0).max(9999).default(0);

/** Traducciones al español: { es: { campo: texto | lista } }. Se eliminan valores vacíos. */
const i18nSchema = z
  .object({
    es: z
      .record(
        z.string().regex(/^[a-z_]{1,40}$/),
        z.union([z.string().trim().max(6000), z.array(z.string().trim().max(300)).max(30)]),
      )
      .optional(),
  })
  .nullish()
  .transform((v) => {
    const es = Object.fromEntries(
      Object.entries(v?.es ?? {})
        .map(([k, val]) => [k, Array.isArray(val) ? val.filter(Boolean) : val] as const)
        .filter(([, val]) => (Array.isArray(val) ? val.length > 0 : val !== "")),
    );
    return Object.keys(es).length ? { es } : {};
  });

export const projectSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "El slug es obligatorio.")
    .max(80)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Solo minúsculas, números y guiones."),
  title: reqText(120, "El nombre"),
  summary: z.string().trim().max(400).default(""),
  description: optText(6000),
  category: z.enum(PROJECT_CATEGORIES),
  cover_url: optUrlOrPath,
  gallery: z.array(httpUrl).max(20).default([]),
  technologies: stringList(30, 60),
  problem: optText(3000),
  solution: optText(3000),
  features: stringList(30, 200),
  role: optText(2000),
  repo_url: optHttpUrl,
  demo_url: optHttpUrl,
  year: optText(20),
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(false),
  sort_order: sortOrder,
  i18n: i18nSchema,
});

export const certificateSchema = z
  .object({
    title: reqText(200, "El nombre"),
    issuer: reqText(160, "La institución"),
    issued_at: optDate,
    expires_at: optDate,
    category: reqText(60, "La categoría"),
    file_url: optHttpUrl,
    file_type: z.enum(["pdf", "image"]).nullish().transform((v) => v ?? null),
    preview_url: optHttpUrl,
    description: optText(2000),
    credential_id: optText(200),
    verify_url: optHttpUrl,
    is_published: z.boolean().default(false),
    sort_order: sortOrder,
    i18n: i18nSchema,
  })
  .refine((c) => !c.expires_at || !c.issued_at || c.expires_at >= c.issued_at, {
    message: "La expiración debe ser posterior a la obtención.",
    path: ["expires_at"],
  });

export const technologySchema = z.object({
  name: reqText(60, "El nombre"),
  category: z.enum(TECH_CATEGORIES),
  level: z
    .union([z.coerce.number().int().min(1).max(5), z.literal(""), z.null()])
    .optional()
    .transform((v) => (typeof v === "number" ? v : null)),
  description: optText(600),
  usage: optText(1200),
  icon_url: optUrlOrPath,
  color: z
    .string()
    .trim()
    .nullish()
    .transform((v) => (v ? v : null))
    .refine((v) => v === null || /^#[0-9a-f]{6}$/i.test(v), "Color hexadecimal no válido."),
  is_active: z.boolean().default(true),
  sort_order: sortOrder,
  i18n: i18nSchema,
});

export const timelineSchema = z
  .object({
    kind: z.enum(TIMELINE_KINDS),
    title: reqText(160, "El título"),
    organization: optText(160),
    location: optText(120),
    start_date: optDate,
    end_date: optDate,
    is_current: z.boolean().default(false),
    description: optText(3000),
    is_published: z.boolean().default(true),
    sort_order: sortOrder,
    i18n: i18nSchema,
  })
  .refine((t) => !t.end_date || !t.start_date || t.end_date >= t.start_date, {
    message: "La fecha de fin debe ser posterior al inicio.",
    path: ["end_date"],
  });

export const socialSchema = z.object({
  platform: reqText(40, "La plataforma").transform((v) => v.toLowerCase()),
  label: reqText(60, "La etiqueta"),
  url: httpUrl,
  is_visible: z.boolean().default(true),
  sort_order: sortOrder,
});

export const profileSchema = z.object({
  full_name: reqText(120, "El nombre"),
  brand_name: reqText(60, "La marca"),
  role: z.string().trim().max(160).default(""),
  hero_tagline: z.string().trim().max(160).default(""),
  hero_subtitle: z.string().trim().max(400).default(""),
  bio: optText(4000),
  photo_url: optUrlOrPath,
  cv_url: optHttpUrl,
  email: z
    .string()
    .trim()
    .nullish()
    .transform((v) => (v ? v.toLowerCase() : null))
    .refine((v) => v === null || z.email().safeParse(v).success, "Correo no válido."),
  location: optText(120),
  education_summary: optText(2000),
  interests: stringList(20, 60),
  goals: optText(2000),
  availability: optText(160),
  whatsapp: z
    .string()
    .nullish()
    .transform((v) => (v ? v.replace(/[^0-9]/g, "") : null))
    .refine((v) => v === null || /^[0-9]{8,15}$/.test(v), "WhatsApp: escribe el número con código de país (8 a 15 dígitos)."),
  i18n: i18nSchema,
});

export const sectionSchema = z.object({
  key: z.enum(SECTION_KEYS),
  eyebrow: z.string().trim().max(60).default(""),
  title: reqText(120, "El título"),
  subtitle: optText(400),
  is_visible: z.boolean().default(true),
  sort_order: sortOrder,
  i18n: i18nSchema,
});

export const RESOURCE_SCHEMAS = {
  projects: projectSchema,
  certificates: certificateSchema,
  technologies: technologySchema,
  timeline_entries: timelineSchema,
  social_links: socialSchema,
} as const;

export type ResourceTable = keyof typeof RESOURCE_SCHEMAS;
export const RESOURCE_TABLES = Object.keys(RESOURCE_SCHEMAS) as ResourceTable[];

/** Campo booleano que controla la visibilidad pública de cada tabla. */
export const VISIBILITY_FIELD: Record<ResourceTable, string> = {
  projects: "is_published",
  certificates: "is_published",
  technologies: "is_active",
  timeline_entries: "is_published",
  social_links: "is_visible",
};
