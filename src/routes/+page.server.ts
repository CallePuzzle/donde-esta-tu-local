import { logger } from '$lib/server/logger';
import { initializePrisma } from '$lib/server/db';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const db = event.platform!.env.DB;
	const prisma = initializePrisma(db);
	const gangs = await prisma.gang.findMany();

	logger.debug(gangs, 'Gangs');
	return {
		gangs: gangs
	};
};
