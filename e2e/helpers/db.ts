import { PrismaClient } from '@prisma/client';
import { loadTestEnv } from './env';

// Cliente Prisma propio para los tests: el de la app ($lib/server/db) usa la
// extensión de Accelerate y depende de $app/environment, así que aquí se
// instancia un PrismaClient normal apuntando a la BD de test.
const testEnv = loadTestEnv();

export const prisma = new PrismaClient({
	datasources: {
		db: {
			url: process.env.DATABASE_URL ?? testEnv.DATABASE_URL
		}
	}
});
