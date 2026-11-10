import { timingSafeEqual } from 'node:crypto';
import { CRON_SECRET } from '$app/env/private';
import { sendActivityNotifications } from '#lib/server/push-send.ts';
import { logger } from '#lib/logger.ts';

import type { RequestEvent } from './$types';

function isValidCronSecret(token: string): boolean {
	if (!CRON_SECRET) return false;
	const tokenBuffer = Buffer.from(token);
	const secretBuffer = Buffer.from(CRON_SECRET);
	// timingSafeEqual exige buffers de igual longitud; una longitud distinta
	// ya implica que no coincide.
	if (tokenBuffer.length !== secretBuffer.length) return false;
	return timingSafeEqual(tokenBuffer, secretBuffer);
}

export async function POST(event: RequestEvent) {
	const authHeader = event.request.headers.get('authorization');
	const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';

	if (!isValidCronSecret(token)) {
		logger.warn('Intento no autorizado al endpoint de envío de notificaciones');
		return Response.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const result = await sendActivityNotifications();
		logger.info(result, 'Notificaciones de actividad enviadas');
		return Response.json(result);
	} catch (error) {
		logger.error(error, 'Error enviando notificaciones de actividad');
		return Response.json({ error: 'Internal error' }, { status: 500 });
	}
}
