<script lang="ts">
	import { onMount } from 'svelte';

	interface LatLng {
		lat: number;
		lng: number;
	}

	export let latlng = {} as LatLng;

	onMount(async () => {
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
</script>

<div id="map" class="z-0"></div>

<link
	rel="stylesheet"
	href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
	integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
	crossorigin=""
/>

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
				<button type="submit" class="btn btn-accent">Añadir</button>
			</form>
		</div>

		<div class="modal-action">
			<form method="dialog">
				<!-- if there is a button in form, it will close the modal -->
				<button class="btn">Close</button>
			</form>
		</div>
	</div>
</dialog>

<style>
	#map {
		height: 80vh;
	}
</style>
