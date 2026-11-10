import { logger } from '#lib/logger.ts';
import prisma from '#lib/server/db.ts';
import { canManageGangMembers } from '#lib/server/membership.ts';
import { parseMemberRequest } from '#lib/server/member-request.ts';
import { m } from '#lib/paraglide/messages.js';
import type { RequestHandler, RequestEvent } from './$types';

export const POST: RequestHandler = async (event: RequestEvent) => {
	const parsed = await parseMemberRequest(event);
	if (!parsed.ok) return parsed.response;
	const { userId, gangId, userLogged } = parsed;

	logger.info({ userId, gangId, validatorId: userLogged.id }, 'Validate member request received');

	try {
		// Solo miembros validados de la peña o admin/system pueden validar
		if (!(await canManageGangMembers(userLogged, gangId))) {
			return Response.json(
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
			return Response.json(
				{
					success: false,
					message: m.error_user_not_found()
				},
				{ status: 404 }
			);
		}

		if (userToValidate.gangId !== gangId) {
			return Response.json(
				{
					success: false,
					message: m.gang_validate_user_not_in_gang()
				},
				{ status: 400 }
			);
		}

		if (userToValidate.membershipGangStatus === 'VALIDATED') {
			return Response.json(
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
			},
			select: {
				id: true,
				gangId: true
			}
		});

		logger.info(
			{ userId: updatedUser.id, gangId: updatedUser.gangId },
			'Member validated successfully'
		);

		return Response.json({
			success: true,
			message: m.gang_validate_success()
		});
	} catch (error) {
		logger.error(error, 'Error validating member');
		return Response.json(
			{
				success: false,
				message: m.gang_validate_error()
			},
			{ status: 500 }
		);
	}
};
