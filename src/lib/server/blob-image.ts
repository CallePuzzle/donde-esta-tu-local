import { del, put } from '@vercel/blob';
import { logger } from '$lib/logger';
import { isVercelBlobUrl } from '$lib/config/vercel-hosts.js';

// Extensión del fichero según el tipo MIME permitido por los esquemas de imagen
const EXTENSION_BY_MIME: Record<string, string> = {
	'image/jpeg': 'jpg',
	'image/jpg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp'
};

// Deriva la extensión del tipo MIME ya validado por zod, nunca del nombre del fichero
export function extensionForMime(mime: string): string {
	return EXTENSION_BY_MIME[mime] ?? 'jpg';
}

export async function uploadImage(file: File, keyPrefix: string): Promise<string> {
	const extension = extensionForMime(file.type);
	const filename = `${keyPrefix}-${Date.now()}.${extension}`;

	const arrayBuffer = await file.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);

	const { url } = await put(filename, buffer, {
		access: 'public',
		contentType: file.type
	});

	return url;
}

// No hace nada si la URL no existe o no es de Vercel Blob (p.ej. un avatar
// ajeno o ya borrado); no propaga el error para no romper el flujo (B17).
export async function deleteImage(url: string | null | undefined): Promise<void> {
	if (!url || !isVercelBlobUrl(url)) return;

	try {
		await del(url);
	} catch (error) {
		logger.error(error, 'Error deleting image from Vercel Blob');
	}
}
