import { writable } from 'svelte/store';
import type { NotificationDetail } from '$lib/utils/notification/get-user-notifications-type';

export const currentNotification = writable<NotificationDetail>({
	id: 0,
	title: '',
	body: '',
	type: '',
	status: '',
	data: '',
	createdAt: new Date()
});
