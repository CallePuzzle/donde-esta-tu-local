<script lang="ts">
	import { onMount } from 'svelte';
	import { coordsMonte } from '$lib/utils/coords-monte';
	import { showMyPosition } from '$lib/utils/show-my-position';

	import type { PageData, ActionData } from './$types';
	import type { Gang } from '@prisma/client';
	import { Routes } from '$lib/routes';

	interface LatLng {
		lat: number;
		lng: number;
	}

	export let data: PageData;
	export let form: ActionData;
	export let gang: Gang = data.gang;
	let latlng = {} as LatLng;

	$: latlng = latlng;

	onMount(async () => {
		const L = (await import('leaflet')).default;
		const map = L.map('map').setView(coordsMonte, 17);
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);

		map.panTo([gang.latitude, gang.longitude]);
		L.marker([gang.latitude, gang.longitude]).addTo(map).bindPopup(gang.name);

		showMyPosition(L, map, coordsMonte, false);

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
					'<button class="btn btn-ghost" onclick="change_gang.showModal()">Cambiar la ubicación de la peña a esta localización</button>'
				)
				.openOn(map);
		}
	});
</script>

{#if !form?.success}
	<div class="hero">
		<div class="hero-content text-center">
			<div class="max-w-md flex">
				<form method="POST" action="?/changeName" class="container">
					<div class="form-control">
						<h1 class="text-5xl font-bold">
							<label>
								<input type="text" name="name" value={gang.name} />
							</label>
						</h1>
					</div>
					<button type="submit" class="btn btn-accent">Actualizar</button>
				</form>
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
{/if}
{#if form?.success}
	<div role="alert" class="alert alert-success">
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
		<span>{form?.message}</span>
		<a href={Routes.gang.generateUrl({ id: gang.id })} class="btn">Volver</a>
	</div>
{/if}

{#if !form?.success}
	<dialog id="change_gang" class="modal">
		<div class="modal-box">
			<h3 class="text-lg font-bold">Cambiar ubicación</h3>

			<div class="container pt-6">
				<form method="POST" action="?/changeCoords" class="flex flex-col">
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
					<button type="submit" class="btn btn-accent m-6">Cambiar</button>
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
{/if}

<link
	rel="stylesheet"
	href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
	integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
	crossorigin=""
/>

<style>
	#map {
		height: 30vh;
	}
</style>
