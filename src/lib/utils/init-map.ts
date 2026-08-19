import 'leaflet/dist/leaflet.css';
import { coordsMonte } from '$lib/utils/coords-monte';

import type { Map } from 'leaflet';
import type { Leaflet } from '$lib/utils/types';

export async function initMap(elementId: string): Promise<{ L: Leaflet; map: Map }> {
	const L = await import('leaflet');
	const map = L.map(elementId).setView(coordsMonte, 17);
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);

	return { L, map };
}
