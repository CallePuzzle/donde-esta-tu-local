import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import prisma from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
	// Verificar que el usuario esté autenticado y tenga rol de admin
	if (!locals.user) {
		throw error(401, 'No autenticado');
	}

	if (locals.user.role !== 'admin' && locals.user.role !== 'system') {
		throw error(403, 'No tienes permisos para acceder a esta página');
	}

	// Obtener todos los usuarios con membershipGangStatus PENDING
	const pendingMembers = await prisma.user.findMany({
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
							email: true,
							image: true
						}
					}
				}
			}
		},
		orderBy: {
			updatedAt: 'desc'
		}
	});

	// Obtener usuarios validados recientemente (últimos 30 días)
	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

	const recentlyValidatedMembers = await prisma.user.findMany({
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
	});

	// Obtener estadísticas
	const stats = {
		totalUsers: await prisma.user.count(),
		pendingMembers: pendingMembers.length,
		validatedMembers: await prisma.user.count({
			where: { membershipGangStatus: 'VALIDATED' }
		}),
		refusedMembers: await prisma.user.count({
			where: { membershipGangStatus: 'REFUSED' }
		}),
		usersWithoutGang: await prisma.user.count({
			where: { gangId: null }
		})
	};

	return {
		pendingMembers,
		recentlyValidatedMembers,
		stats
	};
};
