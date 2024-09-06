import { logger } from '$lib/server/logger';

import type { User, Notification, PrismaClient } from '@prisma/client';

interface UserNotifications {
	user: User | null;
	notifications: Notification[];
	notificationsCount: number;
}

export { type UserNotifications, GetUserNotifications };

async function GetUserNotifications(
	prisma: PrismaClient,
	userId: string
): Promise<UserNotifications> {
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
