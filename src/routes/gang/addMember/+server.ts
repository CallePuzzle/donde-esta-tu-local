import { json } from '@sveltejs/kit';
import { logger } from '$lib/logger';
import prisma from '$lib/server/db';
import { m } from '$lib/paraglide/messages.js';
import type { RequestHandler, RequestEvent } from './$types';

export const GET: RequestHandler = async (event: RequestEvent) => {
	const userLogged = event.locals.user;

	const url = event.url;
	const userId = url.searchParams.get('userId');
	const gangId = url.searchParams.get('gangId');

	logger.info({ userId, gangId }, 'New member request received');

	if (!userId || !gangId) {
		return json(
			{
				success: false,
				message: 'Missing required parameters'
			},
			{ status: 400 }
		);
	}

	if (!userLogged) {
		return json(
			{
				success: false,
				message: m.error_user_not_logged_in()
			},
			{ status: 404 }
		);
	}

	if (userLogged.id !== userId) {
		return json(
			{
				success: false,
				message: m.request_new_member_error_users_not_match()
			},
			{ status: 404 }
		);
	}

	try {
		const user = await prisma.user.findUnique({
			where: {
				id: userId
			}
		});

		if (!user) {
			return json(
				{
					success: false,
					message: m.error_user_not_found()
				},
				{ status: 404 }
			);
		}

		const userNewMember = await prisma.user.update({
			where: {
				id: userId
			},
			data: {
				gangId: parseInt(gangId),
				membershipGangStatus: 'PENDING'
			}
		});

		logger.info({ user: userNewMember }, 'New member added');

		return json({
			success: true,
			message: m.request_new_member_added(),
			user: userNewMember
		});
	} catch (error) {
		logger.error(error, 'Error adding member to gang');
		return json(
			{
				success: false,
				message: m.request_new_member_error()
			},
			{ status: 500 }
		);
	}
};
