// Tipos de dominio compartidos entre el sitio público, el panel y la capa de datos.

export const TECH_CATEGORIES = ["frontend", "backend", "database", "tools", "design"] as const;
export type TechCategory = (typeof TECH_CATEGORIES)[number];

export const TECH_CATEGORY_LABELS: Record<TechCategory, string> = {
  frontend: "Frontend",
  backend: "Backend",
  database: "Bases de datos",
  tools: "Herramientas",
  design: "Diseño y productividad",
};

export const PROJECT_CATEGORIES = ["frontend", "backend", "fullstack", "mobile", "other"] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export const PROJECT_CATEGORY_LABELS: Record<ProjectCategory, string> = {
  frontend: "Frontend",
  backend: "Backend",
  fullstack: "Full Stack",
  mobile: "Mobile",
  other: "Otros",
};

export const TIMELINE_KINDS = ["education", "experience", "internship", "project", "course"] as const;
export type TimelineKind = (typeof TIMELINE_KINDS)[number];

export const TIMELINE_KIND_LABELS: Record<TimelineKind, string> = {
  education: "Formación académica",
  experience: "Experiencia profesional",
  internship: "Prácticas",
  project: "Proyecto destacado",
  course: "Curso / capacitación",
};

/** Nivel real configurable. null = no definido todavía (no se muestra como dominio). */
export const TECH_LEVELS = [
  { value: 1, label: "Explorando" },
  { value: 2, label: "Básico" },
  { value: 3, label: "Intermedio" },
  { value: 4, label: "Avanzado" },
  { value: 5, label: "Experto" },
] as const;

/** Traducciones del contenido editable. El valor base de cada campo está en inglés. */
export interface I18n {
  es?: Record<string, string | string[]>;
}

export interface Profile {
  id: number;
  full_name: string;
  brand_name: string;
  role: string;
  hero_tagline: string;
  hero_subtitle: string;
  bio: string | null;
  photo_url: string | null;
  cv_url: string | null;
  email: string | null;
  location: string | null;
  education_summary: string | null;
  interests: string[];
  goals: string | null;
  availability: string | null;
  /** Número de WhatsApp con código de país, solo dígitos (p. ej. 593995737456). */
  whatsapp: string | null;
  updated_at?: string;
  i18n?: I18n;
}

export interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  sort_order: number;
  is_visible: boolean;
}

export interface Technology {
  id: string;
  name: string;
  category: TechCategory;
  level: number | null;
  description: string | null;
  usage: string | null;
  icon_url: string | null;
  color: string | null;
  sort_order: number;
  is_active: boolean;
  i18n?: I18n;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string | null;
  category: ProjectCategory;
  cover_url: string | null;
  gallery: string[];
  technologies: string[];
  problem: string | null;
  solution: string | null;
  features: string[];
  role: string | null;
  repo_url: string | null;
  demo_url: string | null;
  year: string | null;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  i18n?: I18n;
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issued_at: string | null;
  expires_at: string | null;
  category: string;
  file_url: string | null;
  file_type: "pdf" | "image" | null;
  preview_url: string | null;
  description: string | null;
  credential_id: string | null;
  verify_url: string | null;
  is_published: boolean;
  sort_order: number;
  i18n?: I18n;
}

export interface TimelineEntry {
  id: string;
  kind: TimelineKind;
  title: string;
  organization: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  sort_order: number;
  is_published: boolean;
  i18n?: I18n;
}

export const SECTION_KEYS = ["about", "stack", "projects", "certifications", "journey", "playground", "contact"] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

export interface SectionContent {
  key: SectionKey;
  eyebrow: string;
  title: string;
  subtitle: string | null;
  is_visible: boolean;
  sort_order: number;
  i18n?: I18n;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface SiteData {
  profile: Profile;
  socials: SocialLink[];
  technologies: Technology[];
  projects: Project[];
  certificates: Certificate[];
  timeline: TimelineEntry[];
  sections: Record<SectionKey, SectionContent>;
  /** true cuando los datos vienen de Supabase; false = contenido inicial local (Supabase sin configurar). */
  live: boolean;
}
