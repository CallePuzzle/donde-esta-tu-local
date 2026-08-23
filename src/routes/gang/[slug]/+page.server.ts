import { logger } from '$lib/logger';
import prisma from '$lib/server/db';
import { error } from '@sveltejs/kit';
import { isAdmin } from '$lib/utils/roles';
import { memberDisplayName } from '$lib/utils/member-display';
import { m } from '$lib/paraglide/messages.js';

import type { PageServerLoad, PageServerLoadEvent } from './$types';
import type { GangData, Member, CurrentGang } from './type';

type RawMember = { id: string; name: string; email: string; image: string | null };

// El nombre visible se resuelve en servidor (fallback a email si `name` está
// vacío, ver B18); el email en sí no debe llegar al cliente (ver S6).
function toMember(member: RawMember): Member {
	return {
		id: member.id,
		displayName: memberDisplayName(member),
		image: member.image
	};
}

export const load: PageServerLoad = async (event: PageServerLoadEvent) => {
	const gangId = parseInt(event.params.slug);
	const currentUser = event.locals.user;

	if (Number.isNaN(gangId)) {
		return error(404, m.error_gang_not_found());
	}

	const gang = await prisma.gang.findUnique({
		where: {
			status: {
				not: 'REFUSED'
			},
			id: gangId
		},
		include: {
			members: {
				select: {
					id: true,
					name: true,
					email: true,
					image: true,
					membershipGangStatus: true
				}
			}
		}
	});

	// No volcar la peña entera: incluiría el email de todos los miembros (S6)
	logger.debug({ id: gang?.id, name: gang?.name }, 'gang');

	if (!gang) {
		return error(404, m.error_gang_not_found());
	}

	// Separate validated and pending members
	const validatedMembers = gang.members.filter(
		(member) => member.membershipGangStatus === 'VALIDATED'
	);

	const pendingMembers = gang.members.filter((member) => member.membershipGangStatus === 'PENDING');

	// Check if current user is a validated member
	let isValidatedMember = false;
	let userHasPendingRequest = false;
	if (currentUser) {
		isValidatedMember = validatedMembers.some((member) => member.id === currentUser.id);
		userHasPendingRequest = pendingMembers.some((member) => member.id === currentUser.id);
	}

	// Si el usuario ya pertenece a otra peña validada, se le avisa para que confirme
	// el cambio antes de abandonar la peña actual.
	let currentGang: CurrentGang | null = null;
	if (currentUser && !isValidatedMember && !userHasPendingRequest) {
		const userWithGang = await prisma.user.findUnique({
			where: { id: currentUser.id },
			select: {
				gangId: true,
				membershipGangStatus: true,
				gang: { select: { id: true, name: true } }
			}
		});
		if (
			userWithGang &&
			userWithGang.membershipGangStatus === 'VALIDATED' &&
			userWithGang.gangId !== gangId &&
			userWithGang.gang
		) {
			currentGang = userWithGang.gang;
		}
	}

	// Las solicitudes pendientes solo se exponen a miembros validados o admin/system
	const canSeePendingMembers = isValidatedMember || isAdmin(currentUser);

	return {
		gang: {
			id: gang.id,
			name: gang.name,
			latitude: gang.latitude,
			longitude: gang.longitude,
			status: gang.status
		} satisfies GangData,
		members: validatedMembers.map(toMember),
		pendingMembers: canSeePendingMembers ? pendingMembers.map(toMember) : [],
		isValidatedMember: isValidatedMember,
		userHasPendingRequest: userHasPendingRequest,
		currentGang
	};
};
