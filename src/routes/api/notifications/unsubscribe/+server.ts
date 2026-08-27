import { json } from '@sveltejs/kit';
import { z } from 'zod/v4';
import { requireUser } from '$lib/server/membership';
import { requireSameOrigin } from '$lib/server/csrf';
import { deletePushSubscription } from '$lib/server/push-subscription';
import { logger } from '$lib/logger';

import type { RequestEvent } from './$types';

const unsubscribeSchema = z.object({
	endpoint: z.string().url()
});

export async function POST(event: RequestEvent) {
	requireSameOrigin(event.request, event.url);
	requireUser(event.locals);

	let body: unknown;
	try {
		body = await event.request.json();
	} catch {
		return json({ success: false, error: 'Invalid JSON' }, { status: 400 });
	}

	const parsed = unsubscribeSchema.safeParse(body);
	if (!parsed.success) {
		return json({ success: false, error: 'Invalid endpoint' }, { status: 400 });
	}

	try {
		await deletePushSubscription(parsed.data.endpoint);
		return json({ success: true });
	} catch (error) {
		logger.error(error, 'Error borrando suscripción push');
		return json({ success: false, error: 'Internal error' }, { status: 500 });
	}
}
