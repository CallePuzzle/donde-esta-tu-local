import meIconUrl from '$lib/assets/person-arms-up.svg';
import { logger } from '$lib/logger';
import { m } from '$lib/paraglide/messages.js';

import type { Marker, Map, LatLngTuple } from 'leaflet';
import type { Leaflet } from '$lib/utils/types';

// Devuelve una función de limpieza que cancela el watchPosition; sin ella,
// cada llamada (cada onMount, o cada click en "dónde estoy") registraba un
// watcher nuevo que nunca se cancelaba.
export function showMyPosition(
	L: Leaflet,
	map: Map,
	origin: LatLngTuple,
	focus: boolean = true
): () => void {
	let me: Marker;

	if (!navigator.geolocation) {
		return () => {};
	}

	const watchId = navigator.geolocation.watchPosition(showPosition, positionError, {
		enableHighAccuracy: true, // Habilitar alta precisión
		maximumAge: 10_000, // Cache 10s (antes 10ms: probablemente un typo)
		timeout: 5000 // Tiempo de espera para obtener la ubicación
	});

	function showPosition(position: GeolocationPosition) {
		const lat = position.coords.latitude;
		const lon = position.coords.longitude;

		const meIcon = L.icon({
			iconUrl: meIconUrl,
			iconSize: [30, 80],
			iconAnchor: [22, 94],
			popupAnchor: [-3, -76]
		});

		if (!me) {
			me = L.marker([lat, lon], { icon: meIcon }).addTo(map).bindPopup(m.map_you_are_here());
			if (focus) me.openPopup();
		} else {
			me.setLatLng([lat, lon]);
		}
	}

	// Manejar errores de geolocalización
	function positionError(error: GeolocationPositionError) {
		logger.warn({ code: error.code, message: error.message }, 'Error de geolocalización');
	}

	return () => navigator.geolocation.clearWatch(watchId);
}
