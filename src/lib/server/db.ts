import { PrismaClient } from '$lib/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';

import { isAccelerateUrl } from '$lib/server/database-url';

function createPrismaClient(): PrismaClient {
	// `$env/dynamic/private` y no `process.env`: en desarrollo es SvelteKit/Vite
	// quien carga el `.env` (bun no lo propaga a `vite dev`, que es un proceso
	// hijo de node), y en producción lee el entorno real. Dinámico y no
	// `$env/static/private` para que el build no exija tener la variable.
	const url = env.DATABASE_URL;
	if (!url) {
		throw new Error('Falta DATABASE_URL. Ver .env.example.');
	}
	// Con una URL de Accelerate (producción) el cliente v7 habla con Accelerate
	// directamente vía `accelerateUrl`; no hace falta la extensión
	// `@prisma/extension-accelerate`, que solo añade `cacheStrategy` y
	// `$accelerate` y no se usan en el proyecto. Con una URL PostgreSQL normal
	// (desarrollo local, tests E2E) va directo mediante el adapter de node-pg.
	if (isAccelerateUrl(url)) {
		return new PrismaClient({ accelerateUrl: url });
	}
	return new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
}

// Sin esto, cada recarga en caliente de `bun run dev` reevalúa este módulo y
// crea otro PrismaClient (y otro pool de conexiones) sobre el anterior (D5).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

let client: PrismaClient | undefined;

function getPrismaClient(): PrismaClient {
	if (!client) {
		client = globalForPrisma.prisma ?? createPrismaClient();
		if (dev) {
			globalForPrisma.prisma = client;
		}
	}
	return client;
}

// El cliente se crea en el primer acceso, no al importar el módulo: `vite build`
// evalúa el código de servidor sin variables de entorno (y construir no
// necesita base de datos), así que instanciarlo aquí obligaría a tener
// DATABASE_URL definida para compilar. Así el fallo por configuración aparece,
// con mensaje claro, cuando de verdad se va a consultar la base de datos.
const prisma = new Proxy({} as PrismaClient, {
	get(_target, property) {
		const instance = getPrismaClient();
		const value = Reflect.get(instance, property);
		return typeof value === 'function' ? value.bind(instance) : value;
	},
	has(_target, property) {
		return Reflect.has(getPrismaClient(), property);
	}
});

export default prisma;
