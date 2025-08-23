import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/db';
import { logger } from '$lib/logger';
import { m } from '$lib/paraglide/messages.js';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const email = url.searchParams.get('email');

		if (!email) {
			return json({ canSend: false, error: m.magic_link_email_required() }, { status: 400 });
		}

		// Check if user exists and when was the last magic link sent
		const user = await prisma.user.findUnique({
			where: { email },
			select: { lastMagicLinkSentAt: true }
		});

		// If user doesn't exist or never sent a magic link, allow sending
		if (!user || !user.lastMagicLinkSentAt) {
			return json({ canSend: true });
		}

		// Check if 5 minutes have passed since last magic link
		const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
		const canSend = user.lastMagicLinkSentAt <= fiveMinutesAgo;

		if (!canSend) {
			// Calculate remaining time in seconds
			const remainingMs = user.lastMagicLinkSentAt.getTime() - fiveMinutesAgo.getTime();
			const remainingSeconds = Math.ceil(remainingMs / 1000);

			return json({
				canSend: false,
				error: m.magic_link_already_sent(),
				remainingSeconds
			});
		}

		return json({ canSend: true });
	} catch (error) {
		logger.error(error, 'Error checking magic link status');
		return json({ canSend: false, error: m.magic_link_error_checking() }, { status: 500 });
	}
};
