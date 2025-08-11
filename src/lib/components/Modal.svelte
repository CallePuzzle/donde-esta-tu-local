<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import { m } from '../paraglide/messages.js';

	export type Props = {
		type?: 'button' | 'X' | 'outside';
		title: string;
		children: Snippet;
	};

	let { type = 'outside', title, children }: Props = $props();
	let modal: HTMLDialogElement;

	const uid = $props.id();

	function showModal() {
		modal.showModal();
	}

	onMount(() => {
		modal = document.getElementById('modal-' + uid) as HTMLDialogElement;
	});

	export function close() {
		modal.close();
	}
</script>

<button class="btn" onclick={showModal}>{title}</button>
<dialog id="modal-{uid}" class="modal">
	<div class="modal-box">
		{#if type == 'X'}
			<form method="dialog">
				<button class="btn btn-sm btn-circle btn-ghost absolute top-2 right-2">✕</button>
			</form>
		{/if}

		{@render children()}

		{#if type == 'button'}
			<div class="modal-action">
				<form method="dialog">
					<!-- if there is a button in form, it will close the modal -->
					<button class="btn">{m.common_close()}</button>
				</form>
			</div>
		{/if}
	</div>
	{#if type == 'outside'}
		<form method="dialog" class="modal-backdrop">
			<button>{m.common_close()}</button>
		</form>
	{/if}
</dialog>
