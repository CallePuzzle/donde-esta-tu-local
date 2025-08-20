import { logger } from '$lib/logger';
import prisma from '$lib/server/db';
import { error } from '@sveltejs/kit';

import type { PageServerLoad, PageServerLoadEvent } from './$types';
import type { GangData, Member } from './type';

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
		(member: Member) => member.membershipGangStatus === 'VALIDATED'
	);

	const pendingMembers = gang.members.filter(
		(member: Member) => member.membershipGangStatus === 'PENDING'
	);

	// Check if current user is a validated member
	let isValidatedMember = false;
	if (currentUser) {
		isValidatedMember = validatedMembers.some((member: Member) => member.id === currentUser.id);
	}

	// Ensure all members have a name, using email as fallback
	validatedMembers.forEach((member: Member) => {
		if (!member.name) {
			member.name = member.email;
		}
	});

	pendingMembers.forEach((member: Member) => {
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
		} as GangData,
		members: validatedMembers as Member[],
		pendingMembers: pendingMembers as Member[],
		isValidatedMember: isValidatedMember
	};
};
