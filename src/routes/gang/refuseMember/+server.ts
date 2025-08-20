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

	logger.info({ userId, gangId, rejectorId: userLogged?.id }, 'Refuse member request received');

	if (!userId || !gangId) {
		return json(
			{
				success: false,
				message: m.error_missing_parameters()
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
			{ status: 401 }
		);
	}

	try {
		// Check if the logged user is a validated member of the gang
		const rejectorMember = await prisma.user.findUnique({
			where: {
				id: userLogged.id
			},
			select: {
				gangId: true,
				membershipGangStatus: true
			}
		});

		if (
			!rejectorMember ||
			rejectorMember.gangId !== parseInt(gangId) ||
			rejectorMember.membershipGangStatus !== 'VALIDATED'
		) {
			return json(
				{
					success: false,
					message: m.gang_refuse_no_permission()
				},
				{ status: 403 }
			);
		}

		// Check if the user to refuse exists and is pending
		const userToRefuse = await prisma.user.findUnique({
			where: {
				id: userId
			},
			select: {
				gangId: true,
				membershipGangStatus: true
			}
		});

		if (!userToRefuse) {
			return json(
				{
					success: false,
					message: m.error_user_not_found()
				},
				{ status: 404 }
			);
		}

		if (userToRefuse.gangId !== parseInt(gangId)) {
			return json(
				{
					success: false,
					message: m.gang_refuse_user_not_in_gang()
				},
				{ status: 400 }
			);
		}

		if (userToRefuse.membershipGangStatus === 'VALIDATED') {
			return json(
				{
					success: false,
					message: m.gang_refuse_cannot_refuse_validated()
				},
				{ status: 400 }
			);
		}

		// Remove the member from the gang
		const updatedUser = await prisma.user.update({
			where: {
				id: userId
			},
			data: {
				membershipGangStatus: 'REJECTED'
			}
		});

		logger.info({ user: updatedUser }, 'Member refused successfully');

		return json({
			success: true,
			message: m.gang_refuse_success(),
			user: updatedUser
		});
	} catch (error) {
		logger.error(error, 'Error refusing member');
		return json(
			{
				success: false,
				message: m.gang_refuse_error()
			},
			{ status: 500 }
		);
	}
};
