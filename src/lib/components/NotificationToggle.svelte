<script lang="ts">
	import { onMount } from 'svelte';
	import { m } from '$lib/paraglide/messages';
	import { logger } from '$lib/logger';
	import {
		isPushSupported,
		getExistingSubscription,
		subscribeToPush,
		unsubscribeFromPush,
		sendSubscriptionToServer,
		deleteSubscriptionFromServer
	} from '$lib/utils/push-notifications';

	export type Props = {
		vapidPublicKey: string;
	};

	let { vapidPublicKey }: Props = $props();

	let supported = $state(false);
	let enabled = $state(false);
	let loading = $state(false);
	let errorMessage = $state('');

	onMount(async () => {
		supported = isPushSupported();
		if (!supported) return;
		try {
			const existing = await getExistingSubscription();
			enabled = !!existing;
		} catch (error) {
			logger.error(error, 'Error comprobando suscripción push existente');
		}
	});

	async function handleToggle() {
		if (loading) return;
		loading = true;
		errorMessage = '';

		try {
			if (enabled) {
				const permission = await Notification.requestPermission();
				if (permission !== 'granted') {
					enabled = false;
					errorMessage = m.push_notifications_permission_denied();
					return;
				}
				const subscription = await subscribeToPush(vapidPublicKey);
				await sendSubscriptionToServer(subscription);
			} else {
				const existing = await getExistingSubscription();
				if (existing) {
					await deleteSubscriptionFromServer(existing.endpoint);
					await unsubscribeFromPush();
				}
			}
		} catch (error) {
			logger.error(error, 'Error cambiando suscripción push');
			enabled = !enabled;
			errorMessage = enabled
				? m.push_notifications_subscribe_error()
				: m.push_notifications_unsubscribe_error();
		} finally {
			loading = false;
		}
	}
</script>

{#if supported}
	<div class="rounded-lg bg-base-200 p-4">
		<h2 class="mb-2 text-lg font-semibold">{m.push_notifications_title()}</h2>
		<p class="mb-4 text-sm text-base-content/70">
			{m.push_notifications_description()}
		</p>

		<label class="flex cursor-pointer items-center justify-between">
			<span class="font-medium">
				{enabled ? m.push_notifications_disable() : m.push_notifications_enable()}
			</span>
			<input
				type="checkbox"
				class="toggle toggle-primary"
				bind:checked={enabled}
				onchange={handleToggle}
				disabled={loading}
			/>
		</label>

		{#if loading}
			<div class="mt-3">
				<span class="loading loading-sm loading-spinner"></span>
			</div>
		{/if}

		{#if errorMessage}
			<div class="mt-3 alert text-sm alert-warning">
				{errorMessage}
			</div>
		{/if}
	</div>
{/if}
