-- =====================================================================
-- ELVIS FLORES — Actualización (ejecútala UNA vez en Supabase → SQL Editor → Run)
-- Arregla el error "permission denied for table ..." (no deja entrar al admin
-- y la página muestra el contenido de respaldo) y actualiza el contenido.
-- Es seguro ejecutarla varias veces. No borra proyectos, certificados ni mensajes.
-- =====================================================================

-- 1) Permisos de la API (arregla "permission denied for table ...").
--    RLS sigue decidiendo qué filas se ven: el público solo lee lo publicado y solo los admins escriben.
grant usage on schema public to anon, authenticated;
grant select on public.profile, public.social_links, public.technologies, public.projects,
  public.certificates, public.timeline_entries, public.sections to anon, authenticated;
grant insert, update, delete on public.social_links, public.technologies, public.projects,
  public.certificates, public.timeline_entries, public.sections to authenticated;
grant update on public.profile to authenticated;
grant select, update, delete on public.contact_messages to authenticated;
grant select on public.admins to authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.admin_stats() to authenticated;

-- 2) WhatsApp de contacto (solo dígitos, con código de país).
alter table public.profile add column if not exists whatsapp text
  check (whatsapp is null or whatsapp ~ '^[0-9]{8,15}$');
update public.profile set whatsapp = '593995737456' where id = 1 and whatsapp is null;

-- 3) Perfil: rol de Ingeniero de Software y contenido de "Sobre mí" (no pisa lo que ya hayas escrito).
update public.profile set
  role = case when role ilike '%creative technologist%' or role is null then 'Software Engineer' else role end,
  hero_subtitle = case when hero_subtitle ilike 'Software developer passionate%' or hero_subtitle is null then 'Software engineer passionate about crafting digital experiences, technology solutions and modern applications.' else hero_subtitle end,
  bio = coalesce(nullif(bio, ''), 'I’m Elvis Flores, a software engineer from Ambato, Ecuador. I build complete web systems — from the interface people use every day to the APIs and databases behind it. I enjoy turning real processes into clear, reliable tools, like the risk-management and requirements platforms in my projects. I care about clean architecture, security and the small details that make software easy to use.'),
  education_summary = coalesce(nullif(education_summary, ''), 'Software Engineering.
Degree project: a web application that supports the MEGERIC risk-assessment methodology (SIS-MEGERIC).'),
  goals = coalesce(nullif(goals, ''), 'Keep growing as a full-stack engineer and build software that helps local businesses and institutions work better.'),
  location = coalesce(nullif(location, ''), 'Ambato, Ecuador'),
  interests = case when coalesce(array_length(interests, 1), 0) = 0 then array['Full-stack web development', 'Web security (OWASP)', 'Databases', 'UI/UX & motion', 'Docker & DevOps']::text[] else interests end,
  i18n = jsonb_set(coalesce(i18n, '{}'::jsonb), '{es}',
    jsonb_build_object('hero_subtitle', 'Ingeniero de Software apasionado por crear experiencias digitales, soluciones tecnológicas y aplicaciones modernas.', 'bio', 'Soy Elvis Flores, ingeniero de software de Ambato, Ecuador. Construyo sistemas web completos: desde la interfaz que las personas usan a diario hasta las APIs y bases de datos que la sostienen. Me gusta convertir procesos reales en herramientas claras y confiables, como las plataformas de gestión de riesgos y de requerimientos de mis proyectos. Cuido la arquitectura limpia, la seguridad y los pequeños detalles que hacen que el software sea fácil de usar.', 'education_summary', 'Ingeniería de Software.
Proyecto de titulación: aplicación web que apoya la metodología de valoración de riesgos MEGERIC (SIS-MEGERIC).', 'goals', 'Seguir creciendo como ingeniero full-stack y crear software que ayude a negocios e instituciones locales a trabajar mejor.', 'interests', to_jsonb(array['Desarrollo web full-stack', 'Seguridad web (OWASP)', 'Bases de datos', 'UI/UX y animación', 'Docker y DevOps']::text[]))
    || (coalesce(i18n->'es', '{}'::jsonb) - 'role' - 'hero_subtitle')
    || jsonb_build_object('role', 'Ingeniero de Software', 'hero_subtitle', 'Ingeniero de Software apasionado por crear experiencias digitales, soluciones tecnológicas y aplicaciones modernas.'))
where id = 1;

-- 4) Descripción de uso de cada tecnología (solo si aún está vacía).
update public.technologies t
set usage = v.en,
    i18n = jsonb_set(coalesce(t.i18n, '{}'::jsonb), '{es}', coalesce(t.i18n->'es', '{}'::jsonb) || jsonb_build_object('usage', v.es))
from (values
  ('HTML5', 'Semantic structure for every page I build: accessible landmarks, forms with proper labels and markup that search engines and screen readers understand.', 'Estructura semántica en cada página que construyo: regiones accesibles, formularios con etiquetas correctas y un marcado que entienden buscadores y lectores de pantalla.'),
  ('CSS3', 'Layouts with Flexbox and Grid, responsive design from mobile to desktop, custom properties for themes and transitions for micro-interactions.', 'Maquetación con Flexbox y Grid, diseño responsive del móvil al escritorio, variables CSS para temas y transiciones para microinteracciones.'),
  ('JavaScript', 'The language behind the interactivity: DOM logic, async calls to APIs, form validation and the animations that bring interfaces to life.', 'El lenguaje detrás de la interactividad: lógica del DOM, llamadas asíncronas a APIs, validación de formularios y animaciones que dan vida a las interfaces.'),
  ('TypeScript', 'My default for front and back end: typed models shared across layers, safer refactors and fewer bugs before the code reaches production.', 'Mi opción por defecto en front y back: modelos tipados compartidos entre capas, refactorizaciones más seguras y menos errores antes de llegar a producción.'),
  ('React', 'Reusable component libraries, state management with hooks and interactive dashboards. This portfolio itself is built with React.', 'Bibliotecas de componentes reutilizables, manejo de estado con hooks y paneles interactivos. Este mismo portafolio está hecho con React.'),
  ('Angular', 'Business applications with modules, services and reactive forms — ideal for the institutional systems with many forms and roles that I work on.', 'Aplicaciones empresariales con módulos, servicios y formularios reactivos, ideales para los sistemas institucionales con muchos formularios y roles en los que trabajo.'),
  ('Next.js', 'Full-stack React with server rendering, the App Router and server actions. I use it for fast, SEO-friendly sites like this portfolio.', 'React full-stack con renderizado en servidor, App Router y server actions. Lo uso para sitios rápidos y optimizados para SEO como este portafolio.'),
  ('Tailwind CSS', 'Utility-first styling to build consistent design systems quickly, with responsive variants and custom brand tokens.', 'Estilos utility-first para construir sistemas de diseño consistentes rápidamente, con variantes responsive y tokens de marca propios.'),
  ('Flutter', 'Cross-platform mobile apps from a single codebase, with custom widgets and smooth animations. AppMagicPro is built with Flutter.', 'Apps móviles multiplataforma con una sola base de código, widgets personalizados y animaciones fluidas. AppMagicPro está hecho con Flutter.'),
  ('Java', 'Object-oriented backend development: domain models, business rules and integration with relational databases.', 'Desarrollo backend orientado a objetos: modelos de dominio, reglas de negocio e integración con bases de datos relacionales.'),
  ('Spring Boot', 'REST APIs with layered architecture (controllers, services, repositories), JPA, validation and security for institutional systems.', 'APIs REST con arquitectura en capas (controladores, servicios, repositorios), JPA, validación y seguridad para sistemas institucionales.'),
  ('Python', 'Scripts to automate tasks, process data and prototype ideas quickly — from data cleanup to small simulations.', 'Scripts para automatizar tareas, procesar datos y prototipar ideas rápido: desde limpieza de datos hasta pequeñas simulaciones.'),
  ('Node.js', 'Backend services with Express: REST endpoints, authentication, real-time features with Socket.io and integrations with PostgreSQL and Redis.', 'Servicios backend con Express: endpoints REST, autenticación, funciones en tiempo real con Socket.io e integración con PostgreSQL y Redis.'),
  ('REST APIs', 'Designing clear resource-based endpoints with proper status codes, validation, pagination and documentation so front ends can consume them easily.', 'Diseño de endpoints claros orientados a recursos, con códigos de estado correctos, validación, paginación y documentación para que el front los consuma fácilmente.'),
  ('Oracle', 'Enterprise databases for institutional systems: SQL and PL/SQL queries, views and well-structured relational models.', 'Bases de datos empresariales para sistemas institucionales: consultas SQL y PL/SQL, vistas y modelos relacionales bien estructurados.'),
  ('PostgreSQL', 'My go-to relational database: normalized schemas, constraints, indexes and row-level security. It powers this portfolio through Supabase.', 'Mi base de datos relacional preferida: esquemas normalizados, restricciones, índices y seguridad a nivel de fila. Es la base de este portafolio a través de Supabase.'),
  ('MySQL', 'Relational databases for web applications: table design, joins, transactions and query optimization.', 'Bases de datos relacionales para aplicaciones web: diseño de tablas, joins, transacciones y optimización de consultas.'),
  ('Git', 'Version control in every project: feature branches, meaningful commits, merges and resolving conflicts without losing work.', 'Control de versiones en todos mis proyectos: ramas por funcionalidad, commits descriptivos, merges y resolución de conflictos sin perder trabajo.'),
  ('GitHub', 'Hosting repositories, pull requests and code reviews, issues for planning and a public showcase of my work.', 'Repositorios, pull requests y revisiones de código, issues para planificar y una vitrina pública de mi trabajo.'),
  ('VS Code', 'My main editor for web development, with extensions for linting, formatting, debugging and Git.', 'Mi editor principal para desarrollo web, con extensiones para linting, formato, depuración y Git.'),
  ('IntelliJ IDEA', 'The IDE I use for Java and Spring Boot: smart refactoring, debugging and database tools in one place.', 'El IDE que uso para Java y Spring Boot: refactorización inteligente, depuración y herramientas de base de datos en un solo lugar.'),
  ('Postman', 'Testing and documenting APIs: collections, environments and automated checks before connecting the front end.', 'Pruebas y documentación de APIs: colecciones, entornos y verificaciones automáticas antes de conectar el front.'),
  ('Docker', 'Containers for consistent environments: databases, caches and services spun up with Docker Compose for development and deployment.', 'Contenedores para entornos consistentes: bases de datos, cachés y servicios levantados con Docker Compose para desarrollo y despliegue.'),
  ('Figma', 'Wireframes, prototypes and UI design before writing code, so layouts, colors and flows are clear from the start.', 'Wireframes, prototipos y diseño de interfaces antes de programar, para que la estructura, los colores y los flujos estén claros desde el inicio.')
) as v(name, en, es)
where t.name = v.name and (t.usage is null or t.usage = '');

-- Herramientas retiradas del portafolio.
delete from public.technologies where name in ('AI tools', 'Adobe tools', 'GitLab');

-- 5) Sección del minijuego (sin la palabra "3D").
update public.sections set title = 'BLUE Arcade', subtitle = 'Play BLUE’s Neon Catch right on the page.',
  i18n = '{"es": {"eyebrow": "06 — Juego", "title": "Arcade de BLUE", "subtitle": "Juega Neon Catch con BLUE sobre la misma página."}}', eyebrow = '06 — Game'
where key = 'playground' and title ilike '%3D%';

-- 6) Comprobación: las tres columnas deben decir "true".
select has_table_privilege('anon', 'public.profile', 'select') as publico_lee_perfil,
       has_table_privilege('authenticated', 'public.projects', 'insert') as admin_puede_escribir,
       (select count(*) from public.admins) > 0 as hay_admin;
