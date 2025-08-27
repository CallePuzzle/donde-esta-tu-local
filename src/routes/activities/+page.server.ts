import prisma from '$lib/server/db';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const activities = await prisma.activity.findMany({
		include: {
			organisingGangs: {
				select: {
					id: true,
					name: true
				}
			},
			placeGang: {
				select: {
					id: true,
					name: true
				}
			}
		},
		orderBy: {
			date: 'asc'
		}
	});

	return {
		activities
	};
};
