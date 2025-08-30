<script lang="ts">
	import { onMount } from 'svelte';
	import { showMyPosition } from '$lib/utils/show-my-position';
	import { coordsMonte } from '$lib/utils/coords-monte';
	import Locate from '@lucide/svelte/icons/locate';

	import type { PageData } from './$types';
	import type { Map, Marker } from 'leaflet';
	import type { Gang } from '@prisma/client';

	interface GangInMap {
		gang: Gang;
		marker: Marker;
	}

	let { data }: { data: PageData } = $props();
	let L: typeof import('leaflet');
	let map: Map;
	let showImHere = $state(false);
	let gangsInMap: GangInMap[] = [];

	onMount(async () => {
		L = await import('leaflet');
		map = L.map('map').setView(coordsMonte, 17);
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);

		data.gangs.map((gang: Gang) => {
			let message = '<a href="/gang/' + gang.id + '">' + gang.name + '</a>';

			message = gang.status == 'VALIDATED' ? message : message + ' (sin validar)';
			const marker = L.marker([gang.latitude, gang.longitude], {
				opacity: gang.status == 'VALIDATED' ? 1 : 0.6
			})
				.addTo(map)
				.bindPopup(message);
			const gangInMap: GangInMap = { gang, marker };
			gangsInMap.push(gangInMap);
		});

		showImHere = true;
	});

	function imHere() {
		showMyPosition(L, map, coordsMonte);
	}

	function filterGangs(event: Event) {
		const input = event.target as HTMLInputElement;
		const value = input.value.toLowerCase();

		gangsInMap.forEach((gangInMap) => {
			const { marker, gang } = gangInMap;
			const popup = marker.getPopup();
			if (!popup) return;

			const content = popup.getContent();
			const gangName = typeof content === 'string' ? content.toLowerCase() : '';

			if (gangName.includes(value)) {
				// Añadir el marker al mapa si no está ya
				if (!map.hasLayer(marker)) {
					marker.addTo(map);
				}
				marker.openPopup();
			} else {
				// Remover el marker del mapa
				map.removeLayer(marker);
			}
		});
		if (value === '') map.closePopup();
	}
</script>

<div class="hero">
	<div class="hero-content p-0 text-center">
		<div class="max-w-md">
			<label class="input-bordered input flex items-center">
				<input type="text" class="grow" placeholder="Filtrar por peña:" oninput={filterGangs} />
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					fill="currentColor"
					class="h-4 w-4 opacity-70"
				>
					<path
						fill-rule="evenodd"
						d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
						clip-rule="evenodd"
					/>
				</svg>
			</label>
		</div>
	</div>
</div>

<div id="map" class="z-0"></div>

{#if showImHere}
	<button
		id="imhere"
		onclick={imHere}
		class="btn absolute right-3 bottom-25 btn-active btn-circle btn-primary lg:bottom-10"
		><Locate /></button
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
