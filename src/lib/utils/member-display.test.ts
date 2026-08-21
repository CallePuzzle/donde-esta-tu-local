import { describe, expect, it } from 'vitest';
import { memberDisplayName, memberInitial } from './member-display';

describe('memberDisplayName', () => {
	it('uses the name when present', () => {
		expect(memberDisplayName({ name: 'Pepe', email: 'pepe@example.com' })).toBe('Pepe');
	});

	it('falls back to the email when there is no name', () => {
		expect(memberDisplayName({ name: null, email: 'pepe@example.com' })).toBe('pepe@example.com');
	});

	it('falls back to a placeholder when there is neither name nor email', () => {
		expect(memberDisplayName({ name: null, email: null })).not.toBe('');
	});
});

describe('memberInitial', () => {
	it('is the uppercase first letter of the resolved display name', () => {
		expect(memberInitial({ name: 'pepe', email: null })).toBe('P');
	});

	it('falls back to the email initial when there is no name', () => {
		expect(memberInitial({ name: null, email: 'ana@example.com' })).toBe('A');
	});
});
