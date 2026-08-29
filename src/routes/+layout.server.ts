import { logger } from '$lib/logger';
import type { LayoutServerLoad, LayoutServerLoadEvent } from './$types';

export const load: LayoutServerLoad = async (event: LayoutServerLoadEvent) => {
	const user = event.locals.user;
	logger.debug(user?.email, 'User loaded');

	const path = event.route.id;
	const appUrl = event.url.origin;

	return { user, path, appUrl };
};
