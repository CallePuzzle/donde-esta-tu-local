import { ProtectedRoutes } from '$lib/routes';
import { JWK } from '$env/static/private';
import { getPublicKeyFromJwk } from 'cf-webpush';
import { getUserNotifications } from '$lib/utils/get-user-notifications';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	let user = null;
	let notifications = null;

	if (event.locals.user) {
		const db = event.platform!.env.DB;
		const userNotifications = await getUserNotifications(event.locals.user.id, db);
		user = userNotifications.user;
		notifications = userNotifications.notifications;
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
