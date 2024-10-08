import { describe, it, expect, beforeAll, afterAll, expectTypeOf } from 'vitest';
import { getPrismaClient } from '$lib/tests/clientForTest';
import type { User, Gang } from '@prisma/client';
import { RequestNewMember } from './request-new-member';

const prisma = await getPrismaClient();

describe('new member and ADMIN notification', () => {
	let gang: Gang;
	let form: any;
	const USER_ADMIN = 'admin|local';
	const USER_NO_GANG = 'user|no-gang';

	beforeAll(async () => {
		gang = (await prisma.gang.findFirst({
			where: { name: 'Gang 2' }
		})) as Gang;
		form = await RequestNewMember(prisma, gang.id, USER_NO_GANG);
	});

	afterAll(async () => {
		// Remove members of Gang 2
		await prisma.gang.update({
			where: { id: gang.id },
			data: { members: { set: [] } }
		});

		// Remove notification from user|local
		const notificationsToDelete = await prisma.notification.findMany({
			where: { addedByUserId: USER_NO_GANG }
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

	it('form has gang and user in data', async () => {
		expect(form).toHaveProperty('data');
		expect(form.data).toHaveProperty('gang');
		expect(form.data).toHaveProperty('user');
		const { gang, user } = form.data;
		expectTypeOf(gang).toEqualTypeOf<Gang>();
		expectTypeOf(user).toEqualTypeOf<User>();
	});

	it('USER_ADMIN has a notification addedByUserId USER_NO_GANG', async () => {
		const notifications = await prisma.notification.findMany({
			where: {
				title: 'Nueva solicitud de miembro',
				users: {
					some: {
						id: USER_ADMIN
					}
				},
				addedByUserId: USER_NO_GANG
			}
		});
		expect(notifications.length).toBe(1);
	});
});

describe('new member and member notification', () => {
	let gang: Gang;
	let form: any;
	const USER_ADMIN = 'admin|local';
	const USER_NO_GANG = 'user|no-gang';

	beforeAll(async () => {
		gang = (await prisma.gang.findFirst({
			where: { name: 'Gang 2' }
		})) as Gang;
		// Add USER_NO_GANG to Gang 2
		await prisma.gang.update({
			where: { id: gang.id },
			data: { members: { connect: { id: USER_NO_GANG } } }
		});
		form = await RequestNewMember(prisma, gang.id, USER_ADMIN);
	});

	afterAll(async () => {
		// Remove members of Gang 2
		await prisma.gang.update({
			where: { id: gang.id },
			data: { members: { set: [] } }
		});

		// Remove notification from user|local
		const notificationsToDelete = await prisma.notification.findMany({
			where: { addedByUserId: USER_ADMIN }
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

	it('form has gang and user in data', async () => {
		expect(form).toHaveProperty('data');
		expect(form.data).toHaveProperty('gang');
		expect(form.data).toHaveProperty('user');
		const { gang, user } = form.data;
		expectTypeOf(gang).toEqualTypeOf<Gang>();
		expectTypeOf(user).toEqualTypeOf<User>();
	});

	it('USER_ADMIN has a notification addedByUserId USER_LOCAL', async () => {
		const notifications = await prisma.notification.findMany({
			where: {
				title: 'Nueva solicitud de miembro',
				users: {
					some: {
						id: USER_NO_GANG
					}
				},
				addedByUserId: USER_ADMIN
			}
		});
		expect(notifications.length).toBe(1);
	});
});
