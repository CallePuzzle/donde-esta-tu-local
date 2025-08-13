import prisma from '$lib/server/db';
import { logger } from '$lib/logger';
// import sender from './sender';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { magicLink, admin } from 'better-auth/plugins';
import type { BetterAuthOptions } from 'better-auth';
import { betterAuth } from 'better-auth';

import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';

const database = prismaAdapter(prisma, {
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
					logger.debug('Sending magic link to: ' + email);
					logger.debug(request);
					try {
						// await sender(email, 'sign in', 'token: ' + token + ' -- url: ' + url);
						logger.info('token: ' + token + ' -- url: ' + url);
					} catch (error) {
						logger.error(error);
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
