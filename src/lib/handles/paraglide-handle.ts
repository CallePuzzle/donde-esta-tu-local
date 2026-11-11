import type { Handle } from '@sveltejs/kit/hooks';
import { paraglideMiddleware } from '#lib/paraglide/server.js';

// creating a handle to use the paraglide middleware
export const paraglideHandle: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		// En SvelteKit 3 `event.request` es de solo lectura: se pasa un evento nuevo
		// con la petición localizada (pauta de la plantilla de `sv add paraglide`).
		return resolve(
			{ ...event, request },
			{
				transformPageChunk: ({ html }) => {
					return html.replace('%lang%', locale);
				}
			}
		);
	});
