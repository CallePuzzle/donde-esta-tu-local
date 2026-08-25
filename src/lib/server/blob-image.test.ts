import { describe, expect, it, vi, beforeEach } from 'vitest';

const put = vi.fn();
const del = vi.fn();

vi.mock('@vercel/blob', () => ({ put, del }));

const { extensionForMime, uploadImage, deleteImage } = await import('./blob-image');

beforeEach(() => {
	put.mockReset();
	del.mockReset();
});

describe('extensionForMime', () => {
	it.each([
		['image/jpeg', 'jpg'],
		['image/jpg', 'jpg'],
		['image/png', 'png'],
		['image/webp', 'webp']
	])('maps %s to %s', (mime, expected) => {
		expect(extensionForMime(mime)).toBe(expected);
	});

	it('falls back to jpg for an unknown mime type', () => {
		expect(extensionForMime('image/svg+xml')).toBe('jpg');
	});
});

describe('uploadImage', () => {
	it('uploads to the given key prefix with the derived extension', async () => {
		put.mockResolvedValue({ url: 'https://example.public.blob.vercel-storage.com/gangs/7.png' });
		const file = new File([new Uint8Array(10)], 'gang.png', { type: 'image/png' });

		const url = await uploadImage(file, 'gangs/7');

		expect(url).toBe('https://example.public.blob.vercel-storage.com/gangs/7.png');
		expect(put).toHaveBeenCalledTimes(1);
		const [key, , options] = put.mock.calls[0];
		expect(key).toMatch(/^gangs\/7-\d+\.png$/);
		expect(options).toMatchObject({ access: 'public', contentType: 'image/png' });
	});
});

describe('deleteImage', () => {
	it('does not call del for a null url', async () => {
		await deleteImage(null);
		expect(del).not.toHaveBeenCalled();
	});

	it('does not call del for an empty url', async () => {
		await deleteImage('');
		expect(del).not.toHaveBeenCalled();
	});

	it('does not call del for a url that is not from Vercel Blob', async () => {
		await deleteImage('https://example.com/gang.png');
		expect(del).not.toHaveBeenCalled();
	});

	it('calls del for a Vercel Blob url', async () => {
		del.mockResolvedValue(undefined);
		await deleteImage('https://example.public.blob.vercel-storage.com/gangs/7.png');
		expect(del).toHaveBeenCalledWith('https://example.public.blob.vercel-storage.com/gangs/7.png');
	});

	it('does not throw if del rejects', async () => {
		del.mockRejectedValue(new Error('boom'));
		await expect(
			deleteImage('https://example.public.blob.vercel-storage.com/gangs/7.png')
		).resolves.toBeUndefined();
	});
});
