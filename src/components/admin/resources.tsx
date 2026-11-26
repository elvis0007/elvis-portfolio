"use client";
import { ResourceManager, type ResourceConfig } from "./ResourceManager";
import type { Values } from "./fields";
import {
  PROJECT_CATEGORIES,
  PROJECT_CATEGORY_LABELS,
  TECH_CATEGORIES,
  TECH_CATEGORY_LABELS,
  TECH_LEVELS,
  TIMELINE_KINDS,
  TIMELINE_KIND_LABELS,
} from "@/types/content";
import { formatDate } from "@/lib/utils";
import { SUPPORTED_PLATFORMS } from "@/components/ui/BrandIcon";

const CONFIGS = {
  projects: {
    table: "projects",
    singular: "Proyecto",
    plural: "Proyectos",
    visibilityField: "is_published",
    titleField: "title",
    imageField: "cover_url",
    slugFrom: "title",
    searchFields: ["title", "summary", "category"],
    subtitle: (r) => `${PROJECT_CATEGORY_LABELS[r.category as keyof typeof PROJECT_CATEGORY_LABELS] ?? ""} · /${r.slug}`,
    defaults: { category: "fullstack", gallery: [], technologies: [], features: [], is_published: false, is_featured: false },
    fields: [
      { name: "title", label: "Nombre", type: "text", required: true, maxLength: 120 },
      { name: "slug", label: "Slug (URL)", type: "text", required: true, help: "Se genera desde el nombre.", maxLength: 80 },
      { name: "category", label: "Categoría", type: "select", options: PROJECT_CATEGORIES.map((c) => ({ value: c, label: PROJECT_CATEGORY_LABELS[c] })) },
      { name: "year", label: "Año / periodo", type: "text", maxLength: 20 },
      { name: "summary", label: "Descripción corta", type: "textarea", span: 2, rows: 2, maxLength: 400, pending: true, translatable: true },
      { name: "description", label: "Descripción detallada", type: "textarea", span: 2, rows: 5, pending: true, translatable: true },
      { name: "cover_url", label: "Imagen de portada", type: "image", span: 2, folder: "projects", pending: true },
      { name: "gallery", label: "Galería de capturas", type: "gallery", span: 2, folder: "projects/gallery", pending: true },
      { name: "technologies", label: "Tecnologías utilizadas", type: "tags", span: 2, placeholder: "React, Spring Boot…", pending: true },
      { name: "problem", label: "Problema que resuelve", type: "textarea", span: 2, pending: true, translatable: true },
      { name: "solution", label: "Solución implementada", type: "textarea", span: 2, pending: true, translatable: true },
      { name: "features", label: "Funcionalidades principales", type: "lines", span: 2, placeholder: "Una funcionalidad por línea", pending: true, translatable: true },
      { name: "role", label: "Mi participación", type: "textarea", span: 2, pending: true, translatable: true },
      { name: "repo_url", label: "Repositorio GitHub", type: "url", placeholder: "https://github.com/…", pending: true },
      { name: "demo_url", label: "Demostración", type: "url", placeholder: "https://…" },
      { name: "is_featured", label: "Destacado", type: "checkbox" },
      { name: "is_published", label: "Publicado", type: "checkbox", help: "Visible en el sitio público" },
    ],
  },
  certificates: {
    table: "certificates",
    singular: "Certificado",
    plural: "Certificados",
    visibilityField: "is_published",
    titleField: "title",
    imageField: "preview_url",
    searchFields: ["title", "issuer", "category"],
    subtitle: (r) => [r.issuer, r.category, formatDate(r.issued_at as string | null)].filter(Boolean).join(" · "),
    defaults: { category: "General", is_published: true, file_type: null },
    fields: [
      { name: "title", label: "Nombre del certificado", type: "text", required: true, span: 2, maxLength: 200, translatable: true },
      { name: "issuer", label: "Institución emisora", type: "text", required: true, maxLength: 160 },
      { name: "category", label: "Categoría", type: "text", required: true, maxLength: 60, placeholder: "Desarrollo web, Cloud…", translatable: true },
      { name: "issued_at", label: "Fecha de obtención", type: "date" },
      { name: "expires_at", label: "Fecha de expiración", type: "date", help: "Solo si corresponde" },
      { name: "file_url", label: "Archivo original (PDF o imagen)", type: "file", uploadKind: "document", typeField: "file_type", folder: "certificates", span: 2, pending: true, help: "PDF ≤ 10 MB, imagen ≤ 10 MB" },
      { name: "preview_url", label: "Miniatura (opcional para PDFs)", type: "image", folder: "certificates/previews", span: 2 },
      { name: "description", label: "Descripción", type: "textarea", span: 2, translatable: true },
      { name: "credential_id", label: "ID de credencial", type: "text", maxLength: 200 },
      { name: "verify_url", label: "Enlace de verificación", type: "url" },
      { name: "is_published", label: "Publicado", type: "checkbox", span: 2 },
    ],
  },
  technologies: {
    table: "technologies",
    singular: "Tecnología",
    plural: "Tecnologías",
    visibilityField: "is_active",
    titleField: "name",
    imageField: "icon_url",
    searchFields: ["name", "category"],
    subtitle: (r) =>
      `${TECH_CATEGORY_LABELS[r.category as keyof typeof TECH_CATEGORY_LABELS] ?? ""} · ${TECH_LEVELS.find((l) => l.value === r.level)?.label ?? "nivel sin definir"}`,
    defaults: { category: "frontend", level: "", is_active: true },
    fields: [
      { name: "name", label: "Nombre", type: "text", required: true, maxLength: 60, translatable: true },
      { name: "category", label: "Categoría", type: "select", options: TECH_CATEGORIES.map((c) => ({ value: c, label: TECH_CATEGORY_LABELS[c] })) },
      {
        name: "level",
        label: "Nivel real de conocimiento",
        type: "select",
        pending: true,
        options: [{ value: "", label: "Sin definir (no se muestra)" }, ...TECH_LEVELS.map((l) => ({ value: l.value, label: `${l.value} · ${l.label}` }))],
      },
      { name: "color", label: "Color de acento (opcional)", type: "color" },
      { name: "icon_url", label: "Icono", type: "image", folder: "icons", span: 2, help: "Los iconos oficiales iniciales están en /icons/tech/. Puedes subir uno propio (SVG/PNG)." },
      { name: "description", label: "Descripción", type: "textarea", span: 2, rows: 3, pending: true, translatable: true },
      { name: "usage", label: "Cómo la utilizo", type: "textarea", span: 2, rows: 4, pending: true, translatable: true },
      { name: "is_active", label: "Activa", type: "checkbox", help: "Visible en el ecosistema", span: 2 },
    ],
  },
  timeline_entries: {
    table: "timeline_entries",
    singular: "Entrada",
    plural: "Trayectoria",
    visibilityField: "is_published",
    titleField: "title",
    searchFields: ["title", "organization"],
    subtitle: (r) => [TIMELINE_KIND_LABELS[r.kind as keyof typeof TIMELINE_KIND_LABELS], r.organization, r.is_current ? "En curso" : formatDate(r.end_date as string | null)].filter(Boolean).join(" · "),
    defaults: { kind: "education", is_current: false, is_published: true },
    fields: [
      { name: "kind", label: "Tipo", type: "select", options: TIMELINE_KINDS.map((k) => ({ value: k, label: TIMELINE_KIND_LABELS[k] })) },
      { name: "title", label: "Título / cargo", type: "text", required: true, maxLength: 160, translatable: true },
      { name: "organization", label: "Institución / empresa", type: "text", pending: true, maxLength: 160 },
      { name: "location", label: "Ubicación", type: "text", maxLength: 120 },
      { name: "start_date", label: "Inicio", type: "date", pending: true },
      { name: "end_date", label: "Fin", type: "date" },
      { name: "is_current", label: "En curso actualmente", type: "checkbox", span: 2 },
      { name: "description", label: "Descripción", type: "textarea", span: 2, rows: 5, pending: true, translatable: true },
      { name: "is_published", label: "Publicado", type: "checkbox", span: 2 },
    ],
  },
  social_links: {
    table: "social_links",
    singular: "Red social",
    plural: "Redes sociales",
    visibilityField: "is_visible",
    titleField: "label",
    subtitle: (r) => String(r.url ?? ""),
    defaults: { platform: "web", is_visible: true },
    fields: [
      { name: "platform", label: "Plataforma (icono)", type: "select", options: SUPPORTED_PLATFORMS.map((p) => ({ value: p, label: p })) },
      { name: "label", label: "Etiqueta", type: "text", required: true, maxLength: 60 },
      { name: "url", label: "URL", type: "url", required: true, span: 2 },
      { name: "is_visible", label: "Visible", type: "checkbox", span: 2 },
    ],
  },
} satisfies Record<string, ResourceConfig>;

export type ResourceKey = keyof typeof CONFIGS;

export function AdminResource({ resource, rows }: { resource: ResourceKey; rows: (Values & { id: string })[] }) {
  return <ResourceManager config={CONFIGS[resource] as ResourceConfig} rows={rows} />;
}
