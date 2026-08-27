export function isPushSupported(): boolean {
	return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
}

export async function getExistingSubscription(): Promise<PushSubscription | null> {
	if (!isPushSupported()) return null;
	const registration = await navigator.serviceWorker.ready;
	return registration.pushManager.getSubscription();
}

export async function subscribeToPush(publicKey: string): Promise<PushSubscription> {
	const registration = await navigator.serviceWorker.ready;
	return registration.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: urlBase64ToUint8Array(publicKey)
	});
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
