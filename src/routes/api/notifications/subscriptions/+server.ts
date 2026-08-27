import { json } from '@sveltejs/kit';
import { requireUser } from '$lib/server/membership';
import { requireSameOrigin } from '$lib/server/csrf';
import { deletePushSubscriptionsByUser } from '$lib/server/push-subscription';
import { logger } from '$lib/logger';

import type { RequestEvent } from './$types';

export async function DELETE(event: RequestEvent) {
	requireSameOrigin(event.request, event.url);
	const user = requireUser(event.locals);

	try {
		await deletePushSubscriptionsByUser(user.id);
		return json({ success: true });
	} catch (error) {
		logger.error(error, 'Error borrando suscripciones push del usuario');
		return json({ success: false, error: 'Internal error' }, { status: 500 });
	}
}
