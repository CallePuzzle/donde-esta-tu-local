import { logger } from '$lib/server/logger';
import { initializePrisma } from '$lib/server/db';
import {
	NewNotificationForAdmins,
	type Payload,
	type NotificationExtraData
} from '$lib/utils/notification/notifications';

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

			if (!(await NewNotificationForAdmins(payload, extraData, db))) {
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
	}
};
