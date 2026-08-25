import { logger } from '$lib/logger';
import prisma from '$lib/server/db';
import { error, fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { isAdmin } from '$lib/utils/roles';
import { memberDisplayName } from '$lib/utils/member-display';
import { requireValidatedMember } from '$lib/server/membership';
import { gangImageSchema } from '$lib/schemas/gang';
import { uploadImage, deleteImage } from '$lib/server/blob-image';
import { m } from '$lib/paraglide/messages.js';

import type { PageServerLoad, PageServerLoadEvent, Actions } from './$types';
import type { GangDetailData, Member, CurrentGang } from './type';

type RawMember = { id: string; name: string; email: string; image: string | null };

// El nombre visible se resuelve en servidor (fallback a email si `name` está
// vacío, ver B18); el email en sí no debe llegar al cliente (ver S6).
function toMember(member: RawMember): Member {
	return {
		id: member.id,
		displayName: memberDisplayName(member),
		image: member.image
	};
}

export const load: PageServerLoad = async (event: PageServerLoadEvent) => {
	const gangId = parseInt(event.params.slug);
	const currentUser = event.locals.user;

	if (Number.isNaN(gangId)) {
		return error(404, m.error_gang_not_found());
	}

	const gang = await prisma.gang.findUnique({
		where: {
			status: {
				not: 'REFUSED'
			},
			id: gangId
		},
		include: {
			members: {
				select: {
					id: true,
					name: true,
					email: true,
					image: true,
					membershipGangStatus: true
				}
			}
		}
	});

	// No volcar la peña entera: incluiría el email de todos los miembros (S6)
	logger.debug({ id: gang?.id, name: gang?.name }, 'gang');

	if (!gang) {
		return error(404, m.error_gang_not_found());
	}

	// Separate validated and pending members
	const validatedMembers = gang.members.filter(
		(member) => member.membershipGangStatus === 'VALIDATED'
	);

	const pendingMembers = gang.members.filter((member) => member.membershipGangStatus === 'PENDING');

	// Check if current user is a validated member
	let isValidatedMember = false;
	let userHasPendingRequest = false;
	if (currentUser) {
		isValidatedMember = validatedMembers.some((member) => member.id === currentUser.id);
		userHasPendingRequest = pendingMembers.some((member) => member.id === currentUser.id);
	}

	// Si el usuario ya pertenece a otra peña validada, se le avisa para que confirme
	// el cambio antes de abandonar la peña actual.
	let currentGang: CurrentGang | null = null;
	if (currentUser && !isValidatedMember && !userHasPendingRequest) {
		const userWithGang = await prisma.user.findUnique({
			where: { id: currentUser.id },
			select: {
				gangId: true,
				membershipGangStatus: true,
				gang: { select: { id: true, name: true } }
			}
		});
		if (
			userWithGang &&
			userWithGang.membershipGangStatus === 'VALIDATED' &&
			userWithGang.gangId !== gangId &&
			userWithGang.gang
		) {
			currentGang = userWithGang.gang;
		}
	}

	// Las solicitudes pendientes solo se exponen a miembros validados o admin/system
	const canSeePendingMembers = isValidatedMember || isAdmin(currentUser);
	// Mismo criterio que el botón "Actualizar peña" de esta página
	const canUploadImage = isValidatedMember || isAdmin(currentUser);

	return {
		gang: {
			id: gang.id,
			name: gang.name,
			latitude: gang.latitude,
			longitude: gang.longitude,
			status: gang.status,
			image: gang.image
		} satisfies GangDetailData,
		members: validatedMembers.map(toMember),
		pendingMembers: canSeePendingMembers ? pendingMembers.map(toMember) : [],
		isValidatedMember: isValidatedMember,
		userHasPendingRequest: userHasPendingRequest,
		currentGang,
		canUploadImage,
		imageForm: canUploadImage ? await superValidate(zod4(gangImageSchema)) : null
	};
};

export const actions: Actions = {
	uploadImage: async (event) => {
		const gangId = parseInt(event.params.slug);
		if (Number.isNaN(gangId)) {
			return error(404, m.error_gang_not_found());
		}

		// El load de esta página es público: la barrera de autorización real es esta.
		const user = await requireValidatedMember(event.locals, gangId);

		const form = await superValidate(await event.request.formData(), zod4(gangImageSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const imageFile = form.data.imageFile;
		if (!imageFile || imageFile.size === 0) {
			return message(form, m.schema_gang_image_required_error(), { status: 400 });
		}

		const gang = await prisma.gang.findUnique({
			where: { id: gangId, status: { not: 'REFUSED' } },
			select: { image: true }
		});

		if (!gang) {
			return error(404, m.error_gang_not_found());
		}

		let imageUrl: string;
		try {
			imageUrl = await uploadImage(imageFile, `gangs/${gangId}`);
		} catch (uploadError) {
			logger.error(uploadError, 'Error uploading gang image to Vercel Blob');
			return message(form, m.schema_image_upload_error(), { status: 500 });
		}

		try {
			// No se toca normalizedName ni se escribe GangHistory: el nombre no
			// cambia, y GangHistory solo modela cambios de nombre/ubicación (sus
			// columnas son NOT NULL y una fila con los tres campos idénticos
			// ensuciaría /admin/history).
			await prisma.gang.update({
				where: { id: gangId },
				data: { image: imageUrl }
			});
		} catch (updateError) {
			logger.error(updateError, 'Error saving gang image');
			await deleteImage(imageUrl);
			return message(form, m.form_gang_image_error(), { status: 500 });
		}

		await deleteImage(gang.image);

		logger.info({ gangId, userId: user.id }, 'Gang image updated');
		return message(form, m.form_gang_image_successfully());
	}
};
