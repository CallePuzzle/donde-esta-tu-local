import prisma from '$lib/server/db';

import type { PageServerLoad } from './$types';

// D4: la lista de actividades no tenía take (traía todas con sus relaciones).
// Se separan y acotan en servidor en vez de en el cliente: así un histórico
// largo no desplaza a las próximas actividades fuera del límite, y de paso
// SSR e hidratación clasifican pasado/futuro con el mismo "now" (B19).
// Las actividades se separan por año: "próximas"/"pasadas" solo muestran el
// año en curso; "años anteriores" agrupa el resto por año.
const ACTIVITIES_LIST_LIMIT = 100;

export const load: PageServerLoad = async () => {
	const now = new Date();
	const currentYear = now.getUTCFullYear();
	const startOfYear = new Date(Date.UTC(currentYear, 0, 1));
	const startOfNextYear = new Date(Date.UTC(currentYear + 1, 0, 1));

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

	const [
		upcomingActivities,
		upcomingActivitiesTotal,
		pastActivitiesDesc,
		pastActivitiesTotal,
		previousYearsActivitiesDesc,
		previousYearsActivitiesTotal
	] = await Promise.all([
		prisma.activity.findMany({
			where: { date: { gte: now, lt: startOfNextYear } },
			include,
			orderBy: { date: 'asc' },
			take: ACTIVITIES_LIST_LIMIT
		}),
		prisma.activity.count({ where: { date: { gte: now, lt: startOfNextYear } } }),
		// Las más recientes primero para no perderlas al truncar; se
		// reordenan a cronológico ascendente antes de devolverlas.
		prisma.activity.findMany({
			where: { date: { gte: startOfYear, lt: now } },
			include,
			orderBy: { date: 'desc' },
			take: ACTIVITIES_LIST_LIMIT
		}),
		prisma.activity.count({ where: { date: { gte: startOfYear, lt: now } } }),
		// Años anteriores: descendente para priorizar los más recientes al truncar;
		// se agrupan por año y se reordenan a cronológico ascendente dentro de cada uno.
		prisma.activity.findMany({
			where: { date: { lt: startOfYear } },
			include,
			orderBy: { date: 'desc' },
			take: ACTIVITIES_LIST_LIMIT * 5
		}),
		prisma.activity.count({ where: { date: { lt: startOfYear } } })
	]);

	const previousYearsMap = new Map<number, typeof previousYearsActivitiesDesc>();
	for (const activity of previousYearsActivitiesDesc) {
		const year = activity.date.getUTCFullYear();
		if (!previousYearsMap.has(year)) {
			previousYearsMap.set(year, []);
		}
		previousYearsMap.get(year)!.push(activity);
	}

	const previousYearsActivities = Array.from(previousYearsMap.entries())
		.sort(([yearA], [yearB]) => yearB - yearA)
		.map(([year, activities]) => ({
			year,
			activities: activities.slice().reverse()
		}));

	return {
		upcomingActivities,
		upcomingActivitiesTruncated: upcomingActivities.length < upcomingActivitiesTotal,
		pastActivities: pastActivitiesDesc.slice().reverse(),
		pastActivitiesTruncated: pastActivitiesDesc.length < pastActivitiesTotal,
		previousYearsActivities,
		previousYearsActivitiesTruncated:
			previousYearsActivitiesDesc.length < previousYearsActivitiesTotal
	};
};
