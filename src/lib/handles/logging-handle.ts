import type { Handle } from '@sveltejs/kit';
import { logger } from '$lib/logger';

export const loggingHandle: Handle = async ({ event, resolve }) => {
	const start = Date.now();
	const { method, url } = event.request;

	logger.info(
		{
			method,
			url: url.toString(),
			userAgent: event.request.headers.get('user-agent'),
			ip: event.getClientAddress()
		},
		'Incoming request'
	);

	const response = await resolve(event);

	const duration = Date.now() - start;

	logger.info(
		{
			method,
			url: url.toString(),
			status: response.status,
			duration: `${duration}ms`
		},
		'Request completed'
	);

	return response;
};
