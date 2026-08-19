import { describe, expect, it } from 'vitest';
import { isVercelBlobUrl } from './vercel-hosts.js';

describe('isVercelBlobUrl', () => {
	it('is true for a Vercel Blob public URL', () => {
		expect(isVercelBlobUrl('https://abc123.public.blob.vercel-storage.com/avatars/x.png')).toBe(
			true
		);
	});

	it('is false for an unrelated URL', () => {
		expect(isVercelBlobUrl('https://example.com/avatars/x.png')).toBe(false);
	});

	it('is false for a malformed URL', () => {
		expect(isVercelBlobUrl('not-a-url')).toBe(false);
	});
});
