import prisma from '$lib/server/db';
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
	let currentUserGangId: number | null = null;
	const currentUser = event.locals.user;
	if (currentUser) {
		const userWithGang = await prisma.user.findUnique({
			where: { id: currentUser.id },
			select: { gangId: true, membershipGangStatus: true }
		});
		if (userWithGang?.membershipGangStatus === 'VALIDATED') {
			currentUserGangId = userWithGang.gangId;
		}
	}

	return {
		gangs: gangs,
		currentUserGangId
	};
};
