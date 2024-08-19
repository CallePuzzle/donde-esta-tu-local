<script lang="ts">
	import { currentNotification } from '$lib/stores/validationCurrentNotification';
	import { Routes } from '$lib/routes';
	import { onMount } from 'svelte';
	import { coordsMonte } from '$lib/utils/coords-monte';

	import type { Map } from 'leaflet';

	export let modal: HTMLElement;
	export let userId: number;
	export let L: any;
	export let map: Map;

	onMount(async () => {
		L = (await import('leaflet')).default;
		map = L.map('map').setView(coordsMonte, 17);
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);
	});
</script>

<dialog id="validate_modal" class="modal" bind:this={modal}>
	<div class="modal-box">
		<h3 class="text-lg font-bold py-4">Validar peña {$currentNotification.detail?.gang.name}</h3>
		<div id="map" class="z-0"></div>
		<p class="pt-4">
			{$currentNotification?.detail?.addedBy?.name} ha añadido una peña nueva:
			<span class="">{$currentNotification?.detail?.gang.name}</span>
		</p>
		{#if $currentNotification.status === 'PENDING'}
			<div class="flex items-stretch">
				<form method="POST" action="{Routes.add_gang.url}?/validate" class="grow m-3">
					<label
						><input
							type="hidden"
							class="input w-full max-w-xs"
							name="userId"
							value={userId}
						/></label
					>
					<label
						><input
							type="hidden"
							class="input w-full max-w-xs"
							name="notificationId"
							value={$currentNotification.id}
						/></label
					>
					<label
						><input
							type="hidden"
							class="input w-full max-w-xs"
							name="gangId"
							value={$currentNotification.detail?.gang.id}
						/></label
					>
					<button type="submit" class="btn btn-accent w-full">Validar</button>
				</form>
				<form method="POST" action="{Routes.add_gang.url}?/refuse" class="grow m-3">
					<label
						><input
							type="hidden"
							class="input w-full max-w-xs"
							name="userId"
							value={userId}
						/></label
					>
					<label
						><input
							type="hidden"
							class="input w-full max-w-xs"
							name="notificationId"
							value={$currentNotification.id}
						/></label
					>
					<label
						><input
							type="hidden"
							class="input w-full max-w-xs"
							name="gangId"
							value={$currentNotification.detail?.gang.id}
						/></label
					>
					<button type="submit" class="btn btn-error w-full">Rechazar</button>
				</form>
			</div>
		{/if}
	</div>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>

<link
	rel="stylesheet"
	href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
	integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
	crossorigin=""
/>

<style>
	#map {
		height: 40vh;
	}
</style>
