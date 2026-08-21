import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const envTestPath = resolve(dirname(fileURLToPath(import.meta.url)), '../../.env.test');

// Parser mínimo de .env.test (formato KEY=VALUE, sin expansión de variables):
// evita añadir dotenv como dependencia solo para los tests E2E.
export function loadTestEnv(): Record<string, string> {
	const content = readFileSync(envTestPath, 'utf-8');
	const env: Record<string, string> = {};

	for (const line of content.split('\n')) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;

		const eqIndex = trimmed.indexOf('=');
		if (eqIndex === -1) continue;

		const key = trimmed.slice(0, eqIndex).trim();
		let value = trimmed.slice(eqIndex + 1).trim();
		// Soporta valores entre comillas simples o dobles
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}
		env[key] = value;
	}

	return env;
}
