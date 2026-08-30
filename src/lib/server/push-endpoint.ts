import { z } from 'zod/v4';

// El endpoint lo manda el cliente sin que nada garantice que sea el valor
// real devuelto por PushManager.subscribe(): un usuario autenticado podría
// mandar cualquier URL, y sendActivityNotifications hará POST contra ella
// desde el cron. Restringir el host a los push services conocidos evita usar
// el servidor como origen de peticiones arbitrarias (SSRF de bajo impacto,
// ya que el cuerpo va cifrado y la respuesta no se expone).
const ALLOWED_PUSH_ENDPOINT_HOSTS = [
	'fcm.googleapis.com',
	'*.push.services.mozilla.com',
	'web.push.apple.com',
	'*.notify.windows.com'
];

function isAllowedPushHost(hostname: string): boolean {
	return ALLOWED_PUSH_ENDPOINT_HOSTS.some((pattern) =>
		pattern.startsWith('*.') ? hostname.endsWith(pattern.slice(1)) : hostname === pattern
	);
}

export const pushEndpointSchema = z.url().refine((endpoint) => {
	try {
		return isAllowedPushHost(new URL(endpoint).hostname);
	} catch {
		return false;
	}
}, 'Endpoint de push no permitido');
