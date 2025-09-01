import prisma from '$lib/server/db';
import { logger } from '$lib/logger';
import sender from './sender';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { emailOTP, admin } from 'better-auth/plugins';
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
			emailOTP({
				sendVerificationOTP: async ({ email, otp, type }) => {
					if (type === 'sign-in') {
						logger.info('Sending OTP to: ' + email);

						try {
							logger.debug('email: ' + email + ' -- otp: ' + otp);

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

								const subject = 'Tu código de acceso para peñas.montemayordepililla.cc';
								const text = `Este es tu código para acceder: ${otp}`;

								await sender(transporterOptions, SMPT_SENDER, email, subject, text);
								logger.info(`OTP email sent to ${email}`);
							}
							await prisma.emailSent.create({
								data: {
									email
								}
							});
						} catch (error) {
							logger.error(error);
							throw error;
						}
					} else {
						logger.error('Invalid OTP type: ' + type);
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
