<script lang="ts">
	import { onMount } from 'svelte';
	import { m } from '$lib/paraglide/messages';
	import { logger } from '$lib/logger';
	import Modal from '$lib/components/Modal.svelte';
	import { MAX_PUSH_SUBSCRIPTIONS_PER_USER } from '$lib/push-subscription-limit';
	import {
		isPushSupported,
		isPushServiceUnavailableError,
		PushSubscriptionLimitError,
		getExistingSubscription,
		subscribeToPush,
		unsubscribeFromPush,
		sendSubscriptionToServer,
		deleteSubscriptionFromServer,
		deleteAllSubscriptionsFromServer
	} from '$lib/utils/push-notifications';

	export type Props = {
		vapidPublicKey: string;
		id?: string;
	};

	let { vapidPublicKey, id }: Props = $props();

	let supported = $state(false);
	let enabled = $state(false);
	let loading = $state(false);
	let errorMessage = $state('');

	let limitModal: Modal | undefined = $state();
	let deletingAllDevices = $state(false);
	let deleteAllDevicesMessage = $state('');

	onMount(async () => {
		supported = isPushSupported();
		if (!supported) return;
		try {
			const existing = await getExistingSubscription();
			enabled = !!existing;
			if (existing) {
				// savePushSubscription es un upsert idempotente: reenviar la
				// suscripción existente resincroniza el servidor si la fila se
				// hubiera perdido (410 desde otro dispositivo, reseteo de BD...),
				// sin lo cual el toggle mostraría "activado" sin que llegue nada.
				await sendSubscriptionToServer(existing);
			}
		} catch (error) {
			logger.error(error, 'Error comprobando suscripción push existente');
		}
	});

	async function handleToggle() {
		if (loading) return;
		loading = true;
		errorMessage = '';
		const targetEnabled = enabled;

		try {
			if (targetEnabled) {
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
			enabled = !targetEnabled;
			if (targetEnabled && error instanceof PushSubscriptionLimitError) {
				limitModal?.showModal();
			} else {
				logger.error(error, 'Error cambiando suscripción push');
				if (targetEnabled && isPushServiceUnavailableError(error)) {
					errorMessage = m.push_notifications_service_unavailable();
				} else {
					errorMessage = targetEnabled
						? m.push_notifications_subscribe_error()
						: m.push_notifications_unsubscribe_error();
				}
			}
		} finally {
			loading = false;
		}
	}

	async function handleDeleteAllDevices() {
		deletingAllDevices = true;
		deleteAllDevicesMessage = '';
		try {
			await deleteAllSubscriptionsFromServer();
			deleteAllDevicesMessage = m.push_notifications_delete_all_success();
		} catch (error) {
			logger.error(error, 'Error borrando dispositivos con avisos push activados');
			deleteAllDevicesMessage = m.push_notifications_delete_all_error();
		} finally {
			deletingAllDevices = false;
		}
	}
</script>

{#if supported}
	<div class="rounded-lg bg-base-200 p-4" {id}>
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

	<Modal
		title={m.push_notifications_limit_reached_title()}
		showButton={false}
		type="button"
		bind:this={limitModal}
	>
		<h3 class="text-lg font-bold">{m.push_notifications_limit_reached_title()}</h3>
		<p class="py-4">
			{m.push_notifications_limit_reached_description({ limit: MAX_PUSH_SUBSCRIPTIONS_PER_USER })}
		</p>
		<button
			type="button"
			class="btn btn-warning"
			onclick={handleDeleteAllDevices}
			disabled={deletingAllDevices}
		>
			{#if deletingAllDevices}
				<span class="loading loading-xs loading-spinner"></span>
			{/if}
			{m.push_notifications_delete_all_button()}
		</button>
		{#if deleteAllDevicesMessage}
			<p class="mt-2 text-sm">{deleteAllDevicesMessage}</p>
		{/if}
	</Modal>
{/if}
