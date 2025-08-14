<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { coordsMonte } from '$lib/utils/coords-monte';
	import Share2 from '@lucide/svelte/icons/share-2';

	import type { PageData } from './$types';
	import type { Gang, User } from '@prisma/client';

	let { data }: { data: PageData } = $props();

	let gang: Gang = data.gang;

	type Member = Pick<User, 'id' | 'name' | 'image'>;

	let members: Member[] = data.members;

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

	let webShareAPISupported = $state(browser && typeof navigator.share !== 'undefined');

	const handleWebShare = async () => {
		try {
			navigator.share({
				title: `Peña: ${gang.name}`,
				text: `Hola, te comparto esta peña: ${gang.name}`,
				url: data.appUrl + `/gang/${gang.id}`
			});
		} catch (error) {
			console.error('Error sharing:', error);
			webShareAPISupported = false;
		}
	};
</script>

<div class="hero">
	<div class="hero-content text-center">
		<div class="flex max-w-md">
			<h1 class="text-5xl font-bold">
				Peña {gang.name}
			</h1>
			{#if webShareAPISupported}
				<button onclick={handleWebShare} class="ml-4"
					><Share2 size="1.2rem" color="#ee3616" /></button
				>
			{/if}
		</div>
	</div>
</div>

<div id="map" class="z-0"></div>

<div class="container mx-auto my-2">
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<div class="rounded-lg bg-white p-4 shadow">
			<h2 class="text-2xl font-bold">Miembros</h2>
			<ul>
				{#each members as member (member.id)}
					<li class="my-2 flex items-center">
						<div class="avatar">
							<div class="w-10 rounded-full">
								<img alt="Profile image" src={member.image} />
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
