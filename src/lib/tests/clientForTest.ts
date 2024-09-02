import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';

async function findSqliteFile(carpeta: string): Promise<string | null> {
	try {
		const archivos = await fs.readdir(carpeta);

		for (const archivo of archivos) {
			if (archivo.endsWith('.sqlite')) {
				return path.join('../', carpeta, archivo);
			}
		}

		console.error('File not found');
		return null;
	} catch (error) {
		console.error('Error al leer la carpeta:', error);
		return null;
	}
}

export async function getPrismaClient(): Promise<PrismaClient> {
	const sqlite = await findSqliteFile('.wrangler/state/v3/d1/miniflare-D1DatabaseObject');
	process.env.DATABASE_URL = 'file:' + sqlite;
	return new PrismaClient();
}
