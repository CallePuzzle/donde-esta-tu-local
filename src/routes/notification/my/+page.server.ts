import { logger } from '$lib/server/logger';
import { initializePrisma } from '$lib/server/db';

import type { Actions, RequestEvent } from './$types';
import type { PrismaClient } from '@prisma/client';

export const actions: Actions = {
	validateGang: async (event: RequestEvent) => {
		return await validateRefuse(event, 'gang', 'VALIDATED', 'Peña validada, gracias!');
	},
	refuseGang: async (event: RequestEvent) => {
		return await validateRefuse(event, 'gang', 'REFUSED', 'Peña rechazada, gracias!');
	},
	validateMember: async (event: RequestEvent) => {
		return await validateRefuse(event, 'member', 'VALIDATED', 'Nuevo miembro/a aprovado/a');
	},
	refuseMember: async (event: RequestEvent) => {
		return await validateRefuse(event, 'member', 'REFUSED', 'Nuevo miembro/a rechazado/a');
	}
};

async function validateRefuse(event: RequestEvent, type: string, status: string, message: string) {
	const formData = await event.request.formData();
	const notificationId = formData.get('notificationId') as string;
	const userId = formData.get('userId') as string;

	logger.debug({ type: type, status: status }, 'validateRefuse');

	const db = event.platform!.env.DB;
	const prisma = initializePrisma(db);

	try {
		let data = null;
		let notification = await prisma.notification.findUnique({
			where: {
				id: parseInt(notificationId as string)
			}
		});
		const notificationData = JSON.parse(notification?.data as string);

		if (notification === null && notification === undefined) {
			return { success: false, error: 'Notification not found' };
		}
		if (typeof !notification?.data === 'string') {
			return { success: false, error: 'Notification data not found' };
		}

		const gangId = notificationData.gangId;

		if (type === 'gang') {
			data = await validateRefuseGang(prisma, gangId, status);
		}
		if (type === 'member' && status === 'VALIDATED') {
			data = await validateMember(prisma, gangId, notificationData.userId, status);
		}

		notificationData.reviewedBy = userId;
		notification = await prisma.notification.update({
			where: {
				id: parseInt(notificationId as string)
			},
			data: {
				status: status,
				data: JSON.stringify(notificationData)
			}
		});
		logger.info(notification, 'notification ' + status);

		return { success: true, data: data, message: message };
	} catch (error) {
		logger.error(error);
		return { success: false, error: error };
	}
}

async function validateRefuseGang(prisma: PrismaClient, gangId: string, status: string) {
	const gang = await prisma.gang.update({
		where: {
			id: parseInt(gangId as string)
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
	gangId: string,
	userId: string,
	status: string
) {
	const user = await prisma.user.update({
		where: {
			id: userId as string
		},
		data: {
			gangId: parseInt(gangId as string)
		}
	});
	logger.info(user, 'user ' + status);

	return user;
}
