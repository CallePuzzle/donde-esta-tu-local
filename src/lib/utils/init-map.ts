import 'leaflet/dist/leaflet.css';
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerIcon2xUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { coordsMonte } from '$lib/utils/coords-monte';

import type { Map } from 'leaflet';
import type { Leaflet } from '$lib/utils/types';

export async function initMap(elementId: string): Promise<{ L: Leaflet; map: Map }> {
	const L = await import('leaflet');

	// Leaflet calcula la ruta de sus iconos por defecto a partir de la URL del
	// script/CSS, lo que funciona en dev (Vite sirve node_modules) pero falla en
	// producción. Fijamos las URLs usando los assets importados por Vite.
	delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
	L.Icon.Default.mergeOptions({
		iconRetinaUrl: markerIcon2xUrl,
		iconUrl: markerIconUrl,
		shadowUrl: markerShadowUrl
	});

	const map = L.map(elementId).setView(coordsMonte, 17);
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);

	return { L, map };
}
