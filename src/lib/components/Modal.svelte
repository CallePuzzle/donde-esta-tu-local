<script lang="ts">
	import { Modal as LibModal, defaultModalStrings } from '@callepuzzle/svelte-ui';
	import type { ComponentProps } from 'svelte';
	import { m } from '$lib/paraglide/messages.js';

	// Misma API que el Modal local que sustituye: los puntos de uso del código
	// (title, type, showButton, boxClass, bind:this → showModal()/close()) no cambian.
	export type Props = Omit<ComponentProps<typeof LibModal>, 'strings'>;

	let { children, ...rest }: Props = $props();

	let modal = $state<ReturnType<typeof LibModal> | null>(null);

	export function showModal() {
		modal?.showModal();
	}

	export function close() {
		modal?.close();
	}
</script>

<LibModal bind:this={modal} strings={{ ...defaultModalStrings, close: m.common_close() }} {...rest}>
	{@render children()}
</LibModal>
