import { logger } from '$lib/server/logger';
import type { PrismaClient } from '@prisma/client';
import {
	NewNotificationForAdmins,
	type Payload,
	type NotificationExtraData
} from '$lib/notification/notifications';

export async function AddGang(
	prisma: PrismaClient,
	userId: string,
	name: string,
	lat: string,
	lng: string
) {
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
		addedByUserId: userId
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
