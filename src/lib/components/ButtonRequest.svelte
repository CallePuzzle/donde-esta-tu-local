<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';

	import type { Snippet } from 'svelte';

	export type Props = {
		url: string;
		buttonText: Snippet;
		buttonClass?: string;
		onSuccess?: () => void | Promise<void>;
	};

	let { url, buttonText, buttonClass = 'btn w-fit btn-accent', onSuccess }: Props = $props();

	let loading = $state(false);
	let message = $state('');
	let messageClass = $state('');

	async function request() {
		loading = true;
		message = '';
		try {
			const response = await fetch(url);
			const data = await response.json();
			console.log(data);
			if (response.ok) {
				message = data.message;
				messageClass = 'alert-success';
				// Call onSuccess callback if provided
				if (onSuccess) {
					await onSuccess();
				}
			} else {
				message = data.message || m.form_gang_add_error();
				messageClass = response.status === 404 ? 'alert-warning' : 'alert-error';
			}
		} catch (error) {
			console.error('Error adding member:', error);
			messageClass = 'alert-error';
		} finally {
			loading = false;
		}
	}
</script>

<div class="mx-auto flex flex-col justify-center">
	{#if loading}
		<span class="loading loading-lg loading-dots"></span>
	{:else if message}
		<div class="alert {messageClass} text-sm">
			{message}
		</div>
	{:else}
		<button class={buttonClass} onclick={request}>
			{@render buttonText()}
		</button>
	{/if}
</div>
