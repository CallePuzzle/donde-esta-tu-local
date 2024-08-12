import type { Actions, PageServerLoad } from './$types';
import { getUserNotifications } from '$lib/utils/get-user-notifications';
import { initializePrisma } from '$lib/server/db';

export const actions: Actions = {};

export const load: PageServerLoad = async (event) => {
	let notifications = null;

	if (event.locals.user) {
		const db = event.platform!.env.DB;
		const userNotifications = await getUserNotifications(event.locals.user.id, db);
		notifications = userNotifications.notifications;

		const prisma = initializePrisma(db);

		for (const notification of notifications) {
			if (notification.type == 'gang-added') {
				const notificationData = JSON.parse(notification.data);
				const gangId = notificationData.gangId;
				const gang = await prisma.gang.findUnique({
					where: { id: gangId }
				});
				notificationData.gang = gang;
				notification.data = notificationData;
				if (notificationData.addedBy) {
					const addedBy = await prisma.user.findUnique({
						where: { id: notificationData.addedBy }
					});
					notification.data.addedBy = addedBy;
				}
				if (notificationData.validatedBy) {
					const validatedBy = await prisma.user.findUnique({
						where: { id: notificationData.validatedBy }
					});
					notification.data.validatedBy = validatedBy;
				}
			}
		}
	}

	return {
		notifications: notifications
	};
};
