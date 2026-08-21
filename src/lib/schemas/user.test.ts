import { describe, expect, it } from 'vitest';
import { updateUserSchema } from './user';

describe('updateUserSchema', () => {
	it('accepts a well-formed name with no file', () => {
		expect(updateUserSchema.safeParse({ name: 'Pepe' }).success).toBe(true);
	});

	it('rejects an empty name', () => {
		expect(updateUserSchema.safeParse({ name: '' }).success).toBe(false);
	});

	it('rejects a name over 100 characters', () => {
		const result = updateUserSchema.safeParse({ name: 'a'.repeat(101) });
		expect(result.success).toBe(false);
	});

	it('rejects an image file over 5MB', () => {
		const oversized = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'avatar.png', {
			type: 'image/png'
		});
		const result = updateUserSchema.safeParse({ name: 'Pepe', imageFile: oversized });
		expect(result.success).toBe(false);
	});

	it('rejects an unsupported image mime type', () => {
		const svg = new File([new Uint8Array(10)], 'avatar.svg', { type: 'image/svg+xml' });
		const result = updateUserSchema.safeParse({ name: 'Pepe', imageFile: svg });
		expect(result.success).toBe(false);
	});

	it('accepts a valid image file', () => {
		const png = new File([new Uint8Array(10)], 'avatar.png', { type: 'image/png' });
		const result = updateUserSchema.safeParse({ name: 'Pepe', imageFile: png });
		expect(result.success).toBe(true);
	});
});
