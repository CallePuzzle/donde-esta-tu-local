<script lang="ts">
	import ValidateButton from '$lib/components/notification/ValidateButton.svelte';
	import ValidateModal from '$lib/components/notification/ValidateModal.svelte';

	import type { Map } from 'leaflet';
	import type { PageData } from './$types';

	export let data: PageData;

	let modal: HTMLElement;
	let L: any;
	let map: Map;

	$: (modal = modal), (L = L), (map = map);
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
					<ValidateButton {notification} {modal} bind:L bind:map />
				</li>
			{/each}
		</ul>
	</div>
</div>

<ValidateModal bind:modal bind:L bind:map userId={data.user.id} />
