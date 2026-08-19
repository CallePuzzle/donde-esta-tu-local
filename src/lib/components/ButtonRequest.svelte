<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import { logger } from '$lib/logger';

	import type { Snippet } from 'svelte';

	export type Props = {
		endpoint: string;
		body: Record<string, string | number>;
		buttonText: Snippet;
		buttonClass?: string;
		onSuccess?: () => void | Promise<void>;
	};

	let {
		endpoint,
		body,
		buttonText,
		buttonClass = 'btn w-fit btn-accent',
		onSuccess
	}: Props = $props();

	let loading = $state(false);
	let message = $state('');
	let messageClass = $state('');

	async function request() {
		loading = true;
		message = '';
		try {
			const response = await fetch(endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			const data = await response.json();
			logger.debug(data, 'Respuesta de la petición');
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
			logger.error(error, 'Error adding member');
			message = m.request_new_member_error();
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
		{#if messageClass !== 'alert-success'}
			<button type="button" class="btn mt-1 btn-ghost btn-sm" onclick={request}>
				{m.common_retry()}
			</button>
		{/if}
	{:else}
		<button class={buttonClass} onclick={request}>
			{@render buttonText()}
		</button>
	{/if}
</div>
