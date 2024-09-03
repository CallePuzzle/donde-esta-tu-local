import { logger } from '$lib/server/logger';
import { initializePrisma } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import {
	NewNotificationForAdmins,
	NewNotificationForUsers,
	type Payload,
	type NotificationExtraData
} from '$lib/utils/notification/notifications';

import type { Actions, RequestEvent, PageServerLoad } from './$types';
import type { PrismaClient, User } from '@prisma/client';

export const actions: Actions = {
	requestNewMember: async (event: RequestEvent) => {
		const formData = await event.request.formData();
		const gangId = formData.get('gangId');
		const userId = formData.get('userId');

		logger.info({ gangId, userId }, 'new member request datas');

		const db = event.platform!.env.DB;
		const prisma = initializePrisma(db);

		try {
			await requestNewMember(prisma, parseInt(gangId as string), userId as string);
		} catch (error) {
			logger.error(error);
			return { success: false, error: error };
		}
	}
};

async function requestNewMember(prisma: PrismaClient, gangId: number, userId: string) {
	const user = await prisma.user.findUnique({
		where: {
			id: userId as string
		}
	});
	const gang = await prisma.gang.findUnique({
		where: {
			id: gangId
		},
		include: {
			members: true
		}
	});

	const payload: Payload = {
		title: 'Nueva solicitud de miembro',
		body: `${user?.name} ha solicitado unirse a la peña ${gang?.name}`
	};

	const extraData: NotificationExtraData = {
		type: 'gang-member-request',
		status: 'PENDING',
		relatedGangId: gang?.id,
		addedByUserId: user?.id
	};

	if (gang?.members.length === 0) {
		if (!(await NewNotificationForAdmins(payload, extraData, prisma))) {
			return { success: false, error: 'Error sending notification' };
		}
	} else {
		if (!(await NewNotificationForUsers(payload, extraData, gang?.members as User[], prisma))) {
			return { success: false, error: 'Error sending notification' };
		}
	}

	return {
		success: true,
		data: {
			user: user,
			gang: gang
		},
		type: 'requestNewMember'
	};
}

export async function _RequestNewMember(prisma: PrismaClient, gangId: number, userId: string) {
	if (process.env.NODE_ENV === 'test') {
		return requestNewMember(prisma, gangId, userId);
	}
}

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
