import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import { dev } from '$app/environment';

const createAcceleratedClient = () => new PrismaClient().$extends(withAccelerate());

// El tipo público del cliente es siempre el del cliente con Accelerate: las
// queries no cambian entre ambos runtimes, solo difiere el transporte. Sin
// esta anotación explícita, el condicional de createPrismaClient produciría
// una unión de tipos y todas las llamadas a prisma.* dejarían de compilar
// (misma clase de problema que prisma/prisma#28580).
type PrismaClientWithExtensions = ReturnType<typeof createAcceleratedClient>;

function createPrismaClient(): PrismaClientWithExtensions {
	// Accelerate solo acepta URLs prisma:// (producción); con una URL
	// PostgreSQL normal (desarrollo local, tests E2E) el cliente va directo
	// contra la base de datos.
	const url = process.env.DATABASE_URL ?? '';
	if (url.startsWith('prisma://') || url.startsWith('prisma+postgres://')) {
		return createAcceleratedClient();
	}
	return new PrismaClient() as unknown as PrismaClientWithExtensions;
}

// Sin esto, cada recarga en caliente de `bun run dev` reevalúa este módulo y
// crea otro PrismaClient (y otro pool de conexiones) sobre el anterior (D5).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClientWithExtensions };

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (dev) {
	globalForPrisma.prisma = prisma;
}

export default prisma;
