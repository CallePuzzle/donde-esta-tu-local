<script lang="ts">
	import type { NotificationDetail } from '$lib/utils/notification/get-user-notifications-type';

	export let notification: NotificationDetail;
	export let modal: HTMLElement;
	$: currentNotification: null;

	let menssage = '';

	if (notification.type === 'gang-added') {
		menssage = `${notification.detail.addedBy?.name} ha añadido una peña nueva:`;
	}
	if (notification.type === 'gang-member-request') {
		menssage = `${notification.detail.user.name} quiere unirse a la peña:`;
	}

	function showModal(notification: NotificationDetail): null {
		currentNotification = notification;
		modal.showModal();
		return null;
	}
</script>

<span>{menssage} </span><span class="underline decoration-sky-500 font-bold"
	>{notification.detail.gang.name}</span
>
{#if notification.status === 'PENDING'}
	<button class="btn btn-accent m-6" on:click={showModal(notification)}>Validar</button>
{:else if notification.status === 'VALIDATED'}
	<span class="m-3 text-green-500">Validada por {notification.detail.reviewedBy?.name}</span>
	<button class="btn btn-accent m-6" on:click={showModal(notification)}>Ver detalles</button>
{:else if notification.status === 'REFUSED'}
	<span class="m-3 text-red-500">Rechazada por {notification.detail.reviewedBy?.name}</span>
	<button class="btn btn-accent m-6" on:click={showModal(notification)}>Ver detalles</button>
{/if}
