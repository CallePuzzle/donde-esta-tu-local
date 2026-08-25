import { z } from 'zod/v4';
import { m } from '../paraglide/messages.js';
import { coordsMonte } from '../utils/coords-monte.js';
import { MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES } from './image.js';

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

// Formulario del modal de foto de /gang/[slug]: un único campo, por eso el
// fichero es obligatorio (en el perfil es opcional porque comparte
// formulario con el nombre).
export const gangImageSchema = z.object({
	imageFile: z
		.file(m.schema_gang_image_required_error())
		.max(MAX_FILE_SIZE, m.schema_image_file_size_error())
		.mime(ACCEPTED_IMAGE_TYPES, m.schema_image_file_type_error())
		.meta({ placeholder: '', description: m.schema_gang_image_describe() })
});

export type GangImageSchema = z.infer<typeof gangImageSchema>;
