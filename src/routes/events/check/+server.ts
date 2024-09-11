import { logger } from '$lib/server/logger';
import { initializePrisma } from '$lib/server/db';

import type { RequestEvent } from '@sveltejs/kit';

interface ReturnResponse {
	error: boolean;
	message: string;
	data?: any;
}

export async function GET(event: RequestEvent): Promise<Response> {
	const db = event.platform!.env.DB;
	const userId = event.locals.user!.id;
	const prisma = initializePrisma(db);
	logger.info({ user: userId }, 'check event data');

	if (!userId) {
		const ret = { error: true, message: 'user logged in is required' } as ReturnResponse;
		return new Response(JSON.stringify(ret), { status: 400 });
	}
	const user = await prisma.user.findUnique({
		where: {
			id: userId
		}
	});
	if (!user) {
		const ret = { error: true, message: 'user not found' } as ReturnResponse;
		return new Response(JSON.stringify(ret), { status: 404 });
	}
	if (!user.gangId) {
		const ret = { error: true, message: 'user not in a gang' } as ReturnResponse;
		return new Response(JSON.stringify(ret), { status: 400 });
	}
	const now = new Date();
	const twoHoursBefore = new Date(now.getTime() - 2 * 60 * 60 * 1000);
	const notifications = await prisma.notification.findMany({
		where: {
			type: 'message-event',
			relatedGangId: user.gangId,
			createdAt: {
				lte: twoHoursBefore
			}
		}
	});
	const ret = {
		error: false,
		message: 'notifications found',
		data: notifications
	} as ReturnResponse;
	return new Response(JSON.stringify(ret), { status: 200 });
}
