<script lang="ts">
	import { onDestroy } from 'svelte';
	import { showMyPosition } from '$lib/utils/show-my-position';
	import { coordsMonte } from '$lib/utils/coords-monte';
	import GangMap from '$lib/components/gangs/GangMap.svelte';
	import Locate from '@lucide/svelte/icons/locate';
	import { m } from '$lib/paraglide/messages.js';

	import type { PageData } from './$types';
	import type { Map, Marker } from 'leaflet';
	import type { Gang } from '$lib/generated/prisma/client';
	import type { Leaflet } from '$lib/utils/types';

	interface GangInMap {
		gang: Gang;
		marker: Marker;
	}

	let { data }: { data: PageData } = $props();
	let L: Leaflet;
	let map: Map;
	let showImHere = $state(false);
	let gangsInMap: GangInMap[] = [];

	function handleMapReady(context: { L: Leaflet; map: Map }) {
		({ L, map } = context);

		for (const gang of data.gangs) {
			// Construir el popup con elementos DOM (textContent) para evitar XSS
			const popupContent = document.createElement('div');
			const link = document.createElement('a');
			link.href = '/gang/' + gang.id;
			link.textContent = gang.name;
			popupContent.appendChild(link);
			if (gang.status !== 'VALIDATED') {
				const suffix = document.createElement('span');
				suffix.textContent = m.home_gang_unvalidated_suffix();
				popupContent.appendChild(suffix);
			}

			const marker = L.marker([gang.latitude, gang.longitude], {
				opacity: gang.status == 'VALIDATED' ? 1 : 0.6
			})
				.addTo(map)
				.bindPopup(popupContent);
			const gangInMap: GangInMap = { gang, marker };
			gangsInMap.push(gangInMap);
		}

		showImHere = true;
	}

	let stopWatchingPosition: (() => void) | undefined;

	function imHere() {
		stopWatchingPosition?.();
		stopWatchingPosition = showMyPosition(L, map, coordsMonte);
	}

	onDestroy(() => stopWatchingPosition?.());

	const FILTER_DEBOUNCE_MS = 200;
	let filterDebounceTimeout: ReturnType<typeof setTimeout> | undefined;

	function filterGangs(event: Event) {
		const input = event.target as HTMLInputElement;
		const value = input.value.toLowerCase();

		clearTimeout(filterDebounceTimeout);
		filterDebounceTimeout = setTimeout(() => {
			// El mapa puede no haber cargado aún si el usuario filtra antes de
			// que Leaflet termine de inicializarse
			if (!map) return;
			gangsInMap.forEach((gangInMap) => {
				const { marker, gang } = gangInMap;
				const gangName = gang.name.toLowerCase();

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
		}, FILTER_DEBOUNCE_MS);
	}
</script>

<div class="hero">
	<div class="hero-content p-0 text-center">
		<div class="max-w-md">
			<label class="input-bordered input flex items-center">
				<input
					type="text"
					class="grow"
					placeholder={m.home_filter_placeholder()}
					aria-label={m.home_filter_placeholder()}
					oninput={filterGangs}
				/>
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

<GangMap onReady={handleMapReady} />

{#if showImHere}
	<button
		type="button"
		id="imhere"
		onclick={imHere}
		class="btn absolute right-3 bottom-25 btn-active btn-circle btn-primary lg:bottom-10"
		><Locate /></button
	>
{/if}
