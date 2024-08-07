import { logger } from '$lib/server/logger';
import { initializePrisma } from '$lib/server/db';
import { NewNotificationForAll, type Payload } from '$lib/utils/notifications';

import type { Actions } from './$types';
import type { PageServerLoad, NotificationExtraData } from './$types';

export const actions: Actions = {
	new: async (event) => {
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
				data: {
					gangId: gang.id,
					addedBy: event.locals.user!.id
				}
			};

			if (!(await NewNotificationForAll(payload, extraData, event.locals.user!.id, db))) {
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
	validate: async (event) => {
		const formData = await event.request.formData();
		const gangId = formData.get('gangId');
		const notificationId = formData.get('notificationId');
		const userId = formData.get('userId');

		logger.debug(gangId, 'validating gang');

		const db = event.platform!.env.DB;
		const prisma = initializePrisma(db);

		try {
			const gang = await prisma.gang.update({
				where: {
					id: parseInt(gangId as string)
				},
				data: {
					isValidated: true
				}
			});
			const user = await prisma.user.update({
				where: {
					id: userId as string
				},
				data: {
					notifications: {
						disconnect: {
							id: parseInt(notificationId as string)
						}
					}
				}
			});

			return { success: true, data: gang, message: 'Peña validada, gracias!' };
		} catch (error) {
			logger.error(error);
			return { success: false, error: error };
		}
	}
};

export const load: PageServerLoad = async (event) => {
	return {
		userIsLogged: event.locals.user ? true : false
	};
};
