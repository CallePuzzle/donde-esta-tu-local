import { requireUser } from '$lib/server/membership';

import type { LayoutServerLoad, LayoutServerLoadEvent } from './$types';

export const load: LayoutServerLoad = async (event: LayoutServerLoadEvent) => {
	// Corta en servidor (401) en vez de dejar pasar el load y confiar en que
	// +layout.svelte oculte el contenido con un {#if} (B20).
	requireUser(event.locals);
};
