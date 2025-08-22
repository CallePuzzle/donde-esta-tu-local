import prisma from '$lib/server/db';
import { logger } from '$lib/logger';
import sender from './sender';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { magicLink, admin } from 'better-auth/plugins';
import type { BetterAuthOptions } from 'better-auth';
import { betterAuth } from 'better-auth';
import { SMTP_HOST, SMPT_AUTH_USER, SMPT_AUTH_PASS, SMPT_SENDER } from '$env/static/private';
import { dev } from '$app/environment';

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
						logger.info('token: ' + token + ' -- url: ' + url);

						// Send email when not in development
						if (!dev) {
							const transporterOptions = {
								host: SMTP_HOST,
								port: 587,
								secure: false,
								auth: {
									user: SMPT_AUTH_USER,
									pass: SMPT_AUTH_PASS
								}
							};

							const subject = 'Tu enlace mágico de acceso';
							const text = `Haz clic en el siguiente enlace para acceder: ${url}`;

							await sender(transporterOptions, SMPT_SENDER, email, subject, text);
							logger.info(`Magic link email sent to ${email}`);
						}
						// Update the timestamp for last magic link sent
						await prisma.user.update({
							where: { email },
							data: { lastMagicLinkSentAt: new Date() }
						});
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
