import { json } from '@sveltejs/kit';
import { z } from 'zod/v4';
import { requireUser } from '$lib/server/membership';
import { requireSameOrigin } from '$lib/server/csrf';
import { savePushSubscription } from '$lib/server/push-subscription';
import { logger } from '$lib/logger';

import type { RequestEvent } from './$types';

const subscriptionSchema = z.object({
	endpoint: z.string().url(),
	keys: z.object({
		p256dh: z.string().min(1),
		auth: z.string().min(1)
	})
});

export async function POST(event: RequestEvent) {
	requireSameOrigin(event.request, event.url);
	const user = requireUser(event.locals);

	let body: unknown;
	try {
		body = await event.request.json();
	} catch {
		return json({ success: false, error: 'Invalid JSON' }, { status: 400 });
	}

	const parsed = subscriptionSchema.safeParse(body);
	if (!parsed.success) {
		return json({ success: false, error: 'Invalid subscription' }, { status: 400 });
	}

	try {
		await savePushSubscription(user.id, parsed.data);
		return json({ success: true });
	} catch (error) {
		logger.error(error, 'Error guardando suscripción push');
		return json({ success: false, error: 'Internal error' }, { status: 500 });
	}
}
