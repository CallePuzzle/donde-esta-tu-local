import webpush from 'web-push';

import { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } from '$env/static/private';

export function GET() {
	webpush.setVapidDetails('mailto:example@example.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

	return new Response(VAPID_PUBLIC_KEY, {
		headers: {
			'Content-Type': 'application/json'
		}
	});
}
