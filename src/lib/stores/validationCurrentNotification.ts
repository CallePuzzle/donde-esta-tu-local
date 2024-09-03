import { writable } from 'svelte/store';
import type { Gang, Notification, User } from '@prisma/client';

interface NotificationDetail extends Notification {
	relatedGang?: Gang;
	addedBy?: User;
	reviewedBy?: User;
}

export const currentNotification = writable<NotificationDetail>({
	id: 0,
	title: '',
	body: '',
	type: '',
	addedByUserId: '',
	reviewedByUserId: '',
	addedBy: undefined,
	reviewedBy: undefined,
	relatedGang: undefined,
	relatedGangId: 0,
	status: '',
	createdAt: new Date()
});

export const markersInMap = writable<any[]>([]);
