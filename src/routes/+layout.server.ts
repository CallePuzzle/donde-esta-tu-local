import { logger } from '$lib/logger';
import type { PageServerLoad, PageServerLoadEvent } from './$types';

export const load: PageServerLoad = async (event: PageServerLoadEvent) => {
	logger.debug(event.locals);

	return {};
};
