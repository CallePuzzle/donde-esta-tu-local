import { logger } from '$lib/server/logger';

import type { PrismaClient } from '@prisma/client';

export { ValidateRefuse };

async function ValidateRefuse(
	prisma: PrismaClient,
	notificationId: number,
	userId: string,
	type: string,
	status: string,
	message: string
) {
	try {
		let data = null;
		let notification = await prisma.notification.findUnique({
			where: {
				id: notificationId
			}
		});

		if (notification === null && notification === undefined) {
			return { success: false, error: 'Notification not found' };
		}

		const gangId = notification?.relatedGangId as number;

		if (type === 'gang') {
			data = await validateRefuseGang(prisma, gangId, status);
		}
		if (type === 'member' && status === 'VALIDATED') {
			data = await validateMember(prisma, gangId, notification?.addedByUserId as string, status);
		}

		notification = await prisma.notification.update({
			where: {
				id: notificationId
			},
			data: {
				status: status,
				reviewedByUserId: userId
			}
		});
		logger.info(notification, 'notification ' + status);

		return { success: true, data: data, message: message };
	} catch (error) {
		logger.error(error);
		return { success: false, error: error };
	}
}

async function validateRefuseGang(prisma: PrismaClient, gangId: number, status: string) {
	const gang = await prisma.gang.update({
		where: {
			id: gangId
		},
		data: {
			status: status
		}
	});
	logger.info(gang, 'gang ' + status);

	return gang;
}

async function validateMember(
	prisma: PrismaClient,
	gangId: number,
	userId: string,
	status: string
) {
	const user = await prisma.user.update({
		where: {
			id: userId as string
		},
		data: {
			gangId: gangId
		}
	});
	logger.info(user, 'user ' + status);

	return user;
}
