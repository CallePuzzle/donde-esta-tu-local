import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { User } from '@prisma/client';

const findUnique = vi.fn();

vi.mock('$lib/server/db', () => ({
	default: { user: { findUnique } }
}));

const { isAdmin, canManageGangMembers, requireUser, requireAdmin, requireValidatedMember } =
	await import('./membership');

function makeUser(overrides: Partial<User> = {}): User {
	return {
		id: 'user-1',
		name: null,
		email: 'user@example.com',
		emailVerified: true,
		image: null,
		createdAt: new Date(),
		updatedAt: new Date(),
		role: null,
		banned: null,
		banReason: null,
		banExpires: null,
		gangId: null,
		membershipGangStatus: 'PENDING',
		...overrides
	} as User;
}

beforeEach(() => {
	findUnique.mockReset();
});

describe('isAdmin', () => {
	it('is true for admin and system roles', () => {
		expect(isAdmin(makeUser({ role: 'admin' }))).toBe(true);
		expect(isAdmin(makeUser({ role: 'system' }))).toBe(true);
	});

	it('is false for a regular user or no user', () => {
		expect(isAdmin(makeUser({ role: 'user' }))).toBe(false);
		expect(isAdmin(makeUser({ role: null }))).toBe(false);
		expect(isAdmin(null)).toBe(false);
		expect(isAdmin(undefined)).toBe(false);
	});
});

describe('canManageGangMembers', () => {
	it('is false with no user', async () => {
		expect(await canManageGangMembers(null, 1)).toBe(false);
	});

	it('is true for admins without querying the membership', async () => {
		expect(await canManageGangMembers(makeUser({ role: 'admin' }), 1)).toBe(true);
		expect(findUnique).not.toHaveBeenCalled();
	});

	it('is true for a validated member of that same gang', async () => {
		findUnique.mockResolvedValue({ gangId: 1, membershipGangStatus: 'VALIDATED' });
		expect(await canManageGangMembers(makeUser(), 1)).toBe(true);
	});

	it('is false for a validated member of a different gang', async () => {
		findUnique.mockResolvedValue({ gangId: 2, membershipGangStatus: 'VALIDATED' });
		expect(await canManageGangMembers(makeUser(), 1)).toBe(false);
	});

	it('is false for a pending member of the same gang', async () => {
		findUnique.mockResolvedValue({ gangId: 1, membershipGangStatus: 'PENDING' });
		expect(await canManageGangMembers(makeUser(), 1)).toBe(false);
	});
});

describe('requireUser / requireAdmin / requireValidatedMember', () => {
	it('requireUser throws 401 without a session', () => {
		expect(() => requireUser({ user: undefined })).toThrowError();
	});

	it('requireUser returns the user when logged in', () => {
		const user = makeUser();
		expect(requireUser({ user })).toBe(user);
	});

	it('requireAdmin throws 403 for a non-admin user', () => {
		expect(() => requireAdmin({ user: makeUser({ role: 'user' }) })).toThrowError();
	});

	it('requireAdmin returns the user for an admin', () => {
		const user = makeUser({ role: 'admin' });
		expect(requireAdmin({ user })).toBe(user);
	});

	it('requireValidatedMember throws 403 when canManageGangMembers is false', async () => {
		findUnique.mockResolvedValue({ gangId: 2, membershipGangStatus: 'VALIDATED' });
		await expect(requireValidatedMember({ user: makeUser() }, 1)).rejects.toThrow();
	});

	it('requireValidatedMember returns the user when authorized', async () => {
		const user = makeUser({ gangId: 1, membershipGangStatus: 'VALIDATED' });
		findUnique.mockResolvedValue({ gangId: 1, membershipGangStatus: 'VALIDATED' });
		expect(await requireValidatedMember({ user }, 1)).toBe(user);
	});
});
