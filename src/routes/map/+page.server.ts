import { redirect } from '@sveltejs/kit';
import { logger } from '$lib/server/logger';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		logger.warn('User is not logged in');
		return redirect(302, '/login');
	}
	return {
		user: event.locals.user
	};
};