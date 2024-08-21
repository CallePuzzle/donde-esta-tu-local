import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import { PrismaClient } from '@prisma/client';

import { promises as fs } from 'fs';
import path from 'path';

let prisma: PrismaClient;

describe('Prisma Tests', () => {
	beforeAll(async () => {
		const sqlite = await findSqliteFile('.wrangler/state/v3/d1/miniflare-D1DatabaseObject');
		process.env.DATABASE_URL = 'file:' + sqlite;
		console.log('DATABASE_URL:', process.env.DATABASE_URL);
		prisma = new PrismaClient();
	});

	afterAll(async () => {
		await prisma.$disconnect();
	});

	it('debería crear un nuevo usuario', async () => {
		expect(user).toHaveProperty('id');
		expect(user.name).toBe('Test User');
	});
});
