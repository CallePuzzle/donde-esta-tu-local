import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getPrismaClient } from '$lib/tests/clientForTest';
import type { User, Gang } from '@prisma/client';

const prisma = await getPrismaClient();

describe('Prisma Tests', () => {
	let userLocal: User;
	let userAdmin: User;
	let gang1: Gang;
	let gang2: Gang;

	beforeAll(async () => {
		userLocal = (await prisma.user.findUnique({
			where: { id: 'user|local' }
		})) as User;
		userAdmin = (await prisma.user.findUnique({
			where: { id: 'admin|local' }
		})) as User;
		gang1 = (await prisma.gang.findFirst({
			where: { name: 'Gang 1' }
		})) as Gang;
		gang2 = (await prisma.gang.findFirst({
			where: { name: 'Gang 2' }
		})) as Gang;
	});

	afterAll(async () => {
		await prisma.$disconnect();
	});

	it('gang1 should be a gang', async () => {
		expect(gang1).toHaveProperty('id');
		expect(gang1).toHaveProperty('name');
		expect(gang1.name).toBe('Gang 1');
		expect(gang1).toHaveProperty('latitude');
		expect(gang1).toHaveProperty('longitude');
	});

	it('gang2 should be a gang', async () => {
		expect(gang2).toHaveProperty('id');
		expect(gang2).toHaveProperty('name');
		expect(gang2.name).toBe('Gang 2');
		expect(gang2).toHaveProperty('latitude');
		expect(gang2).toHaveProperty('longitude');
		expect(gang2).toHaveProperty('status');
		expect(gang2.status).toBe('VALIDATED');
	});

	it('userLocal should be a user', async () => {
		expect(userLocal).toHaveProperty('id');
		expect(userLocal).toHaveProperty('name');
		expect(userLocal.name).toBe('User Local');
		expect(userLocal).toHaveProperty('role');
		expect(userLocal.role).toBe('USER');
		expect(userLocal).toHaveProperty('gangId');
		expect(userLocal.gangId).toBe(gang1.id);
	});

	it('userAdmin should be a user', async () => {
		expect(userAdmin).toHaveProperty('id');
		expect(userAdmin).toHaveProperty('name');
		expect(userAdmin.name).toBe('Admin Local');
		expect(userAdmin).toHaveProperty('role');
		expect(userAdmin.role).toBe('ADMIN');
	});
});
