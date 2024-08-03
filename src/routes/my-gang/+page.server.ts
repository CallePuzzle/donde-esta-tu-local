import { logger } from '$lib/server/logger';
import { initializePrisma } from '$lib/server/db';

import type { Actions } from './$types';
import type { PageServerLoad } from './$types';

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
			logger.debug(gang, 'new gang');
			return { success: true, data: gang };
		} catch (error) {
			logger.error(error);
			return { success: false, error: error };
		}
	}
};

export const load: PageServerLoad = async (event) => {
	const db = event.platform!.env.DB;
	const prisma = initializePrisma(db);

	let user = null;
	if (event.locals.user) {
		const db = event.platform!.env.DB;
		const prisma = initializePrisma(db);
		user = await prisma.user.findUnique({
			where: {
				id: event.locals.user.id
			}
		});
	}

	return {
		gangs: await prisma.gang.findMany(),
		userIsLogged: event.locals.user ? true : false,
		userHasGang: user?.gangId ? true : false,
		user: user,
	};
};
