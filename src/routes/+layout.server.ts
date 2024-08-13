import { ProtectedRoutes } from '$lib/routes';
import { JWK } from '$env/static/private'; // TODO https://github.com/sveltejs/kit/issues/8882
import { getPublicKeyFromJwk } from 'cf-webpush';
import { getUserNotifications, type UserNotifications } from '$lib/utils/get-user-notifications';

import type { PageServerLoad, PageServerLoadEvent } from './$types';

export const load: PageServerLoad = async (event: PageServerLoadEvent) => {
	let userNotification: UserNotifications = {
		user: null,
		notifications: [],
		notificationsCount: 0
	};

	if (event.locals.user) {
		const db = event.platform!.env.DB;
		userNotification = await getUserNotifications(event.locals.user.id, db);
	}

	let path = event.route.id;

	return {
		isProtectedRoute: ProtectedRoutes.some((route) => route.path === path),
		protectedRouteMessage: ProtectedRoutes.find((route) => route.path === path)?.message,
		path: path,
		userIsLogged: event.locals.user ? true : false,
		user: userNotification.user,
		JWKpublicKey: getPublicKeyFromJwk(JSON.parse(JWK)),
		notifications: userNotification.notifications,
		notificationsCount: userNotification.notificationsCount
	};
};
