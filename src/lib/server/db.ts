import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

export function initializePrisma(D1: D1Database) {
	const adapter = new PrismaD1(D1);
	return new PrismaClient({ adapter });
}