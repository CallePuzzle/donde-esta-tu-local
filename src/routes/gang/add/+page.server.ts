import { logger } from '$lib/server/logger';
import { initializePrisma } from '$lib/server/db';
import { AddGang } from '$lib/utils/gang/add-gang';
import { RequestNewMember } from '$lib/utils/gang/request-new-member';

import type { Actions, RequestEvent } from './$types';

export const actions: Actions = {
	new: async (event: RequestEvent) => {
		const formData = await event.request.formData();
		const name = formData.get('name');
		const lat = formData.get('lat');
		const lng = formData.get('lng');
		const isMyGang = formData.get('ismygang');

		logger.info({ name, lat, lng, isMyGang }, 'new gang datas');

		const db = event.platform!.env.DB;
		const userId = event.locals.user!.id;
		const prisma = initializePrisma(db);
		try {
			const ret = await AddGang(prisma, userId, name as string, lat as string, lng as string);
			if (isMyGang) {
				await RequestNewMember(prisma, ret.data?.id as number, userId);
			}
			return ret;
		} catch (error) {
			logger.error(error);
			return { success: false, error: error };
		}
	}
};
