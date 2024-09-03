import { dev } from '$app/environment';
import { Lucia } from 'lucia';
import { D1Adapter } from '@lucia-auth/adapter-sqlite';
import { Auth0 } from 'arctic';
import {
	AUTH0_DOMAIN,
	AUTH0_CLIENT_ID,
	AUTH0_CLIENT_SECRET,
	AUTH0_REDIRECT_URI
} from '$env/static/private';
import type { D1Database } from '@cloudflare/workers-types';

export function initializeLucia(D1: D1Database) {
	const adapter = new D1Adapter(D1, {
		user: 'user',
		session: 'session'
	});
	return new Lucia(adapter, {
		sessionCookie: {
			attributes: {
				secure: !dev
			}
		}
	});
}

declare module 'lucia' {
	interface Register {
		Lucia: ReturnType<typeof initializeLucia>;
	}
}

export const auth0 = new Auth0(
	AUTH0_DOMAIN,
	AUTH0_CLIENT_ID,
	AUTH0_CLIENT_SECRET,
	AUTH0_REDIRECT_URI
);
