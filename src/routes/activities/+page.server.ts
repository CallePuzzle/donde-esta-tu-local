import prisma from '$lib/server/db';

import type { PageServerLoad } from './$types';

// D4: la lista de actividades no tenía take (traía todas con sus relaciones).
// Se separan y acotan en servidor en vez de en el cliente: así un histórico
// largo no desplaza a las próximas actividades fuera del límite, y de paso
// SSR e hidratación clasifican pasado/futuro con el mismo "now" (B19).
const ACTIVITIES_LIST_LIMIT = 100;

export const load: PageServerLoad = async () => {
	const now = new Date();

	const include = {
		collaboratingGangs: {
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
	};

	const [upcomingActivities, upcomingActivitiesTotal, pastActivitiesDesc, pastActivitiesTotal] =
		await Promise.all([
			prisma.activity.findMany({
				where: { date: { gte: now } },
				include,
				orderBy: { date: 'asc' },
				take: ACTIVITIES_LIST_LIMIT
			}),
			prisma.activity.count({ where: { date: { gte: now } } }),
			// Las más recientes primero para no perderlas al truncar; se
			// reordenan a cronológico ascendente antes de devolverlas.
			prisma.activity.findMany({
				where: { date: { lt: now } },
				include,
				orderBy: { date: 'desc' },
				take: ACTIVITIES_LIST_LIMIT
			}),
			prisma.activity.count({ where: { date: { lt: now } } })
		]);

	return {
		upcomingActivities,
		upcomingActivitiesTruncated: upcomingActivities.length < upcomingActivitiesTotal,
		pastActivities: pastActivitiesDesc.slice().reverse(),
		pastActivitiesTruncated: pastActivitiesDesc.length < pastActivitiesTotal
	};
};
