import { json } from '@sveltejs/kit';
import { logger } from '$lib/logger';
import prisma from '$lib/server/db';
import { parseMemberRequest } from '$lib/server/member-request';
import { m } from '$lib/paraglide/messages.js';
import type { RequestHandler, RequestEvent } from './$types';

export const POST: RequestHandler = async (event: RequestEvent) => {
	const parsed = await parseMemberRequest(event);
	if (!parsed.ok) return parsed.response;
	const { userId, gangId, userLogged } = parsed;

	logger.info({ userId, gangId }, 'New member request received');

	if (userLogged.id !== userId) {
		return json(
			{
				success: false,
				message: m.request_new_member_error_users_not_match()
			},
			{ status: 403 }
		);
	}

	try {
		// La peña debe existir y estar validada
		const gang = await prisma.gang.findUnique({
			where: {
				id: gangId
			}
		});

		if (!gang || gang.status !== 'VALIDATED') {
			return json(
				{
					success: false,
					message: m.request_new_member_gang_not_validated()
				},
				{ status: 404 }
			);
		}

		const user = await prisma.user.findUnique({
			where: {
				id: userId
			},
			select: {
				gangId: true,
				membershipGangStatus: true
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

		// Un usuario rechazado no puede volver a solicitar unirse
		if (user.membershipGangStatus === 'REFUSED') {
			return json(
				{
					success: false,
					message: m.request_new_member_refused()
				},
				{ status: 403 }
			);
		}

		// Un miembro ya validado de otra peña no puede unirse a esta en
		// silencio: antes sobreescribía gangId sin dejar rastro en GangHistory
		// ni avisar a nadie.
		if (user.membershipGangStatus === 'VALIDATED' && user.gangId !== gangId) {
			return json(
				{
					success: false,
					message: m.request_new_member_already_in_gang()
				},
				{ status: 409 }
			);
		}

		const userNewMember = await prisma.user.update({
			where: {
				id: userId
			},
			data: {
				gangId: gangId,
				membershipGangStatus: 'PENDING'
			},
			select: {
				id: true,
				gangId: true
			}
		});

		logger.info({ userId: userNewMember.id, gangId: userNewMember.gangId }, 'New member added');

		return json({
			success: true,
			message: m.request_new_member_added()
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
