import prisma from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const gangs = await prisma.gang.findMany({
		where: {
			status: {
				not: 'REFUSED'
			}
		}
	});

	return {
		gangs: gangs
	};
};
