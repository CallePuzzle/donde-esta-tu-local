<script lang="ts">
	import { currentNotification, markersInMap } from '$lib/stores/validationCurrentNotification';

	import type { NotificationDetail } from '$lib/utils/notification/notifications';
	import type { Gang } from '@prisma/client';
	import type { Map } from 'leaflet';

	export let notification: NotificationDetail;
	export let modal: HTMLElement;
	export let L: any;
	export let map: Map;

	$: notification = notification;

	function showModalGang(notification: NotificationDetail): null {
		currentNotification.update(() => notification);
		panToGang(notification);
		modal.showModal();
		return null;
	}

	function showModalMember(notification: NotificationDetail): null {
		currentNotification.update(() => notification);
		modal.showModal();
		return null;
	}

	function panToGang(notification: NotificationDetail) {
		resetMarks();
		const gang = notification.relatedGang as Gang;
		map.panTo([gang.latitude, gang.longitude]);
		const marker = L.marker([gang.latitude, gang.longitude]).addTo(map).bindPopup(gang.name);
		markersInMap.update((markers) => [...markers, marker]);
	}

	function resetMarks() {
		markersInMap.update((markers) => {
			markers.forEach((marker) => map.removeLayer(marker));
			return [];
		});
	}
</script>

{#if notification.type === 'gang-added'}
	<span>{notification.addedBy.name} ha añadido una peña nueva:</span>
	<span class="underline decoration-sky-500 font-bold">{notification.relatedGang.name}</span>
	{#if notification.status === 'PENDING'}
		<button class="btn btn-accent m-6" on:click={showModalGang(notification)}>Validar</button>
	{:else if notification.status === 'VALIDATED'}
		<span class="m-3 text-green-500">Validada por {notification.reviewedBy?.name}</span>
		<button class="btn btn-accent m-6" on:click={showModalGang(notification)}>Ver detalles</button>
	{:else if notification.status === 'REFUSED'}
		<span class="m-3 text-red-500">Rechazada por {notification.reviewedBy?.name}</span>
		<button class="btn btn-accent m-6" on:click={showModalGang(notification)}>Ver detalles</button>
	{/if}
{/if}

{#if notification.type === 'gang-member-request'}
	<span>{notification.addedBy.name} quiere unirse a la peña:</span>
	<span class="underline decoration-sky-500 font-bold">{notification.relatedGang.name}</span>
	{#if notification.status === 'PENDING'}
		<button class="btn btn-accent m-6" on:click={showModalMember(notification)}>Validar</button>
	{:else if notification.status === 'VALIDATED'}
		<span class="m-3 text-green-500">Validada por {notification.reviewedBy?.name}</span>
		<button class="btn btn-accent m-6" on:click={showModalMember(notification)}>Ver detalles</button
		>
	{:else if notification.status === 'REFUSED'}
		<span class="m-3 text-red-500">Rechazada por {notification.reviewedBy?.name}</span>
		<button class="btn btn-accent m-6" on:click={showModalMember(notification)}>Ver detalles</button
		>
	{/if}
{/if}
