<script lang="ts">
	import { onMount } from 'svelte';

	onMount(async () => {
		const L = (await import('leaflet')).default;
		const map = L.map('map').setView([41.50878286958457, -4.458162378583092], 17);
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);

		L.marker([41.507893235550306, -4.461463703773325]).addTo(map).bindPopup('KPY').openPopup();
	});
</script>

<div id="map"></div>

<span class="badge-icon variant-filled"> (icon) </span>

<link
	rel="stylesheet"
	href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
	integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
	crossorigin=""
/>

<style>
	#map {
		height: 80vh;
	}
</style>
