import { APP_URL } from '$env/static/private';
import type { PageServerLoad, PageServerLoadEvent } from './$types';

export const load: PageServerLoad = async (event: PageServerLoadEvent) => {
	return {
		appUrl: APP_URL
	};
};
