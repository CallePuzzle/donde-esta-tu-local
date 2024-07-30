import { initializeLucia, Auth0AppDomain } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import { logger } from '$lib/server/logger';
import { Auth0Tokens } from '$lib/server/store';
import { AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET } from '$env/static/private';
import { get } from 'svelte/store';

import type { Actions } from './$types';

export const actions: Actions = {
	default: async (event) => {
		const db = event.platform!.env.DB;
		const lucia = initializeLucia(db);

		logger.info('logout action');
		if (!event.locals.session) {
			return fail(401);
		}

		const tokens = get(Auth0Tokens);

		if (tokens !== undefined) {
			const body = {
				client_id: AUTH0_CLIENT_ID,
				client_secret: AUTH0_CLIENT_SECRET,
				token: tokens.refreshToken
			};
			const response = await fetch(Auth0AppDomain + '/oauth/revoke', {
				headers: {
					'Content-Type': 'application/json',
				},
				method: 'POST',
				body: JSON.stringify(body)
			});
			logger.debug(body, 'auth0 revoke request');
			logger.info(response, 'auth0 revoke response');
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
