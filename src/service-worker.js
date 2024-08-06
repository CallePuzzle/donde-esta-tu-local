import { Routes } from './routes/routes';

self.addEventListener('install', (event) => {
	//console.log('Installed SW');
});

self.addEventListener('activate', (event) => {
	//console.log('Activated SW');
});

self.addEventListener('fetch', (event) => {
	//console.log('Fetch:', event.request);
});

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
