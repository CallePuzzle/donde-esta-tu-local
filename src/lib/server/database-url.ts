// Resolución de la URL de conexión a PostgreSQL, compartida por todo lo que
// habla con la base de datos fuera de la app: `prisma.config.ts` (migraciones)
// y los scripts de `prisma/seed-*.ts`.
//
// `DATABASE_URL` puede ser una URL de Accelerate (`prisma+postgres://…`), que
// solo entiende el cliente de Prisma: ni el adapter de node-pg ni el motor de
// migraciones saben conectarse con ella. Por eso, para todo lo que necesita
// conexión directa manda `DIRECT_DATABASE_URL`, y `DATABASE_URL` solo sirve de
// fallback cuando ya es una URL directa (desarrollo local, tests E2E).

const ACCELERATE_PREFIXES = ['prisma://', 'prisma+postgres://'];

export function isAccelerateUrl(url: string): boolean {
	return ACCELERATE_PREFIXES.some((prefix) => url.startsWith(prefix));
}

/** URL de conexión directa, o `undefined` si no hay ninguna utilizable. */
export function resolveDirectDatabaseUrl(): string | undefined {
	const direct = process.env.DIRECT_DATABASE_URL;
	if (direct) {
		return direct;
	}
	const fallback = process.env.DATABASE_URL;
	if (fallback && !isAccelerateUrl(fallback)) {
		return fallback;
	}
	return undefined;
}

/** Igual que `resolveDirectDatabaseUrl`, pero falla con un mensaje claro. */
export function requireDirectDatabaseUrl(): string {
	const url = resolveDirectDatabaseUrl();
	if (!url) {
		throw new Error(
			'Falta una URL de conexión directa a PostgreSQL: define DIRECT_DATABASE_URL ' +
				'(DATABASE_URL solo vale de fallback si no es una URL de Accelerate, ' +
				'prisma:// o prisma+postgres://). Ver .env.example.'
		);
	}
	return url;
}
