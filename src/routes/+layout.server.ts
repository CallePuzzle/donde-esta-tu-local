import { ProtectedRoutes } from '$lib/routes';
import { JWK, APP_URL } from '$env/static/private'; // TODO https://github.com/sveltejs/kit/issues/8882
import { getPublicKeyFromJwk } from 'cf-webpush';
import { GetUserNotifications } from '$lib/notification/get-user-notifications';
import { initializePrisma } from '$lib/server/db';

import type { PageServerLoad, PageServerLoadEvent } from './$types';
import type { UserNotifications } from '$lib/notification/get-user-notifications';

export const load: PageServerLoad = async (event: PageServerLoadEvent) => {
	let userNotification: UserNotifications = {
		user: null,
		notifications: [],
		notificationsCount: 0
	};

	if (event.locals.user) {
		const db = event.platform!.env.DB;
		const prisma = initializePrisma(db);
		userNotification = await GetUserNotifications(prisma, event.locals.user.id);
	}

	let path = event.route.id;

	return {
		isProtectedRoute: ProtectedRoutes.some((route) => route.path === path),
		protectedRouteMessage: ProtectedRoutes.find((route) => route.path === path)?.message,
		appUrl: APP_URL,
		path: path,
		userIsLogged: event.locals.user ? true : false,
		user: userNotification.user,
		JWKpublicKey: getPublicKeyFromJwk(JSON.parse(JWK)),
		notifications: userNotification.notifications,
		notificationsCount: userNotification.notificationsCount
	};
};
