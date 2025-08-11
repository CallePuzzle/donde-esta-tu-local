import db from './db';
// import sender from './sender';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { magicLink, admin } from 'better-auth/plugins';
import type { BetterAuthOptions } from 'better-auth';
import { betterAuth } from 'better-auth';

import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';

const database = prismaAdapter(db, {
	provider: 'postgresql'
});

const additionalOptions: BetterAuthOptions = {
	database: database
};

function getBetterAuth(additionalOptions: BetterAuthOptions): ReturnType<typeof betterAuth> {
	const defaultOptions: BetterAuthOptions = {
		plugins: [
			sveltekitCookies(getRequestEvent),
			magicLink({
				sendMagicLink: async ({ email, token, url }, request) => {
					console.log(request);
					try {
						// await sender(email, 'sign in', 'token: ' + token + ' -- url: ' + url);
						console.log(email, 'sign in', 'token: ' + token + ' -- url: ' + url);
					} catch (error) {
						console.error(error);
						throw error;
					}
				}
			}),
			admin()
		]
	};

	const options = {
		...defaultOptions,
		...additionalOptions
	};

	return betterAuth(options);
}

export const auth = getBetterAuth(additionalOptions);
