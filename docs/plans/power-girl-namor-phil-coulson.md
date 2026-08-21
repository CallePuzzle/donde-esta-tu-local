# Plan: tests E2E con Playwright (core ampliado)

## Objetivo

Añadir tests E2E con Playwright que cubran: login OTP, logout, crear peña, hacerse miembro, validar miembro, validar peña (admin), editar peña, rechazar miembro y control de acceso (401/403). Contra un PostgreSQL dedicado en Docker.

## Contexto clave (ya verificado)

- No existe nada de Playwright en el repo (terreno verde). Vitest queda como está (unitarios).
- Login: modal en `NavBarEnd.svelte` (botón "Iniciar sesión") → `FormLogin.svelte`: paso 1 email → paso 2 `PinInput` de 6 dígitos (auto-submit al completar). En dev el OTP **no se envía**; queda en la tabla `verification` (`identifier`=email, `value`=OTP).
- Rate limit better-auth: 3 req/min en send-otp y sign-in → solo el test de login usa el flujo real; el resto siembra sesiones en BD.
- Crear peña: `/gang/add` exige click real en el mapa Leaflet → popup con botón "Añadir peña en esta localización" → modal con `FormAddGang` (campo `name`; lat/lng ocultos). Modal informativo se abre solo al montar (hay que cerrarlo). Límite 3 peñas/día/usuario.
- Unirse: botón "Solicitar unirme a la peña" en `/gang/[slug]` (solo peñas VALIDATED) → POST `/gang/addMember`.
- Validar miembro: botones "Validar"/"Rechazar" en `/gang/[slug]` (sección "Solicitudes pendientes", visible para miembro validado de esa peña o admin) → POST `/gang/validateMember` / `/gang/refuseMember`.
- Validar peña: `/admin/gangs`, tab "Pendientes", botones "Validar"/"Rechazar" (form actions, `requireAdmin`).
- Editar peña: `/gang/[slug]/update`, exige `requireValidatedMember`.
- Roles: `User.role` ('admin'/'system'); se asigna por BD en el seed de tests.

## Cambios

### 1. Dependencias y config

- `bun add -d @playwright/test` y `bunx playwright install chromium` (solo Chromium).
- `playwright.config.ts` (raíz):
  - `testDir: './e2e'`, un solo proyecto Chromium, `fullyParallel: false` (BD compartida), `workers: 1`.
  - `webServer`: arranca `bun run dev` con las env de `.env.test` (puerto dedicado, p.ej. 4174, con `BETTER_AUTH_URL` acorde), `reuseExistingServer: !process.env.CI`.
  - `globalSetup`: `e2e/global-setup.ts` — aplica migraciones (`prisma migrate deploy` contra la BD de test) y ejecuta el seed base.
  - Bloquear service worker (`serviceWorkers: 'block'`) y ruta de tiles OSM si se quiere offline (opcional; por defecto se deja pasar).
- Scripts en `package.json`: `test:e2e` (levanta BD docker + playwright test), `test:e2e:ui`, y `db:test:up`/`db:test:down` (docker compose).

### 2. Base de datos de test

- `docker-compose.yml` (raíz): servicio `postgres-test` (postgres:16-alpine, puerto 55433, bd `e2e`, user/pass fijos de test). No toca nada existente.
- `.env.test` (commiteado, sin secretos reales): `DATABASE_URL`/`DIRECT_DATABASE_URL` → `postgresql://test:test@localhost:55433/e2e`, `BETTER_AUTH_SECRET` fijo de test, `BETTER_AUTH_URL=http://localhost:4174`. `.env*` ya está en `.gitignore` — añadir excepción `!.env.test` o usar nombre `e2e/.env.test` + ajustar ignore.
- Aislamiento entre tests: el helper de seed borra las tablas relevantes (`gangHistory`, `user`, `gang`, `session`, `verification`) antes de cada spec que lo necesite, vía fixture de Playwright. Activities no hace falta.

### 3. Helpers E2E (`e2e/helpers/`)

- `db.ts`: cliente Prisma para tests (`@prisma/client` ya existe; instanciar con `DATABASE_URL` de `.env.test`, sin Accelerate).
- `seed.ts`: funciones `createUser({role?, gangId?, membershipGangStatus?})`, `createGang({status, lat, lng, name})`, `resetDb()`.
- `auth.ts`:
  - `loginViaUi(page, email)`: flujo real — click "Iniciar sesión" → rellenar email → leer OTP de `verification` (poll con Prisma, timeout 10s) → teclear 6 dígitos en el PinInput → esperar estado logueado (botón "Cerrar sesión" en `/profile` o avatar en navbar).
  - `seedSession(page, user)`: inserta `session` en BD (token aleatorio, expiración futura) y fija la cookie de sesión de better-auth en el contexto (`better-auth.session_token`, mismo nombre que usa better-auth por defecto; verificar en dev tools/código antes de hardcodear). Para todos los tests que no son el de login.

### 4. Specs (`e2e/`)

- `auth.spec.ts`:
  - Login completo por UI con OTP leído de BD; assert estado autenticado.
  - Logout: desde `/profile`, click "Cerrar sesión" → navbar vuelve a mostrar "Iniciar sesión".
  - Control de acceso: `/gang/add` sin sesión → 401; `/admin` sin sesión → 401; `/admin` con usuario no admin → 403.
- `gang-create.spec.ts`:
  - Con sesión sembrada: ir a `/gang/add`, cerrar modal info, `page.mouse.click` dentro de `#map`, esperar `.leaflet-popup` → click "Añadir peña en esta localización" → rellenar `name` → "Añadir peña" → assert mensaje "Peña añadida con éxito" y peña PENDING en BD.
- `membership.spec.ts` (flujo encadenado con 3 usuarios: solicitante, miembro validado de la peña, admin):
  - Solicitante: en `/gang/[id]` de peña VALIDATED, click "Solicitar unirme a la peña" → assert "Solicitud enviada con éxito" y `membershipGangStatus=PENDING` en BD.
  - Miembro validado: en la misma página, sección "Solicitudes pendientes" → click "Validar" → assert solicitante VALIDATED en BD.
  - Rechazar: segundo solicitante → miembro validado click "Rechazar" → assert REFUSED en BD.
- `admin-gangs.spec.ts`:
  - Admin: `/admin/gangs` tab "Pendientes" → "Validar" sobre peña PENDING → assert `status=VALIDATED` en BD.
  - Admin: "Rechazar" sobre otra peña PENDING → assert `status=REFUSED`.
- `gang-update.spec.ts`:
  - Miembro validado de la peña edita nombre en `/gang/[id]/update` → assert cambio en BD y registro `GangHistory` UPDATE.

### 5. Documentación y verificación

- Actualizar `AGENTS.md`: sección de comandos (`test:e2e`, docker de test) y mención de la carpeta `e2e/` en la estructura.
- README: nota breve de cómo correr los E2E (si encaja con su formato actual).
- Verificación: `bun run check`, `bun run lint`, `bun run test` (unitarios intactos) y `bun run test:e2e` verde de punta a punta. Formatear con `bun run format`.

## Riesgos / notas

- Nombre exacto de la cookie de sesión de better-auth: confirmarlo en el primer test (`seedSession`); si difiere, leerlo de la config de `auth.ts`.
- El mapa necesita red para tiles OSM; si es un problema, interceptar `*.tile.openstreetmap.org` devolviendo 204 (el click funciona igual).
- El flujo encadenado de `membership.spec.ts` depende del orden; si resulta frágil, cada caso siembra su propio estado y solo ejercita su click.
- No se testea: subida de avatar (Vercel Blob), envío real de email, activities (solo lectura).
