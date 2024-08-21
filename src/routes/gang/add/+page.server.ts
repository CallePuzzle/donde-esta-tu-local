import { logger } from '$lib/server/logger';
import { initializePrisma } from '$lib/server/db';
import {
	NewNotificationForAdmins,
	type Payload,
	type NotificationExtraData
} from '$lib/utils/notification/notifications';

import type { Actions, RequestEvent } from './$types';
import type { PrismaClient } from '@prisma/client';

export const actions: Actions = {
	new: async (event: RequestEvent) => {
		const formData = await event.request.formData();
		const name = formData.get('name');
		const lat = formData.get('lat');
		const lng = formData.get('lng');

		logger.info({ name, lat, lng }, 'new gang datas');

		const db = event.platform!.env.DB;
		const userId = event.locals.user!.id;
		const prisma = initializePrisma(db);
		try {
			return await addGang(prisma, userId, name as string, lat as string, lng as string);
		} catch (error) {
			logger.error(error);
			return { success: false, error: error };
		}
	}
};

async function addGang(prisma: PrismaClient, userId: string, name: string, lat: string, lng: string) {

	const gang = await prisma.gang.create({
		data: {
			name: name,
			latitude: parseFloat(lat),
			longitude: parseFloat(lng)
		}
	});
	logger.info(gang, 'new gang created');

	const payload: Payload = {
		title: 'Nueva peña',
		body: `Se ha añadido una nueva peña: ${name}`
	};

	const extraData: NotificationExtraData = {
		type: 'gang-added',
		status: 'PENDING',
		relatedGangId: gang.id,
		addedById: userId
	};

	if (!(await NewNotificationForAdmins(payload, extraData, prisma))) {
		return { success: false, error: 'Error sending notification' };
	}

	return {
		success: true,
		data: gang,
		message: 'Peña añadida, a la espera de revisión por un administrador'
	};
}

export async function TestAddGang(
	prisma: PrismaClient,
	userId: string,
	name: string,
	lat: string,
	lng: string
) {
	if (process.env.NODE_ENV === 'test') {
		return addGang(prisma, userId, name, lat, lng);
	}
}
