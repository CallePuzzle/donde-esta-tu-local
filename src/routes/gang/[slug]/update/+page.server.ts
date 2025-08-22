import { logger } from '$lib/logger';
import prisma from '$lib/server/db';
import { error } from '@sveltejs/kit';

import type { PageServerLoad, PageServerLoadEvent } from './$types';
import type { GangData } from '../type';

export const load: PageServerLoad = async (event: PageServerLoadEvent) => {
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

	return {
		gang: {
			id: gang.id,
			name: gang.name,
			latitude: gang.latitude,
			longitude: gang.longitude,
			status: gang.status
		} as GangData
	};
};
