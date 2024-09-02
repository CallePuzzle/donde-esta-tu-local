<script lang="ts">
	import { currentNotification } from '$lib/stores/validationCurrentNotification';

	import type { NotificationDetail } from '$lib/utils/notification/get-user-notifications-type';
	import type { Gang } from '@prisma/client';
	import type { Map } from 'leaflet';

	export let notification: NotificationDetail;
	export let modal: HTMLElement;
	export let L: any;
	export let map: Map;

	let menssage = '';

	if (notification.type === 'gang-added') {
		menssage = `${notification.detail?.addedBy?.name} ha añadido una peña nueva:`;
	}
	if (notification.type === 'gang-member-request') {
		menssage = `${notification.detail?.user.name} quiere unirse a la peña:`;
	}

	function showModal(notification: NotificationDetail): null {
		currentNotification.update(() => notification);
		if (notification.type === 'gang-added') {
			panToGang(notification);
		}
		modal.showModal();
		return null;
	}

	function panToGang(notification: NotificationDetail) {
		const gang = notification.detail?.gang as Gang;
		map.panTo([gang.latitude, gang.longitude]);
		L.marker([gang.latitude, gang.longitude]).addTo(map).bindPopup(gang.name);
	}
</script>

<span>{menssage} </span><span class="underline decoration-sky-500 font-bold"
	>{notification.detail?.gang.name}</span
>
{#if notification.status === 'PENDING'}
	<button class="btn btn-accent m-6" on:click={showModal(notification)}>Validar</button>
{:else if notification.status === 'VALIDATED'}
	<span class="m-3 text-green-500">Validada por {notification.detail?.reviewedBy?.name}</span>
	<button class="btn btn-accent m-6" on:click={showModal(notification)}>Ver detalles</button>
{:else if notification.status === 'REFUSED'}
	<span class="m-3 text-red-500">Rechazada por {notification.detail?.reviewedBy?.name}</span>
	<button class="btn btn-accent m-6" on:click={showModal(notification)}>Ver detalles</button>
{/if}
