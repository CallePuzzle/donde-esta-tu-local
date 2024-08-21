import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getPrismaClient } from '$lib/tests/clientForTest';
import type { User, Gang } from '@prisma/client';
import { TestAddGang } from './+page.server';

const prisma = await getPrismaClient();

describe('Prisma Tests', () => {
	let userLocal: User;
	let userAdmin: User;
	let gang1: Gang;
	let gang2: Gang;
    let form: any;

	beforeAll(async () => {
		form = await TestAddGang(prisma, 'user|local', 'Gang addGang', '41.50855419665639', '-4.46047229590312');
	});

	afterAll(async () => {
        // Remove the gang
        const gangsToDelete = await prisma.gang.findMany({
            where: { name: 'Gang addGang' }
        });
        if (gangsToDelete) {
            for (const gangToDelete of gangsToDelete) {
                await prisma.gang.delete({
                    where: { id: gangToDelete.id }
                });
            }
        }
		await prisma.$disconnect();
	});

	it('form has success', async () => {
        expect(form).toHaveProperty('success');
        expect(form.success).toBe(true);
    });
});
