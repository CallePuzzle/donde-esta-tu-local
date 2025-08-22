import { logger } from '$lib/logger';
import prisma from '$lib/server/db';
import { error } from '@sveltejs/kit';

import type { LayoutServerLoad, LayoutServerLoadEvent } from './$types';
import type { Member } from '../type';

export const load: LayoutServerLoad = async (event: LayoutServerLoadEvent) => {
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
		(member: Member) => member.membershipGangStatus === 'VALIDATED'
	);

	// Check if current user is a validated member
	let isValidatedMember = false;
	if (currentUser) {
		isValidatedMember = validatedMembers.some((member: Member) => member.id === currentUser.id);
	}

	return {
		isValidatedMember: isValidatedMember
	};
};
