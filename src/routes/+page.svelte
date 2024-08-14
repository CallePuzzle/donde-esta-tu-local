<script lang="ts">
	import { onMount } from 'svelte';
	import { showMyPosition } from '$lib/utils/show-my-position';
	import { coordsMonte } from '$lib/utils/coords-monte';
	import { Icon } from 'svelte-icons-pack';
	import { BiCurrentLocation } from 'svelte-icons-pack/bi';
	import { goto } from '$app/navigation';
	import { Routes } from '$lib/routes';
	import wellcome from '$lib/stores/wellcome';
	import { defaultValue as firstTime } from '$lib/stores/wellcome';
	import { isEqual } from 'lodash-es';

	import type { PageData } from './$types';
	import type { Map } from 'leaflet';

	export let data: PageData;
	let L: any;
	let map: Map;
	let showImHere = false;

	onMount(async () => {
		if (isEqual($wellcome, firstTime)) {
			console.log('firstTime');
			goto(Routes.wellcome.url);
		}
		L = (await import('leaflet')).default;
		map = L.map('map').setView(coordsMonte, 17);
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);

		data.gangs.map((gang) => {
			let message = '<a href="/gang/' + gang.id + '">' + gang.name + '</a>';

			message = gang.status == 'VALIDATED' ? message : message + ' (sin validar)';
			L.marker([gang.latitude, gang.longitude], {
				opacity: gang.status == 'VALIDATED' ? 1 : 0.6
			})
				.addTo(map)
				.bindPopup(message);
		});

		showImHere = true;
	});

	function imHere() {
		showMyPosition(L, map, coordsMonte);
	}
</script>

<div id="map" class="z-0"></div>

{#if showImHere}
	<button
		id="imhere"
		on:click={imHere}
		class="btn btn-circle absolute bottom-18 md:bottom-3 right-3 btn-active btn-primary"
		><Icon src={BiCurrentLocation} /></button
	>
{/if}

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
