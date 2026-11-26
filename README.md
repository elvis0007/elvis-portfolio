# Elvis Flores — Interactive Developer Portfolio

Portafolio profesional de **Elvis Flores — Software Engineer**.
Idioma principal: **inglés**, con traducción completa al **español** (botón EN/ES). Te acompaña **BLUE**, un gato blanco en 3D con ojos azules y collar rojo.
Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Framer Motion · GSAP + ScrollTrigger · Three.js (React Three Fiber + Drei) · Supabase (PostgreSQL, Auth, Storage).

> Beyond the code. Create the experience.

## Qué incluye
- **Pantalla de inicio** "Initializing Elvis Flores…" en rosa pastel (una vez por carga de página).
- **Hero 3D**: núcleo líquido rosa con cáscara geodésica, anillos, satélites, figuras flotantes y partículas que reaccionan al cursor y al scroll.
- **Tech Stack**: ecosistema orbital de logos + tarjetas con inclinación 3D; filtros por categoría y ficha de cada tecnología.
- **Vitrina 3D de proyectos**: carrusel con profundidad (flechas, teclado o deslizar). La tarjeta central se inclina con fuerza 25° y amortiguación baja.
- **Certificados, trayectoria y contacto por WhatsApp**: el formulario arma el mensaje y lo abre en WhatsApp (app o WhatsApp Web).
- **BLUE, el guía**: camina detrás del cursor, salta a donde haces clic, se sienta junto al título de cada sección y la presenta, y comenta los botones importantes (`data-guide="…"`). En móvil se queda en su esquina.
- **BLUE's Neon Catch**: minijuego 3D que se juega encima de la propia página (botón "Play with BLUE" del menú o "Play" en la burbuja de BLUE). Récord guardado en el navegador.

---

## 1. Puesta en marcha

### Requisitos
- Node.js 20.9+ (recomendado 22 LTS)
- Una cuenta gratuita en [supabase.com](https://supabase.com)

### Paso 1 — Instalar dependencias
```bash
npm install
```

### Paso 2 — Base de datos en Supabase
1. Crea un proyecto nuevo en Supabase.
2. **SQL Editor → New query**: pega `supabase/schema.sql` y ejecútalo.
3. En otra consulta, ejecuta `supabase/seed.sql` (perfil, redes, 27 tecnologías, 4 proyectos, secciones y tu WhatsApp).

> **¿Ya habías creado la base antes?** Ejecuta `supabase/update.sql`. Corrige el error
> `permission denied for table …` (los proyectos nuevos de Supabase ya no dan permisos automáticos a las tablas)
> y añade la columna de WhatsApp. Los scripts son idempotentes: puedes repetirlos sin perder datos.

### Paso 3 — Variables de entorno
```bash
cp .env.example .env.local
```
| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto (botón **Connect** o **Project Settings → API Keys**) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave pública `sb_publishable_…` (segura en el navegador: RLS protege los datos). En proyectos antiguos también sirve `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio (SEO, Open Graph, sitemap) |
| `CRON_SECRET` | *Opcional*: protege `/api/keepalive`, la consulta diaria que evita que Supabase Free pause el proyecto |

**Nunca** pongas la clave secreta (`sb_secret_…` / `service_role`) en este proyecto: no se necesita.

### Paso 4 — Tu usuario administrador
1. **Authentication → Users → Add user** (correo + contraseña, marca *Auto Confirm User*).
2. En el SQL Editor (cambia el correo):
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'TU_CORREO@ejemplo.com'
   on conflict do nothing;
   ```
3. Recomendado: **Authentication → Sign In / Providers → desactiva "Allow new users to sign up"**.

### Paso 5 — Ejecutar
```bash
npm run dev        # http://localhost:3000   ·   panel: http://localhost:3000/admin
```
Para abrirlo desde el celular u otro equipo de tu red usa la IP que muestra la consola (p. ej. `http://192.168.1.54:3000`).
`next.config.ts` ya permite las IP de red local (`allowedDevOrigins`); si tu red usa otro rango, añádelo ahí y reinicia `npm run dev`.

---

## 2. Despliegue (Vercel)
1. Sube el proyecto a GitHub e impórtalo en [vercel.com](https://vercel.com).
2. Añade las variables de `.env.local` (con `NEXT_PUBLIC_SITE_URL` = tu dominio).
3. Deploy. Lo que guardes en `/admin` se publica al instante: **no hace falta volver a desplegar**.
4. Supabase → **Authentication → URL Configuration**: pon tu dominio de Vercel como *Site URL*.
5. `vercel.json` programa una visita diaria a `/api/keepalive` para que Supabase Free no pause la base por inactividad.

---

## 3. Qué se gestiona desde `/admin`

| Módulo | Funciones |
|---|---|
| **Dashboard** | Totales y checklist de contenido pendiente |
| **Proyectos** | Crear, editar, eliminar, reordenar, publicar/ocultar; portada, galería, tecnologías, problema, solución, funcionalidades, participación, repo y demo |
| **Certificados** | PDF o imagen, institución, fechas, categoría, ID y enlace de verificación |
| **Tecnologías** | Icono, categoría, nivel real (o sin definir), descripción y uso |
| **Trayectoria** | Formación, experiencia, prácticas, proyectos destacados y cursos |
| **Perfil y redes** | Nombre, rol, textos del hero, foto, bio, formación, objetivos, intereses, **WhatsApp**, CV (PDF) y redes sociales |
| **Contenido** | Títulos y subtítulos (EN + ES), orden y visibilidad de cada sección. La sección **playground** activa o desactiva el minijuego de BLUE |
| **Mensajes** | Archivo de los mensajes que llegaron por el formulario anterior (el contacto ahora va por WhatsApp) |

---

## 4. Arquitectura
```
src/
├── app/                      # page.tsx (ISR), projects/[slug], admin/, api/keepalive, sitemap, robots, OG
├── sections/                 # Hero, About, TechStack, Projects (vitrina 3D), Certifications, Journey, Contact
├── components/
│   ├── layout/               # Header, Footer, Preloader, SiteShell
│   ├── game/BlueArcade.tsx   # Interfaz del minijuego (HUD, menús, controles)
│   ├── projects/ tech/ ui/   # Tarjetas, ficha de tecnología, primitivas (Button, Modal, TiltCard…)
│   └── admin/                # Panel
├── three/                    # HeroScene, Cat3D (BLUE), ArcadeScene (juego 3D)
├── guide/                    # GuideProvider (estado y mensajes de BLUE) y CatGuide (movimiento y burbuja)
├── i18n/                     # Diccionario EN/ES
├── lib/ services/ types/ hooks/ animations/ styles/
└── proxy.ts                  # Protección de /admin
supabase/
├── schema.sql · seed.sql     # Esquema + contenido inicial
└── update.sql       # Parche para bases creadas antes de este cambio
```

## 5. Seguridad
- Supabase Auth + `proxy.ts` + verificación de rol en el panel y en cada Server Action.
- RLS en todas las tablas (lectura pública solo de lo publicado; escritura solo si `is_admin()`), con `GRANT` explícitos para la Data API.
- Storage con límites de tamaño y tipo MIME; validación con zod (URLs solo `http(s)`, longitudes, fechas) y `CHECK` en PostgreSQL.
- El número de WhatsApp se valida (8–15 dígitos) y el mensaje se envía con `encodeURIComponent`.

## 6. Personalización rápida
- Colores: `src/styles/globals.css` (`@theme`) y `src/three/palette.ts`.
- Textos de la interfaz y de BLUE (EN/ES): `src/i18n/dictionary.ts`.
- Física de la vitrina: `STAGE_PHYSICS` en `src/sections/Projects.tsx`.
- Dificultad del juego: `src/three/ArcadeScene.tsx` (velocidad, frecuencia y probabilidad de fallos).
