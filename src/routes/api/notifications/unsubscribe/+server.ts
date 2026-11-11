import { z } from 'zod/v4';
import { requireUser } from '#lib/server/membership.ts';
import { requireSameOrigin } from '#lib/server/csrf.ts';
import { pushEndpointSchema } from '#lib/server/push-endpoint.ts';
import { deletePushSubscriptionForUser } from '#lib/server/push-subscription.ts';
import { logger } from '#lib/logger.ts';

import type { RequestEvent } from './$types';

const unsubscribeSchema = z.object({
	endpoint: pushEndpointSchema
});

export async function POST(event: RequestEvent) {
	requireSameOrigin(event.request, event.url);
	const user = requireUser(event.locals);

	let body: unknown;
	try {
		body = await event.request.json();
	} catch {
		return Response.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
	}

	const parsed = unsubscribeSchema.safeParse(body);
	if (!parsed.success) {
		return Response.json({ success: false, error: 'Invalid endpoint' }, { status: 400 });
	}

	try {
		await deletePushSubscriptionForUser(parsed.data.endpoint, user.id);
		return Response.json({ success: true });
	} catch (error) {
		logger.error(error, 'Error borrando suscripción push');
		return Response.json({ success: false, error: 'Internal error' }, { status: 500 });
	}
}
