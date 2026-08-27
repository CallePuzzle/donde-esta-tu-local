import { logger } from '$lib/logger';

export function isPushSupported(): boolean {
	return (
		typeof window !== 'undefined' &&
		'serviceWorker' in navigator &&
		'PushManager' in window &&
		'Notification' in window
	);
}

// navigator.serviceWorker.ready no resuelve nunca si no hay un service worker
// registrado, y SvelteKit solo lo registra automáticamente en builds de
// producción (bun run dev no lo hace). Sin este timeout, pulsar el toggle en
// dev deja `loading` colgado para siempre.
async function waitForServiceWorkerReady(timeoutMs = 5000): Promise<ServiceWorkerRegistration> {
	const existing = await navigator.serviceWorker.getRegistration();
	if (existing) return existing;

	const timeout = new Promise<never>((_, reject) => {
		setTimeout(
			() =>
				reject(
					new Error(
						'No hay un service worker registrado. En desarrollo (bun run dev) no se registra automáticamente; prueba con bun run only-build.'
					)
				),
			timeoutMs
		);
	});
	return Promise.race([navigator.serviceWorker.ready, timeout]);
}

export async function getExistingSubscription(): Promise<PushSubscription | null> {
	if (!isPushSupported()) return null;
	const registration = await waitForServiceWorkerReady();
	return registration.pushManager.getSubscription();
}

export function isVapidKeyValid(publicKey: string): boolean {
	return /^[A-Za-z0-9_-]{87}$/.test(publicKey);
}

export async function subscribeToPush(publicKey: string): Promise<PushSubscription> {
	if (!isVapidKeyValid(publicKey)) {
		throw new Error('Clave pública VAPID inválida');
	}
	const registration = await waitForServiceWorkerReady();
	const subscription = await registration.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: urlBase64ToUint8Array(publicKey)
	});
	logger.debug({ endpoint: subscription.endpoint }, 'Suscripción push obtenida');
	return subscription;
}

export async function unsubscribeFromPush(): Promise<void> {
	const subscription = await getExistingSubscription();
	if (subscription) {
		await subscription.unsubscribe();
	}
}

export async function sendSubscriptionToServer(
	subscription: PushSubscription,
	fetchImpl: typeof fetch = fetch
): Promise<void> {
	const response = await fetchImpl('/api/notifications/subscribe', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(subscription.toJSON())
	});
	if (!response.ok) {
		const text = await response.text().catch(() => 'unknown error');
		throw new Error(`Failed to save subscription: ${response.status} ${text}`);
	}
}

export async function deleteSubscriptionFromServer(
	endpoint: string,
	fetchImpl: typeof fetch = fetch
): Promise<void> {
	const response = await fetchImpl('/api/notifications/unsubscribe', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ endpoint })
	});
	if (!response.ok) {
		const text = await response.text().catch(() => 'unknown error');
		throw new Error(`Failed to delete subscription: ${response.status} ${text}`);
	}
}

export function urlBase64ToUint8Array(base64String: string): BufferSource {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
	const rawData = atob(base64);
	const outputArray = new Uint8Array(rawData.length);
	for (let i = 0; i < rawData.length; i++) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray as BufferSource;
}
