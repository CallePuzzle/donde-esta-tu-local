import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import prisma from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
	// Verificar que el usuario esté autenticado
	if (!locals.user) {
		throw redirect(303, '/');
	}

	// Verificar que el usuario tenga rol de admin
	if (locals.user.role !== 'admin' && locals.user.role !== 'system') {
		throw error(403, 'No tienes permisos para acceder a esta página');
	}

	// Obtener todas las gangs validadas con información del validador
	const validatedGangs = await prisma.gang.findMany({
		where: {
			status: 'VALIDATED'
		},
		include: {
			validatedBy: {
				select: {
					id: true,
					name: true,
					email: true
				}
			},
			members: {
				select: {
					id: true,
					name: true,
					email: true,
					membershipGangStatus: true
				}
			}
		},
		orderBy: {
			name: 'asc'
		}
	});

	// Obtener todas las gangs pendientes de validación
	const pendingGangs = await prisma.gang.findMany({
		where: {
			status: 'PENDING'
		},
		include: {
			members: {
				select: {
					id: true,
					name: true,
					email: true,
					membershipGangStatus: true
				}
			}
		},
		orderBy: {
			id: 'desc'
		}
	});

	// Obtener estadísticas
	const stats = {
		totalGangs: await prisma.gang.count(),
		validatedGangs: validatedGangs.length,
		pendingGangs: pendingGangs.length,
		refusedGangs: await prisma.gang.count({
			where: { status: 'REFUSED' }
		})
	};

	return {
		validatedGangs,
		pendingGangs,
		stats
	};
};

export const actions = {
	validate: async ({ request, locals }) => {
		// Verificar permisos
		if (!locals.user || (locals.user.role !== 'admin' && locals.user.role !== 'system')) {
			throw error(403, 'No tienes permisos para realizar esta acción');
		}

		const formData = await request.formData();
		const gangId = Number(formData.get('gangId'));

		if (!gangId) {
			throw error(400, 'ID de gang inválido');
		}

		try {
			// Actualizar el estado de la gang a validada
			await prisma.gang.update({
				where: {
					id: gangId
				},
				data: {
					status: 'VALIDATED',
					validatedByUserId: locals.user.id
				}
			});

			return {
				success: true,
				message: 'Gang validada correctamente'
			};
		} catch (err) {
			console.error('Error validating gang:', err);
			throw error(500, 'Error al validar la gang');
		}
	},

	refuse: async ({ request, locals }) => {
		// Verificar permisos
		if (!locals.user || (locals.user.role !== 'admin' && locals.user.role !== 'system')) {
			throw error(403, 'No tienes permisos para realizar esta acción');
		}

		const formData = await request.formData();
		const gangId = Number(formData.get('gangId'));

		if (!gangId) {
			throw error(400, 'ID de gang inválido');
		}

		try {
			// Actualizar el estado de la gang a rechazada
			await prisma.gang.update({
				where: {
					id: gangId
				},
				data: {
					status: 'REFUSED',
					validatedByUserId: locals.user.id
				}
			});

			return {
				success: true,
				message: 'Gang rechazada'
			};
		} catch (err) {
			console.error('Error refusing gang:', err);
			throw error(500, 'Error al rechazar la gang');
		}
	}
} satisfies Actions;
