import { defineConfig } from 'prisma/config';

import { resolveDirectDatabaseUrl } from './src/lib/server/database-url';

// Las migraciones necesitan conexión directa a PostgreSQL: con Accelerate en
// DATABASE_URL manda DIRECT_DATABASE_URL (ver database-url.ts).
const url = resolveDirectDatabaseUrl();

export default defineConfig({
	schema: 'prisma/schema.prisma',
	migrations: {
		path: 'prisma/migrations'
	},
	// Sin URL no declaramos `datasource` en vez de pasar una cadena vacía: así
	// `prisma generate` (que corre en el postinstall, donde puede no haber
	// variables de entorno) sigue funcionando, y los comandos que sí la
	// necesitan fallan con el mensaje de Prisma ("The datasource.url property
	// is required…") en lugar de con un "Connection url is empty" opaco.
	...(url ? { datasource: { url } } : {})
});
