import { logger } from '$lib/logger';
import prisma from '$lib/server/db';
import { Prisma } from '@prisma/client';
import { requireValidatedMember } from '$lib/server/membership';
import { error } from '@sveltejs/kit';
import { superValidate, message, fail } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { addGangSchema } from '$lib/schemas/gang';
import { m } from '$lib/paraglide/messages.js';

import type { PageServerLoad, PageServerLoadEvent, Actions, RequestEvent } from './$types';
import type { GangData } from '../type';

const UNIQUE_CONSTRAINT_VIOLATION = 'P2002';

export const load: PageServerLoad = async (event: PageServerLoadEvent) => {
	const gangId = parseInt(event.params.slug);

	if (Number.isNaN(gangId)) {
		return error(404, m.error_gang_not_found());
	}

	// Solo miembros validados de la peña o admin/system pueden acceder a la edición
	await requireValidatedMember(event.locals, gangId);

	const gang = await prisma.gang.findUnique({
		where: {
			status: {
				not: 'REFUSED'
			},
			id: gangId
		}
	});

	logger.debug(gang, 'gang');

	if (!gang) {
		return error(404, m.error_gang_not_found());
	}

	return {
		gang: {
			id: gang.id,
			name: gang.name,
			latitude: gang.latitude,
			longitude: gang.longitude,
			status: gang.status
		} satisfies GangData,
		form: await superValidate(gang, zod4(addGangSchema))
	};
};

export const actions: Actions = {
	default: async (event: RequestEvent) => {
		const gangId = parseInt(event.params.slug);

		if (Number.isNaN(gangId)) {
			return error(404, m.error_gang_not_found());
		}

		// Solo miembros validados de la peña o admin/system pueden editarla
		const user = await requireValidatedMember(event.locals, gangId);

		const request = event.request;
		const form = await superValidate(request, zod4(addGangSchema));
		logger.info({ userId: user.id }, 'Form submitted');

		if (!form.valid) return fail(400, { form });

		try {
			// Obtener datos actuales antes de actualizar
			const currentGang = await prisma.gang.findUnique({
				where: {
					id: gangId
				}
			});

			if (!currentGang) {
				return message(form, m.error_gang_not_found(), { status: 404 });
			}

			// Verificar si hay cambios en los campos que queremos historizar
			const hasChanges =
				currentGang.name !== form.data.name ||
				currentGang.latitude !== form.data.lat ||
				currentGang.longitude !== form.data.lng;

			if (!hasChanges) {
				return message(form, m.form_gang_no_changes());
			}

			// Actualizar la peña y registrar el historial en la misma transacción:
			// si el segundo write fallara, no debe quedar una peña actualizada sin
			// su entrada de historial.
			const newGang = await prisma.$transaction(async (tx) => {
				const updatedGang = await tx.gang.update({
					where: {
						id: gangId
					},
					data: {
						name: form.data.name,
						normalizedName: form.data.name.toLowerCase(),
						latitude: form.data.lat,
						longitude: form.data.lng
					}
				});

				await tx.gangHistory.create({
					data: {
						gang: {
							connect: {
								id: updatedGang.id
							}
						},
						name: updatedGang.name,
						latitude: updatedGang.latitude,
						longitude: updatedGang.longitude,
						changeType: 'UPDATE',
						changedBy: {
							connect: {
								id: user.id
							}
						}
					}
				});

				return updatedGang;
			});

			logger.info({ gangId: newGang.id, name: newGang.name }, 'Gang updated with history');
			return message(form, m.form_gang_add_successfully());
		} catch (error) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === UNIQUE_CONSTRAINT_VIOLATION
			) {
				return message(form, m.form_gang_name_duplicated(), { status: 400 });
			}
			logger.error(error, 'Error updating gang');
			return message(form, m.form_gang_add_error(), { status: 500 });
		}
	}
};
