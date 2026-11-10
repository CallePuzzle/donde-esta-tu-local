import { waitUntil } from '@vercel/functions';
import { logger } from '#lib/logger.ts';
import prisma from '#lib/server/db.ts';
import { parseMemberRequest } from '#lib/server/member-request.ts';
import { notifyAdminsPendingMember } from '#lib/server/push-send.ts';
import { m } from '#lib/paraglide/messages.js';
import type { RequestHandler, RequestEvent } from './$types';

export const POST: RequestHandler = async (event: RequestEvent) => {
	const parsed = await parseMemberRequest(event);
	if (!parsed.ok) return parsed.response;
	const { userId, gangId, userLogged, confirmed } = parsed;

	logger.info({ userId, gangId, confirmed }, 'New member request received');

	if (userLogged.id !== userId) {
		return Response.json(
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
			return Response.json(
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
				id: true,
				name: true,
				email: true,
				gangId: true,
				membershipGangStatus: true
			}
		});

		if (!user) {
			return Response.json(
				{
					success: false,
					message: m.error_user_not_found()
				},
				{ status: 404 }
			);
		}

		// Un usuario rechazado no puede volver a solicitar unirse
		if (user.membershipGangStatus === 'REFUSED') {
			return Response.json(
				{
					success: false,
					message: m.request_new_member_refused()
				},
				{ status: 403 }
			);
		}

		// Un miembro ya validado de otra peña solo puede unirse a una nueva si
		// confirma explícitamente que abandona la peña actual.
		if (user.membershipGangStatus === 'VALIDATED' && user.gangId !== gangId) {
			if (!confirmed) {
				const currentGang = user.gangId
					? await prisma.gang.findUnique({
							where: { id: user.gangId },
							select: { id: true, name: true }
						})
					: null;

				return Response.json(
					{
						success: false,
						message: m.request_new_member_already_in_gang({
							name: currentGang?.name ?? ''
						}),
						currentGang: currentGang ?? undefined
					},
					{ status: 409 }
				);
			}
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

		// Notificar a los admins sin bloquear la respuesta al usuario.
		waitUntil(
			notifyAdminsPendingMember(user, gang).catch((error) => {
				logger.error(error, 'Error notifying admins about new pending member');
			})
		);

		return Response.json({
			success: true,
			message: m.request_new_member_added()
		});
	} catch (error) {
		logger.error(error, 'Error adding member to gang');
		return Response.json(
			{
				success: false,
				message: m.request_new_member_error()
			},
			{ status: 500 }
		);
	}
};
