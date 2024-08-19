<script lang="ts">
	import { onMount } from 'svelte';
	import { coordsMonte } from '$lib/utils/coords-monte';
	import ValidateButton from '$lib/components/notification/ValidateButton.svelte';
	import ValidateModal from '$lib/components/notification/ValidateModal.svelte';

	import type { Map } from 'leaflet';
	import type { PageData } from './$types';

	export let data: PageData;

	let modal: HTMLElement;
	let L: any;
	let map: Map;

	$: modal = modal;
</script>

<div class="flex flex-col">
	<div class="hero">
		<div class="hero-content text-center">
			<div class="max-w-md">
				<h1 class="text-5xl font-bold">
					Hola {#if data.user.name}{data.user.name}{/if}
				</h1>
				<p class="py-6">
					Tienes {data.notificationsCount} notificaciones pendientes
				</p>
			</div>
		</div>
	</div>
	<div class="container mx-auto px-4">
		<ul>
			{#each data.notifications as notification}
				<li>
					<ValidateButton {notification} {modal} />
				</li>
			{/each}
		</ul>
	</div>
</div>

<ValidateModal bind:modal userId={data.user.id} />

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
