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

	event.waitUntil(
		// Show a notification with title 'ServiceWorker Cookbook' and body 'Alea iacta est'.
		self.registration.showNotification('ServiceWorker Cookbook', {
		  body: 'Alea iacta est',
		})
	  );

	  console.log('Push received');
	  const data = event.data.json();
	  console.log(data);
});

self.addEventListener('notificationclick', (event) => {
	event.notification.close();
	event.waitUntil(clients.openWindow('/'));
});
