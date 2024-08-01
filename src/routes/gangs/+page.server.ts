import { logger } from '$lib/server/logger';
import { initializeLucia } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';

import type { Actions } from './$types';

export const actions: Actions = {
	new: async (event) => {
		const formData = await event.request.formData();
		const name = formData.get('name');
		const lat = formData.get('lat');
		const lng = formData.get('lng');

		logger.debug(name);
		logger.debug(lat);
		logger.debug(lng);
	}
};
