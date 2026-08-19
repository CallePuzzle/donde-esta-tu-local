<script lang="ts">
	import { page } from '$app/state';
	import { onDestroy, onMount } from 'svelte';
	import { showMyPosition } from '$lib/utils/show-my-position';
	import { coordsMonte } from '$lib/utils/coords-monte';
	import GangMap from '$lib/components/gangs/GangMap.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import FormAddGang from '$lib/components/gangs/FormAddGang.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import CirculePlus from '@lucide/svelte/icons/circle-plus';

	import type { LatLng } from '$lib/components/gangs/types.ts';
	import type { Map } from 'leaflet';
	import type { Leaflet } from '$lib/utils/types';

	import type { PageData } from './$types';

	let {
		data
	}: {
		data: PageData;
	} = $props();

	let latlng = $state<LatLng>({ lat: 0, lng: 0 });

	let modalInfo = $state<Modal | null>(null);
	let modalAdd = $state<Modal | null>(null);
	let stopWatchingPosition: (() => void) | undefined;

	onDestroy(() => stopWatchingPosition?.());

	onMount(() => {
		modalInfo!.showModal();
	});

	function handleMapReady({ L, map }: { L: Leaflet; map: Map }) {
		stopWatchingPosition = showMyPosition(L, map, coordsMonte, false);

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
			button.className = 'btn btn-dash btn-accent';
			button.textContent = m.gang_add_marker_button();
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
	}
</script>

<GangMap onReady={handleMapReady} />

<Modal title={m.routes_gang_add()} showButton={false} bind:this={modalInfo}>
	<p class="py-4">{m.gang_add_modal_info()}</p>
</Modal>

<Modal title={m.routes_gang_add()} showButton={false} bind:this={modalAdd}>
	<h3 class="text-lg font-bold">{m.routes_gang_add()}</h3>

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
