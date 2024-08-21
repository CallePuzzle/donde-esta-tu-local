import { ProtectedRoutes } from '$lib/routes';
import { JWK } from '$env/static/private'; // TODO https://github.com/sveltejs/kit/issues/8882
import { getPublicKeyFromJwk } from 'cf-webpush';
import { getUserNotifications } from '$lib/utils/notification/get-user-notifications';
import { logger } from '$lib/server/logger';

import type { PageServerLoad, PageServerLoadEvent } from './$types';
import type { UserNotifications } from '$lib/utils/notification/get-user-notifications-type';

export const load: PageServerLoad = async (event: PageServerLoadEvent) => {
	let userNotification: UserNotifications = {
		user: null,
		notifications: [],
		notificationsCount: 0
	};

	if (event.locals.user) {
		const db = event.platform!.env.DB;
		logger.info(db, 'db');
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
