import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import { dev } from '$app/environment';

function createPrismaClient() {
	return new PrismaClient().$extends(withAccelerate());
}

type PrismaClientWithExtensions = ReturnType<typeof createPrismaClient>;

// Sin esto, cada recarga en caliente de `bun run dev` reevalúa este módulo y
// crea otro PrismaClient (y otro pool de conexiones) sobre el anterior (D5).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClientWithExtensions };

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (dev) {
	globalForPrisma.prisma = prisma;
}

export default prisma;
