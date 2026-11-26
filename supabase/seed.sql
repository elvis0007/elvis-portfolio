-- =====================================================================
-- ELVIS FLORES — Contenido inicial (editable desde /admin)
-- Ejecutar DESPUÉS de schema.sql. No sobrescribe datos existentes.
-- Idioma principal: inglés. Las traducciones al español van en la columna i18n.
-- Los campos sin información quedan en NULL (se marcan "pendiente" en el panel).
-- =====================================================================

insert into public.profile (id, full_name, brand_name, role, hero_tagline, hero_subtitle, photo_url, whatsapp, i18n)
values (1, 'Elvis Flores', 'ELVIS FLORES', 'Software Engineer',
        'Building digital experiences.',
        'Software developer passionate about crafting digital experiences, technology solutions and modern applications.',
        '/images/elvis-flores.jpg',
        '593995737456',
        jsonb_build_object('es', jsonb_build_object(
          'role', 'Ingeniero de Software',
          'hero_tagline', 'Construyendo experiencias digitales.',
          'hero_subtitle', 'Desarrollador de Software apasionado por crear experiencias digitales, soluciones tecnológicas y aplicaciones modernas.')))
on conflict (id) do nothing;

insert into public.social_links (platform, label, url, sort_order)
select * from (values
  ('linkedin',  'LinkedIn',  'https://www.linkedin.com/in/elvis-flores-543954417/', 1),
  ('github',    'GitHub',    'https://github.com/elvis0007', 2),
  ('tiktok',    'TikTok',    'https://www.tiktok.com/@elvis_code07', 3),
  ('instagram', 'Instagram', 'https://www.instagram.com/elvis_flores07/', 4)
) v(platform, label, url, sort_order)
where not exists (select 1 from public.social_links);

insert into public.technologies (name, category, icon_url, sort_order, i18n)
values
  ('HTML5','frontend','/icons/tech/html5.svg',1,'{}'),
  ('CSS3','frontend','/icons/tech/css3.svg',2,'{}'),
  ('JavaScript','frontend','/icons/tech/javascript.svg',3,'{}'),
  ('TypeScript','frontend','/icons/tech/typescript.svg',4,'{}'),
  ('React','frontend','/icons/tech/react.svg',5,'{}'),
  ('Angular','frontend','/icons/tech/angular.svg',6,'{}'),
  ('Next.js','frontend','/icons/tech/nextjs.svg',7,'{}'),
  ('Tailwind CSS','frontend','/icons/tech/tailwindcss.svg',8,'{}'),
  ('Flutter','frontend','/icons/tech/flutter.svg',9,'{}'),
  ('Java','backend','/icons/tech/java.svg',10,'{}'),
  ('Spring Boot','backend','/icons/tech/spring.svg',11,'{}'),
  ('Python','backend','/icons/tech/python.svg',12,'{}'),
  ('Node.js','backend','/icons/tech/nodejs.svg',13,'{}'),
  ('REST APIs','backend',null,14,'{}'),
  ('Oracle','database','/icons/tech/oracle.svg',15,'{}'),
  ('PostgreSQL','database','/icons/tech/postgresql.svg',16,'{}'),
  ('MySQL','database','/icons/tech/mysql.svg',17,'{}'),
  ('Git','tools','/icons/tech/git.svg',18,'{}'),
  ('GitHub','tools','/icons/tech/github.svg',19,'{}'),
  ('VS Code','tools','/icons/tech/vscode.svg',21,'{}'),
  ('IntelliJ IDEA','tools','/icons/tech/intellij.svg',22,'{}'),
  ('Postman','tools','/icons/tech/postman.svg',23,'{}'),
  ('Docker','tools','/icons/tech/docker.svg',24,'{}'),
  ('Figma','design','/icons/tech/figma.svg',25,'{}')
on conflict (name) do nothing;

insert into public.projects (slug, title, summary, category, technologies, is_featured, is_published, sort_order, i18n)
values
  ('sis-megeric','SIS-MEGERIC','Web application that supports the management and assessment of corruption risks.','fullstack','{}',true,true,1,
   '{"es":{"summary":"Aplicación web para apoyar la gestión y valoración de riesgos de corrupción."}}'),
  ('sisci','SISCI','System for managing conflict-of-interest disclosure forms.','fullstack','{}',true,true,2,
   '{"es":{"summary":"Sistema para la gestión de formularios de conflicto de intereses."}}'),
  ('sisrec','SISREC','Requirements management system with related functionality.','fullstack','{}',true,true,3,
   '{"es":{"summary":"Sistema de gestión de requerimientos y funcionalidades relacionadas."}}'),
  ('appmagicpro','AppMagicPro','Mobile application project built with Flutter.','mobile','{Flutter}',true,true,4,
   '{"es":{"summary":"Proyecto de aplicación móvil desarrollado con Flutter."}}')
on conflict (slug) do nothing;

insert into public.timeline_entries (kind, title, is_current, sort_order, i18n)
select 'education', 'Software Engineering', true, 1, '{"es":{"title":"Ingeniería de Software"}}'::jsonb
where not exists (select 1 from public.timeline_entries);

insert into public.sections (key, eyebrow, title, subtitle, sort_order, i18n) values
  ('about','01 — About','About Me',null,1,
   '{"es": {"eyebrow": "01 — Sobre mí", "title": "Sobre mí"}}'),
  ('stack','02 — Tech Stack','Tech Stack Ecosystem','Click any technology node to inspect how I use it in real projects. Categories and proficiency levels are configurable.',2,
   '{"es": {"eyebrow": "02 — Tech Stack", "title": "Ecosistema tecnológico", "subtitle": "Haz clic en cualquier tecnología para ver cómo la uso en proyectos reales. Las categorías y los niveles son configurables."}}'),
  ('projects','03 — Projects','Featured Projects','Select any project to inspect the problem solved, the architecture and key features.',3,
   '{"es": {"eyebrow": "03 — Proyectos", "title": "Proyectos destacados", "subtitle": "Selecciona cualquier proyecto para ver el problema que resuelve, su arquitectura y sus funcionalidades."}}'),
  ('certifications','04 — Certifications','Certifications Library','Digital vault for verified PDF and image certificates.',4,
   '{"es": {"eyebrow": "04 — Certificaciones", "title": "Biblioteca de certificaciones", "subtitle": "Bóveda digital de certificados verificados en PDF e imagen."}}'),
  ('journey','05 — Journey','Experience & Education','Interactive timeline of academic formation, internships and key technical milestones.',5,
   '{"es": {"eyebrow": "05 — Trayectoria", "title": "Experiencia y formación", "subtitle": "Línea de tiempo interactiva de formación académica, prácticas e hitos técnicos."}}'),
  ('playground','06 — Game','BLUE Arcade','Play BLUE’s Neon Catch right on the page.',6,
   '{"es": {"eyebrow": "06 — Juego", "title": "Arcade de BLUE", "subtitle": "Juega Neon Catch con BLUE sobre la misma página."}}'),
  ('contact','07 — Contact','Let’s Connect','Open to frontend engineering roles, creative developer collaborations and full-stack product builds.',7,
   '{"es": {"eyebrow": "07 — Contacto", "title": "Conectemos", "subtitle": "Abierto a roles de ingeniería frontend, colaboraciones creativas y desarrollo de productos full stack."}}')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------
-- Registrar tu usuario como administrador:
-- 1) Authentication → Users → "Add user" (email + contraseña, Auto Confirm).
-- 2) Ejecuta (cambiando el correo):
--    insert into public.admins (user_id)
--    select id from auth.users where email = 'TU_CORREO@ejemplo.com'
--    on conflict do nothing;
-- ---------------------------------------------------------------------

-- Perfil: rol de Ingeniero de Software y contenido de "Sobre mí" (no pisa lo que ya hayas escrito).
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

-- Descripción de uso de cada tecnología (solo si aún está vacía).
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
