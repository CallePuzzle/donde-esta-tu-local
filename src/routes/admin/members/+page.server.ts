import type { PageServerLoad } from './$types';
import prisma from '$lib/server/db';
import { memberDisplayName } from '$lib/utils/member-display';

// D4: esta lista no tenía take; sin paginación real, al menos un límite
// explícito y visible (aviso de "solo se muestran los N primeros" en la UI).
const ADMIN_PENDING_MEMBERS_LIMIT = 100;

export const load: PageServerLoad = async () => {
	// La comprobación de rol admin/system ya la hace admin/+layout.server.ts

	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

	// Consultas independientes: se lanzan todas en paralelo
	const [
		pendingMembers,
		pendingMembersTotal,
		recentlyValidatedMembers,
		totalUsers,
		validatedMembers,
		refusedMembers,
		usersWithoutGang
	] = await Promise.all([
		// Usuarios con membershipGangStatus PENDING (hasta ADMIN_PENDING_MEMBERS_LIMIT)
		prisma.user.findMany({
			where: {
				membershipGangStatus: 'PENDING',
				gangId: {
					not: null
				}
			},
			include: {
				gang: {
					select: {
						id: true,
						name: true,
						status: true,
						members: {
							where: {
								membershipGangStatus: 'VALIDATED'
							},
							select: {
								id: true,
								name: true,
								email: true
							}
						}
					}
				}
			},
			orderBy: {
				updatedAt: 'desc'
			},
			take: ADMIN_PENDING_MEMBERS_LIMIT
		}),
		prisma.user.count({
			where: {
				membershipGangStatus: 'PENDING',
				gangId: { not: null }
			}
		}),
		// Usuarios validados recientemente (últimos 30 días)
		prisma.user.findMany({
			where: {
				membershipGangStatus: 'VALIDATED',
				gangId: {
					not: null
				},
				updatedAt: {
					gte: thirtyDaysAgo
				}
			},
			include: {
				gang: {
					select: {
						id: true,
						name: true,
						status: true
					}
				}
			},
			orderBy: {
				updatedAt: 'desc'
			},
			take: 50
		}),
		prisma.user.count(),
		prisma.user.count({
			where: { membershipGangStatus: 'VALIDATED' }
		}),
		prisma.user.count({
			where: { membershipGangStatus: 'REFUSED' }
		}),
		prisma.user.count({
			where: { gangId: null }
		})
	]);

	const stats = {
		totalUsers,
		pendingMembers: pendingMembersTotal,
		validatedMembers,
		refusedMembers,
		usersWithoutGang
	};

	// El email de los miembros ya validados de la peña solo se usa para resolver el
	// nombre a mostrar si no tienen `name`; no debe llegar como tal al cliente.
	const pendingMembersWithResolvedGangMembers = pendingMembers.map((member) => ({
		...member,
		gang: member.gang && {
			...member.gang,
			members: member.gang.members.map((gangMember) => ({
				id: gangMember.id,
				displayName: memberDisplayName(gangMember)
			}))
		}
	}));

	return {
		pendingMembers: pendingMembersWithResolvedGangMembers,
		pendingMembersTruncated: pendingMembers.length < pendingMembersTotal,
		recentlyValidatedMembers,
		stats
	};
};
