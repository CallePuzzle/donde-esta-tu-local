import { describe, expect, it } from 'vitest';
import { addGangSchema, gangImageSchema } from './gang';
import { coordsMonte } from '../utils/coords-monte';

const [MONTE_LAT, MONTE_LNG] = coordsMonte;
const validCoords = { lat: MONTE_LAT + 0.01, lng: MONTE_LNG - 0.01 };

describe('addGangSchema', () => {
	it('accepts a well-formed gang', () => {
		const result = addGangSchema.safeParse({ name: 'Peña Los Modernos', ...validCoords });
		expect(result.success).toBe(true);
	});

	it('rejects a non-string name', () => {
		const result = addGangSchema.safeParse({ name: 123, ...validCoords });
		expect(result.success).toBe(false);
	});

	it('rejects an empty (or whitespace-only) name', () => {
		expect(addGangSchema.safeParse({ name: '', ...validCoords }).success).toBe(false);
		expect(addGangSchema.safeParse({ name: '   ', ...validCoords }).success).toBe(false);
	});

	it('rejects a name over 60 characters', () => {
		const result = addGangSchema.safeParse({ name: 'a'.repeat(61), ...validCoords });
		expect(result.success).toBe(false);
	});

	it('trims the name', () => {
		const result = addGangSchema.safeParse({ name: '  Peña  ', ...validCoords });
		expect(result.success && result.data.name).toBe('Peña');
	});

	it('rejects a non-numeric lat/lng', () => {
		const result = addGangSchema.safeParse({ name: 'Peña', lat: 'norte', lng: MONTE_LNG });
		expect(result.success).toBe(false);
	});

	it('rejects a missing field', () => {
		const result = addGangSchema.safeParse({ name: 'Peña', lat: MONTE_LAT });
		expect(result.success).toBe(false);
	});

	it('rejects coordinates far outside Montemayor de Pililla', () => {
		const result = addGangSchema.safeParse({ name: 'Peña', lat: 40.4168, lng: -3.7038 }); // Madrid
		expect(result.success).toBe(false);
	});

	it('accepts coordinates right at the edge of the bounding box', () => {
		const result = addGangSchema.safeParse({
			name: 'Peña',
			lat: MONTE_LAT + 0.1,
			lng: MONTE_LNG - 0.1
		});
		expect(result.success).toBe(true);
	});
});

describe('gangImageSchema', () => {
	it('rejects a missing file', () => {
		expect(gangImageSchema.safeParse({}).success).toBe(false);
	});

	it('rejects a file over 4MB', () => {
		const oversized = new File([new Uint8Array(4 * 1024 * 1024 + 1)], 'gang.png', {
			type: 'image/png'
		});
		const result = gangImageSchema.safeParse({ imageFile: oversized });
		expect(result.success).toBe(false);
	});

	it('rejects an unsupported image mime type', () => {
		const svg = new File([new Uint8Array(10)], 'gang.svg', { type: 'image/svg+xml' });
		const result = gangImageSchema.safeParse({ imageFile: svg });
		expect(result.success).toBe(false);
	});

	it.each(['image/png', 'image/jpeg', 'image/webp'])('accepts a small %s file', (mime) => {
		const file = new File([new Uint8Array(10)], 'gang', { type: mime });
		const result = gangImageSchema.safeParse({ imageFile: file });
		expect(result.success).toBe(true);
	});
});
