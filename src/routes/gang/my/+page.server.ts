import { logger } from '$lib/server/logger';
import { initializePrisma } from '$lib/server/db';

import type { Actions } from './$types';
import type { PageServerLoad } from './$types';

export const actions: Actions = {
	join: async (event) => {
		if (!event.locals.user) {
			logger.error('Not logged in');
			return { success: false, error: 'Not logged in' };
		}

		const formData = await event.request.formData();
		const id = formData.get('id');
		logger.info({ gang: id, user: event.locals.user.id }, 'the user wants to join a gang');

		const db = event.platform!.env.DB;
		const prisma = initializePrisma(db);

		try {
			// update user with gangId
			const user = await prisma.user.update({
				where: {
					id: event.locals.user.id
				},
				data: {
					gangId: parseInt(id as string)
				}
			});

			logger.debug(user, 'user updated with gangId');
			return { success: true, data: user };
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
	let gang = null;
	if (event.locals.user) {
		const db = event.platform!.env.DB;
		const prisma = initializePrisma(db);
		user = await prisma.user.findUnique({
			where: {
				id: event.locals.user.id
			}
		});
	}

	const userHasGang = user?.gangId ? true : false;
	if (userHasGang) {
		gang = await prisma.gang.findUnique({
			where: {
				id: user?.gangId as number
			}
		});
	}

	return {
		gangs: await prisma.gang.findMany(),
		userIsLogged: event.locals.user ? true : false,
		userHasGang: userHasGang,
		user: user,
		gang: gang
	};
};
