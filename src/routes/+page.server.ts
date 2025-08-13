import { logger } from '$lib/logger';
import prisma from '$lib/server/db';
import type { PageServerLoad, PageServerLoadEvent } from './$types';

export const load: PageServerLoad = async (event: PageServerLoadEvent) => {
	const gangs = await prisma.gang.findMany({
		where: {
			status: {
				not: 'REFUSED'
			}
		}
	});
	logger.debug(gangs, 'gangs');

	return {
		gangs: gangs
	};
};
