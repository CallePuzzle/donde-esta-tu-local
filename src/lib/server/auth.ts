import prisma from '$lib/server/db';
import { logger } from '$lib/logger';
import { m } from '$lib/paraglide/messages.js';
import sender from './sender';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { dev } from '$app/environment';
import { getBetterAuth, emailOtpPreset } from '@callepuzzle/auth/server';
import type { SendVerificationOtp } from '@callepuzzle/auth/server';
import { SMTP_HOST, SMPT_AUTH_USER, SMPT_AUTH_PASS, SMPT_SENDER } from '$env/static/private';

const sendVerificationOtp: SendVerificationOtp = async ({ email, otp, type }) => {
	if (type === 'sign-in') {
		logger.info('Sending OTP to: ' + email);

		try {
			if (dev) {
				logger.debug('email: ' + email + ' -- otp: ' + otp);
			}

			// Envío real del email fuera de desarrollo
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

				const subject = m.email_otp_subject();
				const text = m.email_otp_body({ otp });

				await sender(transporterOptions, SMPT_SENDER, email, subject, text);
				logger.info(`OTP email sent to ${email}`);
			}
		} catch (error) {
			logger.error(error);
			throw error;
		}
	} else {
		logger.error('Invalid OTP type: ' + type);
	}
};

export const auth = getBetterAuth({
	database: prismaAdapter(prisma, { provider: 'postgresql' }),
	rateLimit: {
		// Límite estricto en las rutas de OTP por email: 3 peticiones por minuto por IP
		// (por defecto better-auth solo aplica rate limit en producción)
		customRules: {
			'/email-otp/send-verification-otp': {
				window: 60,
				max: 3
			},
			'/sign-in/email-otp': {
				window: 60,
				max: 3
			}
		}
	},
	plugins: [sveltekitCookies(getRequestEvent), emailOtpPreset(sendVerificationOtp), admin()]
});
