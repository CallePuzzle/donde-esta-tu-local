import { JWK } from '$env/static/private';
import { buildRequest, type PushSubscription } from 'cf-webpush';
import { logger } from '$lib/server/logger';
import { initializePrisma } from '$lib/server/db';

import type { RequestEvent } from '@sveltejs/kit';

export async function GET(event: RequestEvent): Promise<Response> {
	const db = event.platform!.env.DB;
	const prisma = initializePrisma(db);

	const users = await prisma.user.findMany();

	for (const user of users) {
		if (user.subscription) {
			const subscription: PushSubscription = JSON.parse(user.subscription);
			const payload = JSON.stringify({ title: 'Hello!', body: 'It works!' });

			try {
				const jwk = JSON.parse(JWK);
				const ttl = 20 * 60 * 60; // 20 hours
				const host = new URL(subscription.endpoint).origin;
				const pushRequest = await buildRequest(
					{
						jwk,
						ttl,
						jwt: {
							aud: host,
							exp: Math.floor(Date.now() / 1000) + ttl,
							sub: '99479536+aynh@users.noreply.github.com'
						},
						payload
					},
					subscription
				);

				const response = await fetch(pushRequest);
				const responseText = await response.text();
				logger.info(response.status, 'Notification status');
				logger.info(responseText);
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
