import type { PageServerLoad, PageServerLoadEvent, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { updateUserSchema } from '$lib/schemas/user';
import prisma from '$lib/server/db';
import { m } from '$lib/paraglide/messages';
import { logger } from '$lib/logger';

export const load: PageServerLoad = async (event: PageServerLoadEvent) => {
	const user = await event.locals.user;

	// Check if user is authenticated
	if (!user) {
		throw redirect(303, '/');
	}

	// Initialize form with current user data
	const form = await superValidate(
		{
			name: user.name || '',
			image: user.image || null
		},
		zod4(updateUserSchema)
	);

	return {
		form,
		user: user
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		// Check if user is authenticated
		if (!locals.user) {
			throw redirect(303, '/');
		}

		const form = await superValidate(request, zod4(updateUserSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			// Update user using Prisma
			const updatedUser = await prisma.user.update({
				where: {
					id: locals.user.id
				},
				data: {
					name: form.data.name,
					image: form.data.image || null,
					updatedAt: new Date()
				}
			});

			if (!updatedUser) {
				logger.error('Failed to update user profile');
				return message(form, m.form_user_update_error(), { status: 500 });
			}

			logger.info(`User ${locals.user.email} updated profile successfully`);
			return message(form, m.form_user_update_successfully());
		} catch (error) {
			logger.error(error, 'Error updating user profile');
			return message(form, m.form_user_update_error(), { status: 500 });
		}
	}
};
