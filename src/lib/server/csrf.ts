import { error } from '@sveltejs/kit';
import { m } from '$lib/paraglide/messages.js';

// Los endpoints de miembros son POST con cuerpo JSON, así que la comprobación
// de Origin integrada de SvelteKit (kit.csrf.checkOrigin) no los cubre: solo
// se aplica a los content-type de formulario. La replicamos a mano aquí.
export function requireSameOrigin(request: Request, url: URL): void {
	const origin = request.headers.get('origin');
	if (origin !== url.origin) {
		throw error(403, m.error_invalid_origin());
	}
}
