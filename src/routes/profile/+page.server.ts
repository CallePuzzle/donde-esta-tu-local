import type { PageServerLoad, PageServerLoadEvent, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { updateUserSchema } from '$lib/schemas/user';
import prisma from '$lib/server/db';
import { m } from '$lib/paraglide/messages';
import { logger } from '$lib/logger';
import { put } from '@vercel/blob';

export const load: PageServerLoad = async (event: PageServerLoadEvent) => {
	const user = event.locals.user;

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

		const formData = await request.formData();
		const form = await superValidate(formData, zod4(updateUserSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			let imageUrl = form.data.image;

			// Handle file upload if a new image file is provided
			const imageFile = formData.get('imageFile');
			if (imageFile && imageFile instanceof File && imageFile.size > 0) {
				try {
					// Create a unique filename with user ID and timestamp
					const timestamp = Date.now();
					const fileExtension = imageFile.name.split('.').pop();
					const filename = `avatars/${locals.user.id}-${timestamp}.${fileExtension}`;

					// Convert File to ArrayBuffer then to Buffer for Vercel Blob
					const arrayBuffer = await imageFile.arrayBuffer();
					const buffer = Buffer.from(arrayBuffer);

					// Upload to Vercel Blob
					const { url } = await put(filename, buffer, {
						access: 'public',
						contentType: imageFile.type
					});

					imageUrl = url;
					logger.info(`Avatar uploaded successfully for user ${locals.user.email}: ${url}`);

					// Optional: Delete old image from Vercel Blob if it exists and is a Vercel Blob URL
					// This would require storing the blob key or parsing it from the URL
					// For now, we'll keep old images to maintain history
				} catch (uploadError) {
					logger.error(uploadError, 'Error uploading image to Vercel Blob');
					return message(form, m.schema_user_image_upload_error(), {
						status: 500
					});
				}
			}

			// Update user using Prisma
			const updatedUser = await prisma.user.update({
				where: {
					id: locals.user.id
				},
				data: {
					name: form.data.name,
					image: imageUrl || null,
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
