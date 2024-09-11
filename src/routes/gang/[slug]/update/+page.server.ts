import { logger } from '$lib/server/logger';
import { initializePrisma } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import { HasPermission } from '$lib/permissions';

import type { Actions, RequestEvent, PageServerLoad } from './$types';

export const actions: Actions = {
	changeCoords: async (event: RequestEvent) => {
		const formData = await event.request.formData();
		const lat = formData.get('lat');
		const lng = formData.get('lng');
		const gangId = event.params.slug;

		logger.info({ gangId, lat, lng }, 'change coords datas');

		const db = event.platform!.env.DB;
		const prisma = initializePrisma(db);
		try {
			await prisma.gang.update({
				where: {
					id: parseInt(gangId)
				},
				data: {
					latitude: parseFloat(lat as string),
					longitude: parseFloat(lng as string)
				}
			});
			return { success: true, message: 'Coordenadas actualizadas' };
		} catch (error) {
			logger.error(error);
			return { success: false, error: error };
		}
	},
	changeName: async (event: RequestEvent) => {
		const formData = await event.request.formData();
		const name = formData.get('name');
		const gangId = event.params.slug;

		logger.info({ gangId, name }, 'change name datas');

		const db = event.platform!.env.DB;
		const prisma = initializePrisma(db);
		try {
			await prisma.gang.update({
				where: {
					id: parseInt(gangId)
				},
				data: {
					name: name as string
				}
			});
			return { success: true, message: 'Nombre actualizado' };
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
		}
	});
	logger.debug(gang, 'gang');
	if (!gang) {
		return error(404, 'Peña no encontrada');
	}

	if (event.locals.user) {
		const user = await prisma.user.findUnique({
			where: {
				id: event.locals.user.id
			}
		});

		if (!HasPermission(user, 'ADMIN')) {
			return error(403, 'No tienes permisos para acceder a esta página');
		}
	}

	return {
		gang: gang
	};
};
