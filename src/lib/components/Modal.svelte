<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import { m } from '../paraglide/messages.js';

	export type Props = {
		type?: 'button' | 'X' | 'outside';
		showButton?: boolean;
		title: string;
		children: Snippet;
	};

	let { type = 'outside', showButton = true, title, children }: Props = $props();
	let modal: HTMLDialogElement;

	const uid = $props.id();

	export function showModal() {
		modal.showModal();
	}

	onMount(() => {
		modal = document.getElementById('modal-' + uid) as HTMLDialogElement;
	});

	export function close() {
		modal.close();
	}
</script>

{#if showButton}
	<button class="btn" onclick={showModal}>{title}</button>
{/if}
<dialog id="modal-{uid}" class="modal">
	<div class="modal-box">
		{#if type == 'X'}
			<form method="dialog">
				<button class="btn absolute top-2 right-2 btn-circle btn-ghost btn-sm">✕</button>
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
