import { z } from 'zod/v4';
import { m } from '../paraglide/messages.js';

export const addGangSchema = z.object({
	name: z.string(m.schema_add_gang_name_error()).meta({
		placeholder: 'KPY',
		description: m.schema_add_gang_name_describe()
	}),
	lat: z.string().meta({
		placeholder: '',
		description: ''
	}),
	lng: z.string().meta({
		placeholder: '',
		description: ''
	})
});

export type AddGangSchema = z.infer<typeof addGangSchema>;
