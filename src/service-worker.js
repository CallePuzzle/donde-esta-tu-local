/// <reference types="@sveltejs/kit" />

import { build, files, version } from '$service-worker';

const worker = self;
const CACHE_NAME = `static-cache-${version}`;

const to_cache = build.concat(files);

worker.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(to_cache).then(() => {
				worker.skipWaiting();
			});
		})
	);
});

worker.addEventListener('activate', (event) => {
	// Remove previous cached data from disk
	event.waitUntil(
		caches.keys().then(async (keys) =>
			Promise.all(
				keys.map((key) => {
					if (key !== CACHE_NAME) {
						return caches.delete(key);
					}
				})
			)
		)
	);
	worker.clients.claim();
});

self.addEventListener('fetch', (event) => {
	if (event.request.mode !== 'navigate') {
		return;
	}
	event.respondWith(
		fetch(event.request).catch(() => {
			return caches.open(CACHE_NAME).then((cache) => {
				return cache.match('offline.html');
			});
		})
	);
});

self.addEventListener('push', (event) => {
	if (!event.data) return;

	let data;
	try {
		data = event.data.json();
	} catch {
		data = { body: event.data.text() };
	}

	const title = data.title ?? 'Peñas Montemayor';
	const options = {
		body: data.body,
		icon: data.icon ?? '/icon192.png',
		badge: data.badge ?? '/icon192.png',
		tag: data.tag,
		data: data.data ?? {}
	};

	event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
	event.notification.close();
	const url = event.notification.data?.url ?? '/';
	const targetUrl = new URL(url, self.location.origin).href;
	event.waitUntil(
		self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
			for (const client of clientList) {
				if (client.url === targetUrl && 'focus' in client) {
					return client.focus();
				}
			}
			for (const client of clientList) {
				if ('focus' in client && 'navigate' in client) {
					return client.focus().then(() => client.navigate(targetUrl));
				}
			}
			if (self.clients.openWindow) {
				return self.clients.openWindow(targetUrl);
			}
		})
	);
});
