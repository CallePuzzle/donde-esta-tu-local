import { error } from '@sveltejs/kit';
import { requireValidatedMember } from '$lib/server/membership';
import { m } from '$lib/paraglide/messages.js';

import type { LayoutServerLoad, LayoutServerLoadEvent } from './$types';

export const load: LayoutServerLoad = async (event: LayoutServerLoadEvent) => {
	const gangId = Number(event.params.slug);

	// Un slug no numérico es un 404 (la peña no existe), no un 403
	if (Number.isNaN(gangId)) {
		throw error(404, m.error_gang_not_found());
	}

	// Corta en servidor (401/403) en vez de dejar pasar el load y confiar en
	// que +layout.svelte oculte el contenido con un {#if} (B20).
	await requireValidatedMember(event.locals, gangId);

	return {
		isValidatedMember: true
	};
};
