import { ProtectedRoutes } from '$lib/routes';
import { JWK } from '$env/static/private';
import { getPublicKeyFromJwk } from 'cf-webpush';
import { getUserNotifications } from '$lib/utils/get-user-notifications';
import { initializePrisma } from '$lib/server/db';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	let user = null;
	let notifications = null;
	let notificationsCount = 0;

	if (event.locals.user) {
		const db = event.platform!.env.DB;
		const prisma = initializePrisma(db);
		const userNotifications = await getUserNotifications(event.locals.user.id, db);
		user = userNotifications.user;
		notifications = userNotifications.notifications;
		notificationsCount = await prisma.notification.count({
			where: {
				users: {
					some: {
						id: event.locals.user.id
					}
				},
				status: {
					not: 'validated'
				}
			}
		});
	}

	let path = event.route.id;

	return {
		userIsLogged: event.locals.user ? true : false,
		user: user,
		isProtectedRoute: ProtectedRoutes.some((route) => route.path === path),
		protectedRouteMessage: ProtectedRoutes.find((route) => route.path === path)?.message,
		JWKpublicKey: getPublicKeyFromJwk(JSON.parse(JWK)),
		notifications: notifications,
		notificationsCount: notificationsCount,
		path: path
	};
};
