<script lang="ts">
	import { currentNotification } from '$lib/stores/validationCurrentNotification';
	import ValidateGangModalBox from './ValidateGangModalBox.svelte';
	import ValidateMemberModalBox from './ValidateMemberModalBox.svelte';

	import type { Map } from 'leaflet';

	export let modal: HTMLElement;
	export let userId: number;
	export let L: any;
	export let map: Map;

	$: (L = L), (map = map);
</script>

<dialog id="validate_modal" class="modal" bind:this={modal}>
	<ValidateGangModalBox bind:L bind:map {userId} />
	{#if $currentNotification.type === 'gang-member-request'}
		<ValidateMemberModalBox {userId} />
	{/if}
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>
