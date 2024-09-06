import { describe, it, expect, beforeAll, afterAll, expectTypeOf } from 'vitest';
import { getPrismaClient } from '$lib/tests/clientForTest';
import { GetUserNotifications, type UserNotifications } from './get-user-notifications';

const prisma = await getPrismaClient();

describe('get user notitification fn', () => {
	const USER_LOCAL = 'user|local';
	const GANG1 = 'Gang 1';
	let userNotifications: UserNotifications;

	beforeAll(async () => {
		// Create a PEDING notification for USER_LOCAL
		await prisma.notification.create({
			data: {
				title: 'Test notification',
				body: 'Test notification body',
				status: 'PENDING',
				users: {
					connect: {
						id: USER_LOCAL
					}
				}
			}
		});
		// Create a VALIDATED notification for USER_LOCAL
		await prisma.notification.create({
			data: {
				title: 'Test notification',
				body: 'Test notification body',
				status: 'VALIDATED',
				users: {
					connect: {
						id: USER_LOCAL
					}
				}
			}
		});
		// Create a REFUSED notification for USER_LOCAL
		await prisma.notification.create({
			data: {
				title: 'Test notification',
				body: 'Test notification body',
				status: 'REFUSED',
				users: {
					connect: {
						id: USER_LOCAL
					}
				}
			}
		});

		userNotifications = await GetUserNotifications(prisma, USER_LOCAL);
	});

	afterAll(async () => {
		// Remove notification from user|local
		const notificationsToDelete = await prisma.notification.findMany({
			where: { users: { some: { id: USER_LOCAL } } }
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

	it('user has gang', async () => {
		expect(userNotifications.user).toHaveProperty('gang');
		expect(userNotifications.user?.gang).toHaveProperty('name');
		expect(userNotifications.user?.gang.name).toBe(GANG1);
	});

	it('user has notifications', async () => {
		expect(userNotifications).toHaveProperty('notifications');
		expect(userNotifications.notifications).toHaveLength(3);
	});
});
