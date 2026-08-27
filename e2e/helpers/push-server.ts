import { createServer } from 'node:http';

import type { Server } from 'node:http';

// Simula un push service real lo justo para probar el envío de
// notificaciones sin depender de uno de verdad (FCM/Mozilla): responde con el
// código HTTP configurado por ruta. web-push interpreta cualquier no-2xx como
// WebPushError con ese código de estado (ver web-push-lib.js), así que basta
// con esto para ejercitar tanto el envío correcto (2xx) como el borrado de
// suscripciones caducadas (410).
export async function startFakePushServer(
	responses: Record<string, number>
): Promise<{ url: string; close: () => Promise<void> }> {
	const server: Server = createServer((req, res) => {
		const status = req.url ? responses[req.url] : undefined;
		res.writeHead(status ?? 500);
		res.end();
	});

	await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
	const address = server.address();
	if (!address || typeof address === 'string') {
		throw new Error('No se pudo arrancar el servidor de push de prueba');
	}

	return {
		url: `http://127.0.0.1:${address.port}`,
		close: () => new Promise<void>((resolve) => server.close(() => resolve()))
	};
}
