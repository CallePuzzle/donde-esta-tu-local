import { createServer } from 'node:https';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { Server } from 'node:https';

// web-push llama siempre a https.request (hardcoded en la librería, ver
// web-push-lib.js), sin importar el protocolo del endpoint de la
// suscripción: un servidor de prueba en HTTP plano nunca recibiría la
// petición (el handshake TLS falla contra un socket que no habla TLS). Así
// que el servidor falso también tiene que ser HTTPS, con un certificado
// autofirmado generado al vuelo. El proceso del dev server confía en él vía
// NODE_TLS_REJECT_UNAUTHORIZED=0 (ver playwright.config.ts).
function generateSelfSignedCert(): { key: string; cert: string } {
	const dir = mkdtempSync(join(tmpdir(), 'push-cert-'));
	const keyPath = join(dir, 'key.pem');
	const certPath = join(dir, 'cert.pem');
	try {
		execFileSync('openssl', [
			'req',
			'-x509',
			'-newkey',
			'rsa:2048',
			'-nodes',
			'-days',
			'1',
			'-subj',
			'/CN=127.0.0.1',
			'-keyout',
			keyPath,
			'-out',
			certPath
		]);
		return { key: readFileSync(keyPath, 'utf-8'), cert: readFileSync(certPath, 'utf-8') };
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
}

// Simula un push service real lo justo para probar el envío de
// notificaciones sin depender de uno de verdad (FCM/Mozilla): responde con el
// código HTTP configurado por ruta. web-push interpreta cualquier no-2xx como
// WebPushError con ese código de estado (ver web-push-lib.js), así que basta
// con esto para ejercitar tanto el envío correcto (2xx) como el borrado de
// suscripciones caducadas (410).
export async function startFakePushServer(responses: Record<string, number>): Promise<{
	url: string;
	close: () => Promise<void>;
	getRequests: () => { url: string; method: string }[];
}> {
	const requests: { url: string; method: string }[] = [];
	const server: Server = createServer(generateSelfSignedCert(), (req, res) => {
		requests.push({ url: req.url ?? '/', method: req.method ?? 'POST' });
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
		url: `https://127.0.0.1:${address.port}`,
		close: () => new Promise<void>((resolve) => server.close(() => resolve())),
		getRequests: () => requests
	};
}
