import { logger } from '$lib/server/logger';
import { initializePrisma } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import { RequestNewMember } from '$lib/gang/request-new-member';

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
	},
	visitGang: async (event: RequestEvent) => {
		const formData = await event.request.formData();
		const gangId = formData.get('gangId');
		const userId = formData.get('userId');

		logger.info({ gangId, userId }, 'visit gang datas');

		const db = event.platform!.env.DB;
		const prisma = initializePrisma(db);

		try {
			await prisma.gang.update({
				where: {
					id: parseInt(gangId as string)
				},
				data: {
					visitedBy: {
						connect: {
							id: userId as string
						}
					}
				}
			});
			return { success: true, type: 'visitGang' };
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
			},
			visitedBy: true
		}
	});
	logger.debug(gang, 'gang');
	if (!gang) {
		return error(404, 'Peña no encontrada');
	}

	let userHasAMembershipRequestForThisGang = 0;
	let userHasVisitedThisGang = false;
	if (event.locals.user) {
		userHasAMembershipRequestForThisGang = await prisma.notification.count({
			where: {
				type: 'gang-member-request',
				addedByUserId: event.locals.user!.id,
				relatedGangId: parseInt(gangId)
			}
		});
		if (gang.visitedBy.find((user) => user.id === event.locals.user!.id)) {
			userHasVisitedThisGang = true;
		}
	}

	return {
		gang: gang,
		members: gang.members,
		userHasAMembershipRequestForThisGang: userHasAMembershipRequestForThisGang,
		userHasVisitedThisGang: userHasVisitedThisGang
	};
};
