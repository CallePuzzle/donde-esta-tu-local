import { logger } from '$lib/server/logger';
import { initializePrisma } from '$lib/server/db';
import {
	NewNotificationForAdmins,
	type Payload,
	type NotificationExtraData
} from '$lib/utils/notifications';

import type { Actions, RequestEvent } from './$types';

export const actions: Actions = {
	new: async (event: RequestEvent) => {
		const formData = await event.request.formData();
		const name = formData.get('name');
		const lat = formData.get('lat');
		const lng = formData.get('lng');

		logger.info({ name, lat, lng }, 'new gang datas');

		const db = event.platform!.env.DB;
		const prisma = initializePrisma(db);

		try {
			const gang = await prisma.gang.create({
				data: {
					name: name as string,
					latitude: parseFloat(lat as string),
					longitude: parseFloat(lng as string)
				}
			});
			logger.info(gang, 'new gang created');

			const payload: Payload = {
				title: 'Nueva peña',
				body: `Se ha añadido una nueva peña: ${name}`
			};

			const extraData: NotificationExtraData = {
				type: 'gang-added',
				status: 'PENDING',
				data: {
					gangId: gang.id,
					addedBy: event.locals.user!.id
				}
			};

			if (!(await NewNotificationForAdmins(payload, extraData, event.locals.user!.id, db))) {
				return { success: false, error: 'Error sending notification' };
			}

			return {
				success: true,
				data: gang,
				message: 'Peña añadida, a la espera de revisión por un administrador'
			};
		} catch (error) {
			logger.error(error);
			return { success: false, error: error };
		}
	},
	validate: async (event: RequestEvent) => {
		return await validateRefuseGang(event, 'validate');
	},
	refuse: async (event: RequestEvent) => {
		return await validateRefuseGang(event, 'refuse');
	}
};

async function validateRefuseGang(event: RequestEvent, action: string) {
	if (action !== 'validate' && action !== 'refuse') {
		return { success: false, error: 'Invalid action' };
	}

	const status = action === 'validate' ? 'VALIDATED' : 'REFUSED';
	const message = action === 'validate' ? 'Peña validada, gracias!' : 'Peña rechazada, gracias!';
	const formData = await event.request.formData();
	const gangId = formData.get('gangId');
	const notificationId = formData.get('notificationId');
	const userId = formData.get('userId');
	if (gangId === null || notificationId === null || userId === null) {
		return { success: false, error: 'Missing parameters' };
	}

	logger.debug(gangId, 'action: ' + action);

	const db = event.platform!.env.DB;
	const prisma = initializePrisma(db);

	try {
		const gang = await prisma.gang.update({
			where: {
				id: parseInt(gangId as string)
			},
			data: {
				status: status
			}
		});
		logger.info(gang, 'gang ' + action);
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
		logger.info(notification, 'notification ' + action);

		return { success: true, data: gang, message: message };
	} catch (error) {
		logger.error(error);
		return { success: false, error: error };
	}
}
