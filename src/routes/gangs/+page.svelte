<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	export let form: ActionData;

	import type { ActionData } from './$types';

	interface LatLng {
		lat: number;
		lng: number;
	}

	export let latlng = {} as LatLng;

	onMount(async () => {
		if (form?.success) return;
		document.getElementById('add_gang_info').showModal();

		const L = (await import('leaflet')).default;
		const map = L.map('map').setView([41.50878286958457, -4.458162378583092], 17);
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);

		map.on('click', addGang);

		function addGang(e) {
			latlng = {
				lat: e.latlng.lat,
				lng: e.latlng.lng
			};
			console.log(latlng);
			L.popup()
				.setLatLng(e.latlng)
				.setContent(
					'<button class="btn btn-ghost" onclick="add_gang.showModal()">Añadir peña en esta localización</button>'
				)
				.openOn(map);
		}
	});

	function loadSucess(node) {
		// wait 10 seconds and redirect to home
		setTimeout(() => {
			goto('/');
		}, 5000);
		return {
			destroy() {
				// the node has been removed from the DOM
			}
		};
	}
</script>

{#if !form?.success}
	<div id="map" class="z-0"></div>

	<link
		rel="stylesheet"
		href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
		integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
		crossorigin=""
	/>
{/if}
{#if form?.success}
	<div role="alert" class="alert alert-success" use:loadSucess>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-6 w-6 shrink-0 stroke-current"
			fill="none"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		</svg>
		<span>Peña añadida, a la espera de revisión por un administrador</span>
	</div>
{/if}

<dialog id="add_gang" class="modal">
	<div class="modal-box">
		<h3 class="text-lg font-bold">Añadir peña</h3>

		<div class="container pt-6">
			<form method="POST" action="?/new">
				<label
					><input
						type="hidden"
						placeholder="Lat"
						class="input w-full max-w-xs"
						name="lat"
						value={latlng.lat}
					/></label
				>
				<label
					><input
						type="hidden"
						placeholder="Lng"
						class="input w-full max-w-xs"
						name="lng"
						value={latlng.lng}
					/></label
				>
				<label
					><input
						type="text"
						placeholder="Nombre"
						class="input w-full max-w-xs"
						name="name"
					/></label
				>
				<button type="submit" class="btn btn-accent m-6">Añadir</button>
			</form>
		</div>
		<div class="modal-action m-0">
			<form method="dialog">
				<!-- if there is a button in form, it will close the modal -->
				<button class="btn">Close</button>
			</form>
		</div>
	</div>
</dialog>

<dialog id="add_gang_info" class="modal">
	<div class="modal-box max-w-md flex justify-center">
		<p class="py-4">Haz click en la ubicación de la peña para añadirla</p>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>

<style>
	#map {
		height: 80vh;
	}
</style>
