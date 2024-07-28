import { User } from '$lib/server/auth-mongoose-models';

import { test, expect } from 'vitest';

test('mongoose User methods', async () => {
	const existingUser = await User.findById('000000').exec();
	expect(existingUser).toBeNull();

	const newUser = await User.create({
		_id: '000000',
		email: '00000@example.com'
	});
	expect(newUser._id).toBe('000000');

	const found = await User.findById('000000').exec();
	expect(found).not.toBeNull();
	expect(found?.email).toBe('00000@example.com');
});
