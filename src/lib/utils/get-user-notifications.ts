import type { D1Database } from '@cloudflare/workers-types';
import { initializePrisma } from '$lib/server/db';
import { logger } from '$lib/server/logger';

import type { User, Notification, PrismaClient } from '@prisma/client';

interface UserNotifications {
	user: User;
	notifications: Notification[];
	notificationsCount: number;
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
	logger.debug(user, 'current user');
	const _notifications = await prisma.notification.findMany({
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
	let notifications: Notification[] = [];
	for (const _notification of _notifications) {
		if (_notification.type == 'gang-added') {
			notifications.concat(await getGangAddedNotificationDetails(_notification, prisma));
		}
	}
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

async function getGangAddedNotificationDetails(
	notification: Notification,
	prisma: PrismaClient
): Promise<Notification> {
	const notificationData = JSON.parse(notification.data);
	const gangId = notificationData.gangId;
	const gang = await prisma.gang.findUnique({
		where: { id: gangId }
	});
	notificationData.gang = gang;
	notification.data = notificationData;
	if (notificationData.addedBy) {
		const addedBy = await prisma.user.findUnique({
			where: { id: notificationData.addedBy }
		});
		notification.data.addedBy = addedBy;
	}
	if (notificationData.reviewedBy) {
		const reviewedBy = await prisma.user.findUnique({
			where: { id: notificationData.reviewedBy }
		});
		notification.data.reviewedBy = reviewedBy;
	}
	return notification;
}
