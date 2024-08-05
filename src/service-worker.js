self.addEventListener('install', (event) => {
	console.log('Installed SW');
});

self.addEventListener('activate', (event) => {
	console.log('Activated SW');
});

self.addEventListener('fetch', (event) => {
	console.log('Fetch:', event.request);
});

self.addEventListener('push', (event) => {
	console.log('Push received');
	const data = event.data.json();
	console.log(data);
});

self.addEventListener('notificationclick', (event) => {
	event.notification.close();
	event.waitUntil(clients.openWindow('/'));
});
