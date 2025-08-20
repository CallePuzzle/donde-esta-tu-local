import { logger } from '$lib/logger';
import prisma from '$lib/server/db';
import { error } from '@sveltejs/kit';

import type { PageServerLoad, PageServerLoadEvent } from './$types';

export const load: PageServerLoad = async (event: PageServerLoadEvent) => {
	const gangId = event.params.slug;
	const currentUser = event.locals.user;

	const gang = await prisma.gang.findUnique({
		where: {
			status: {
				not: 'REFUSED'
			},
			id: parseInt(gangId)
		},
		include: {
			members: {
				select: {
					id: true,
					email: true,
					name: true,
					image: true,
					membershipGangStatus: true,
					gangId: true
				}
			}
		}
	});

	logger.debug(gang, 'gang');

	if (!gang) {
		return error(404, 'Peña no encontrada');
	}

	// Separate validated and pending members
	const validatedMembers = gang.members.filter(
		(member) => member.membershipGangStatus === 'VALIDATED'
	);

	const pendingMembers = gang.members.filter((member) => member.membershipGangStatus === 'PENDING');

	// Check if current user is a validated member
	let isValidatedMember = false;
	if (currentUser) {
		isValidatedMember = validatedMembers.some((member) => member.id === currentUser.id);
	}

	// Ensure all members have a name, using email as fallback
	validatedMembers.forEach((member) => {
		if (!member.name) {
			member.name = member.email;
		}
	});

	pendingMembers.forEach((member) => {
		if (!member.name) {
			member.name = member.email;
		}
	});

	return {
		gang: {
			id: gang.id,
			name: gang.name,
			latitude: gang.latitude,
			longitude: gang.longitude,
			status: gang.status
		},
		members: validatedMembers,
		pendingMembers: pendingMembers,
		isValidatedMember: isValidatedMember
	};
};
