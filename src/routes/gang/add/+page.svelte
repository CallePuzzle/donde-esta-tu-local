<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { showMyPosition } from '$lib/utils/show-my-position';
	import { coordsMonte } from '$lib/utils/coords-monte';
	import { routes } from '$lib/routes';

	import type { Gang } from '@prisma/client';

	import type { PageData } from './$types';

	let {
		data
	}: {
		data: PageData;
	} = $props();

	interface LatLng {
		lat: number;
		lng: number;
	}

	let latlng = $state({}) as LatLng;

	onMount(async () => {
		const infoModal = document.getElementById('add_gang_info') as HTMLDialogElement;
		infoModal.showModal();

		const L = (await import('leaflet')).default;
		const map = L.map('map').setView(coordsMonte, 17);
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);

		showMyPosition(L, map, coordsMonte, false);

		map.on('click', addGang);

		function addGang(e: L.LeafletMouseEvent) {
			latlng = {
				lat: e.latlng.lat,
				lng: e.latlng.lng
			};
			console.log(latlng);
			L.popup()
				.setLatLng(e.latlng)
				.setContent(
					'<button class="btn btn-ghost" onclick="add_gang.showModal()">Añadir peña en esta localización</button>'
				)
				.openOn(map);
		}
	});
</script>

<div id="map" class="z-0"></div>

<link
	rel="stylesheet"
	href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
	integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
	crossorigin=""
/>

<dialog id="add_gang_info" class="modal">
	<div class="modal-box flex max-w-md justify-center">
		<p class="py-4">Haz click en la ubicación de la peña para añadirla</p>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>

<style>
	#map {
		height: 80vh;
	}
</style>
