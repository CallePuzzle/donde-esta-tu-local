import type { User, Gang, Notification } from '@prisma/client';

interface UserNotifications {
	user?: User;
	notifications: Notification[];
	notificationsCount: number;
}

interface NotificationDetail extends Notification {
	detail: {
		gang: Gang;
		addedBy?: User;
		reviewedBy?: User;
		user: User;
	};
}

export { type UserNotifications, type NotificationDetail };
