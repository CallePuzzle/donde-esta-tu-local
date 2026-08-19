# donde-esta-tu-local

Aplicación web para localizar las peñas de las fiestas de Montemayor de Pililla (Valladolid,
España). Muestra las peñas en un mapa (Leaflet + OpenStreetMap), permite a los usuarios registrados
añadir y editar su peña, gestionar miembros, y consultar las actividades de las fiestas. Producción:
`peñas.montemayordepililla.cc`.

## Stack

SvelteKit 2 + Svelte 5, TypeScript, PostgreSQL vía Prisma + Prisma Accelerate, better-auth (login sin
contraseña por OTP de email), Tailwind CSS 4 + daisyUI, Leaflet, Paraglide JS (i18n, único locale
`es`), desplegado en Vercel. Ver [AGENTS.md](./AGENTS.md) para el detalle completo del stack, la
estructura del código y las convenciones.

## Requisitos

- [Bun](https://bun.sh) (hay `bun.lock`; también funciona con npm/pnpm)
- Una base de datos PostgreSQL (o una URL de [Prisma Accelerate](https://www.prisma.io/accelerate))

## Puesta en marcha

```sh
bun install
cp .env.example .env   # y rellena los valores, ver más abajo
bun run dev
```

En desarrollo el código OTP de login no se envía por email: aparece en el log de la terminal
(`logger.debug`).

## Variables de entorno

Ver [`.env.example`](./.env.example) para la lista completa. Resumen:

| Variable                                                       | Para qué                         |
| -------------------------------------------------------------- | -------------------------------- |
| `DATABASE_URL`                                                 | PostgreSQL o Prisma Accelerate   |
| `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`                        | Sesión/login (better-auth)       |
| `SMTP_HOST`, `SMPT_AUTH_USER`, `SMPT_AUTH_PASS`, `SMPT_SENDER` | Envío del código OTP por email   |
| `BLOB_READ_WRITE_TOKEN`                                        | Subida de avatares (Vercel Blob) |

## Comandos

- `bun run dev` — servidor de desarrollo.
- `bun run check` — type-check (`svelte-check`).
- `bun run lint` / `bun run format` — comprobar / aplicar formato y lint (Prettier + ESLint).
- `bun run test` — tests unitarios (Vitest).
- `bun run only-build` — build de producción **sin** tocar la base de datos. Úsalo para verificar
  localmente.
- `bun run build` — build real de despliegue: aplica migraciones pendientes contra la base de datos
  de `DATABASE_URL` (`prisma migrate deploy`). **No lo ejecutes en local** salvo que sepas contra qué
  base de datos estás apuntando.
- `bun run db:seed-activities` — puebla actividades de ejemplo.

## Despliegue

Vercel, mediante `@sveltejs/adapter-vercel`. El pipeline de CI/CD ejecuta `bun run build`, que aplica
las migraciones de `prisma/migrations/` contra `DATABASE_URL` antes de compilar. Revisa siempre el
SQL de una migración nueva antes de fusionarla, y aplícala primero contra una base de datos de
staging si toca datos existentes.

## Más documentación

[AGENTS.md](./AGENTS.md) — guía extendida (pensada para agentes de IA, pero útil para cualquiera):
estructura del código, modelo de dominio, convenciones y consideraciones de seguridad.
