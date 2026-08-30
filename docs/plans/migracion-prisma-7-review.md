# Revisión de la migración a Prisma 7

> Code review del diff `origin/106-notificaciones-de-las-actividades..HEAD`
> (rama `143-prisma-7`). Fecha: 2026-08-27. Plan original:
> [migracion-prisma-7.md](./migracion-prisma-7.md).

## Veredicto

La migración es **correcta y está bien ejecutada**. No hay nada bloqueante;
el único cambio recomendado antes de mergear es el del script `prepare`
(hallazgo 1).

## Verificación ejecutada

| Comando              | Resultado                                         |
| -------------------- | ------------------------------------------------- |
| `bun run check`      | 0 errores, 0 warnings                             |
| `bun run lint`       | Prettier + ESLint limpios                         |
| `bun run test`       | 93/93 tests (13 ficheros)                         |
| `bun run only-build` | build correcto                                    |
| `bun audit`          | 0 vulnerabilidades                                |
| `bun run test:e2e`   | **24/24 en verde** (Chromium, PostgreSQL de test) |

Los E2E son la validación fuerte: ejercitan el adapter `@prisma/adapter-pg`
contra PostgreSQL real y confirman la compatibilidad de better-auth con el
cliente de v7 (su peer dependency ya admite `@prisma/client ^5 || ^6 || ^7`,
ver `node_modules/better-auth/package.json`).

## Puntos bien resueltos

- Todos los imports de `@prisma/client` migrados a
  `$lib/generated/prisma/client`; no queda ninguno en `src/`, `e2e/` ni
  `prisma/` (las únicas menciones restantes son comentarios en
  `src/lib/server/membership.ts` y `src/lib/utils/roles.ts`, y el paquete en
  sí como peer de better-auth).
- `prisma.config.ts` con fallback
  `process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL` — mejor que el
  `env()` estricto que proponía el plan, porque cubre entornos sin
  `DIRECT_DATABASE_URL` donde `DATABASE_URL` ya es directa.
- Correcta eliminación del workaround `--no-engine` del script `build` y de la
  regeneración "con motor" de `e2e/global-setup.ts`: el generador
  `prisma-client` de v7 no tiene engine que omitir.
- `src/lib/generated/` añadido a `.gitignore`, `.prettierignore` y a los
  `ignores` de `eslint.config.js`, coherente con el criterio ya aplicado a
  `src/lib/paraglide/`.
- `AGENTS.md` y `.env.example` actualizados acorde al cambio.
- Los overrides nuevos de `package.json` (`deepmerge-ts`, `nanoid`) dejan
  `bun audit` a 0.

## Hallazgos

### 1. El cliente generado no se regenera en un clone limpio (acción recomendada)

`src/lib/generated/` está gitignored, `@prisma/client` v7 ya **no** trae
postinstall que genere el cliente (confirmado en su `package.json`: solo
scripts de desarrollo) y el script `prepare` del proyecto solo hace
`svelte-kit sync`. Consecuencia: en un checkout fresco,
`bun install && bun run dev/check/test/test:e2e` fallan con imports
irresolubles de `$lib/generated/prisma/client` hasta ejecutar
`prisma generate` a mano. En Vercel no ocurre porque `build` ya incluye
`prisma generate`.

**Sugerencia**: `"prepare": "svelte-kit sync && prisma generate"`
(o documentar el paso en AGENTS.md/README).

### 2. `withAccelerate()` es redundante en v7 (opcional)

En `src/lib/server/db.ts:17` se combina `accelerateUrl` en el constructor con
`.$extends(withAccelerate())`. Con `accelerateUrl`, la extensión ya no hace
falta: el README de `@prisma/extension-accelerate` v3 muestra `cacheStrategy`
(`ttl`/`swr`) funcionando sin `$extends`. Quitarla permitiría eliminar el cast
`as unknown as` y el alias `PrismaClientWithExtensions` (que hoy existe por
prisma/prisma#28580).

No es un bug y la rama Accelerate no se puede probar en local (solo aplica a
producción), así que es seguro dejarlo como está; si se toca, verificar en
producción.

### 3. Menores

- `prisma.config.ts:16` — el `?? ''` traga la misconfiguración: sin
  `DIRECT_DATABASE_URL` ni `DATABASE_URL`, `prisma migrate` fallará con un
  error de conexión críptico en vez de un mensaje claro de "falta variable".
- Seeds y `.env` — los scripts `prisma/seed-*.ts` leen
  `process.env.DATABASE_URL` y lanzan error si falta. Funcionan vía
  `bun run db:seed-*` (bun carga `.env` y lo inyecta al proceso hijo `tsx`),
  pero `tsx prisma/seed-activities.ts` directo —como lo describe AGENTS.md—
  ahora falla con `DATABASE_URL no está definida`. Matiz de documentación.
- `AGENTS.md` no menciona los nuevos overrides `deepmerge-ts` y `nanoid` en la
  lista de overrides documentada (cumplen su función —audit a 0—, solo falta
  la mención).
- `src/lib/server/db.ts` — si `DATABASE_URL` no está definida, la rama directa
  crea `PrismaPg` con `connectionString: ''` y `node-pg` cae a los defaults
  `PG*`/localhost; antes Prisma lanzaba un error más claro. Caso marginal.

## Nota fuera de la migración

La rama arrastra un commit de feature ajeno a la migración (`e63f90b`,
lightbox de foto de miembro en `MemberDetail.svelte` + las claves
`member_image_alt`/`member_image_view` de `messages/es.json`). Aparece en este
diff porque no está en `origin/106-notificaciones-de-las-actividades`; no es
un defecto, pero conviene saberlo al mergear.

## Segunda revisión (independiente)

> Revisión adicional del mismo diff, 2026-08-27. Coincide con el veredicto
> general (la migración funciona: mismos resultados de `check`, `test`,
> `only-build`, `audit` y **24/24 E2E**) y con los hallazgos 1, 2 y 3. Lo que
> sigue es lo que añade o matiza.

### A. Los seeds rompen con Accelerate en `DATABASE_URL` (nuevo, real)

El hallazgo 3 lo describe como "matiz de documentación", pero hay un fallo de
verdad. `prisma/seed-activities.ts`, `seed-clear-activities.ts` y
`seed-test-notifications.ts` pasan `DATABASE_URL` a
`PrismaPg({ connectionString })`, y en el `.env` de este proyecto
`DATABASE_URL` es una URL de Accelerate (`prisma+postgres://...`). Verificado:
`PrismaPg` con esa URL falla la query (`Invalid prisma.gang.count() invocation`),
porque `node-pg` no entiende ese esquema. Antes los seeds usaban
`new PrismaClient()` y la URL la resolvía el datasource del esquema.

Es la misma razón por la que `prisma.config.ts` usa `DIRECT_DATABASE_URL`: los
seeds necesitan idéntica resolución (`DIRECT_DATABASE_URL ?? DATABASE_URL`),
idealmente en un helper compartido con el config en vez de tres copias del
`throw`.

### B. Prisma 7 no carga `.env` al evaluar `prisma.config.ts` (nuevo)

Refuerza el hallazgo 3 sobre `?? ''`. Comprobado en un directorio aislado con
un `prisma.config.ts` que imprime `process.env`: ejecutando el CLI con `node`
la variable sale `undefined`; con `bun`, `"cargado_desde_dotenv"`. Es decir,
que hoy funcione depende de que bun inyecte `.env` en `bun run`/`bunx`, no de
Prisma. Con `npx`/`node`/un CI sin variables exportadas, `datasource.url` queda
`''` y el fallo aparece como error de conexión. Un `throw` explícito nombrando
la variable que falta cierra tanto este caso como el de `db.ts`.

### C. El fix propuesto para el hallazgo 1 pierde el guard actual

`"prepare": "svelte-kit sync && prisma generate"` cambia la semántica del
script: hoy es `svelte-kit sync || echo ''` precisamente para que un `sync`
fallido no rompa el install, y con `&&` además `prisma generate` no llegaría a
ejecutarse. Mejor dejar `prepare` como está y añadir un script aparte:

```json
"postinstall": "prisma generate",
```

Confirmado el impacto moviendo `src/lib/generated/` fuera: `only-build` falla
con `[UNLOADABLE_DEPENDENCY] Could not load src/lib/generated/prisma/client` y
`bun run test` con `Cannot find module '$lib/generated/prisma/client'`
(1 suite, 77/93 tests). `prisma generate` no necesita base de datos, así que en
`postinstall` es seguro.

### D. `withAccelerate()` se puede quitar con más confianza que "opcional"

El hallazgo 2 lo deja en el aire por no poder probar Accelerate en local, pero
hay un dato que lo decide: `cacheStrategy` y `$accelerate` **no se usan en
ningún sitio** (grep en `src/`, `e2e/`, `prisma/`; las dos únicas apariciones
de la extensión son el import y el `$extends` de `db.ts:2,19`). Sin esas dos
APIs la extensión no aporta nada sobre `accelerateUrl`, así que retirarla no
puede cambiar el comportamiento en producción, y a cambio desaparecen el
`as unknown as`, el alias `PrismaClientWithExtensions`, el comentario sobre
prisma/prisma#28580 y la dependencia `@prisma/extension-accelerate`:

```ts
function createPrismaClient(): PrismaClient {
	const url = process.env.DATABASE_URL ?? '';
	if (url.startsWith('prisma://') || url.startsWith('prisma+postgres://')) {
		return new PrismaClient({ accelerateUrl: url });
	}
	return new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
}
```

### E. `AGENTS.md` sigue con documentación obsoleta

"`AGENTS.md` actualizado acorde al cambio" es parcial: la línea 58 aún describe
`e2e/global-setup.ts` como "regenera el cliente Prisma **con** motor —el build
lo genera con `--no-engine`…—" y `helpers/db.ts` como "PrismaClient propio sin
Accelerate". Ambas cosas ya no son ciertas tras este diff.

### F. Los overrides nuevos están justificados (dato para el hallazgo 3)

Verificado en aislado con `bun audit` sobre `deepmerge-ts@7.1.5` y
`nanoid@3.3.16`: `GHSA-ggr8-5vv4-36mx` (high, deepmerge-ts <8, entra vía el pin
exacto `7.1.5` de `@prisma/config` 7.10) y `GHSA-2v37-7h3g-55p8` (high, nanoid
<3.3.18, vía `postcss`). Al documentarlos en `AGENTS.md` conviene anotar que el
de `deepmerge-ts` fuerza a `@prisma/config` fuera de su pin exacto — funciona
(`generate`, `migrate deploy` y los E2E pasan), pero es el tipo de override que
hay que revisar en cada bump de Prisma.

## Estado: hallazgos aplicados

Todos los puntos de ambas revisiones están corregidos en la rama. Resumen de lo
que cambió y de lo que se descubrió al arreglarlo.

| Hallazgo                                    | Estado | Cambio                                                                                                                                                 |
| ------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1 / C — cliente no generado en clone limpio | Hecho  | `"postinstall": "prisma generate"` (dejando `prepare` con su `\|\| echo ''`)                                                                           |
| 2 / D — `withAccelerate()` redundante       | Hecho  | Eliminada la extensión y la dependencia `@prisma/extension-accelerate`; fuera el cast y el alias `PrismaClientWithExtensions`                          |
| 3 / B — `?? ''` en `prisma.config.ts`       | Hecho  | `datasource` solo se declara si hay URL                                                                                                                |
| 3 — `PrismaPg` con `connectionString: ''`   | Hecho  | `db.ts` lee `$env/dynamic/private` y falla con "Falta DATABASE_URL"                                                                                    |
| 3 / A — seeds y `DATABASE_URL`              | Hecho  | Helper compartido + seeds ejecutados con el runtime de bun                                                                                             |
| 3 / F — overrides sin documentar            | Hecho  | `AGENTS.md` con `deepmerge-ts`/`nanoid` y el aviso del pin de `@prisma/config`                                                                         |
| E — `AGENTS.md` obsoleto                    | Hecho  | Reescritas las líneas de `global-setup.ts`, `helpers/db.ts`, acceso a datos y `bun outdated`                                                           |
| Comentarios que citaban `@prisma/client`    | Hecho  | `NavBarEnd.svelte`, `membership.ts`, `roles.ts` (y la mención de `app.d.ts` en `AGENTS.md`); ya no queda ninguna referencia fuera del cliente generado |

### Lo que apareció al arreglarlo

**`bun run <script>` no propaga el `.env` a procesos hijo de node.** Solo el
runtime de bun carga `.env`. Comprobado con un script temporal
(`node -e "…process.env.DATABASE_URL"` vía `bun run`): sale `false`. Tres
consecuencias que estaban latentes en la rama:

1. **Los seeds nunca veían el `.env`**, ni antes ni después de la migración: se
   lanzaban con `tsx` (hijo de node). La revisión anterior daba por hecho que
   bun se lo inyectaba; no es así. Ahora corren con `bun prisma/seed-*.ts`,
   que sí carga `.env`, y `tsx` deja de ser dependencia directa.
2. **`vite dev` y `vite build` tampoco ven el `.env`**, así que leer
   `process.env.DATABASE_URL` en `src/lib/server/db.ts` —como hacía la rama—
   solo funcionaba por accidente: antes de la migración era el cliente de
   Prisma 6 quien cargaba el `.env` a partir del `env("DATABASE_URL")` del
   esquema, y con los driver adapters de v7 ese paso desaparece. `db.ts` pasa a
   leer `$env/dynamic/private` (en dev el `.env` lo carga SvelteKit/Vite; en
   producción es el entorno real), dinámico y no estático para que el build no
   exija la variable. Además el cliente se crea de forma perezosa (`Proxy` sobre
   el primer acceso), porque `vite build` evalúa el módulo de servidor y
   construir no necesita base de datos. Validado con `bun run dev` contra la BD
   real (`/` y `/gang/15` a 200) y con los 24 E2E, que ejercitan better-auth
   sobre ese proxy.
3. **`bun run build` en local tampoco ve el `.env`** y falla en
   `prisma migrate deploy`. Ya era así antes (con `?? ''` el error era
   `Connection url is empty`); ahora al menos dice
   `The datasource.url property is required…`. Documentado en `AGENTS.md`
   junto a `bunx prisma migrate …` para migraciones locales.
4. **`bun run preview` estaba roto por lo mismo, y desde antes de la
   migración**: el servidor construido lee `process.env` directamente, así que
   better-auth arrancaba sin `BETTER_AUTH_SECRET`
   (`BetterAuthError: You are using the default secret`). Comprobado que falla
   igual con la rama tal cual estaba, antes de estos arreglos. El script pasa a
   ser `bunx --bun vite preview`, que corre bajo el runtime de bun y sí carga el
   `.env` (verificado: `/` y `/gang/15` a 200).

### Verificación tras los cambios

`bun run lint` limpio · `bun run check` 0 errores · `bun run test` 93/93 ·
`bun run only-build` correcto · `bun audit` 0 vulnerabilidades ·
`bun run test:e2e` **24/24**.
