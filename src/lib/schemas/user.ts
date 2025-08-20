import { z } from 'zod/v4';
import { m } from '../paraglide/messages.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const updateUserSchema = z.object({
	name: z.string().min(1, m.schema_user_name_error()).max(100).meta({
		placeholder: 'John Doe',
		description: m.schema_user_name_describe()
	}),
	image: z.url(m.schema_user_image_error()).optional().meta({
		placeholder: 'https://example.com/avatar.jpg',
		description: m.schema_user_image_describe()
	}),
	imageFile: z.file().max(MAX_FILE_SIZE).mime(ACCEPTED_IMAGE_TYPES).optional().meta({
		placeholder: 'Choose a file',
		description: m.schema_user_image_describe()
	})
});

export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
