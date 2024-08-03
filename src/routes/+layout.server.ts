import { logger } from '$lib/server/logger';
import { initializePrisma } from '$lib/server/db';
import { ProtectedRoutes } from './routes';

import type { PageServerLoad } from './$types';

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

	let path = event.route.id;

	return {
		userIsLogged: event.locals.user ? true : false,
		user: user,
		isProtectedRoute: ProtectedRoutes.some((route) => route.path === path),
		protectedRouteMessage: ProtectedRoutes.find((route) => route.path === path)?.message
	};
};
