import { logger } from '$lib/logger';
import prisma from '$lib/server/db';
import { superValidate, message, fail } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { addGangSchema } from '$lib/schemas/gang';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return { form: await superValidate(zod4(addGangSchema)) };
};

export const actions = {
	default: async ({ request }) => {
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
				return message(form, 'Peña repetida', { status: 400 });
			}

			// Crear nueva entrada en gang
			const newGang = await prisma.gang.create({
				data: {
					name: form.data.name,
					latitude: form.data.lat,
					longitude: form.data.lng
				}
			});

			logger.info({ gangId: newGang.id, name: newGang.name }, 'Nueva peña creada');
			return message(form, 'Peña creada exitosamente!');
		} catch (error) {
			logger.error(error, 'Error al crear la peña');
			return message(form, 'Error al crear la peña', { status: 500 });
		}
	}
};
