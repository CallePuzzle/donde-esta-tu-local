import { waitUntil } from '@vercel/functions';
import { logger } from '$lib/logger';
import prisma from '$lib/server/db';
import { Prisma } from '$lib/generated/prisma/client';
import { requireUser } from '$lib/server/membership';
import { superValidate, message, fail } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { addGangSchema } from '$lib/schemas/gang';
import { m } from '$lib/paraglide/messages.js';
import { notifyAdminsPendingGang } from '$lib/server/push-send';

import type { PageServerLoad } from './$types';

const UNIQUE_CONSTRAINT_VIOLATION = 'P2002';

// Límite de altas de peña por usuario y día (B3): cualquier usuario con
// sesión podía crear peñas sin límite, un vector de spam directo una vez
// arreglados B1/B2. No mira si el usuario ya pertenece a una peña: eso queda
// para cuando se decida el modelo de membresía por peña (B7/B8).
const MAX_GANGS_PER_USER_PER_DAY = 3;

// Centinela para abortar la transacción cuando se supera el límite diario:
// el chequeo va dentro de la $transaction para que dos envíos concurrentes no
// pasen ambos el límite (carrera detectada en code review).
class RateLimitExceededError extends Error {}

export const load: PageServerLoad = async () => {
	return { form: await superValidate(zod4(addGangSchema)) };
};

export const actions = {
	default: async ({ request, locals }) => {
		const user = requireUser(locals);

		const form = await superValidate(request, zod4(addGangSchema));
		logger.info({ userId: user.id }, 'Form submitted');

		if (!form.valid) return fail(400, { form });

		try {
			// La unicidad case-insensitive la exige normalizedName a nivel de BD
			// (@@unique); si ya existe, se captura el P2002 más abajo en vez de
			// comprobarlo antes con una consulta separada (esa comprobación previa
			// era una carrera: dos altas simultáneas con el mismo nombre pasaban
			// ambas).
			const { newGang, historyGang } = await prisma.$transaction(async (tx) => {
				// El límite de altas/día se comprueba dentro de la transacción: fuera,
				// dos envíos concurrentes pasarían ambos el chequeo.
				const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
				const gangsCreatedToday = await tx.gangHistory.count({
					where: {
						changedByUserId: user.id,
						changeType: 'CREATE',
						createdAt: { gte: oneDayAgo }
					}
				});

				if (gangsCreatedToday >= MAX_GANGS_PER_USER_PER_DAY) {
					throw new RateLimitExceededError();
				}

				const newGang = await tx.gang.create({
					data: {
						name: form.data.name,
						normalizedName: form.data.name.toLowerCase(),
						latitude: form.data.lat,
						longitude: form.data.lng
					}
				});

				const historyGang = await tx.gangHistory.create({
					data: {
						gangId: newGang.id,
						name: newGang.name,
						latitude: newGang.latitude,
						longitude: newGang.longitude,
						changedByUserId: user.id,
						changeType: 'CREATE',
						createdAt: new Date()
					}
				});

				return { newGang, historyGang };
			});

			logger.info({ gangId: newGang.id, name: newGang.name }, 'New gang added');
			logger.info({ historyId: historyGang.id }, 'New history entry created');

			// Notificar a los admins sin bloquear la respuesta al usuario.
			waitUntil(
				notifyAdminsPendingGang(newGang).catch((error) => {
					logger.error(error, 'Error notifying admins about new pending gang');
				})
			);

			return message(form, m.form_gang_add_successfully());
		} catch (error) {
			if (error instanceof RateLimitExceededError) {
				return message(form, m.form_gang_add_rate_limited(), { status: 429 });
			}
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === UNIQUE_CONSTRAINT_VIOLATION
			) {
				return message(form, m.form_gang_name_duplicated(), { status: 400 });
			}
			logger.error(error, 'Error creating gang');
			return message(form, m.form_gang_add_error(), { status: 500 });
		}
	}
};
