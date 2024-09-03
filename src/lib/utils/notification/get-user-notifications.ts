import type { D1Database } from '@cloudflare/workers-types';
import { initializePrisma } from '$lib/server/db';
import { logger } from '$lib/server/logger';

import type { User, Gang, Notification, PrismaClient } from '@prisma/client';

interface UserNotifications {
	user?: User;
	notifications: Notification[];
	notificationsCount: number;
}

export { type UserNotifications };

export async function getUserNotifications(
	userId: string,
	db: D1Database
): Promise<UserNotifications> {
	const prisma = initializePrisma(db);

	const user = await prisma.user.findUnique({
		where: {
			id: userId
		},
		include: {
			gang: true
		}
	});
	logger.debug(user, 'current user');
	const notifications = await prisma.notification.findMany({
		where: {
			users: {
				some: {
					id: userId
				}
			}
		},
		include: {
			addedBy: true,
			reviewedBy: true,
			relatedGang: true
		},
		orderBy: [
			{
				createdAt: 'desc'
			}
		]
	});
	logger.debug(notifications, 'notifications');
	const notificationsCount = await prisma.notification.count({
		where: {
			users: {
				some: {
					id: userId
				}
			},
			status: 'PENDING'
		}
	});

	return {
		user,
		notifications,
		notificationsCount
	} as UserNotifications;
}
