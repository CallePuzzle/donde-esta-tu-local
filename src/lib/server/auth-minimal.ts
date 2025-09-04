import prisma from './db';

import { prismaAdapter } from 'better-auth/adapters/prisma';
import { emailOTP, admin } from 'better-auth/plugins';

import { betterAuth } from 'better-auth';

const database = prismaAdapter(prisma, {
	provider: 'postgresql'
});

export const auth = betterAuth({
	database,
	plugins: [
		admin(),
		emailOTP({
			async sendVerificationOTP({ type }) {
				if (type === 'sign-in') {
					// Send the OTP for sign in
				} else if (type === 'email-verification') {
					// Send the OTP for email verification
				} else {
					// Send the OTP for password reset
				}
			}
		})
	]
});
