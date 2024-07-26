import { lucia } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import { logger } from '$lib/server/logger';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		logger.warn('User is not logged in');
		return redirect(302, '/login');
	}
	return {
		user: event.locals.user
	};
};

export const actions: Actions = {
	default: async (event) => {
		logger.info('logout action');
		if (!event.locals.session) {
			return fail(401);
		}
		await lucia.invalidateSession(event.locals.session.id);
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
		return redirect(302, '/login');
	}
};
