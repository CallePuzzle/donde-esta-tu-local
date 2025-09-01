import prisma from '$lib/server/db';
import { error, redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Verificar que el usuario esté autenticado
	if (!locals.user) {
		throw redirect(303, '/');
	}

	// Verificar que el usuario tenga rol de admin
	if (locals.user.role !== 'admin' && locals.user.role !== 'system') {
		throw error(403, 'No tienes permisos para acceder a esta página');
	}

	try {
		// Obtener el historial de cambios con información de la peña
		const history = await prisma.gangHistory.findMany({
			include: {
				gang: {
					select: {
						id: true,
						name: true,
						status: true
					}
				},
				changedBy: {
					select: {
						id: true,
						name: true,
						email: true
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			},
			take: 100 // Limitar a los últimos 100 cambios
		});

		// Obtener estadísticas del historial
		const createCount = await prisma.gangHistory.count({
			where: { changeType: 'CREATE' }
		});

		const updateCount = await prisma.gangHistory.count({
			where: { changeType: 'UPDATE' }
		});

		const deleteCount = await prisma.gangHistory.count({
			where: { changeType: 'DELETE' }
		});

		return {
			history,
			stats: {
				total: history.length,
				byType: {
					CREATE: createCount,
					UPDATE: updateCount,
					DELETE: deleteCount
				}
			}
		};
	} catch (err) {
		console.error('Error al cargar el historial:', err);
		throw error(500, 'Error al cargar el historial de cambios');
	}
};
