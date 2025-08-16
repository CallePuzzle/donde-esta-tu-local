import { z } from 'zod/v4';
import { m } from '../paraglide/messages.js';

export const loginSchema = z.object({
	email: z.email(m.schema_login_email_error()).meta({
		placeholder: 'pepe@archive.org',
		description: m.schema_login_email_describe()
	})
});

export type LoginSchema = z.infer<typeof loginSchema>;
