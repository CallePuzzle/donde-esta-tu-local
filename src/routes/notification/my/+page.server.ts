import type { Actions } from './$types';
import type { PageServerLoad } from './$types';
import { getUserNotifications } from '$lib/utils/get-user-notifications';

export const actions: Actions = {};

export const load: PageServerLoad = async (event) => {
	let user = null;
	let notifications = null;

	if (event.locals.user) {
		const db = event.platform!.env.DB;
		const userNotifications = await getUserNotifications(event.locals.user.id, db);
		user = userNotifications.user;
		notifications = userNotifications.notifications;
	}

	return {
		user: user,
		notifications: notifications
	};
};
