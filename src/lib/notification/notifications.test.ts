import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getPrismaClient } from '$lib/tests/clientForTest';
import {
	NewNotificationForAll,
	NewNotificationForAdmins,
	NewNotificationForUsers,
	type Payload,
	type NotificationExtraData
} from './notifications';
import type { User } from '@prisma/client';

const prisma = await getPrismaClient();

describe('new notifications', () => {
	const USER_LOCAL = 'user|local';
	const USER_ADMIN = 'admin|local';
	const USER_NO_GANG = 'user|no-gang';

	beforeAll(async () => {
		await prisma.notification.deleteMany();
		const payload: Payload = {
			title: 'Test notification',
			body: 'Test notification body'
		};

		const extraData: NotificationExtraData = {
			type: 'test-notification',
			status: 'PENDING'
		};
		const user_admin = (await prisma.user.findUnique({
			where: { id: USER_ADMIN }
		})) as User;
		const user_no_gang = (await prisma.user.findUnique({
			where: { id: USER_NO_GANG }
		})) as User;

		await NewNotificationForAll(payload, extraData, USER_LOCAL, prisma);
		await NewNotificationForAdmins(payload, extraData, prisma);
		await NewNotificationForUsers(payload, extraData, [user_admin, user_no_gang], prisma);
	});

	afterAll(async () => {
		await prisma.notification.deleteMany();
		await prisma.$disconnect();
	});

	it('USER_ADMIN has 3 notifications', async () => {
		const userNotifications = await prisma.notification.findMany({
			where: { users: { some: { id: USER_ADMIN } } }
		});
		expect(userNotifications.length).toBe(3);
	});
	it('USER_NO_GANG has 2 notifications', async () => {
		const userNotifications = await prisma.notification.findMany({
			where: { users: { some: { id: USER_NO_GANG } } }
		});
		expect(userNotifications.length).toBe(2);
	});
});
