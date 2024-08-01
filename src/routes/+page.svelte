<script lang="ts">
	import { onMount } from 'svelte';

	import type { PageData } from './$types';
	export let data: PageData;

	onMount(async () => {
		const L = (await import('leaflet')).default;
		const map = L.map('map').setView([41.50878286958457, -4.458162378583092], 17);
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);

		(await data.gangs).map((gang) => {
			L.marker([gang.latitude, gang.longitude]).addTo(map).bindPopup(gang.name);
		});
	});
</script>

<div id="map" class="z-0"></div>

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
