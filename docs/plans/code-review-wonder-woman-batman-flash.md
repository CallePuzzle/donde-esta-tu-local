# Code review de la PR (vs `origin/main`)

Fecha: 2026-08-13. Revisión completa de los 114 ficheros del diff, repartidos en 4 áreas (servidor/seguridad, rutas/acciones, cliente/componentes, infra/config).

En general la PR es **sólida**: mejoras reales de seguridad (endpoints de miembros a POST+JSON con check de `Origin`, autorización centralizada en `membership.ts`, XSS en popups de Leaflet corregido vía `textContent`, emails de miembros ya no se serializan al cliente, transacciones en alta/edición de peña, rate limit en OTP) y limpieza coherente de la migración Cloudflare→Vercel.

## Severidad media (1)

- **`.env.example` vs `prisma/schema.prisma:9`** — el esquema ahora exige `directUrl = env("DIRECT_DATABASE_URL")`, pero `.env.example` no incluye `DIRECT_DATABASE_URL` (ni la sección de variables de `AGENTS.md`, que pide mantenerse al día). Un clon fresco fallará en cualquier comando Prisma (`generate`, `migrate deploy`, que corre en `bun run build`). Añadirla a `.env.example` + AGENTS.md, o quitar `directUrl`.

## Severidad baja

### Comportamiento funcional

- `src/routes/gang/refuseMember/+server.ts` + `addMember/+server.ts` — un usuario `REFUSED` queda vetado de **cualquier** peña, sin vía admin para revertirlo (el código lo reconoce como pendiente de B7). Conviene al menos una acción admin de reset, o documentar la decisión.
- `src/routes/gang/[slug]/update/+layout.server.ts:7` — slug no numérico → `NaN` → usuario no-admin recibe **403 en vez de 404** (el admin sí cae en el 404 correcto del page load). Validar `Number.isNaN` en el layout antes de `requireValidatedMember`.
- `src/routes/gang/add/+page.server.ts:36-48` — el rate limit de peñas/día se comprueba **fuera** de la transacción: dos envíos concurrentes crean dos peñas. Impacto acotado (anti-spam), pero el chequeo debería ir dentro de la `$transaction`.
- `src/routes/gang/[slug]/update/+page.server.ts:85-87` — cuando no hay cambios se responde "peña añadida correctamente". Mensaje engañoso; mejor una clave propia "sin cambios".

### Bugs / robustez

- `src/routes/+page.svelte:82` — `filterGangs` llama a `map.closePopup()` cuando `map` puede ser `undefined` si el usuario filtra antes de que cargue Leaflet → `TypeError`. Falta `if (!map) return`.
- `src/lib/components/ButtonRequest.svelte:66` — el botón "Reintentar" no tiene `type="button"` y no reintenta: solo borra el mensaje. Hoy no está dentro de formularios, pero la etiqueta es engañosa y es una trampa futura.
- `src/lib/utils/format-date.test.ts:21,28` — tests dependientes de la TZ local; fallarían en TZ ≥ UTC+13. Fijar `TZ` en Vitest o usar fechas sin hora.

### Privacidad / datos

- `src/routes/gang/[slug]/+page.server.ts:51` — `logger.debug(gang, 'gang')` vuelca la peña con los `email` de todos los miembros (línea pre-existente, pero ahora el email ya no va al cliente y el log es el único sitio donde queda). Loguear solo `{ id, name }`.
- `prisma/schema.prisma:45` — la PR elimina el handler `push` del service worker y no queda uso de push en el código, pero `User.subscription` sigue en el esquema. Columna muerta con PII; coherente con `drop_email_sent`, valorar eliminarla.

### UX

- `src/routes/gang/[slug]/+page.svelte:98` — un usuario con solicitud pendiente no ve el botón de unirse ni ninguna indicación de su estado (efecto colateral del acertado recorte de `pendingMembers`). Bastaría un texto "Tu solicitud está pendiente".
- `src/lib/components/FormLogin.svelte:46` — se pierde la UX "código ya enviado, válido X segundos"; el reenvío rápido ahora da un error genérico de rate limit. No es agujero de seguridad (hay rate limit en `auth.ts`).

### Tipado

- `src/lib/server/membership.ts:8,21,40` — los helpers tipan el usuario como `User` de `@prisma/client`, contradiciendo `app.d.ts` (que usa `auth.$Infer.Session` a propósito). Hoy compila, pero es frágil. Tipar con `App.Locals['user']`.

## Verificado sin problemas

- Claves de rate limit coinciden con las rutas reales de better-auth; `requireSameOrigin` cubre el flujo real del navegador.
- Migraciones correctas: `normalizedName` backfilled antes de NOT NULL/UNIQUE, enums con `USING`, índices de FK.
- CSP con nonce, hosts centralizados en `vercel-hosts.js`, `isVercelBlobUrl` no vulnerable a spoofing de sufijo.
- No quedan referencias rotas a claves i18n eliminadas ni a `/notices`; `getMenuRoutes` es semánticamente idéntico; `show-my-position` corrige la fuga de watchers; `.oxlintrc.json` reactiva reglas de correctness.
- Todo el texto de UI nuevo pasa por `m.*` en español informal, conforme a AGENTS.md.

## Recomendación

Aprobar tras resolver el hallazgo medio (`.env.example`/`DIRECT_DATABASE_URL`) y, idealmente, los de comportamiento funcional (403-vs-404 y el veto global de REFUSED). El resto puede ir en follow-ups.
