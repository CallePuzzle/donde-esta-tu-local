import type { D1Database } from '@cloudflare/workers-types';
import { initializePrisma } from '$lib/server/db';
import type { User, Notification } from '@prisma/client';

interface UserNotifications {
	user: User;
	notifications: Notification[];
}

export async function getUserNotifications(
	userId: string,
	db: D1Database
): Promise<UserNotifications> {
	const prisma = initializePrisma(db);

	const user = await prisma.user.findUnique({
		where: {
			id: userId
		}
	});
	const notifications = await prisma.notification.findMany({
		where: {
			users: {
				some: {
					id: userId
				}
			}
		},
		orderBy: [
			{
				createdAt: 'desc'
			}
		]
	});
	return {
		user,
		notifications
	} as UserNotifications;
}
