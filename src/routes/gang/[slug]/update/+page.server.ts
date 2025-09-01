import { logger } from '$lib/logger';
import prisma from '$lib/server/db';
import { error } from '@sveltejs/kit';
import { superValidate, message, fail } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { addGangSchema } from '$lib/schemas/gang';
import { m } from '$lib/paraglide/messages.js';

import type { PageServerLoad, PageServerLoadEvent, Actions, RequestEvent } from './$types';
import type { GangData } from '../type';

export const load: PageServerLoad = async (event: PageServerLoadEvent) => {
	const gangId = event.params.slug;

	const gang = await prisma.gang.findUnique({
		where: {
			status: {
				not: 'REFUSED'
			},
			id: parseInt(gangId)
		}
	});

	logger.debug(gang, 'gang');

	if (!gang) {
		return error(404, 'Peña no encontrada');
	}

	return {
		gang: {
			id: gang.id,
			name: gang.name,
			latitude: gang.latitude,
			longitude: gang.longitude,
			status: gang.status
		} as GangData,
		form: await superValidate(gang, zod4(addGangSchema))
	};
};

export const actions: Actions = {
	default: async (event: RequestEvent) => {
		const { user } = event.locals;
		if (!user) {
			return fail(401, { form: 'Unauthorized' });
		}

		const request = event.request;
		const form = await superValidate(request, zod4(addGangSchema));
		logger.info(form, 'Form submitted');

		if (!form.valid) return fail(400, { form });

		const gangId = event.params.slug;

		try {
			// Obtener datos actuales antes de actualizar
			const currentGang = await prisma.gang.findUnique({
				where: {
					id: parseInt(gangId)
				}
			});

			if (!currentGang) {
				return message(form, 'Peña no encontrada', { status: 404 });
			}

			// Verificar si hay cambios en los campos que queremos historizar
			const hasChanges =
				currentGang.name !== form.data.name ||
				currentGang.latitude !== form.data.lat ||
				currentGang.longitude !== form.data.lng;

			// Actualizar la peña
			const newGang = await prisma.gang.update({
				where: {
					id: parseInt(gangId)
				},
				data: {
					name: form.data.name,
					latitude: form.data.lat,
					longitude: form.data.lng
				}
			});

			// Crear registro en el historial si hubo cambios
			if (hasChanges) {
				await prisma.gangHistory.create({
					data: {
						gang: {
							connect: {
								id: newGang.id
							}
						},
						name: newGang.name,
						latitude: newGang.latitude,
						longitude: newGang.longitude,
						changeType: 'UPDATE',
						changedBy: {
							connect: {
								id: user.id
							}
						}
					}
				});
				logger.info({ gangId: newGang.id, name: newGang.name }, 'Gang updated with history');
			}

			logger.info({ gangId: newGang.id, name: newGang.name }, 'Gang updated');
			return message(form, m.form_gang_add_successfully());
		} catch (error) {
			logger.error(error, 'Error updating gang');
			return message(form, m.form_gang_add_error(), { status: 500 });
		}
	}
};
