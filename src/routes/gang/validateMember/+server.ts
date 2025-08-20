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

	logger.info({ userId, gangId, validatorId: userLogged?.id }, 'Validate member request received');

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
		const validatorMember = await prisma.user.findUnique({
			where: {
				id: userLogged.id
			},
			select: {
				gangId: true,
				membershipGangStatus: true
			}
		});

		if (
			!validatorMember ||
			validatorMember.gangId !== parseInt(gangId) ||
			validatorMember.membershipGangStatus !== 'VALIDATED'
		) {
			return json(
				{
					success: false,
					message: m.gang_validate_no_permission()
				},
				{ status: 403 }
			);
		}

		// Check if the user to validate exists and is pending
		const userToValidate = await prisma.user.findUnique({
			where: {
				id: userId
			},
			select: {
				gangId: true,
				membershipGangStatus: true
			}
		});

		if (!userToValidate) {
			return json(
				{
					success: false,
					message: m.error_user_not_found()
				},
				{ status: 404 }
			);
		}

		if (userToValidate.gangId !== parseInt(gangId)) {
			return json(
				{
					success: false,
					message: m.gang_validate_user_not_in_gang()
				},
				{ status: 400 }
			);
		}

		if (userToValidate.membershipGangStatus === 'VALIDATED') {
			return json(
				{
					success: false,
					message: m.gang_validate_already_validated()
				},
				{ status: 400 }
			);
		}

		// Validate the member
		const updatedUser = await prisma.user.update({
			where: {
				id: userId
			},
			data: {
				membershipGangStatus: 'VALIDATED'
			}
		});

		logger.info({ user: updatedUser }, 'Member validated successfully');

		return json({
			success: true,
			message: m.gang_validate_success(),
			user: updatedUser
		});
	} catch (error) {
		logger.error(error, 'Error validating member');
		return json(
			{
				success: false,
				message: m.gang_validate_error()
			},
			{ status: 500 }
		);
	}
};
