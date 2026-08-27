import { defineConfig } from 'prisma/config';

// Las migraciones necesitan conexión directa a PostgreSQL: con Accelerate en
// DATABASE_URL, DIRECT_DATABASE_URL es la que manda aquí. Si no está definida
// y DATABASE_URL ya es una URL directa, se usa como fallback.
const directUrl = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;

export default defineConfig({
	schema: 'prisma/schema.prisma',
	migrations: {
		path: 'prisma/migrations'
	},
	datasource: {
		url: directUrl ?? ''
	}
});
