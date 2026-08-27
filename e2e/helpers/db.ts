import { PrismaClient } from '$lib/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { loadTestEnv } from './env';

// Cliente Prisma propio para los tests: el de la app ($lib/server/db) depende
// de $app/environment, así que aquí se instancia un PrismaClient directo
// apuntando a la BD de test mediante el adapter de node-pg.
const testEnv = loadTestEnv();
const connectionString = process.env.DATABASE_URL ?? testEnv.DATABASE_URL;
if (!connectionString) {
	throw new Error('DATABASE_URL no está definida');
}

export const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString })
});
