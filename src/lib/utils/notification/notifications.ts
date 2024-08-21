import { JWK } from '$env/static/private';
import { buildRequest, type PushSubscription } from 'cf-webpush';
import { logger } from '$lib/server/logger';
import type { User } from '@prisma/client';
import type { PrismaClient } from '@prisma/client';

export interface Payload {
	title: string;
	body: string;
}

export interface NotificationExtraData {
	type: string;
	status: string;
	addedByUserId?: string;
	reviewedByUserId?: string;
	relatedGangId?: number;
}

async function sendNotifications(user: User, payload: Payload): Promise<boolean> {
	if (user.subscription) {
		const subscription: PushSubscription = JSON.parse(user.subscription);
		const payloadJson = JSON.stringify(payload);

		try {
			const jwk = JSON.parse(JWK);
			const ttl = 20 * 60 * 60; // 20 hours
			const host = new URL(subscription.endpoint).origin;
			const pushRequest = await buildRequest(
				{
					jwk,
					ttl,
					jwt: {
						aud: host,
						exp: Math.floor(Date.now() / 1000) + ttl,
						sub: '99479536+aynh@users.noreply.github.com'
					},
					payload: payloadJson
				},
				subscription
			);

			const response = await fetch(pushRequest);
			const responseText = await response.text();
			logger.info(response.status, 'Notification status');
			logger.info(responseText);
			logger.info('Notification sent');
		} catch (error) {
			logger.error(error, 'Error sending notification');
			return false;
		}
	}
	return true;
}

async function createNotification(
	users: User[],
	payload: Payload,
	extraData: NotificationExtraData,
	prisma: PrismaClient
): Promise<boolean> {
	try {
		await prisma.notification.create({
			data: {
				title: payload.title,
				body: payload.body,
				type: extraData.type,
				status: extraData.status,
				addedByUserId: extraData.addedByUserId,
				reviewedByUserId: extraData.reviewedByUserId,
				relatedGangId: extraData.relatedGangId,
				users: {
					connect: users.map((user) => ({ id: user.id }))
				}
			}
		});

		return true;
	} catch (error) {
		logger.error(error, 'Error creating notification');
		return false;
	}
}

async function newNotification(
	users: User[],
	payload: Payload,
	extraData: NotificationExtraData,
	prisma: PrismaClient
): Promise<boolean> {
	for (const user of users) {
		if (!(await sendNotifications(user, payload))) {
			return false;
		}
	}

	if (!(await createNotification(users, payload, extraData, prisma))) {
		return false;
	}
	return true;
}

async function NewNotificationForAll(
	payload: Payload,
	extraData: NotificationExtraData,
	userId: string,
	prisma: PrismaClient
): Promise<boolean> {
	const users = await prisma.user.findMany({
		where: {
			id: {
				not: userId
			}
		}
	});

	return newNotification(users, payload, extraData, prisma);
}

async function NewNotificationForAdmins(
	payload: Payload,
	extraData: NotificationExtraData,
	prisma: PrismaClient
): Promise<boolean> {
	const users = await prisma.user.findMany({
		where: {
			role: 'ADMIN'
		}
	});

	return newNotification(users, payload, extraData, prisma);
}

async function NewNotificationForUsers(
	payload: Payload,
	extraData: NotificationExtraData,
	users: User[],
	prisma: PrismaClient
): Promise<boolean> {
	return newNotification(users, payload, extraData, prisma);
}

export { NewNotificationForAll, NewNotificationForAdmins, NewNotificationForUsers };
