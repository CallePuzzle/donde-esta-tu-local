import { Routes } from '$lib/routes';

/// <reference types="@sveltejs/kit" />

self.addEventListener('push', (event) => {
	const data = event.data.json();
	event.waitUntil(
		self.registration.showNotification(data.title, {
			body: data.body
		})
	);
});

self.addEventListener('notificationclick', (event) => {
	event.notification.close();
	event.waitUntil(clients.openWindow(Routes.notification_my.url));
});
