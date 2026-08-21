import { describe, expect, it } from 'vitest';
import { loginSchema } from './login';

describe('loginSchema', () => {
	it('accepts a well-formed email', () => {
		expect(loginSchema.safeParse({ email: 'pepe@example.com' }).success).toBe(true);
	});

	it('rejects a malformed email', () => {
		expect(loginSchema.safeParse({ email: 'not-an-email' }).success).toBe(false);
	});

	it('rejects an empty email', () => {
		expect(loginSchema.safeParse({ email: '' }).success).toBe(false);
	});
});
