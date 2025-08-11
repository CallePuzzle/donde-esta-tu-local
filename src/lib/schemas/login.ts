import { z } from 'zod';
import { m } from '../paraglide/messages.js';

export const loginSchema = z.object({
	email: z.string().email(m.schema_login_email_error()).describe(m.schema_login_email_describe())
});

export type LoginSchema = typeof loginSchema;
