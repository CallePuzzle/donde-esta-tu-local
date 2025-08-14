import { logger } from '$lib/logger';
import { APP_URL } from '$env/static/private';
import type { LayoutServerLoad, LayoutServerLoadEvent } from './$types';

export const load: LayoutServerLoad = async (event: LayoutServerLoadEvent) => {
	const user = await event.locals.user;
	logger.debug(user?.email, 'User loaded');

	const path = event.route.id;
	const appUrl = APP_URL;

	return { user, path, appUrl };
};
