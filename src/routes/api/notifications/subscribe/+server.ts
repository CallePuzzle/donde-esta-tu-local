import { z } from 'zod/v4';
import { requireUser } from '#lib/server/membership.ts';
import { requireSameOrigin } from '#lib/server/csrf.ts';
import { pushEndpointSchema } from '#lib/server/push-endpoint.ts';
import { PushSubscriptionLimitError, savePushSubscription } from '#lib/server/push-subscription.ts';
import { logger } from '#lib/logger.ts';

import type { RequestEvent } from './$types';

const subscriptionSchema = z.object({
	endpoint: pushEndpointSchema,
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
		logger.warn('Cuerpo JSON inválido en suscripción push');
		return Response.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
	}

	const parsed = subscriptionSchema.safeParse(body);
	if (!parsed.success) {
		logger.warn({ issues: parsed.error.issues }, 'Suscripción push inválida');
		return Response.json({ success: false, error: 'Invalid subscription' }, { status: 400 });
	}

	try {
		await savePushSubscription(user.id, parsed.data);
		logger.debug({ userId: user.id }, 'Suscripción push guardada');
		return Response.json({ success: true });
	} catch (error) {
		if (error instanceof PushSubscriptionLimitError) {
			logger.warn({ userId: user.id }, 'Límite de suscripciones push alcanzado');
			return Response.json({ success: false, error: 'LIMIT_REACHED' }, { status: 409 });
		}
		logger.error(error, 'Error guardando suscripción push');
		return Response.json({ success: false, error: 'Internal error' }, { status: 500 });
	}
}
