import prisma from '$lib/server/db';
import { error } from '@sveltejs/kit';
import { logger } from '$lib/logger';
import { m } from '$lib/paraglide/messages.js';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// La comprobación de rol admin/system ya la hace admin/+layout.server.ts

	try {
		// Consultas independientes: se lanzan todas en paralelo. changeType solo
		// vale CREATE/UPDATE en cualquier flujo existente (no hay DELETE), así
		// que no se cuenta.
		const [history, total, createCount, updateCount] = await Promise.all([
			// Historial de cambios con información de la peña (últimos 100)
			prisma.gangHistory.findMany({
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
				take: 100
			}),
			prisma.gangHistory.count(),
			prisma.gangHistory.count({
				where: { changeType: 'CREATE' }
			}),
			prisma.gangHistory.count({
				where: { changeType: 'UPDATE' }
			})
		]);

		return {
			history,
			stats: {
				total,
				byType: {
					CREATE: createCount,
					UPDATE: updateCount
				}
			}
		};
	} catch (err) {
		logger.error(err, 'Error al cargar el historial');
		throw error(500, m.admin_history_load_error());
	}
};
