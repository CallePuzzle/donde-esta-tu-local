import { logger } from '$lib/logger';
import prisma from '$lib/server/db';
import { error } from '@sveltejs/kit';

import type { PageServerLoad, PageServerLoadEvent } from './$types';

export const load: PageServerLoad = async (event: PageServerLoadEvent) => {
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
					image: true
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
