import { logger } from '$lib/logger';
import prisma from '$lib/server/db';
import webpush from '$lib/server/web-push';
import type { PushSubscription } from 'web-push';

import type { RequestEvent } from '@sveltejs/kit';

export async function GET(event: RequestEvent): Promise<Response> {
	const userId = event.url.searchParams.get('userId');

	if (!userId) {
		return new Response('userId is required', {
			status: 400
		});
	}

	try {
		const user = await prisma.user.findFirst({
			where: {
				id: userId
			},
			select: {
				subscription: true
			}
		});

		if (!user) {
			return new Response('user not found', {
				status: 404
			});
		}

		if (!user.subscription) {
			return new Response('user has no subscription', {
				status: 400
			});
		}

		const subscription: PushSubscription = JSON.parse(user.subscription);

		const payload = JSON.stringify({ title: 'hola', body: 'hlablablaasdfad' });

		try {
			await webpush.sendNotification(subscription, payload);
		} catch (err) {
			console.error('Error enviando push:', err);
		}

		return new Response('ok', {
			status: 200
		});
	} catch (error) {
		logger.error(error, 'error updating user');
		return new Response('error', {
			status: 500
		});
	}
}
