import { logger } from '$lib/logger';
import prisma from '$lib/server/db';
import { error } from '@sveltejs/kit';
import { superValidate, message, fail } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { newMemberSchema } from '$lib/schemas/gang';
import { m } from '$lib/paraglide/messages.js';

import type { PageServerLoad, PageServerLoadEvent } from './$types';

export const load: PageServerLoad = async (event: PageServerLoadEvent) => {
	const gangId = event.params.slug;
	const gang = await prisma.gang.findUnique({
		where: {
			status: {
				not: 'REFUSED'
			},
			id: parseInt(gangId)
		},
		include: {
			members: {
				where: {
					membershipGangStatus: 'VALIDATED'
				},
				select: {
					id: true,
					name: true,
					image: true,
					membershipGangStatus: true
				}
			}
		}
	});
	logger.debug(gang, 'gang');
	if (!gang) {
		return error(404, 'Peña no encontrada');
	}

	return {
		gang: gang,
		members: gang.members,
		form: await superValidate(zod4(newMemberSchema))
	};
};

export const actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(newMemberSchema));
		logger.info(form, 'Form submitted');

		if (!form.valid) return fail(400, { form });

		try {
			const user = await prisma.user.findUnique({
				where: {
					id: form.data.userId
				}
			});

			if (!user) {
				return message(form, m.form_user_not_found(), { status: 404 });
			}

			const userNewMember = await prisma.user.update({
				where: {
					id: form.data.userId
				},
				data: {
					gangId: form.data.gangId
				}
			});

			logger.info({ user: userNewMember }, 'Nuevo miembro agregado');
			return message(form, m.form_gang_add_successfully());
		} catch (error) {
			logger.error(error, 'Error al crear la peña');
			return message(form, m.form_gang_add_error(), { status: 500 });
		}
	}
};
