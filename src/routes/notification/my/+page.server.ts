import { logger } from '$lib/server/logger';
import { initializePrisma } from '$lib/server/db';
import { ValidateRefuse } from '$lib/notification/validate-refuse';

import type { Actions, RequestEvent } from './$types';

export const actions: Actions = {
	validateGang: async (event: RequestEvent) => {
		return await validateRefuse(event, 'gang', 'VALIDATED', 'Peña validada, gracias!');
	},
	refuseGang: async (event: RequestEvent) => {
		return await validateRefuse(event, 'gang', 'REFUSED', 'Peña rechazada, gracias!');
	},
	validateMember: async (event: RequestEvent) => {
		return await validateRefuse(event, 'member', 'VALIDATED', 'Nuevo miembro/a aprovado/a');
	},
	refuseMember: async (event: RequestEvent) => {
		return await validateRefuse(event, 'member', 'REFUSED', 'Nuevo miembro/a rechazado/a');
	}
};

async function validateRefuse(event: RequestEvent, type: string, status: string, message: string) {
	const formData = await event.request.formData();
	const notificationId = formData.get('notificationId') as string;
	const userId = formData.get('userId') as string;

	logger.debug({ type: type, status: status }, 'validateRefuse');

	const db = event.platform!.env.DB;
	const prisma = initializePrisma(db);

	return await ValidateRefuse(prisma, parseInt(notificationId), userId, type, status, message);
}
