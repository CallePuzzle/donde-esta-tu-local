import { logger } from '$lib/server/logger';
import { initializePrisma } from '$lib/server/db';

import type { RequestEvent } from '@sveltejs/kit';

export async function GET(event: RequestEvent): Promise<Response> {
	const db = event.platform!.env.DB;
	const userId = event.locals.user!.id;
	const prisma = initializePrisma(db);
	const name = event.url.searchParams.get('name');
	logger.info({ user: userId, name: name }, 'check gang data');

	if (!name) {
		return new Response('name is required', { status: 400 });
	}
	if (!userId) {
		return new Response('user logged in is required', { status: 400 });
	}

	// Find a gangs with similar name
	const gangs = await prisma.gang.findMany({
		where: {
			name: {
				contains: name
			}
		}
	});

	return new Response(JSON.stringify(gangs), { status: 200 });
}
