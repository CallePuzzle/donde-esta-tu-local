// Hosts de Vercel usados tanto por la optimización de imágenes (svelte.config.js)
// como por la CSP (security-headers-handle.ts). Un único sitio que actualizar
// si cambian los dominios de despliegue.

export const VERCEL_APP_HOSTS = [
	'donde-esta-tu-local-git-staging-jilgues-projects.vercel.app',
	'donde-esta-tu-local.vercel.app',
	'xn--peas-hqa.montemayordepililla.cc'
];

export const VERCEL_BLOB_HOST_PATTERN = 'https://*.public.blob.vercel-storage.com';

const VERCEL_BLOB_HOST_SUFFIX = '.public.blob.vercel-storage.com';

// Antes de borrar un blob (p.ej. un avatar reemplazado, ver B17) conviene
// comprobar que la URL es realmente de Vercel Blob y no algo ajeno.
/** @param {string} url */
export function isVercelBlobUrl(url) {
	try {
		return new URL(url).hostname.endsWith(VERCEL_BLOB_HOST_SUFFIX);
	} catch {
		return false;
	}
}
