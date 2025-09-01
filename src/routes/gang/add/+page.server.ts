import { logger } from '$lib/logger';
import prisma from '$lib/server/db';
import { superValidate, message, fail } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { addGangSchema } from '$lib/schemas/gang';
import { m } from '$lib/paraglide/messages.js';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return { form: await superValidate(zod4(addGangSchema)) };
};

export const actions = {
	default: async ({ request, locals }) => {
		const { user } = locals;
		if (!user) {
			return fail(401, { form: 'Unauthorized' });
		}

		const form = await superValidate(request, zod4(addGangSchema));
		logger.info(form, 'Form submitted');

		if (!form.valid) return fail(400, { form });

		try {
			// Buscar si existe una peña con nombre similar (case insensitive)
			const existingGang = await prisma.gang.findFirst({
				where: {
					name: {
						mode: 'insensitive',
						equals: form.data.name
					}
				}
			});

			if (existingGang) {
				return message(form, m.form_gang_name_duplicated(), { status: 400 });
			}

			// Crear nueva entrada en gang
			const newGang = await prisma.gang.create({
				data: {
					name: form.data.name,
					latitude: form.data.lat,
					longitude: form.data.lng
				}
			});

			logger.info({ gangId: newGang.id, name: newGang.name }, 'New gang added');

			const historyGang = await prisma.gangHistory.create({
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

			logger.info({ historyId: historyGang.id }, 'New history entry created');

			return message(form, m.form_gang_add_successfully());
		} catch (error) {
			logger.error(error, 'Error creating gang');
			return message(form, m.form_gang_add_error(), { status: 500 });
		}
	}
};
