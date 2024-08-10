import meIconUrl from '$lib/assets/person-arms-up.svg';

import type { Marker, Map, LatLngTuple } from 'leaflet';

export function showMyPosition(L: any, map: Map, origin: LatLngTuple, focus: boolean = true) {
	let me: Marker;

	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(checkDistance, positionError, {
			enableHighAccuracy: true, // Habilitar alta precisión
			maximumAge: 10, // No usar caché
			timeout: 5000 // Tiempo de espera para obtener la ubicación
		});
	}

	function checkDistance(position) {
		var lat = position.coords.latitude;
		var lon = position.coords.longitude;

		var distancia = calculateDistance(lat, lon, origin[0], origin[1]);

		// Verificar si está dentro de 5 km
		if (distancia < 5) {
			navigator.geolocation.watchPosition(showPosition, positionError, {
				enableHighAccuracy: true, // Habilitar alta precisión
				maximumAge: 10, // Cache 10ms
				timeout: 5000 // Tiempo de espera para obtener la ubicación
			});
		}
	}

	function calculateDistance(lat1, lon1, lat2, lon2) {
		var R = 6371; // Radio de la Tierra en km
		var dLat = ((lat2 - lat1) * Math.PI) / 180;
		var dLon = ((lon2 - lon1) * Math.PI) / 180;
		var a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos((lat1 * Math.PI) / 180) *
				Math.cos((lat2 * Math.PI) / 180) *
				Math.sin(dLon / 2) *
				Math.sin(dLon / 2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		var distancia = R * c; // Distancia en km
		return distancia;
	}

	function showPosition(position) {
		var lat = position.coords.latitude;
		var lon = position.coords.longitude;

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
	function positionError(error) {
		console.warn(`ERROR(${error.code}): ${error.message}`);
	}
}
