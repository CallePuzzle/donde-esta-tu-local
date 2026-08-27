import { PrismaClient } from '$lib/generated/prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import { PrismaPg } from '@prisma/adapter-pg';
import { dev } from '$app/environment';

// El tipo público del cliente es el del PrismaClient base: la extensión de
// Accelerate (v3) no propaga correctamente los tipos de resultados con
// relaciones incluidas (prisma/prisma#28580). En runtime sí se aplica la
// extensión; en tipos nos quedamos con el cliente base.
type PrismaClientWithExtensions = PrismaClient;

function createPrismaClient(): PrismaClientWithExtensions {
	// Accelerate solo acepta URLs prisma:// (producción); con una URL
	// PostgreSQL normal (desarrollo local, tests E2E) el cliente va directo
	// contra la base de datos mediante el adapter de node-pg.
	const url = process.env.DATABASE_URL ?? '';
	if (url.startsWith('prisma://') || url.startsWith('prisma+postgres://')) {
		return new PrismaClient({ accelerateUrl: url }).$extends(
			withAccelerate()
		) as unknown as PrismaClientWithExtensions;
	}
	const adapter = new PrismaPg({ connectionString: url });
	return new PrismaClient({ adapter });
}

// Sin esto, cada recarga en caliente de `bun run dev` reevalúa este módulo y
// crea otro PrismaClient (y otro pool de conexiones) sobre el anterior (D5).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClientWithExtensions };

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (dev) {
	globalForPrisma.prisma = prisma;
}

export default prisma;
