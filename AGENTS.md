# AGENTS.md

Guía para agentes de IA que trabajen en este repositorio. Asume que el lector no conoce el proyecto.

## Descripción del proyecto

**donde-esta-tu-local** (nombre de paquete: `donde-esta-tu-local-v5`) es una aplicación web para localizar las peñas ("gangs") de las fiestas de Montemayor de Pililla (Valladolid, España). Muestra las peñas en un mapa (Leaflet + OpenStreetMap), permite a los usuarios registrados añadir y editar su peña, gestionar miembros, y consultar actividades de las fiestas. El dominio de producción es `peñas.montemayordepililla.cc` (`xn--peas-hqa.montemayordepililla.cc`).

El proyecto es la quinta iteración de una serie que empezó en Cloudflare Workers + D1; ahora corre sobre PostgreSQL desplegado en Vercel.

## Stack tecnológico

- **Framework**: SvelteKit 2 con **Svelte 5** (runes: `$state`, `$props`, etc.; `compilerOptions.experimental.async: true`).
- **Lenguaje**: TypeScript estricto (`strict: true` en `tsconfig.json`).
- **Despliegue**: Vercel (`@sveltejs/adapter-vercel` con optimización de imágenes).
- **Base de datos**: PostgreSQL vía **Prisma 7** (generador `prisma-client` con output en `src/lib/generated/prisma`, driver adapters GA). El cliente vive en `src/lib/server/db.ts`: lee `DATABASE_URL` de `$env/dynamic/private` (no de `process.env`: en dev el `.env` lo carga SvelteKit/Vite; dinámico y no estático para que el build no exija la variable), y con una URL de **Prisma Accelerate** usa `accelerateUrl` (producción) o el adapter `@prisma/adapter-pg` con una URL PostgreSQL normal (desarrollo/tests). Se crea de forma perezosa (proxy sobre el primer acceso) porque `vite build` evalúa el módulo sin variables de entorno; singleton en `globalThis` para dev/HMR. No se usa `@prisma/extension-accelerate`: en v7 `accelerateUrl` ya enruta por Accelerate y la extensión solo aporta `cacheStrategy`/`$accelerate`, que el proyecto no usa. La resolución de URLs está centralizada en `src/lib/server/database-url.ts` (`isAccelerateUrl`, `resolveDirectDatabaseUrl`, `requireDirectDatabaseUrl`), que comparten `prisma.config.ts` (migraciones) y los seeds: todo lo que necesita conexión directa usa `DIRECT_DATABASE_URL`, con `DATABASE_URL` de fallback solo si no es una URL de Accelerate. `DATABASE_URL` debe estar definida en el entorno. TypeScript se mantiene en 5.x por compatibilidad con `svelte-check`/`typescript-eslint`.
- **Autenticación**: **better-auth** con adaptador Prisma, login sin contraseña mediante **OTP por email** (nodemailer vía SMTP) y plugin `admin` (roles `admin`/`system`). Configuración en `src/lib/server/auth.ts`; el handler vive en `src/lib/handles/better-auth-handle.ts` y se encadena en `src/hooks.server.ts`.
- **Estilos**: Tailwind CSS 4 (plugin de Vite) + **daisyUI 5** (tema `dark` por defecto, definido en `src/app.css`) + Flowbite/flowbite-svelte + bits-ui. Iconos: `@lucide/svelte`.
- **Mapas**: Leaflet, cargado dinámicamente en el cliente vía el helper `initMap()` de `$lib/utils/init-map.ts` (import dinámico + `leaflet/dist/leaflet.css` en el bundle + tile layer de OpenStreetMap); úsalo en vez de repetir la inicialización en cada página.
- **i18n**: **Paraglide JS** (inlang), único locale `es`. Mensajes fuente en `messages/es.json`; el código compilado se genera en `src/lib/paraglide` (no editar a mano). En componentes se usa `import { m } from '$lib/paraglide/messages.js'`.
- **Formularios**: sveltekit-superforms + formsnap con esquemas **zod v4** (`import { z } from 'zod/v4'`) definidos en `src/lib/schemas/`.
- **Logging**: pino (`src/lib/logger.ts`, exporta `logger`; pretty en desarrollo).
- **Observabilidad**: `@vercel/otel` en `src/instrumentation.server.ts` y `@vercel/analytics` en `src/routes/+layout.ts`.
- **Gestor de paquetes**: bun (hay `bun.lock`; el README usa `bun run`). También funciona npm/pnpm. `.npmrc` tiene `engine-strict=true`. `package.json` tiene un bloque `overrides` para fijar versiones parcheadas de dependencias transitivas con vulnerabilidades conocidas (tar, postcss, defu, sharp, validator, rollup, flatted, picomatch, cookie, yaml, deepmerge-ts, nanoid); no lo borres sin volver a correr `bun audit`. Ojo con `deepmerge-ts`: `@prisma/config` lo fija en la versión exacta `7.1.5` (vulnerable, GHSA-ggr8-5vv4-36mx) y el override lo sube a 8.x, así que revísalo en cada subida de Prisma.

## Comandos

Usa **bun** (hay `bun.lock`); todos los scripts son `bun run <script>`.

- `bun run dev` — servidor de desarrollo (Vite).
- `bun run build` — build de producción. Ojo: ejecuta `prisma generate && prisma migrate deploy && vite build` (aplica migraciones contra la base de datos configurada).
- `bun run only-build` — build sin tocar la base de datos. **Usa siempre este para verificar, nunca `build`.**
- `bun run preview` — sirve el build (`bunx --bun vite preview`; el `--bun` es necesario para que el proceso vea el `.env`, ver más abajo).
- `postinstall` — `prisma generate`, automático tras `bun install`. El cliente generado (`src/lib/generated/prisma`) está gitignorado, así que sin este paso ni `dev`, ni `check`, ni `test`, ni los E2E resuelven `$lib/generated/prisma/client` en un clon limpio.
- `bun run check` — type-check con `svelte-check`.
- `bun run lint` — `prettier --check` + ESLint. `bun run format` — formatea todo con Prettier.
- `bun run test` — tests unitarios (Vitest): `membership.ts`, esquemas zod, `member-display.ts`, `schemas/utils.ts`, `roles.ts`, `format-date.ts`, `vercel-hosts.ts`. Los E2E van aparte (ver abajo).
- `bun run test:e2e` — tests E2E (Playwright, Chromium): ejecuta los specs de `e2e/` contra un dev server en el puerto 4174 que usa las variables de `.env.test`. Para levantar la base de datos de test, usa directamente `podman compose up -d` y para pararla `podman compose stop`. Hacerlo a través de scripts de node/bun no funciona correctamente. `bun run test:e2e:ui` — modo UI de Playwright. La primera vez hace falta `bunx playwright install chromium`.
- `bun run paraglide-js` — recompila los mensajes de i18n tras editar `messages/es.json` (el plugin de Vite también lo hace en dev/build; tras un `check`/build, los ficheros generados en `src/lib/paraglide/` pueden quedar sin formatear — pasa `bun run format` si `lint` se queja de ellos).
- `bun run db:seed-activities` — puebla actividades (`bun prisma/seed-activities.ts`). Los seeds abren conexión directa con el adapter de node-pg, así que necesitan `DIRECT_DATABASE_URL` (o una `DATABASE_URL` que no sea de Accelerate). Corren con el runtime de **bun**, no con `tsx`: `bun run` no propaga el `.env` a procesos hijo de node (`tsx`, `vite`), solo el runtime de bun lo carga.
- `bun audit` — auditoría de vulnerabilidades; objetivo 0. `bun outdated` — dependencias desactualizadas (a fecha de este documento el único _major_ pendiente es TypeScript 7, aplazado a conciencia, ver más abajo).

## Estructura del código

- `src/routes/` — rutas SvelteKit:
  - `+page.svelte` — mapa principal con las peñas.
  - `gang/[slug]/` — detalle de peña (`slug` es el **id numérico** de la peña); `gang/[slug]/update/` — edición; `gang/add/` — alta. `addMember`, `validateMember`, `refuseMember` son endpoints (`+server.ts`): POST con cuerpo JSON (`$lib/server/member-request.ts` centraliza el parseo/validación común) y comprobación explícita de `Origin` (`$lib/server/csrf.ts`), no cubiertos por la protección CSRF integrada de SvelteKit al no ser form actions.
  - `activities/`, `profile/` — páginas de contenido.
  - `admin/` — panel de administración (peñas, miembros, historial). `admin/+layout.server.ts` usa `requireAdmin(locals)` de `$lib/server/membership.ts` (401 sin sesión, 403 sin rol admin/system); los `load` de las páginas hijas no repiten el check porque el layout ya protege la navegación, pero las **actions** sí llaman a `requireAdmin`/`requireValidatedMember` porque no pasan por el `load` del layout.
- `src/lib/` — código compartido:
  - `server/` — solo servidor: `db.ts` (cliente Prisma, singleton en `globalThis` para dev/HMR), `auth.ts` (better-auth), `sender.ts` (email, transporter de nodemailer cacheado a nivel de módulo), `membership.ts` (`requireUser`/`requireAdmin`/`requireValidatedMember`/`canManageGangMembers`, usado por los endpoints de miembros y por `/admin`), `csrf.ts` (`requireSameOrigin`), `member-request.ts` (boilerplate común de los tres endpoints de miembros).
  - `components/` — componentes Svelte (subcarpeta `gangs/` para los específicos de peñas).
  - `utils/` — `init-map.ts` (helper de Leaflet), `member-display.ts` (`memberDisplayName`/`memberInitial`, fallback nombre→email→"Sin nombre"), `roles.ts` (`isAdmin`, compartido cliente/servidor), `format-date.ts` (formateadores de fecha centralizados, locale `es-ES`), `is-asset-pathname.ts` (para saltarse assets estáticos en los handles), `show-my-position.ts` (geolocalización en el mapa; devuelve una función de limpieza).
  - `handles/` — handles de SvelteKit encadenados en `src/hooks.server.ts`, en este orden: `securityHeadersHandle` (cabeceras + CSP, solo fuera de dev), `loggingHandle`, `betterAuthHandle`, `paraglideHandle`.
  - `schemas/` — esquemas zod de formularios (usados con superforms).
  - `stores/` — solo `loginModal.svelte.ts` (runes, `$state` module-level con getter/setter `.value`).
  - `paraglide/` — generado por i18n, **no editar**.
- `src/app.d.ts` — tipos globales: `App.Locals.session`/`user` se derivan de `auth.$Infer.Session` (better-auth), no de los modelos crudos del cliente Prisma — así incluyen exactamente lo que better-auth pone en la sesión (con `role` del plugin `admin`), y no lo que Prisma expondría por su cuenta.
- `prisma/` — `schema.prisma` (modelos: `User`, `Session`, `Account`, `Verification`, `Gang`, `Activity`, `GangHistory`; `membershipGangStatus`, `Gang.status` y `GangHistory.changeType` son enums), migraciones SQL en `migrations/`, y scripts de seed/migración.
- `e2e/` — tests E2E de Playwright: specs (`auth`, `gang-create`, `membership`, `admin-gangs`, `gang-update`), `global-setup.ts` (espera a que la BD de test acepte conexiones y aplica `prisma migrate deploy` contra ella; el cliente Prisma lo genera el `postinstall`) y `helpers/` (`env.ts` carga `.env.test` sin dotenv, `db.ts` PrismaClient propio con el adapter `@prisma/adapter-pg`, `seed.ts` con `resetDb`/`createUser`/`createGang`, `auth.ts` con `loginViaUi` —OTP leído de la tabla `verification`— y `seedSession` —sesión insertada en BD + cookie firmada de better-auth, `better-auth.session_token` = `token.base64(HMAC-SHA256(secret, token))`—). Config en `playwright.config.ts` (workers 1, BD compartida) y BD en `docker-compose.yml` (postgres:16-alpine, puerto 55433).
- `messages/es.json` — todos los textos de la UI (español).

### Modelo de dominio

Una `Gang` (peña) tiene nombre, coordenadas y un `status` (`PENDING`, validada, `REFUSED`). Los usuarios solicitan unirse (`membershipGangStatus`, por defecto `PENDING`). Cada cambio de nombre/posición se registra en `GangHistory` (`changeType`: `CREATE`/`UPDATE`). Las `Activity` tienen fecha única, peña anfitriona opcional y peñas colaboradoras (many-to-many).

Decisión consciente (code review 2026-08): un usuario con `membershipGangStatus = REFUSED` queda vetado de **cualquier** peña y no hay vía admin para revertirlo — se acepta así hasta que se defina el modelo de membresía por peña (B7/B8).

## Convenciones de código

- **Idioma**: comentarios, mensajes de UI, mensajes de log y textos de error en **español**. Identificadores en inglés (con algún anglicismo como `Gang` por "peña").
- **Formato** (Prettier, `.prettierrc`): tabuladores, comillas simples, sin trailing commas, ancho 100. Plugins de Prettier para Svelte y Tailwind — las clases de Tailwind se ordenan automáticamente. Ejecuta `bun run format` antes de terminar.
- **Lint**: ESLint flat config (`eslint.config.js`) + oxlint en pre-commit (lint-staged, `.oxlintrc.json`). `@typescript-eslint/no-explicit-any` es error.
- **Estilo Svelte 5**: runes (`$state`, `$derived`, `$props`); nada de la API legacy de Svelte 4. Tipos de rutas con `./$types` generados por SvelteKit. Componentes genéricos (p.ej. sobre el tipo de datos de un `SuperForm`) usan `<script lang="ts" generics="T extends ...">` (ver `FormFields.svelte`/`FormString.svelte`).
- **Formularios**: patrón superforms — `superValidate(request, zod4(schema))` en la acción, `fail(400, { form })` si no valida, `message(form, m.alguna_clave())` para responder. Los esquemas zod usan mensajes de Paraglide y `.meta()` con `placeholder`/`description` para renderizar campos.
- **Acceso a datos**: siempre a través de `import prisma from '$lib/server/db'` (cliente único; Accelerate o adapter directo según la URL). Nunca importes `$lib/server/*` desde código de cliente.
- **Autorización**: en acciones/loads de servidor usa los helpers de `$lib/server/membership.ts` (`requireUser`, `requireAdmin`, `requireValidatedMember`, `canManageGangMembers`) en vez de repetir `event.locals.user.role === 'admin' | 'system'` a mano.
- **i18n**: no escribas texto de usuario hardcodeado (tampoco en utils de servidor/cliente que no sean `.svelte`); añade la clave a `messages/es.json` y usa `m.clave()`. Recompila con `bun run paraglide-js` si es necesario. Registro: tú (informal), no usted.
- **Logging**: usa `logger` de `$lib/logger` en vez de `console.log` — funciona tanto en servidor como en cliente (`browserOptions` en `logger.ts`).
- **Nombre visible de un usuario/miembro**: usa `memberDisplayName`/`memberInitial` de `$lib/utils/member-display.ts` (nombre → email → "Sin nombre"), no reimplementes el fallback.
- **Commits**: en inglés, siguiendo el formato [Conventional Commits](https://www.conventionalcommits.org/): `<type>(<scope>): <description>`.

## Variables de entorno

Requeridas en producción/desarrollo (fichero `.env`, no commiteado; ver `.env.example`):

- `DATABASE_URL` — PostgreSQL (o URL de Prisma Accelerate).
- `DIRECT_DATABASE_URL` — conexión directa a PostgreSQL, usada por `prisma.config.ts` (migraciones) y por los seeds. Puede ser la misma que `DATABASE_URL` si no usas Accelerate; si no está definida se usa `DATABASE_URL` como fallback, pero **solo si no es una URL de Accelerate** (ver `src/lib/server/database-url.ts`).
- `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` — better-auth (sesión/login).
- `SMTP_HOST`, `SMPT_AUTH_USER`, `SMPT_AUTH_PASS`, `SMPT_SENDER` — envío del OTP de login (nótese el typo `SMPT_`, es intencionado/existente). En dev no se envía email; el OTP aparece en el log (`logger.debug`).
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob, para subir el avatar del perfil.

**Ojo con `.env` y bun**: solo el runtime de bun carga el `.env` automáticamente;
`bun run <script>` **no** lo propaga a los procesos hijo de node (`prisma`,
`vite`, `tsx`). En `dev` no se nota porque el servidor de SvelteKit carga el
`.env` él mismo, pero fuera de ahí sí: las migraciones locales se lanzan con
`bunx prisma migrate dev|deploy` (runtime de bun, ve el `.env`), los seeds con
`bun prisma/seed-*.ts`, `preview` fuerza el runtime de bun
(`bunx --bun vite preview`) porque el servidor construido lee `process.env`
directamente —si no, better-auth arranca sin `BETTER_AUTH_SECRET`—, y
`bun run build` solo funciona donde las variables están exportadas de verdad en
el entorno (Vercel): en local usa `only-build`.

## Herramientas del entorno

- **CodeGraph**: el proyecto está indexado con [codegraph](https://github.com/colbymchenry/codegraph) en `.codegraph/` (grafo de código en SQLite, ignorado por git, con auto-sync al guardar ficheros). Hay un binario `codegraph` instalado en el PATH para hacer consultas: `codegraph explore "<pregunta>"` (fuente relevante + rutas de llamada en una sola llamada), `codegraph query <símbolo>`, `codegraph callers|callees|impact <símbolo>`, `codegraph node <símbolo|fichero>`, `codegraph files`, `codegraph status`. Referencia completa: https://github.com/colbymchenry/codegraph#cli-reference. Prefiere estas consultas a recorrer el código fichero a fichero.
- **Modelo local**: hay un modelo `qwen3-coder:30b` expuesto en `http://localhost:11434` (API de Ollama). Delega en él trabajos sencillos pero que consuman muchos tokens (búsquedas masivas, resúmenes de ficheros, refactorizaciones mecánicas, etc.) en lugar de gastar el contexto del modelo principal.

## Consideraciones de seguridad

- Hay tests unitarios (Vitest, `bun run test`) para lo que se puede probar sin base de datos ni navegador; para el resto, verifica los cambios con `bun run check`, `bun run lint` y `bun run only-build` como mínimo.
- Toda mutación de datos pasa por acciones de SvelteKit con validación zod; mantén esa barrera.
- Las rutas `/admin` dependen de `requireAdmin` en `admin/+layout.server.ts` (más `requireAdmin`/`requireValidatedMember` en cada action, que no pasan por el layout): no los elimines ni los debilites.
- Los endpoints de miembros (`validateMember`, `refuseMember`, `addMember`) deben comprobar sesión y pertenencia a la peña antes de modificar datos (vía `membership.ts`).
- `security-headers-handle.ts` (primero en `hooks.server.ts`) pone cabeceras de seguridad (X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS fuera de dev). La CSP en sí la firma SvelteKit vía `kit.csp` en `svelte.config.js` (`mode: 'nonce'`, solo fuera de `vite dev`); si añades un origen externo nuevo (fuente, script, imagen…), amplía los `directives` ahí en vez de relajarla de forma genérica. Los hosts de Vercel (imágenes y Blob) están centralizados en `src/lib/config/vercel-hosts.js`.
- El email OTP solo se envía fuera de desarrollo; en dev el código queda en los logs — no lo expongas en UI.
- Los ficheros `.env*` están ignorados por git y por oxlint; nunca los leas ni los copies a otros sitios.
