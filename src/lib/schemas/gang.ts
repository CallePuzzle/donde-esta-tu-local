import { z } from 'zod/v4';
import { m } from '../paraglide/messages.js';
import { coordsMonte } from '../utils/coords-monte.js';

// Cuánto puede alejarse una peña de Montemayor de Pililla: ~11 km en
// latitud y ~8 km en longitud a esta latitud, de sobra para el pueblo y
// sus alrededores.
const COORDS_BOUNDING_BOX_DEGREES = 0.1;
const [MONTE_LAT, MONTE_LNG] = coordsMonte;

export const addGangSchema = z.object({
	name: z
		.string(m.schema_add_gang_name_error())
		.trim()
		.min(1, m.schema_add_gang_name_error())
		.max(60, m.schema_add_gang_name_error())
		.meta({
			placeholder: 'KPY',
			description: m.schema_add_gang_name_describe()
		}),
	lat: z
		.number(m.schema_add_gang_coords_error())
		.min(MONTE_LAT - COORDS_BOUNDING_BOX_DEGREES, m.schema_add_gang_coords_error())
		.max(MONTE_LAT + COORDS_BOUNDING_BOX_DEGREES, m.schema_add_gang_coords_error())
		.meta({
			placeholder: '',
			description: ''
		}),
	lng: z
		.number(m.schema_add_gang_coords_error())
		.min(MONTE_LNG - COORDS_BOUNDING_BOX_DEGREES, m.schema_add_gang_coords_error())
		.max(MONTE_LNG + COORDS_BOUNDING_BOX_DEGREES, m.schema_add_gang_coords_error())
		.meta({
			placeholder: '',
			description: ''
		})
});

export type AddGangSchema = z.infer<typeof addGangSchema>;
