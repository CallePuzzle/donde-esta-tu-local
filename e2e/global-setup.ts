import { execSync } from 'node:child_process';
import { loadTestEnv } from './helpers/env';

// Espera a que el PostgreSQL de test (docker compose) acepte conexiones y
// aplica las migraciones sobre la BD de test antes de lanzar los tests.
export default async function globalSetup() {
	const env = { ...process.env, ...loadTestEnv() };

	const maxAttempts = 15;
	let lastError: unknown;
	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			execSync('bunx prisma migrate deploy', { stdio: 'inherit', env });
			return;
		} catch (error) {
			lastError = error;
			if (attempt < maxAttempts) {
				await new Promise((resolve) => setTimeout(resolve, 2000));
			}
		}
	}

	throw new Error(
		`No se pudieron aplicar las migraciones sobre la BD de test. ¿Está levantada? (bun run db:test:up): ${lastError}`
	);
}
