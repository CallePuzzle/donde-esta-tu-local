# Aplicación de las migraciones pendientes del plan hawkgirl-cyborg-supergirl-nightwing

> Documenta el procedimiento seguido para aplicar, contra la base de datos de **staging**, las 5
> migraciones que quedaron pendientes al cerrar
> [`docs/plans/hawkgirl-cyborg-supergirl-nightwing.md`](./plans/hawkgirl-cyborg-supergirl-nightwing.md).
> **Aplicado en staging el 2026-08-06. Pendiente de repetir contra producción** (ver el último
> apartado).

## Migraciones aplicadas, en orden

| #   | Migración                                      | Tarea | Qué hace                                                                                                   |
| --- | ---------------------------------------------- | ----- | ---------------------------------------------------------------------------------------------------------- |
| 1   | `20260805160000_drop_email_sent`               | S9    | `DROP TABLE email_sent`                                                                                    |
| 2   | `20260805161000_gang_normalized_name_unique`   | B2    | Añade `Gang.normalizedName` (backfill desde `name`) con `@@unique`                                         |
| 3   | `20260805162000_gang_history_changed_by_index` | B3    | Índice en `gang_history.changedByUserId`                                                                   |
| 4   | `20260805163000_missing_fk_and_status_indexes` | D1    | Índices en `user.gangId`, `user.membershipGangStatus`, `gang.status`                                       |
| 5   | `20260805164000_status_fields_to_enums`        | D3    | Convierte `membershipGangStatus`, `Gang.status` y `GangHistory.changeType` de `String` a enums de Postgres |

## 0. Prerrequisito: `directUrl` en el datasource

`DATABASE_URL` es una URL de Prisma Accelerate (pooler/cache), no válida para ejecutar DDL. Se
añadió `directUrl` al datasource de `prisma/schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")
}
```

`DIRECT_DATABASE_URL` se añadió a `.env` (no commiteado) con la conexión directa a Postgres. Los
comandos `prisma migrate *` usan `directUrl` automáticamente; el resto de la app sigue usando
`DATABASE_URL` (Accelerate) sin cambios. Tras el cambio: `bun x prisma format` +
`bun x prisma generate --no-engine`.

## 1. Backup

```fish
set -gx DIRECT_DATABASE_URL (grep "^DIRECT_DATABASE_URL=" .env | cut -d= -f2-)
pg_dump "$DIRECT_DATABASE_URL" -f backup_pre_migraciones_(date +%Y%m%d).sql
```

Nota: `pg_dump` no lee `.env` (no es un comando de Prisma), por eso hace falta exportar la variable
a mano para ese único comando.

## 2. Comprobar qué falta por aplicar (solo lectura)

```sh
bun x prisma migrate status
```

Confirmó las 5 migraciones pendientes, en el orden de la tabla de arriba, contra
`db.prisma.io:5432` (staging).

## 3. Chequeos previos (solo lectura)

Dos de las cinco migraciones pueden fallar si los datos existentes no encajan con la nueva
restricción/tipo:

**B2 — nombres de peña duplicados salvo mayúsculas/minúsculas:**

```sql
SELECT lower(name), count(*) FROM gang GROUP BY lower(name) HAVING count(*) > 1;
```

Resultado: 0 filas. Sin duplicados.

**D3 — valores fuera de los enums nuevos:**

```sql
SELECT DISTINCT "membershipGangStatus" FROM "user"
  WHERE "membershipGangStatus" NOT IN ('PENDING','VALIDATED','REFUSED');
SELECT DISTINCT status FROM gang
  WHERE status NOT IN ('PENDING','VALIDATED','REFUSED');
SELECT DISTINCT "changeType" FROM gang_history
  WHERE "changeType" NOT IN ('CREATE','UPDATE');
```

Resultado: 0 filas en las tres. Sin valores fuera de rango.

## 4. Aplicar

```sh
bun x prisma migrate deploy
```

Las 5 migraciones se aplicaron sin errores (`All migrations have been successfully applied.`).

## 5. Verificación posterior

- `bun x prisma migrate status` → `Database schema is up to date!`.
- `bun x prisma generate --no-engine` → cliente regenerado.
- `bun run check` / `bun run lint` / `bun run test` / `bun run only-build` → todo en verde (0
  errores, 0 warnings, 47 tests, build ok) con el cliente ya regenerado contra el nuevo schema.
- Inspección directa de staging:
  - `\d gang` → `status` es `"GangStatus"` (enum), `normalizedName` `NOT NULL` con índice único,
    índice en `status`.
  - `normalizedName` backfilleado correctamente (`KPY` → `kpy`, `La Peña` → `la peña`, etc.).
  - `\dt email_sent` → tabla eliminada.

## 6. Pendiente: aplicar en producción

Este procedimiento se ejecutó contra **staging**. Para producción, repetir exactamente los pasos
1-5 apuntando `DIRECT_DATABASE_URL` (y `DATABASE_URL` si procede) a la base de datos de producción.
Los chequeos previos del paso 3 hay que volver a lanzarlos ahí — el hecho de que staging esté limpio
no garantiza que producción lo esté también.

Si el despliegue a producción se hace vía Vercel con `bun run build`
(`prisma generate --no-engine && prisma migrate deploy && vite build`), basta con que
`DIRECT_DATABASE_URL` esté configurada como variable de entorno en Vercel: las migraciones se
aplicarán solas en el próximo deploy. Aun así, es recomendable lanzar el paso 3 (chequeos) a mano
contra producción antes de ese deploy, ya que un fallo a mitad de `migrate deploy` en el pipeline de
CI es más incómodo de diagnosticar que uno interactivo.
