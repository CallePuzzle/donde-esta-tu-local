import { Routes } from '$lib/routes';

/// <reference types="@sveltejs/kit" />

import { build, files, version } from '$service-worker';

const worker = self;
const CACHE_NAME = `static-cache-${version}`;

const to_cache = build.concat(files);

console.log('[ServiceWorker] Caching the following files:', to_cache);

worker.addEventListener('install', (event) => {
	console.log('[ServiceWorker] Install');

	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			console.log('[ServiceWorker] Pre-caching offline page');
			return cache.addAll(to_cache).then(() => {
				worker.skipWaiting();
			});
		})
	);
});

worker.addEventListener('activate', (event) => {
	console.log('[ServiceWorker] Activate');
	// Remove previous cached data from disk
	event.waitUntil(
		caches.keys().then(async (keys) =>
			Promise.all(
				keys.map((key) => {
					if (key !== CACHE_NAME) {
						console.log('[ServiceWorker] Removing old cache', key);
						return caches.delete(key);
					}
				})
			)
		)
	);
	worker.clients.claim();
});

self.addEventListener('fetch', (event) => {
	console.log('[ServiceWorker] Fetch', event.request.url);
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
