import { json } from '@sveltejs/kit';
import { CRON_SECRET } from '$env/static/private';
import { sendActivityNotifications } from '$lib/server/push-send';
import { logger } from '$lib/logger';

import type { RequestEvent } from './$types';

export async function POST(event: RequestEvent) {
	const authHeader = event.request.headers.get('authorization');
	const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';

	if (token !== CRON_SECRET || !CRON_SECRET) {
		logger.warn('Intento no autorizado al endpoint de envío de notificaciones');
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const result = await sendActivityNotifications();
		logger.info(result, 'Notificaciones de actividad enviadas');
		return json(result);
	} catch (error) {
		logger.error(error, 'Error enviando notificaciones de actividad');
		return json({ error: 'Internal error' }, { status: 500 });
	}
}
