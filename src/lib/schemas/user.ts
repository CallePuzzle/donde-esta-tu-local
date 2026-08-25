import { z } from 'zod/v4';
import { m } from '../paraglide/messages.js';
import { MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES } from './image.js';

export const updateUserSchema = z.object({
	name: z.string().min(1, m.schema_user_name_error()).max(100).meta({
		placeholder: 'John Doe',
		description: m.schema_user_name_describe()
	}),
	imageFile: z.file().max(MAX_FILE_SIZE).mime(ACCEPTED_IMAGE_TYPES).optional().meta({
		placeholder: 'Choose a file',
		description: m.schema_user_image_describe()
	})
});

export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
