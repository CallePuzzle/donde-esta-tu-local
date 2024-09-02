import { describe, it, expect, beforeAll, afterAll, expectTypeOf } from 'vitest';
import { getPrismaClient } from '$lib/tests/clientForTest';
import type { User, Gang } from '@prisma/client';
import { TestAddGang } from './+page.server';

const prisma = await getPrismaClient();

describe('add new gang', () => {
	let form: any;
	const USER_LOCAL = 'user|local';
	const USER_ADMIN = 'admin|local';

	beforeAll(async () => {
		form = await TestAddGang(
			prisma,
			USER_LOCAL,
			'Gang addGang',
			'41.50855419665639',
			'-4.46047229590312'
		);
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

		// Remove notification from user|local
		const notificationsToDelete = await prisma.notification.findMany({
			where: { addedByUserId: USER_LOCAL }
		});
		if (notificationsToDelete) {
			for (const notificationToDelete of notificationsToDelete) {
				await prisma.notification.delete({
					where: { id: notificationToDelete.id }
				});
			}
		}
		await prisma.$disconnect();
	});

	it('form has success', async () => {
		expect(form).toHaveProperty('success');
		expect(form.success).toBe(true);
	});

	it('form has gang in data', async () => {
		expect(form).toHaveProperty('data');
		expect(form.data).toHaveProperty('name');
		// form.gang is tpype of Gang
		expectTypeOf(form.data).toEqualTypeOf<Gang>();
		expect(form.data.name).toBe('Gang addGang');
	});

	it('USER_ADMIN has a notification addedByUserId USER_LOCAL', async () => {
		const notifications = await prisma.notification.findMany({
			where: {
				title: 'Nueva peña',
				users: {
					some: {
						id: USER_ADMIN
					}
				},
				addedByUserId: USER_LOCAL
			}
		});
		expect(notifications.length).toBe(1);
	});
});
