import { logger } from '$lib/logger';
import type { LayoutServerLoad, LayoutServerLoadEvent } from './$types';

export const load: LayoutServerLoad = async (event: LayoutServerLoadEvent) => {
	logger.debug(event.locals);

	return {};
};
