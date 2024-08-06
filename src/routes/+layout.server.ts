import { logger } from '$lib/server/logger';
import { initializePrisma } from '$lib/server/db';
import { ProtectedRoutes } from './routes';
import { JWK } from '$env/static/private';
import { getPublicKeyFromJwk } from 'cf-webpush';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	let user = null;
	let notifications = null;

	if (event.locals.user) {
		const db = event.platform!.env.DB;
		const prisma = initializePrisma(db);
		user = await prisma.user.findUnique({
			where: {
				id: event.locals.user.id
			}
		});
		notifications = await prisma.notification.findMany({
			where: {
				users: {
					some: {
						id: event.locals.user.id
					}
				}
			}
		});
		logger.debug(notifications, 'notifications');
	}

	let path = event.route.id;

	return {
		userIsLogged: event.locals.user ? true : false,
		user: user,
		isProtectedRoute: ProtectedRoutes.some((route) => route.path === path),
		protectedRouteMessage: ProtectedRoutes.find((route) => route.path === path)?.message,
		JWKpublicKey: getPublicKeyFromJwk(JSON.parse(JWK)),
		notifications: notifications,
		notificationsCount: notifications ? Object.keys(notifications).length : 0,
		path: path
	};
};
