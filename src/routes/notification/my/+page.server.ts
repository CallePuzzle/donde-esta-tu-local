import type { Actions, PageServerLoad } from './$types';
import { getUserNotifications } from '$lib/utils/get-user-notifications';
import { initializePrisma } from '$lib/server/db';

export const actions: Actions = {};

export const load: PageServerLoad = async (event) => {
	let user = null;
	let notifications = null;

	if (event.locals.user) {
		const db = event.platform!.env.DB;
		const userNotifications = await getUserNotifications(event.locals.user.id, db);
		user = userNotifications.user;
		notifications = userNotifications.notifications;

		const prisma = initializePrisma(db);

		for (const notification of notifications) {
			if (notification.type == 'gang-added') {
				const notificationData = JSON.parse(notification.data);
				const gangId = notificationData.gangId;
				const gang = await prisma.gang.findUnique({
					where: { id: gangId },
					select: { name: true }
				});
				notificationData.gangName = gang.name;
				notification.data = JSON.stringify(notificationData);
			}
		}
	}

	return {
		user: user,
		notifications: notifications
	};
};
