import type { D1Database } from '@cloudflare/workers-types';
import { initializePrisma } from '$lib/server/db';
import { logger } from '$lib/server/logger';

import type { User, Gang, Notification, PrismaClient } from '@prisma/client';
import type {
	UserNotifications,
	NotificationDetail
} from '$lib/utils/notification/get-user-notifications-type';

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
		if (_notification.type == 'gang-added' || _notification.type == 'gang-member-request') {
			notifications = notifications.concat(await getNotificationDetails(_notification, prisma));
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

async function getNotificationDetails(
	notification: Notification,
	prisma: PrismaClient
): Promise<NotificationDetail | Notification> {
	if (notification.data === null) {
		return notification;
	}

	const notificationData = JSON.parse(notification.data);

	let ret = notification as NotificationDetail;

	if (notificationData.gangId) {
		const gang = await prisma.gang.findUnique({
			where: { id: parseInt(notificationData.gangId) }
		});
		ret.detail = { ...ret.detail, ...{ gang: gang as Gang } };
	}
	if (notificationData.userId) {
		const user = await prisma.user.findUnique({
			where: { id: notificationData.userId }
		});
		ret.detail = { ...ret.detail, ...{ user: user as User } };
	}

	if (notificationData.addedBy) {
		const addedBy = await prisma.user.findUnique({
			where: { id: notificationData.addedBy }
		});
		ret.detail.addedBy = addedBy as User;
	}
	if (notificationData.reviewedBy) {
		const reviewedBy = await prisma.user.findUnique({
			where: { id: notificationData.reviewedBy }
		});
		ret.detail.reviewedBy = reviewedBy as User;
	}
	return ret;
}
