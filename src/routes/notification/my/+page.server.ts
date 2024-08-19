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
	const gangId = formData.get('gangId');
	const notificationId = formData.get('notificationId');
	const userId = formData.get('userId');
	if (gangId === null || notificationId === null || userId === null) {
		return { success: false, error: 'Missing parameters' };
	}

	logger.debug({ type: type, status: status }, 'validateRefuse');

	const db = event.platform!.env.DB;
	const prisma = initializePrisma(db);

	if (type === 'gang') {
		return await validateRefuseGang(prisma, gangId, userId, notificationId, status, message);
	}
}

async function validateRefuseGang(
	prisma: PrismaClient,
	gangId: string,
	userId: string,
	notificationId: string,
	status: string,
	message: string
) {
	try {
		const gang = await prisma.gang.update({
			where: {
				id: parseInt(gangId as string)
			},
			data: {
				status: status
			}
		});
		logger.info(gang, 'gang ' + status);
		let notification = await prisma.notification.findUnique({
			where: {
				id: parseInt(notificationId as string)
			}
		});
		if (notification === null && notification === undefined) {
			return { success: false, error: 'Notification not found' };
		}
		const data = JSON.parse(notification?.data);
		data.reviewedBy = userId;
		notification = await prisma.notification.update({
			where: {
				id: parseInt(notificationId as string)
			},
			data: {
				status: status,
				data: JSON.stringify(data)
			}
		});
		logger.info(notification, 'notification ' + status);

		return { success: true, data: gang, message: message };
	} catch (error) {
		logger.error(error);
		return { success: false, error: error };
	}
}
