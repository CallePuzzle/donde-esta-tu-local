import meIconUrl from '$lib/assets/person-arms-up.svg';

import type { Marker, Map, LatLngTuple } from 'leaflet';

export function showMyPosition(L: any, map: Map, origin: LatLngTuple, focus: boolean = true) {
	let me: Marker;

	if (navigator.geolocation) {
		navigator.geolocation.watchPosition(showPosition, positionError, {
			enableHighAccuracy: true, // Habilitar alta precisión
			maximumAge: 10, // Cache 10ms
			timeout: 5000 // Tiempo de espera para obtener la ubicación
		});
	}

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
			me = L.marker([lat, lon], { icon: meIcon }).addTo(map).bindPopup('Estás aquí');
			if (focus) me.openPopup();
		} else {
			me.setLatLng([lat, lon]);
		}
	}

	// Manejar errores de geolocalización
	function positionError(error: GeolocationPositionError) {
		console.warn(`ERROR(${error.code}): ${error.message}`);
	}
}
