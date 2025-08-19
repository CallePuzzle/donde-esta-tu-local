import { z } from 'zod/v4';
import { m } from '../paraglide/messages.js';

export const updateUserSchema = z.object({
	name: z.string().min(1, m.schema_user_name_error()).max(100).meta({
		placeholder: 'John Doe',
		description: m.schema_user_name_describe()
	}),
	image: z.string().url(m.schema_user_image_error()).nullish().meta({
		placeholder: 'https://example.com/avatar.jpg',
		description: m.schema_user_image_describe()
	})
});

export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
