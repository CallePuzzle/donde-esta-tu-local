import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { updateUserSchema } from '$lib/schemas/user';
import prisma from '$lib/server/db';
import { requireUser } from '$lib/server/membership';
import { m } from '$lib/paraglide/messages';
import { logger } from '$lib/logger';
import { del, put } from '@vercel/blob';
import { isVercelBlobUrl } from '$lib/config/vercel-hosts.js';

import type { PageServerLoad, PageServerLoadEvent, Actions } from './$types';
import type { UserGangDetail } from './type';

// Extensión del fichero según el tipo MIME permitido por updateUserSchema
const EXTENSION_BY_MIME: Record<string, string> = {
	'image/jpeg': 'jpg',
	'image/jpg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp'
};

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
					// Derivar la extensión del tipo MIME validado, no del nombre del fichero
					const fileExtension = EXTENSION_BY_MIME[imageFile.type] ?? 'jpg';
					// Create a unique filename with user ID and timestamp
					const timestamp = Date.now();
					const filename = `avatars/${user.id}-${timestamp}.${fileExtension}`;

					// Convert File to ArrayBuffer then to Buffer for Vercel Blob
					const arrayBuffer = await imageFile.arrayBuffer();
					const buffer = Buffer.from(arrayBuffer);

					// Upload to Vercel Blob
					const { url } = await put(filename, buffer, {
						access: 'public',
						contentType: imageFile.type
					});

					imageUrl = url;

					logger.info(`Avatar uploaded successfully for user ${user.email}: ${url}`);
				} catch (uploadError) {
					logger.error(uploadError, 'Error uploading image to Vercel Blob');
					return message(form, m.schema_user_image_upload_error(), {
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
			if (imageUrl && previousImageUrl && isVercelBlobUrl(previousImageUrl)) {
				try {
					await del(previousImageUrl);
				} catch (deleteError) {
					logger.error(deleteError, 'Error deleting previous avatar from Vercel Blob');
				}
			}

			logger.info(`User ${user.email} updated profile successfully`);
			return message(form, m.form_user_update_successfully());
		} catch (error) {
			logger.error(error, 'Error updating user profile');
			return message(form, m.form_user_update_error(), { status: 500 });
		}
	}
};
