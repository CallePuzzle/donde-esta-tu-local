import db from './db';
// import sender from './sender';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { magicLink, organization, admin } from 'better-auth/plugins';
import type { BetterAuthOptions } from 'better-auth';
import { betterAuth } from 'better-auth';

const database = prismaAdapter(db, {
	provider: 'postgresql'
});

const additionalOptions: BetterAuthOptions = {
	database: database
};

function getBetterAuth(additionalOptions: BetterAuthOptions): ReturnType<typeof betterAuth> {
	const defaultOptions: BetterAuthOptions = {
		plugins: [
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
			organization(),
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
