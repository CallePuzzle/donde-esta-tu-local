import { logger } from '$lib/server/logger';
import { initializePrisma } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import {
	NewNotificationForAdmins,
	NewNotificationForUsers,
	type Payload,
	type NotificationExtraData
} from '$lib/utils/notifications';

import type { Actions, RequestEvent, PageServerLoad } from './$types';
import type { User } from '@prisma/client';

export const actions: Actions = {
	requestNewMember: async (event: RequestEvent) => {
		const formData = await event.request.formData();
		const gangId = formData.get('gangId');
		const userId = formData.get('userId');

		logger.info({ gangId, userId }, 'new member request datas');

		const db = event.platform!.env.DB;
		const prisma = initializePrisma(db);

		const user = await prisma.user.findUnique({
			where: {
				id: userId as string
			}
		});
		const gang = await prisma.gang.findUnique({
			where: {
				id: parseInt(gangId as string)
			},
			include: {
				members: true
			}
		});

		try {
			const payload: Payload = {
				title: 'Nueva solicitud de miembro',
				body: `${user?.name} ha solicitado unirse a la peña ${gang?.name}`
			};

			const extraData: NotificationExtraData = {
				type: 'gang-member-request',
				status: 'PENDING',
				data: {
					gangId: gangId,
					userId: userId
				}
			};

			if (gang?.members.length === 0) {
				if (!(await NewNotificationForAdmins(payload, extraData, db))) {
					return { success: false, error: 'Error sending notification' };
				}
			} else {
				if (!(await NewNotificationForUsers(payload, extraData, gang?.members as User[], db))) {
					return { success: false, error: 'Error sending notification' };
				}
			}

			return {
				success: true,
				type: 'requestNewMember'
			};
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

	return {
		gang: gang,
		members: gang.members
	};
};
