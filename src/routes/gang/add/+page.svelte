<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { showMyPosition } from '$lib/utils/show-my-position';
	import { coordsMonte } from '$lib/utils/coords-monte';
	import Modal from '$lib/components/Modal.svelte';
	import ModalType from '$lib/components/Modal.svelte';
	import FormAddGang from '$lib/components/gangs/FormAddGang.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import CirculePlus from '@lucide/svelte/icons/circle-plus';

	import type { LatLng } from '$lib/components/gangs/types.ts';

	import type { PageData } from './$types';

	let {
		data
	}: {
		data: PageData;
	} = $props();

	let latlng = $state<LatLng>({ lat: 0, lng: 0 });

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

			// Crear un marcador temporal en el punto clickeado
			const marker = L.marker(e.latlng).addTo(map);

			// Crear popup con botón
			const popupContent = document.createElement('div');
			const button = document.createElement('button');
			button.className = 'btn btn-accent';
			button.textContent = 'Añadir peña en esta localización';
			button.onclick = () => {
				modalAdd!.showModal();
				map.closePopup();
			};
			popupContent.appendChild(button);

			// Mostrar popup
			marker.bindPopup(popupContent).openPopup();

			// Opcional: remover el marcador cuando se cierre el popup
			marker.on('popupclose', () => {
				map.removeLayer(marker);
			});
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

<Modal title="add_gang_info" showButton={false} bind:this={modalInfo}>
	<p class="py-4">Haz click en la ubicación de la peña para añadirla</p>
</Modal>

<Modal title="add_gang" showButton={false} bind:this={modalAdd}>
	<h3 class="text-lg font-bold">Añadir peña</h3>

	<div class="container pt-6">
		{#if latlng.lat !== 0 && latlng.lng !== 0}
			{#snippet buttonText()}
				<CirculePlus />{m.form_gang_add_submit()}
			{/snippet}
			<FormAddGang
				pageStatus={page.status}
				dataForm={data.form}
				{latlng}
				{buttonText}
				callbackUrl="/"
			/>
		{/if}
	</div>
</Modal>

<style>
	#map {
		height: 80vh;
	}
</style>
