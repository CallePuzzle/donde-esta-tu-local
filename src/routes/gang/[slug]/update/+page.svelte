<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { coordsMonte } from '$lib/utils/coords-monte';
	import { showMyPosition } from '$lib/utils/show-my-position';
	import Modal from '$lib/components/Modal.svelte';
	import ModalType from '$lib/components/Modal.svelte';
	import FormAddGang from '$lib/components/gangs/FormAddGang.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import CircleFadingArrowUp from '@lucide/svelte/icons/circle-fading-arrow-up';
	import { resolve } from '$app/paths';

	import type { PageData } from './$types';
	import type { GangData } from '../type';
	import type { LatLng } from '$lib/components/gangs/types.ts';

	let { data }: { data: PageData } = $props();

	let modalInfo = $state<ModalType | null>(null);
	let modalAdd = $state<ModalType | null>(null);
	let latlng = $state<LatLng>({ lat: 0, lng: 0 });
	let gang: GangData = data.gang;

	onMount(async () => {
		modalInfo!.showModal();

		const L = await import('leaflet');
		const map = L.map('map').setView(coordsMonte, 17);
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);

		map.panTo([gang.latitude, gang.longitude]);
		L.marker([gang.latitude, gang.longitude]).addTo(map).bindPopup(gang.name);

		showMyPosition(L, map, coordsMonte, false);

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
	});
</script>

<div class="hero">
	<div class="hero-content text-center">
		<div class="flex max-w-md flex-col">
			<h2>Actualizar peña</h2>
			<h1 class="text-5xl font-bold">{gang.name}</h1>
		</div>
	</div>
</div>

<div id="map" class="z-0"></div>

<link
	rel="stylesheet"
	href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
	integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
	crossorigin=""
/>

<Modal title="add_gang_info" showButton={false} bind:this={modalInfo}>
	<p class="py-4">Haz click en la ubicación para actualizar la peña</p>
</Modal>

<Modal title="add_gang" showButton={false} bind:this={modalAdd}>
	<h3 class="text-lg font-bold">Modificar peña</h3>

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

<style>
	#map {
		height: 80vh;
	}
</style>
