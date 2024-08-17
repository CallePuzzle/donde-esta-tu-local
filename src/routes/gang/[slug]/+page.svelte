<script lang="ts">
	import { onMount } from 'svelte';
	import { coordsMonte } from '$lib/utils/coords-monte';

	import type { PageData } from './$types';
	import type { Gang } from '@prisma/client';

	export let data: PageData;

	export let gang: Gang = data.gang;

	onMount(async () => {
		const L = (await import('leaflet')).default;
		const map = L.map('map').setView(coordsMonte, 17);
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);

		map.panTo([gang.latitude, gang.longitude]);
		L.marker([gang.latitude, gang.longitude]).addTo(map).bindPopup(gang.name);
	});
</script>

<div class="hero">
	<div class="hero-content text-center">
		<div class="max-w-md">
			<h1 class="text-5xl font-bold">
				Peña {gang.name}
			</h1>
		</div>
	</div>
</div>

<div id="map" class="z-0"></div>

<div class="container mx-auto">
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<div class="p-4 bg-white rounded-lg shadow">
			<h2 class="text-2xl font-bold">Actividades</h2>
			<p>TODO</p>
		</div>
		<div class="p-4 bg-white rounded-lg shadow">
			<h2 class="text-2xl font-bold">Miembros</h2>
			<ul>
				{#each gang.members as member}
					<li class="my-2 flex items-center">
						<div class="avatar">
							<div class="w-10 rounded-full">
								<img alt="Profile image" src={member.picture} />
							</div>
						</div>
						<div class="ml-2">{member.name}</div>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</div>

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
