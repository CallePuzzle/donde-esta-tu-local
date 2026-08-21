import type { Handle } from '@sveltejs/kit';
import { dev } from '$app/environment';

// Cabeceras de seguridad aplicadas a todas las respuestas
export const securityHeadersHandle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');

	// La CSP la firma SvelteKit (kit.csp en svelte.config.js, con nonce para su script
	// de hidratación) y solo se aplica fuera de desarrollo para no interferir con el HMR de Vite.
	// HSTS solo tiene sentido fuera de dev, donde sí se sirve por HTTPS.
	if (!dev) {
		response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
	}

	return response;
};
