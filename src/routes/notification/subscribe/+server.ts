import { logger } from '$lib/server/logger';
import { initializePrisma } from '$lib/server/db';

import type { RequestEvent } from '@sveltejs/kit';

export async function POST(event: RequestEvent): Promise<Response> {
	const data = await event.request.json();

	logger.info(data, 'notification data');

	const db = event.platform!.env.DB;
	const prisma = initializePrisma(db);

	try {
		const user = await prisma.user.update({
			where: {
				id: data.userId
			},
			data: {
				subscription: JSON.stringify(data.sub)
			}
		});

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
