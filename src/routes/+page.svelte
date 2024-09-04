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

	function goWellcome() {
		goto(Routes.wellcome.url);
	}

	function noWellcome() {
		wellcome.update((value) => {
			return {
				...value,
				wellcome: true
			};
		});
		document.getElementById('wellcomeModal').close();
	}
</script>

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
			<li>Registrarte como miembro de tu peña</li>
		</ol>
		<div class="modal-action flex flex-wrap justify-center">
			<button class="btn btn-success p-1 m-1" on:click={goWellcome}>
				Empezar a usar la aplicación
			</button>
			<form method="dialog">
				<!-- if there is a button in form, it will close the modal -->
				<button class="btn btn-warning p-1 m-1" on:click={noWellcome}>Ver mapa</button>
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
