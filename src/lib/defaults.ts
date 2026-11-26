import type {
  Profile,
  Project,
  SectionContent,
  SectionKey,
  SiteData,
  SocialLink,
  Technology,
  TechCategory,
  TimelineEntry,
} from "@/types/content";

/**
 * Contenido inicial. Es el mismo que inserta `supabase/seed.sql`.
 * Se usa solo como respaldo cuando Supabase aún no está configurado, para que el sitio
 * pueda previsualizarse. Todo es editable desde /admin.
 */

export const defaultProfile: Profile = {
  id: 1,
  full_name: "Elvis Flores",
  brand_name: "ELVIS FLORES",
  role: "Software Engineer",
  hero_tagline: "Building digital experiences.",
  hero_subtitle: "Software engineer passionate about crafting digital experiences, technology solutions and modern applications.",
  bio: "I’m Elvis Flores, a software engineer from Ambato, Ecuador. I build complete web systems — from the interface people use every day to the APIs and databases behind it. I enjoy turning real processes into clear, reliable tools, like the risk-management and requirements platforms in my projects. I care about clean architecture, security and the small details that make software easy to use.",
  photo_url: "/images/elvis-flores.jpg",
  cv_url: null,
  email: null,
  location: "Ambato, Ecuador",
  education_summary: "Software Engineering.\nDegree project: a web application that supports the MEGERIC risk-assessment methodology (SIS-MEGERIC).",
  interests: ["Full-stack web development", "Web security (OWASP)", "Databases", "UI/UX & motion", "Docker & DevOps"],
  goals: "Keep growing as a full-stack engineer and build software that helps local businesses and institutions work better.",
  availability: null,
  whatsapp: "593995737456",
  i18n: {
    es: {
      role: "Ingeniero de Software",
      hero_tagline: "Construyendo experiencias digitales.",
      hero_subtitle: "Ingeniero de Software apasionado por crear experiencias digitales, soluciones tecnológicas y aplicaciones modernas.",
      bio: "Soy Elvis Flores, ingeniero de software de Ambato, Ecuador. Construyo sistemas web completos: desde la interfaz que las personas usan a diario hasta las APIs y bases de datos que la sostienen. Me gusta convertir procesos reales en herramientas claras y confiables, como las plataformas de gestión de riesgos y de requerimientos de mis proyectos. Cuido la arquitectura limpia, la seguridad y los pequeños detalles que hacen que el software sea fácil de usar.",
      education_summary: "Ingeniería de Software.\nProyecto de titulación: aplicación web que apoya la metodología de valoración de riesgos MEGERIC (SIS-MEGERIC).",
      goals: "Seguir creciendo como ingeniero full-stack y crear software que ayude a negocios e instituciones locales a trabajar mejor.",
      interests: ["Desarrollo web full-stack", "Seguridad web (OWASP)", "Bases de datos", "UI/UX y animación", "Docker y DevOps"],
    },
  },
};

export const defaultSocials: SocialLink[] = [
  { id: "s-linkedin", platform: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/elvis-flores-543954417/", sort_order: 1, is_visible: true },
  { id: "s-github", platform: "github", label: "GitHub", url: "https://github.com/elvis0007", sort_order: 2, is_visible: true },
  { id: "s-tiktok", platform: "tiktok", label: "TikTok", url: "https://www.tiktok.com/@elvis_code07", sort_order: 3, is_visible: true },
  { id: "s-instagram", platform: "instagram", label: "Instagram", url: "https://www.instagram.com/elvis_flores07/", sort_order: 4, is_visible: true },
];

type TechSeed = [name: string, category: TechCategory, icon: string | null];
const techSeeds: TechSeed[] = [
  ["HTML5", "frontend", "html5"],
  ["CSS3", "frontend", "css3"],
  ["JavaScript", "frontend", "javascript"],
  ["TypeScript", "frontend", "typescript"],
  ["React", "frontend", "react"],
  ["Angular", "frontend", "angular"],
  ["Next.js", "frontend", "nextjs"],
  ["Tailwind CSS", "frontend", "tailwindcss"],
  ["Flutter", "frontend", "flutter"],
  ["Java", "backend", "java"],
  ["Spring Boot", "backend", "spring"],
  ["Python", "backend", "python"],
  ["Node.js", "backend", "nodejs"],
  ["REST APIs", "backend", null],
  ["Oracle", "database", "oracle"],
  ["PostgreSQL", "database", "postgresql"],
  ["MySQL", "database", "mysql"],
  ["Git", "tools", "git"],
  ["GitHub", "tools", "github"],
  ["VS Code", "tools", "vscode"],
  ["IntelliJ IDEA", "tools", "intellij"],
  ["Postman", "tools", "postman"],
  ["Docker", "tools", "docker"],
  ["Figma", "design", "figma"],
];

const techUsage: Record<string, [en: string, es: string]> = {"HTML5": ["Semantic structure for every page I build: accessible landmarks, forms with proper labels and markup that search engines and screen readers understand.", "Estructura semántica en cada página que construyo: regiones accesibles, formularios con etiquetas correctas y un marcado que entienden buscadores y lectores de pantalla."], "CSS3": ["Layouts with Flexbox and Grid, responsive design from mobile to desktop, custom properties for themes and transitions for micro-interactions.", "Maquetación con Flexbox y Grid, diseño responsive del móvil al escritorio, variables CSS para temas y transiciones para microinteracciones."], "JavaScript": ["The language behind the interactivity: DOM logic, async calls to APIs, form validation and the animations that bring interfaces to life.", "El lenguaje detrás de la interactividad: lógica del DOM, llamadas asíncronas a APIs, validación de formularios y animaciones que dan vida a las interfaces."], "TypeScript": ["My default for front and back end: typed models shared across layers, safer refactors and fewer bugs before the code reaches production.", "Mi opción por defecto en front y back: modelos tipados compartidos entre capas, refactorizaciones más seguras y menos errores antes de llegar a producción."], "React": ["Reusable component libraries, state management with hooks and interactive dashboards. This portfolio itself is built with React.", "Bibliotecas de componentes reutilizables, manejo de estado con hooks y paneles interactivos. Este mismo portafolio está hecho con React."], "Angular": ["Business applications with modules, services and reactive forms — ideal for the institutional systems with many forms and roles that I work on.", "Aplicaciones empresariales con módulos, servicios y formularios reactivos, ideales para los sistemas institucionales con muchos formularios y roles en los que trabajo."], "Next.js": ["Full-stack React with server rendering, the App Router and server actions. I use it for fast, SEO-friendly sites like this portfolio.", "React full-stack con renderizado en servidor, App Router y server actions. Lo uso para sitios rápidos y optimizados para SEO como este portafolio."], "Tailwind CSS": ["Utility-first styling to build consistent design systems quickly, with responsive variants and custom brand tokens.", "Estilos utility-first para construir sistemas de diseño consistentes rápidamente, con variantes responsive y tokens de marca propios."], "Flutter": ["Cross-platform mobile apps from a single codebase, with custom widgets and smooth animations. AppMagicPro is built with Flutter.", "Apps móviles multiplataforma con una sola base de código, widgets personalizados y animaciones fluidas. AppMagicPro está hecho con Flutter."], "Java": ["Object-oriented backend development: domain models, business rules and integration with relational databases.", "Desarrollo backend orientado a objetos: modelos de dominio, reglas de negocio e integración con bases de datos relacionales."], "Spring Boot": ["REST APIs with layered architecture (controllers, services, repositories), JPA, validation and security for institutional systems.", "APIs REST con arquitectura en capas (controladores, servicios, repositorios), JPA, validación y seguridad para sistemas institucionales."], "Python": ["Scripts to automate tasks, process data and prototype ideas quickly — from data cleanup to small simulations.", "Scripts para automatizar tareas, procesar datos y prototipar ideas rápido: desde limpieza de datos hasta pequeñas simulaciones."], "Node.js": ["Backend services with Express: REST endpoints, authentication, real-time features with Socket.io and integrations with PostgreSQL and Redis.", "Servicios backend con Express: endpoints REST, autenticación, funciones en tiempo real con Socket.io e integración con PostgreSQL y Redis."], "REST APIs": ["Designing clear resource-based endpoints with proper status codes, validation, pagination and documentation so front ends can consume them easily.", "Diseño de endpoints claros orientados a recursos, con códigos de estado correctos, validación, paginación y documentación para que el front los consuma fácilmente."], "Oracle": ["Enterprise databases for institutional systems: SQL and PL/SQL queries, views and well-structured relational models.", "Bases de datos empresariales para sistemas institucionales: consultas SQL y PL/SQL, vistas y modelos relacionales bien estructurados."], "PostgreSQL": ["My go-to relational database: normalized schemas, constraints, indexes and row-level security. It powers this portfolio through Supabase.", "Mi base de datos relacional preferida: esquemas normalizados, restricciones, índices y seguridad a nivel de fila. Es la base de este portafolio a través de Supabase."], "MySQL": ["Relational databases for web applications: table design, joins, transactions and query optimization.", "Bases de datos relacionales para aplicaciones web: diseño de tablas, joins, transacciones y optimización de consultas."], "Git": ["Version control in every project: feature branches, meaningful commits, merges and resolving conflicts without losing work.", "Control de versiones en todos mis proyectos: ramas por funcionalidad, commits descriptivos, merges y resolución de conflictos sin perder trabajo."], "GitHub": ["Hosting repositories, pull requests and code reviews, issues for planning and a public showcase of my work.", "Repositorios, pull requests y revisiones de código, issues para planificar y una vitrina pública de mi trabajo."], "VS Code": ["My main editor for web development, with extensions for linting, formatting, debugging and Git.", "Mi editor principal para desarrollo web, con extensiones para linting, formato, depuración y Git."], "IntelliJ IDEA": ["The IDE I use for Java and Spring Boot: smart refactoring, debugging and database tools in one place.", "El IDE que uso para Java y Spring Boot: refactorización inteligente, depuración y herramientas de base de datos en un solo lugar."], "Postman": ["Testing and documenting APIs: collections, environments and automated checks before connecting the front end.", "Pruebas y documentación de APIs: colecciones, entornos y verificaciones automáticas antes de conectar el front."], "Docker": ["Containers for consistent environments: databases, caches and services spun up with Docker Compose for development and deployment.", "Contenedores para entornos consistentes: bases de datos, cachés y servicios levantados con Docker Compose para desarrollo y despliegue."], "Figma": ["Wireframes, prototypes and UI design before writing code, so layouts, colors and flows are clear from the start.", "Wireframes, prototipos y diseño de interfaces antes de programar, para que la estructura, los colores y los flujos estén claros desde el inicio."]};

export const defaultTechnologies: Technology[] = techSeeds.map(([name, category, icon], i) => ({
  id: `t-${i}`,
  name,
  category,
  level: null,
  description: null,
  usage: techUsage[name]?.[0] ?? null,
  icon_url: icon ? `/icons/tech/${icon}.svg` : null,
  color: null,
  sort_order: i + 1,
  is_active: true,
  i18n: techUsage[name] ? { es: { usage: techUsage[name][1] } } : undefined,
}));

const emptyProject = {
  description: null,
  cover_url: null,
  gallery: [],
  problem: null,
  solution: null,
  features: [],
  role: null,
  repo_url: null,
  demo_url: null,
  year: null,
  is_featured: true,
  is_published: true,
} satisfies Partial<Project>;

export const defaultProjects: Project[] = [
  {
    ...emptyProject,
    id: "p-megeric",
    slug: "sis-megeric",
    title: "SIS-MEGERIC",
    summary: "Web application that supports the management and assessment of corruption risks.",
    i18n: { es: { summary: "Aplicación web para apoyar la gestión y valoración de riesgos de corrupción." } },
    category: "fullstack",
    technologies: [],
    sort_order: 1,
  },
  {
    ...emptyProject,
    id: "p-sisci",
    slug: "sisci",
    title: "SISCI",
    summary: "System for managing conflict-of-interest disclosure forms.",
    i18n: { es: { summary: "Sistema para la gestión de formularios de conflicto de intereses." } },
    category: "fullstack",
    technologies: [],
    sort_order: 2,
  },
  {
    ...emptyProject,
    id: "p-sisrec",
    slug: "sisrec",
    title: "SISREC",
    summary: "Requirements management system with related functionality.",
    i18n: { es: { summary: "Sistema de gestión de requerimientos y funcionalidades relacionadas." } },
    category: "fullstack",
    technologies: [],
    sort_order: 3,
  },
  {
    ...emptyProject,
    id: "p-appmagicpro",
    slug: "appmagicpro",
    title: "AppMagicPro",
    summary: "Mobile application project built with Flutter.",
    i18n: { es: { summary: "Proyecto de aplicación móvil desarrollado con Flutter." } },
    category: "mobile",
    technologies: ["Flutter"],
    sort_order: 4,
  },
];

export const defaultTimeline: TimelineEntry[] = [
  {
    id: "tl-1",
    kind: "education",
    title: "Software Engineering",
    i18n: { es: { title: "Ingeniería de Software" } },
    organization: null,
    location: null,
    start_date: null,
    end_date: null,
    is_current: true,
    description: null,
    sort_order: 1,
    is_published: true,
  },
];

const sectionList: SectionContent[] = [
  { key: "about", eyebrow: "01 — About", title: "About Me", subtitle: null, is_visible: true, sort_order: 1, i18n: { es: {"eyebrow": "01 — Sobre mí", "title": "Sobre mí"} } },
  { key: "stack", eyebrow: "02 — Tech Stack", title: "Tech Stack Ecosystem", subtitle: "Click any technology node to inspect how I use it in real projects. Categories and proficiency levels are configurable.", is_visible: true, sort_order: 2, i18n: { es: {"eyebrow": "02 — Tech Stack", "title": "Ecosistema tecnológico", "subtitle": "Haz clic en cualquier tecnología para ver cómo la uso en proyectos reales. Las categorías y los niveles son configurables."} } },
  { key: "projects", eyebrow: "03 — Projects", title: "Featured Projects", subtitle: "Select any project to inspect the problem solved, the architecture and key features.", is_visible: true, sort_order: 3, i18n: { es: {"eyebrow": "03 — Proyectos", "title": "Proyectos destacados", "subtitle": "Selecciona cualquier proyecto para ver el problema que resuelve, su arquitectura y sus funcionalidades."} } },
  { key: "certifications", eyebrow: "04 — Certifications", title: "Certifications Library", subtitle: "Digital vault for verified PDF and image certificates.", is_visible: true, sort_order: 4, i18n: { es: {"eyebrow": "04 — Certificaciones", "title": "Biblioteca de certificaciones", "subtitle": "Bóveda digital de certificados verificados en PDF e imagen."} } },
  { key: "journey", eyebrow: "05 — Journey", title: "Experience & Education", subtitle: "Interactive timeline of academic formation, internships and key technical milestones.", is_visible: true, sort_order: 5, i18n: { es: {"eyebrow": "05 — Trayectoria", "title": "Experiencia y formación", "subtitle": "Línea de tiempo interactiva de formación académica, prácticas e hitos técnicos."} } },
  { key: "playground", eyebrow: "06 — Game", title: "BLUE Arcade", subtitle: "Play BLUE’s Neon Catch right on the page.", is_visible: true, sort_order: 6, i18n: { es: {"eyebrow": "06 — Juego", "title": "Arcade de BLUE", "subtitle": "Juega Neon Catch con BLUE sobre la misma página."} } },
  { key: "contact", eyebrow: "07 — Contact", title: "Let’s Connect", subtitle: "Open to frontend engineering roles, creative developer collaborations and full-stack product builds.", is_visible: true, sort_order: 7, i18n: { es: {"eyebrow": "07 — Contacto", "title": "Conectemos", "subtitle": "Abierto a roles de ingeniería frontend, colaboraciones creativas y desarrollo de productos full stack."} } },
];

export const defaultSections = Object.fromEntries(sectionList.map((s) => [s.key, s])) as Record<SectionKey, SectionContent>;

export const defaultSiteData: SiteData = {
  profile: defaultProfile,
  socials: defaultSocials,
  technologies: defaultTechnologies,
  projects: defaultProjects,
  certificates: [],
  timeline: defaultTimeline,
  sections: defaultSections,
  live: false,
};
