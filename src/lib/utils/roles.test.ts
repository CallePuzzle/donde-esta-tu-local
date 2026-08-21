import { describe, expect, it } from 'vitest';
import { isAdmin } from './roles';

describe('isAdmin', () => {
	it('is true for admin and system roles', () => {
		expect(isAdmin({ role: 'admin' })).toBe(true);
		expect(isAdmin({ role: 'system' })).toBe(true);
	});

	it('is false for a regular user, no role, or no user', () => {
		expect(isAdmin({ role: 'user' })).toBe(false);
		expect(isAdmin({ role: null })).toBe(false);
		expect(isAdmin(null)).toBe(false);
		expect(isAdmin(undefined)).toBe(false);
	});
});
