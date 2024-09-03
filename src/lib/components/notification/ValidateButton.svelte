<script lang="ts">
	import { currentNotification, markersInMap } from '$lib/stores/validationCurrentNotification';

	import type { Gang, Notification, User } from '@prisma/client';
	import type { Map } from 'leaflet';

	interface NotificationDetail extends Notification {
		relatedGang: Gang;
		addedBy: User;
		reviewedBy: User;
	}

	export let notification: NotificationDetail;
	export let modal: HTMLElement;
	export let L: any;
	export let map: Map;

	let menssage = '';

	if (notification.type === 'gang-added') {
		menssage = `${notification.addedBy.name} ha añadido una peña nueva:`;
	}
	if (notification.type === 'gang-member-request') {
		menssage = `${notification.addedBy.name} quiere unirse a la peña:`;
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

<span>{menssage} </span><span class="underline decoration-sky-500 font-bold"
	>{notification.relatedGang.name}</span
>
{#if notification.status === 'PENDING'}
	<button class="btn btn-accent m-6" on:click={showModal(notification)}>Validar</button>
{:else if notification.status === 'VALIDATED'}
	<span class="m-3 text-green-500">Validada por {notification.reviewedBy?.name}</span>
	<button class="btn btn-accent m-6" on:click={showModal(notification)}>Ver detalles</button>
{:else if notification.status === 'REFUSED'}
	<span class="m-3 text-red-500">Rechazada por {notification.reviewedBy?.name}</span>
	<button class="btn btn-accent m-6" on:click={showModal(notification)}>Ver detalles</button>
{/if}
