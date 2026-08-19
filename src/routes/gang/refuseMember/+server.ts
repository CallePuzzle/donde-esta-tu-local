import { json } from '@sveltejs/kit';
import { logger } from '$lib/logger';
import prisma from '$lib/server/db';
import { canManageGangMembers } from '$lib/server/membership';
import { parseMemberRequest } from '$lib/server/member-request';
import { m } from '$lib/paraglide/messages.js';
import type { RequestHandler, RequestEvent } from './$types';

export const POST: RequestHandler = async (event: RequestEvent) => {
	const parsed = await parseMemberRequest(event);
	if (!parsed.ok) return parsed.response;
	const { userId, gangId, userLogged } = parsed;

	logger.info({ userId, gangId, rejectorId: userLogged.id }, 'Refuse member request received');

	try {
		// Solo miembros validados de la peña o admin/system pueden rechazar
		if (!(await canManageGangMembers(userLogged, gangId))) {
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

		if (userToRefuse.gangId !== gangId) {
			return json(
				{
					success: false,
					message: m.gang_refuse_user_not_in_gang()
				},
				{ status: 400 }
			);
		}

		// Remove the member from the gang. Se limpia gangId para no dejar al
		// usuario "colgado" de una peña de la que ya no es miembro (arreglo
		// mínimo de B7; el usuario sigue sin poder solicitar unirse a NINGUNA
		// peña mientras membershipGangStatus sea REFUSED, ver addMember).
		const updatedUser = await prisma.user.update({
			where: {
				id: userId
			},
			data: {
				membershipGangStatus: 'REFUSED',
				gangId: null
			},
			select: {
				id: true,
				gangId: true
			}
		});

		logger.info(
			{ userId: updatedUser.id, gangId: updatedUser.gangId },
			'Member refused successfully'
		);

		return json({
			success: true,
			message: m.gang_refuse_success()
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
