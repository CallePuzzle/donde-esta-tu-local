<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { showMyPosition } from '$lib/utils/show-my-position';
	import { coordsMonte } from '$lib/utils/coords-monte';
	import { routes } from '$lib/routes';
	import Modal from '$lib/components/Modal.svelte';
	import ModalType from '$lib/components/Modal.svelte';
	import FormAddGang from '$lib/components/gangs/FormAddGang.svelte';

	import type { Gang } from '@prisma/client';
	import type { LatLng } from '$lib/components/gangs/types.ts';

	import type { PageData } from './$types';

	let {
		data
	}: {
		data: PageData;
	} = $props();

	let latlng = $state({}) as LatLng;

	let modalInfo = $state<ModalType | null>(null);
	let modalAdd = $state<ModalType | null>(null);

	onMount(async () => {
		modalInfo!.showModal();

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
					'<button class="btn btn-accent" onclick="showModalAdd()">Añadir peña en esta localización</button>'
				)
				.openOn(map);
		}

		// Hacemos que la función sea global para que funcione el onclick generado del setContent
		window.showModalAdd = function () {
			modalAdd!.showModal();
		};
	});
</script>

<div id="map" class="z-0"></div>

<link
	rel="stylesheet"
	href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
	integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
	crossorigin=""
/>

<Modal title="add_gang_info" showButton={false} bind:this={modalInfo}>
	<p class="py-4">Haz click en la ubicación de la peña para añadirla</p>
</Modal>

<Modal title="add_gang" showButton={false} bind:this={modalAdd}>
	<h3 class="text-lg font-bold">Añadir peña</h3>

	<div class="container pt-6">
		<FormAddGang {latlng} />
	</div>
</Modal>

<style>
	#map {
		height: 80vh;
	}
</style>
