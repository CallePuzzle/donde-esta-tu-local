import type { Handle } from '@sveltejs/kit';
import { logger } from '$lib/logger';
import { isAssetPathname } from '$lib/utils/is-asset-pathname';

export const loggingHandle: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;

	if (isAssetPathname(pathname)) {
		return resolve(event);
	}

	const start = Date.now();
	const { method } = event.request;

	logger.debug(
		{
			userAgent: event.request.headers.get('user-agent'),
			ip: event.getClientAddress()
		},
		'Incoming request context'
	);
	logger.info({ method, pathname }, 'Incoming request');

	const response = await resolve(event);

	const duration = Date.now() - start;

	logger.info(
		{ method, pathname, status: response.status, duration: `${duration}ms` },
		'Request completed'
	);

	return response;
};
