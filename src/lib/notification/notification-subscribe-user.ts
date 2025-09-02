import { routes } from '$lib/routes';

async function SubscribeUser(
	userId: string,
	reg: ServiceWorkerRegistration,
	JWKpublicKey: string
): Promise<void> {
	let sub = await reg.pushManager.getSubscription();
	console.log('getSubscription', sub);
	if (!sub) {
		sub = await reg.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(JWKpublicKey)
		});
	}
	console.log('subscribe', sub);
	if (sub) {
		const url = routes.notification_subscribe.url as string;
		const data = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ sub: sub, userId: userId })
		});
		console.log('notification_subscribe', data);
	}
}

// This function is needed because Chrome doesn't accept a base64 encoded string
// as value for applicationServerKey in pushManager.subscribe yet
// https://bugs.chromium.org/p/chromium/issues/detail?id=802280
function urlBase64ToUint8Array(base64String: string) {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

export { SubscribeUser };
