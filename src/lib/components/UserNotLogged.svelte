<script lang="ts">
	import { onMount } from 'svelte';
	import { UserNotLogged as LibUserNotLogged } from '@callepuzzle/svelte-ui';
	import type { ComponentProps } from 'svelte';
	import { loginModalStore } from '$lib/stores/loginModal.svelte';

	export type Props = ComponentProps<typeof LibUserNotLogged>;

	let { text, ...rest }: Props = $props();

	// La librería no auto-abre nada por su cuenta: se conserva el auto-open con
	// retardo que tenía esta app (la referencia del modal la alimenta NavBarEnd).
	onMount(async () => {
		await new Promise((resolve) => setTimeout(resolve, 2000));
		loginModalStore.value?.showModal();
	});
</script>

<LibUserNotLogged {text} {...rest} />
