import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { updateUserSchema } from '$lib/schemas/user';
import prisma from '$lib/server/db';
import { requireUser } from '$lib/server/membership';
import { m } from '$lib/paraglide/messages';
import { logger } from '$lib/logger';
import { uploadImage, deleteImage } from '$lib/server/blob-image';

import type { PageServerLoad, PageServerLoadEvent, Actions } from './$types';
import type { UserGangDetail } from './type';

export const load: PageServerLoad = async (event: PageServerLoadEvent) => {
	// El +layout.server.ts de esta ruta ya exige sesión (requireUser); aquí solo
	// se recupera el usuario ya autenticado.
	const user = requireUser(event.locals);

	const userGangDetail = await prisma.user.findUnique({
		where: {
			id: user.id
		},
		include: {
			gang: true
		}
	});

	// Initialize form with current user data
	const form = await superValidate(
		{
			name: user.name || '',
			imageFile: undefined
		},
		zod4(updateUserSchema)
	);

	return {
		form,
		user,
		userGangDetail: {
			id: userGangDetail?.gang?.id || null,
			name: userGangDetail?.gang?.name || m.profile_no_gang()
		} satisfies UserGangDetail
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const user = requireUser(locals);

		const formData = await request.formData();
		const form = await superValidate(formData, zod4(updateUserSchema));

		if (!form.valid) {
			return fail(400, { form });
		}
		let imageUrl: string | null = null;
		try {
			// Handle file upload if a new image file is provided (ya validado por zod)
			const imageFile = form.data.imageFile;
			if (imageFile && imageFile.size > 0) {
				try {
					imageUrl = await uploadImage(imageFile, `avatars/${user.id}`);

					logger.info(`Avatar uploaded successfully for user ${user.email}: ${imageUrl}`);
				} catch (uploadError) {
					logger.error(uploadError, 'Error uploading image to Vercel Blob');
					return message(form, m.schema_image_upload_error(), {
						status: 500
					});
				}
			}

			const previousImageUrl = user.image;

			// Update user using Prisma
			// Solo se incluye `image` cuando se ha subido una imagen nueva;
			// si no, se conserva el avatar existente
			const updatedUser = await prisma.user.update({
				where: {
					id: user.id
				},
				data: {
					name: form.data.name,
					...(imageUrl ? { image: imageUrl } : {}),
					updatedAt: new Date()
				}
			});

			if (!updatedUser) {
				logger.error('Failed to update user profile');
				return message(form, m.form_user_update_error(), { status: 500 });
			}

			// Borrar el avatar anterior de Vercel Blob ahora que el nuevo ya está
			// guardado; si fallara, no rompemos la actualización del perfil por eso.
			if (imageUrl) {
				await deleteImage(previousImageUrl);
			}

			logger.info(`User ${user.email} updated profile successfully`);
			return message(form, m.form_user_update_successfully());
		} catch (error) {
			logger.error(error, 'Error updating user profile');
			return message(form, m.form_user_update_error(), { status: 500 });
		}
	}
};
