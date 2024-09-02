<script lang="ts">
	import { currentNotification } from '$lib/stores/validationCurrentNotification';
	import { onMount } from 'svelte';
	import { coordsMonte } from '$lib/utils/coords-monte';
	import ValidateForm from './ValidateForm.svelte';

	import type { Map } from 'leaflet';

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

<div class="modal-box {$currentNotification.type === 'gang-added' ? 'visible' : 'invisible'}">
	<h3 class="text-lg font-bold py-4">Validar peña {$currentNotification.detail?.gang.name}</h3>
	<div id="map" class="z-0"></div>
	<p class="pt-4">
		{$currentNotification?.detail?.addedBy?.name} ha añadido una peña nueva:
		<span class="">{$currentNotification?.detail?.gang.name}</span>
	</p>
	{#if $currentNotification.status === 'PENDING'}
		<div class="flex items-stretch">
			<ValidateForm {userId} type="validateGang" />
			<ValidateForm {userId} type="refuseGang" buttonType="btn-error" buttonMessage="Rechazar" />
		</div>
	{/if}
</div>

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
