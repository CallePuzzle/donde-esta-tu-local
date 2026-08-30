import prisma from '$lib/server/db';
import { getValidatedGangId } from '$lib/server/membership';
import type { PageServerLoad, PageServerLoadEvent } from './$types';

export const load: PageServerLoad = async (event: PageServerLoadEvent) => {
	const gangs = await prisma.gang.findMany({
		where: {
			status: {
				not: 'REFUSED'
			}
		}
	});

	// Peña de la que el usuario ya es miembro validado, si alguna: el tour de
	// onboarding la necesita para no ofrecer como ejemplo una peña a la que ya
	// pertenece (ver buildMemberTourSteps en $lib/utils/tour).
	const currentUser = event.locals.user;
	const currentUserGangId = currentUser ? await getValidatedGangId(currentUser.id) : null;

	return {
		gangs: gangs,
		currentUserGangId
	};
};
