<script lang="ts">
	import { onMount } from 'svelte';
	import { showMyPosition } from '$lib/utils/show-my-position';
	import { coordsMonte } from '$lib/utils/coords-monte';
	import { Icon } from 'svelte-icons-pack';
	import { BiCurrentLocation } from 'svelte-icons-pack/bi';
	import { Routes } from '$lib/routes';
	import wellcome from '$lib/stores/wellcome';
	import { defaultValue as firstTime } from '$lib/stores/wellcome';
	import { isEqual } from 'lodash-es';

	import type { PageData } from './$types';
	import type { Map, Marker } from 'leaflet';
	import type { Gang } from '@prisma/client';

	interface GangInMap {
		gang: Gang;
		marker: Marker;
	}

	export let data: PageData;
	let L: any;
	let map: Map;
	let showImHere = false;
	let gangsInMap: GangInMap[] = [];

	onMount(async () => {
		if (isEqual($wellcome, firstTime)) {
			document.getElementById('wellcomeModal').showModal();
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
			const gangName = marker.getPopup().getContent().toLowerCase();
			if (gangName.includes(value)) {
				if (gang.status == 'VALIDATED') {
					marker.setOpacity(1);
				} else {
					marker.setOpacity(0.6);
				}
			} else {
				marker.setOpacity(0);
			}
		});
	}
</script>

<div class="hero">
	<div class="hero-content text-center p-0">
		<div class="max-w-md">
			<label class="input input-bordered flex items-center">
				<input type="text" class="grow" placeholder="Filtrar por peña:" on:change={filterGangs} />
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
		on:click={imHere}
		class="btn btn-circle absolute bottom-16 md:bottom-3 right-3 btn-active btn-primary"
		><Icon src={BiCurrentLocation} /></button
	>
{/if}

<dialog id="wellcomeModal" class="modal">
	<div class="modal-box">
		<h3 class="text-lg font-bold">Hola</h3>
		<p class="py-4">Bienvenido/a a Peñas de Montemayor de Pililla.</p>
		<p class="py-4">Un mapa con las peñas del pueblo. En esta app podrás:</p>
		<ol class="list-decimal ml-4">
			<li>Añadir peñas</li>
			<li>Registrarte en tu peña</li>
			<li>Validar a otras personas como pertenecientes a tu peña</li>
		</ol>
		<div class="modal-action flex flex-wrap justify-center">
			<button class="btn btn-success p-1 m-1">
				<a href={Routes.wellcome.url}>Empezar a usar la aplicación</a>
			</button>
			<form method="dialog">
				<!-- if there is a button in form, it will close the modal -->
				<button class="btn btn-warning p-1 m-1">Ver mapa</button>
			</form>
		</div>
	</div>
</dialog>

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
