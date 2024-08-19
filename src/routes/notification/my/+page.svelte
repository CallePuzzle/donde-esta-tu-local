<script lang="ts">
	import ValidateButton from '$lib/components/notification/ValidateButton.svelte';
	import ValidateModal from '$lib/components/notification/ValidateModal.svelte';

	import type { Map } from 'leaflet';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let modal: HTMLElement;
	let L: any;
	let map: Map;
	let showSucess: boolean;

	$: (modal = modal), (L = L), (map = map), (showSucess = form?.success || false);

	function loadSucess(node) {
		// wait 10 seconds and redirect to home
		setTimeout(() => {
			showSucess = false;
		}, 3000);
	}
</script>

{#if showSucess }
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
