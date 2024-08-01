import { logger } from '$lib/server/logger';
import { initializePrisma } from '$lib/server/db';
import { initializeLucia } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';
import type { Actions } from './$types';

export const load: PageServerLoad = async (event) => {
	let user = null;
	if (event.locals.user) {
		const db = event.platform!.env.DB;
		const prisma = initializePrisma(db);
		user = await prisma.user.findUnique({
			where: {
				id: event.locals.user.id
			}
		});
		logger.debug(user?.picture, 'user');
	}

	return {
		userIsLogged: event.locals.user ? true : false,
		user: user
	};
};
