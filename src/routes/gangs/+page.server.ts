import { logger } from '$lib/server/logger';
import { initializePrisma } from '$lib/server/db';

import type { Actions } from './$types';

export const actions: Actions = {
	new: async (event) => {
		const formData = await event.request.formData();
		const name = formData.get('name');
		const lat = formData.get('lat');
		const lng = formData.get('lng');

		logger.debug(name);
		logger.debug(lat);
		logger.debug(lng);

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
			logger.debug(gang, 'new gang');
			return { success: true, data: gang };
		} catch (error) {
			logger.error(error);
			return { success: false, error: error };
		}
	}
};
