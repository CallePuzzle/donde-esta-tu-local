import { redirect } from '@sveltejs/kit';
import { logger } from '$lib/server/logger';
import { Auth0Tokens } from '$lib/server/store';
import { get } from 'svelte/store';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		logger.warn('User is not logged in');
		return new Response(null, {
			status: 401
		});
	}
	return {
		user: event.locals.user,
		tokens: get(Auth0Tokens)
	};
};
