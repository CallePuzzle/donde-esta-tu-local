<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { page } from '$app/state';
	import { coordsMonte } from '$lib/utils/coords-monte';
	import { showMyPosition } from '$lib/utils/show-my-position';
	import GangMap from '$lib/components/gangs/GangMap.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import FormAddGang from '$lib/components/gangs/FormAddGang.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import CircleFadingArrowUp from '@lucide/svelte/icons/circle-fading-arrow-up';
	import { resolve } from '$app/paths';

	import type { PageData } from './$types';
	import type { GangData } from '../type';
	import type { LatLng } from '$lib/components/gangs/types.ts';
	import type { Map } from 'leaflet';
	import type { Leaflet } from '$lib/utils/types';

	let { data }: { data: PageData } = $props();

	let modalInfo = $state<Modal | null>(null);
	let modalAdd = $state<Modal | null>(null);
	let latlng = $state<LatLng>({ lat: 0, lng: 0 });
	let gang: GangData = $derived(data.gang);
	let stopWatchingPosition: (() => void) | undefined;

	onDestroy(() => stopWatchingPosition?.());

	onMount(() => {
		modalInfo!.showModal();
	});

	function handleMapReady({ L, map }: { L: Leaflet; map: Map }) {
		map.panTo([gang.latitude, gang.longitude]);
		const popupContent = document.createElement('span');
		popupContent.textContent = gang.name;
		L.marker([gang.latitude, gang.longitude]).addTo(map).bindPopup(popupContent);

		stopWatchingPosition = showMyPosition(L, map, coordsMonte, false);

		map.on('click', addGang);

		function addGang(e: L.LeafletMouseEvent) {
			latlng = {
				lat: e.latlng.lat,
				lng: e.latlng.lng
			};
			const marker = L.marker(e.latlng).addTo(map);
			modalAdd!.showModal();
			marker.on('popupclose', () => {
				map.removeLayer(marker);
			});
		}
	}
</script>

<div class="hero">
	<div class="hero-content text-center">
		<div class="flex max-w-md flex-col">
			<h2>{m.gang_update()}</h2>
			<h1 class="text-5xl font-bold">{gang.name}</h1>
		</div>
	</div>
</div>

<GangMap onReady={handleMapReady} />

<Modal title={m.gang_update_modal_title()} showButton={false} bind:this={modalInfo}>
	<p class="py-4">{m.gang_update_modal_info()}</p>
</Modal>

<Modal title={m.gang_update_modal_title()} showButton={false} bind:this={modalAdd}>
	<h3 class="text-lg font-bold">{m.gang_update_modal_title()}</h3>

	<div class="container pt-6">
		{#if latlng.lat !== 0 && latlng.lng !== 0}
			{#snippet buttonText()}
				<CircleFadingArrowUp />{m.form_gang_upgrade_submit()}
			{/snippet}
			<FormAddGang
				pageStatus={page.status}
				dataForm={data.form}
				{latlng}
				{buttonText}
				callbackUrl={resolve('/gang/[slug]', { slug: gang.id.toString() })}
			/>
		{/if}
	</div>
</Modal>
