import { describe, expect, it } from 'vitest';
import { z } from 'zod/v4';
import { zodToFieldsJsonSchema } from './utils';

describe('zodToFieldsJsonSchema', () => {
	it('maps each property to a field with its placeholder/description/required', () => {
		const schema = z.object({
			name: z.string().meta({ placeholder: 'John Doe', description: 'Your name' }),
			nickname: z.string().optional().meta({ placeholder: 'Johnny' })
		});

		const fields = zodToFieldsJsonSchema(schema);

		expect(fields).toEqual([
			{
				name: 'name',
				required: true,
				placeholder: 'John Doe',
				format: undefined,
				description: 'Your name'
			},
			{
				name: 'nickname',
				required: false,
				placeholder: 'Johnny',
				format: undefined,
				description: undefined
			}
		]);
	});

	it('returns an empty array for a schema with no properties', () => {
		expect(zodToFieldsJsonSchema(z.object({}))).toEqual([]);
	});
});
