import { logger } from '$lib/server/logger';
import { initializePrisma } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import { RequestNewMember } from '$lib/utils/gang/request-new-member';

import type { Actions, RequestEvent, PageServerLoad } from './$types';

export const actions: Actions = {
	requestNewMember: async (event: RequestEvent) => {
		const formData = await event.request.formData();
		const gangId = formData.get('gangId');
		const userId = formData.get('userId');

		logger.info({ gangId, userId }, 'new member request datas');

		const db = event.platform!.env.DB;
		const prisma = initializePrisma(db);

		try {
			return await RequestNewMember(prisma, parseInt(gangId as string), userId as string);
		} catch (error) {
			logger.error(error);
			return { success: false, error: error };
		}
	}
};

export const load: PageServerLoad = async (event) => {
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

	let userHasAMembershipRequestForThisGang = 0;
	if (event.locals.user) {
		userHasAMembershipRequestForThisGang = await prisma.notification.count({
			where: {
				type: 'gang-member-request',
				addedByUserId: event.locals.user!.id,
				relatedGangId: parseInt(gangId)
			}
		});
	}

	return {
		gang: gang,
		members: gang.members,
		userHasAMembershipRequestForThisGang: userHasAMembershipRequestForThisGang
	};
};
