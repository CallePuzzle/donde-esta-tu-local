import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import prisma from '$lib/server/db';
import { requireAdmin } from '$lib/server/membership';
import { logger } from '$lib/logger';
import { m } from '$lib/paraglide/messages.js';
import { memberDisplayName } from '$lib/utils/member-display';

type GangMember = {
	id: string;
	name: string | null;
	email: string | null;
	membershipGangStatus: string;
};

// El email de los miembros solo se usa para resolver el nombre a mostrar si no
// tienen `name`; no debe llegar como tal al cliente (a diferencia del email de
// validatedBy, que sí se muestra).
function toDisplayMembers(members: GangMember[]) {
	return members.map((member) => ({
		id: member.id,
		displayName: memberDisplayName(member),
		membershipGangStatus: member.membershipGangStatus
	}));
}

// D4: estas listas no tenían take; sin paginación real, al menos un límite
// explícito y visible (el aviso de "solo se muestran los N primeros" en la UI).
const ADMIN_GANGS_LIST_LIMIT = 100;

export const load: PageServerLoad = async () => {
	// La comprobación de rol admin/system ya la hace admin/+layout.server.ts

	// Obtener gangs, estadísticas y contadores en paralelo (son consultas independientes)
	const [validatedGangs, pendingGangs, validatedGangsTotal, pendingGangsTotal, refusedGangs] =
		await Promise.all([
			// Gangs validadas con información del validador (hasta ADMIN_GANGS_LIST_LIMIT)
			prisma.gang.findMany({
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
				},
				take: ADMIN_GANGS_LIST_LIMIT
			}),
			// Gangs pendientes de validación (hasta ADMIN_GANGS_LIST_LIMIT)
			prisma.gang.findMany({
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
				},
				take: ADMIN_GANGS_LIST_LIMIT
			}),
			prisma.gang.count({ where: { status: 'VALIDATED' } }),
			prisma.gang.count({ where: { status: 'PENDING' } }),
			prisma.gang.count({
				where: { status: 'REFUSED' }
			})
		]);

	const stats = {
		totalGangs: validatedGangsTotal + pendingGangsTotal + refusedGangs,
		validatedGangs: validatedGangsTotal,
		pendingGangs: pendingGangsTotal,
		refusedGangs
	};

	return {
		validatedGangs: validatedGangs.map((gang) => ({
			...gang,
			members: toDisplayMembers(gang.members)
		})),
		validatedGangsTruncated: validatedGangs.length < validatedGangsTotal,
		pendingGangs: pendingGangs.map((gang) => ({
			...gang,
			members: toDisplayMembers(gang.members)
		})),
		pendingGangsTruncated: pendingGangs.length < pendingGangsTotal,
		stats
	};
};

export const actions = {
	validate: async ({ request, locals }) => {
		const user = requireAdmin(locals);

		const formData = await request.formData();
		const gangId = Number(formData.get('gangId'));

		if (!gangId) {
			return fail(400, { success: false, message: m.admin_gangs_invalid_id() });
		}

		try {
			// Actualizar el estado de la gang a validada
			await prisma.gang.update({
				where: {
					id: gangId
				},
				data: {
					status: 'VALIDATED',
					validatedByUserId: user.id
				}
			});

			return {
				success: true,
				message: m.admin_gangs_validate_success()
			};
		} catch (err) {
			logger.error(err, 'Error validating gang');
			return fail(500, { success: false, message: m.admin_gangs_validate_error() });
		}
	},

	refuse: async ({ request, locals }) => {
		const user = requireAdmin(locals);

		const formData = await request.formData();
		const gangId = Number(formData.get('gangId'));

		if (!gangId) {
			return fail(400, { success: false, message: m.admin_gangs_invalid_id() });
		}

		try {
			// Actualizar el estado de la gang a rechazada
			await prisma.gang.update({
				where: {
					id: gangId
				},
				data: {
					status: 'REFUSED',
					validatedByUserId: user.id
				}
			});

			return {
				success: true,
				message: m.admin_gangs_refuse_success()
			};
		} catch (err) {
			logger.error(err, 'Error refusing gang');
			return fail(500, { success: false, message: m.admin_gangs_refuse_error() });
		}
	}
} satisfies Actions;
