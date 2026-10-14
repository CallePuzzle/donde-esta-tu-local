import type { Handle } from '@sveltejs/kit';
import { isAssetPathname } from '$lib/utils/is-asset-pathname';

// Salta el handle envuelto en peticiones de assets estáticos: no resuelven sesión
// y evitan el trabajo innecesario (p. ej. la llamada a `auth.api.getSession`).
export const skipAssets =
	(handle: Handle): Handle =>
	({ event, resolve }) =>
		isAssetPathname(event.url.pathname) ? resolve(event) : handle({ event, resolve });
