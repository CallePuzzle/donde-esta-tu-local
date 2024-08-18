import { logger } from '$lib/server/logger';
import { initializePrisma } from '$lib/server/db';
import { error } from '@sveltejs/kit';

import type { Actions, PageServerLoad } from './$types';

export const actions: Actions = {
	addRequestsValidation: async (event) => {
		const formData = await event.request.formData();
		const gangId = formData.get('gangId');
		const userId = formData.get('userId');

		logger.info({ gangId, userId }, 'add requests validation');

		const db = event.platform!.env.DB;
		const prisma = initializePrisma(db);

		try {
			const gangRequestValidation = await prisma.gangRequestValidation.create({
				data: {
					gangId: parseInt(gangId as string),
					userId: userId as string
				}
			});
			return { validation: true, data: gangRequestValidation };
		} catch (error) {
			logger.error(error);
			return { validation: false, error: error };
		}
	}
};

export const load: PageServerLoad = async (event) => {
	let gangRequestValidationByUser = false;

	const db = event.platform!.env.DB;
	const prisma = initializePrisma(db);
	const gangId = event.params.slug;
	const gang = await prisma.gang.findUnique({
		where: {
			status: {
				not: 'REFUSED'
			},
			id: parseInt(gangId)
		},
		include: {
			members: {
				select: {
					id: true,
					name: true,
					picture: true
				}
			}
		}
	});
	logger.debug(gang, 'gang');
	if (!gang) {
		return error(404, 'Peña no encontrada');
	}

	if (event.locals.user) {
		const _gangRequestValidationByUser = await prisma.gangRequestValidation.count({
			where: {
				gangId: parseInt(gangId),
				userId: event.locals.user.id
			}
		});
		gangRequestValidationByUser = _gangRequestValidationByUser > 0;
		logger.debug(gangRequestValidationByUser, 'gangRequestValidationByUser');
	}

	return {
		gang: gang,
		members: gang.members,
		gangRequestValidationByUser: gangRequestValidationByUser
	};
};
