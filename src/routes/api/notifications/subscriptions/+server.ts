import { requireUser } from '#lib/server/membership.ts';
import { requireSameOrigin } from '#lib/server/csrf.ts';
import { deletePushSubscriptionsByUser } from '#lib/server/push-subscription.ts';
import { logger } from '#lib/logger.ts';

import type { RequestEvent } from './$types';

export async function DELETE(event: RequestEvent) {
	requireSameOrigin(event.request, event.url);
	const user = requireUser(event.locals);

	try {
		await deletePushSubscriptionsByUser(user.id);
		return Response.json({ success: true });
	} catch (error) {
		logger.error(error, 'Error borrando suscripciones push del usuario');
		return Response.json({ success: false, error: 'Internal error' }, { status: 500 });
	}
}
