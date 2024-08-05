import webpush from 'web-push';

import { logger } from '$lib/server/logger';
import { initializePrisma } from '$lib/server/db';
import { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } from '$env/static/private';

import type { RequestEvent } from '@sveltejs/kit';

export async function GET(event: RequestEvent): Promise<Response> {
	const db = event.platform!.env.DB;
	const prisma = initializePrisma(db);

	const users = await prisma.user.findMany();

	webpush.setVapidDetails('mailto:example@example.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

	for (const user of users) {
		if (user.subscription) {
			const subscription = JSON.parse(user.subscription);
			const payload = JSON.stringify({ title: 'Hello!', body: 'It works!' });

			try {
				await webpush.sendNotification(subscription, payload);
				logger.info('Notification sent');
			} catch (error) {
				logger.error(error, 'Error sending notification');
			}
		}
	}

	return new Response('', {
		headers: {
			'Content-Type': 'application/json'
		}
	});
}
