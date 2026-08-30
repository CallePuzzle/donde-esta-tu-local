# Migración a Prisma 7

> Plan de migración de Prisma 6.19 → 7.x. Hoy el bump está aplazado a conciencia
> (ver `AGENTS.md`): Prisma 7 no es un simple bump, exige nuevo generador,
> `prisma.config.ts`, driver adapters obligatorios y revisar la compatibilidad
> con `@prisma/extension-accelerate` (problema de tipos original:
> [prisma/prisma#28580](https://github.com/prisma/prisma/issues/28580)).
>
> Referencia principal: [guía oficial de actualización a Prisma 7](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7).

## Por qué es una migración y no un bump

Cambios rupturistas de Prisma 7 que nos afectan directamente:

1. **Nuevo generador `prisma-client`** (Rust-free): `prisma-client-js` está en
   vías de eliminación y `output` es ahora **obligatorio** — el cliente ya no se
   genera en `node_modules/@prisma/client`, así que **todos los imports
   `from '@prisma/client'` del repo dejan de ser válidos**.
2. **`datasource.url` / `directUrl` eliminados del schema**: se configuran en el
   nuevo `prisma.config.ts` (raíz del proyecto).
3. **Driver adapter obligatorio** para instanciar `PrismaClient` contra
   PostgreSQL directo (`@prisma/adapter-pg`). La URL de Accelerate
   (`prisma://...`) **no** va al adapter: va como `accelerateUrl` en el
   constructor + extensión `withAccelerate()`.
4. **`previewFeatures = ["driverAdapters"]` sobra**: los adapters ya son GA.
5. **`prisma generate --no-engine` desaparece**: el cliente nuevo no tiene motor
   Rust que omitir; esto simplifica el build y los E2E (ver abajo).
6. **Las variables de entorno ya no se cargan solas** en la CLI: con bun no hay
   que hacer nada (bun carga `.env` automáticamente), pero `prisma.config.ts`
   debe usar `env()` de `prisma/config` y los scripts que pasan `env` a mano
   (E2E) siguen funcionando igual.
7. **SSL con `node-pg`**: al ir contra PostgreSQL directo con adapter-pg cambian
   los defaults de validación de certificados (posible error P1010). En
   producción usamos Accelerate (no afecta); en dev/test es PostgreSQL local en
   docker sin SSL (no afecta). Solo relevante si algún día se conecta el adapter
   a una BD remota con SSL autofirmado → `ssl: { rejectUnauthorized: false }` o
   CA configurada.
8. **`migrate dev`/`db push` ya no regeneran el cliente ni siembran solos**:
   hay que correr `prisma generate` y `prisma db seed` explícitamente.

Prerequisitos (ya cumplidos, verificar al ejecutar): Node ≥ 20.19,
TypeScript ≥ 5.4, `package.json` con `"type": "module"` (ya lo tiene),
`moduleResolution: "bundler"` (ya lo tiene).

## Inventario de puntos afectados

### Instancias de `PrismaClient` (runtime)

- `src/lib/server/db.ts` — cliente único de la app: hoy condicional
  Accelerate (`prisma://`) vs directo, con singleton en `globalThis` y el
  workaround de tipos `PrismaClientWithExtensions`.
- `e2e/helpers/db.ts` — cliente directo a la BD de test con
  `datasources.db.url`.
- `prisma/seed-activities.ts`, `prisma/seed-clear-activities.ts` — cliente
  directo propio.
- `e2e/global-setup.ts` — regenera el cliente "con motor" porque el build lo
  genera con `--no-engine`; en v7 este workaround entero desaparece.

### Imports de tipos/valores desde `@prisma/client`

`Prisma` (namespace): `src/routes/gang/add/+page.server.ts`,
`src/routes/gang/[slug]/update/+page.server.ts`, `prisma/seed-activity.ts`.
Tipos (`Gang`, `User`, `Activity`, `GangStatus`, `MembershipGangStatus`):
`src/routes/+page.svelte`, `src/routes/profile/type.ts`,
`src/routes/gang/[slug]/type.ts`, `src/lib/components/ActivityCard.svelte`,
`src/lib/server/membership.test.ts`, `e2e/helpers/seed.ts`,
`e2e/helpers/auth.ts`.

### Configuración y scripts

- `prisma/schema.prisma` — bloque `generator` y `datasource`.
- `package.json` — versiones, script `build` (`prisma generate --no-engine && ...`).
- Nuevo fichero `prisma.config.ts` en la raíz.
- `.gitignore` / `.prettierignore` — cubrir el directorio del cliente generado.

## Plan paso a paso

### 0. Preparación

- Confirmar en el entorno de ejecución: `node --version` ≥ 20.19 (y la versión
  configurada en Vercel).
- Comprobar compatibilidad de `better-auth` (`prismaAdapter`) con el cliente de
  Prisma 7: el adapter recibe la instancia de `PrismaClient`; verificar que los
  tipos del cliente generado nuevo casan (better-auth ≥ la versión que declare
  soporte de Prisma 7). **Si no casa, la migración se para aquí.**
- Verificar el estado de `@prisma/extension-accelerate` compatible con v7 y si
  el problema de tipos de prisma/prisma#28580 está resuelto en la línea 7.x (en
  v7 el constructor acepta `accelerateUrl`, lo que debería eliminar el cast
  `as unknown as` de `db.ts`).

### 1. Dependencias

```
bun add @prisma/client@7 @prisma/adapter-pg
bun add --dev prisma@7
```

- Actualizar `@prisma/extension-accelerate` a la versión compatible con v7.
- Tras instalar: `bun audit` (objetivo 0) y revisar si algún `override` de
  `package.json` queda obsoleto o hay que ajustarlo.

### 2. `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/lib/generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

- Sin `previewFeatures` (driverAdapters ya es GA).
- Sin `url`/`directUrl` en el datasource (van a `prisma.config.ts`).
- Añadir `src/lib/generated/` a `.gitignore` y a `.prettierignore` (mismo
  criterio que `src/lib/paraglide/`).

### 3. Nuevo `prisma.config.ts` (raíz)

```ts
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
	schema: 'prisma/schema.prisma',
	migrations: {
		path: 'prisma/migrations'
	},
	datasource: {
		// Las migraciones necesitan conexión directa: con Accelerate en
		// DATABASE_URL, DIRECT_DATABASE_URL es la que manda aquí.
		url: env('DIRECT_DATABASE_URL')
	}
});
```

- Decisión a tomar al implementar: si en algún entorno `DIRECT_DATABASE_URL` no
  existe y `DATABASE_URL` ya es directa, valorar fallback
  (`process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL`) en vez de
  `env()` estricto.
- No hace falta `import 'dotenv/config'`: bun carga `.env` solo.

### 4. `src/lib/server/db.ts`

Reescribir la creación del cliente:

- Import desde la ruta generada:
  `import { PrismaClient } from '$lib/generated/prisma/client'` (o relativa,
  según lo que soporte el alias `$lib` con el output elegido).
- Rama Accelerate (`DATABASE_URL` empieza por `prisma://` /
  `prisma+postgres://`):
  ```ts
  new PrismaClient({ accelerateUrl: url }).$extends(withAccelerate());
  ```
- Rama directa:
  ```ts
  import { PrismaPg } from '@prisma/adapter-pg';
  new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
  ```
- Mantener el singleton en `globalThis` (D5) y la anotación de tipo explícita
  si la unión de ramas sigue siendo necesaria; si v7 resuelve el tipado de
  `withAccelerate`, simplificar y borrar el comentario que referencia
  prisma#28580.

### 5. Clientes auxiliares (seeds y E2E)

- `prisma/seed-activities.ts`, `prisma/seed-clear-activities.ts`,
  `e2e/helpers/db.ts`: instanciar con `PrismaPg` + `connectionString`
  (en `e2e/helpers/db.ts` sustituye al actual `datasources.db.url`).
- `prisma/seed-activity.ts`: solo importa tipos → actualizar la ruta de import.

### 6. Imports de tipos en el resto del repo

- Sustituir todos los `from '@prisma/client'` listados en el inventario por la
  ruta del cliente generado. En v7 los enums se exportan con los nombres del
  schema (comportamiento igual que v6), así que `GangStatus` /
  `MembershipGangStatus` no deberían necesitar cambios de uso.
- Ojo con `Prisma` namespace en `gang/add/+page.server.ts` y
  `gang/[slug]/update/+page.server.ts`: confirmar que el generador nuevo sigue
  exportando el namespace `Prisma` con los tipos de input que se usan.

### 7. Scripts y E2E

- `package.json` → `build`: quitar `--no-engine`
  (`prisma generate && prisma migrate deploy && vite build`).
- `e2e/global-setup.ts`: eliminar la regeneración "con motor" (ya no hay motor);
  queda solo el bucle de `prisma migrate deploy` con reintentos. Actualizar el
  comentario de cabecera.
- Verificar que `bunx prisma migrate deploy` dentro de Playwright sigue
  resolviendo `DATABASE_URL` de `.env.test` vía el `env` que ya se pasa a
  `execSync` + `prisma.config.ts`.

### 8. Verificación (en este orden)

1. `bun run check`
2. `bun run lint` (y `bun run format` si el cliente generado ensucia prettier)
3. `bun run test` (Vitest; `membership.test.ts` importa tipos de Prisma)
4. `bun run only-build`
5. `bun run test:e2e` completo (levanta postgres-test con docker compose)
6. Fumiga en dev: `bun run dev` y login OTP contra la BD real de desarrollo.

### 9. Documentación y cierre

- Actualizar `AGENTS.md`: quitar el párrafo de "Prisma 7 está deliberadamente
  aplazado", describir el nuevo montaje (generador `prisma-client` con output
  en `src/lib/generated/prisma`, `prisma.config.ts`, adapter-pg para conexión
  directa, `accelerateUrl` para producción) y el nuevo script `build`.
- Actualizar `.env.example` si cambia la semántica de `DIRECT_DATABASE_URL`.
- Commit en inglés, Conventional Commits:
  `chore(deps): migrate to prisma 7`.

## Riesgos y preguntas abiertas

- **better-auth**: si `prismaAdapter` no acepta el cliente de v7, bloquea toda
  la migración. Es la primera cosa a verificar.
- **Tipado de `withAccelerate`**: si el problema de prisma#28580 persiste en
  v7, mantener el patrón actual de tipo explícito en `db.ts`.
- **Alias `$lib` para el cliente generado**: si el output dentro de `src/lib`
  da problemas con svelte-check o con el bundler, alternativa: generar en
  `prisma/generated/` e importar con ruta relativa (menos limpio en
  componentes cliente; los tipos se importan también desde `.svelte`).
- **Vercel**: confirmar que la versión de Node del proyecto en Vercel ≥ 20.19 y
  que `prisma migrate deploy` en el build sigue teniendo red a la BD directa.
- **Overrides de `package.json`**: revisar tras el bump (`bun audit`).

## Fuera de alcance

- No se toca el modelo de datos ni las migraciones existentes.
- No se aprovecha para subir TypeScript a 7 (aplazado por
  `svelte-check`/`typescript-eslint`, ver `AGENTS.md`).
