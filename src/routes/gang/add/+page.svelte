<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { showMyPosition } from '$lib/utils/show-my-position';
	import { coordsMonte } from '$lib/utils/coords-monte';
	import { Routes } from '$lib/routes';

	import type { ActionData } from './$types';
	import type { Gang } from '@prisma/client';

	interface LatLng {
		lat: number;
		lng: number;
	}

	export let form: ActionData;
	export let latlng = {} as LatLng;
	let sending = false;
	let confirm = false;
	let duplicateGangs: Gang[] = [];

	onMount(async () => {
		if (form?.success) return;
		document.getElementById('add_gang_info')?.showModal();

		const L = (await import('leaflet')).default;
		const map = L.map('map').setView(coordsMonte, 17);
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);

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
					'<button class="btn btn-ghost" onclick="add_gang.showModal()">Añadir peña en esta localización</button>'
				)
				.openOn(map);
		}
	});

	function loadSucess(node) {
		// wait 10 seconds and redirect to home
		setTimeout(() => {
			goto('/');
		}, 3000);
		return {
			destroy() {
				// the node has been removed from the DOM
			}
		};
	}
	async function handleSubmit({
		submitter,
		formData,
		cancel
	}: {
		formData: FormData;
		submitter: HTMLButtonElement;
		cancel: () => void;
	}) {
		sending = true;
		if (submitter.innerText === 'Añadir') {
			const name = formData.get('name');
			// Call to Route.check_new_gang service to check if the gang already exists
			const response = await fetch(`${Routes.check_new_gang.url}?name=${name}`);
			const data = await response.json();
			if (data.length > 0) {
				duplicateGangs = data;
				sending = false;
				confirm = true;
				cancel();
			}
		}
		return ({ update }: { update: (options?: { invalidateAll?: boolean }) => Promise<void> }) => {
			// Set invalidateAll to false if you don't want to reload page data when submitting
			update({ invalidateAll: true }).finally(async () => {
				sending = false;
			});
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
		<span>{form?.message}</span>
	</div>
{/if}

{#if !form?.success}
	<dialog id="add_gang" class="modal">
		<div class="modal-box">
			<h3 class="text-lg font-bold">Añadir peña</h3>

			<div class="container pt-6">
				<form method="POST" action="?/new" class="flex flex-col" use:enhance={handleSubmit}>
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
					<label class="m-2"
						><input
							type="text"
							placeholder="Nombre"
							class="input w-full max-w-xs"
							required
							name="name"
						/></label
					>
					<label class="m-2 flex items-center"
						><span>Es mi peña: </span><input
							type="checkbox"
							class="toggle toggle-success ml-2"
							name="ismygang"
						/></label
					>
					{#if sending}
						<span class="loading loading-dots loading-lg"></span>
					{:else if confirm}
						<div class="alert alert-warning m-1 flex flex-col">
							<p>Parece que ya existe una o varias peñas con un nombre parecido:</p>
							<ul>
								{#each duplicateGangs as gang}
									<li><a href={Routes.gang.generateUrl({ id: gang.id })}>{gang.name}</a></li>
								{/each}
							</ul>
						</div>
						<p class="alert alert-warning m-1">¿Quieres añadir esta peña de todas formas?</p>
						<button type="submit" class="btn btn-accent m-3">Confirmar</button>
						<button type="reset" class="btn btn-error m-3"
							><a href={Routes.add_gang.url} data-sveltekit-reload>Cancelar</a></button
						>
					{:else}
						<button type="submit" class="btn btn-accent m-6">Añadir</button>
					{/if}
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
