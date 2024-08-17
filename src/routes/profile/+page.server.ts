import { logger } from '$lib/server/logger';
import { initializePrisma } from '$lib/server/db';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const db = event.platform!.env.DB;
	const prisma = initializePrisma(db);
	const gangs = await prisma.gang.findMany({
		where: {
			status: {
				not: 'REFUSED'
			}
		}
	});
	logger.debug(gangs, 'gangs');

	return {
		gangs: gangs
	};
};

export const actions: Actions = {
	save: async (event) => {
		const formData = await event.request.formData();
		const name = formData.get('name');
		const gangId = formData.get('gangId');

		logger.info({ name }, 'saving profile');

		const db = event.platform!.env.DB;
		const prisma = initializePrisma(db);

		try {
			const user = await prisma.user.update({
				where: {
					id: event.locals.user!.id
				},
				data: {
					name: name as string,
					gangId: gangId ? parseInt(gangId as string) : null
				}
			});
			logger.info(user, 'profile updated');
			return { success: true, data: user };
		} catch (error) {
			logger.error(error);
			return { success: false, error: error };
		}
	}
};
