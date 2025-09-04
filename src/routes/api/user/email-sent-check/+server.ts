import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/db';
import { logger } from '$lib/logger';
import { m } from '$lib/paraglide/messages.js';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const email = url.searchParams.get('email');

		if (!email) {
			return json({ canSend: false, error: m.email_sent_check_required() }, { status: 400 });
		}

		const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
		const emailSent = await prisma.emailSent.findFirst({
			where: {
				email: email as string,
				date: {
					gt: fiveMinutesAgo
				}
			}
		});

		if (emailSent === null) {
			return json({ canSend: true });
		}

		// Check if user has a session created in the last 5 minutes
		const userSession = await prisma.session.findFirst({
			where: {
				user: {
					email: email as string
				},
				createdAt: {
					gt: fiveMinutesAgo
				}
			}
		});

		if (userSession) {
			return json({ canSend: true });
		}

		// Check if 5 minutes have passed since last magic link

		const canSend = emailSent.date <= fiveMinutesAgo;

		if (!canSend) {
			// Calculate remaining time in seconds
			const remainingMs = emailSent.date.getTime() - fiveMinutesAgo.getTime();
			const remainingSeconds = Math.ceil(remainingMs / 1000);

			return json({
				canSend: false,
				error: m.magic_link_already_sent({ remainingSeconds })
			});
		}

		return json({ canSend: true });
	} catch (error) {
		logger.error(error, 'Error checking magic link status');
		return json({ canSend: false, error: m.magic_link_error_checking() }, { status: 500 });
	}
};
