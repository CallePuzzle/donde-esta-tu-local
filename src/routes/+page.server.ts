import { initializeLucia } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import { logger } from '$lib/server/logger';

import type { Actions } from './$types';

export const actions: Actions = {
	default: async (event) => {
		const db = event.platform!.env.DB;
		const lucia = initializeLucia(db);

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
		return redirect(302, '/');
	}
};
