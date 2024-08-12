<script lang="ts">
	import { onMount } from 'svelte';
	import { coordsMonte } from '$lib/utils/coords-monte';
	import { Routes } from '$lib/routes';

	import type { Map } from 'leaflet';
	import type { PageData } from './$types';
	import type { Gang, Notification } from '@prisma/client';

	export let data: PageData;

	let currentNotification: Notification;
	let L: any;
	let map: Map;

	onMount(async () => {
		L = (await import('leaflet')).default;
		map = L.map('map').setView(coordsMonte, 17);
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);
	});

	function showModal(notification: Notification): undefined {
		currentNotification = notification;
		const gang: Gang = currentNotification.data?.gang;

		map.panTo([gang.latitude, gang.longitude]);
		L.marker([gang.latitude, gang.longitude]).addTo(map).bindPopup(gang.name);

		const modal = document.getElementById('validate_modal');
		modal.showModal();

		return undefined;
	}
</script>

<div class="flex flex-col">
	<div class="hero">
		<div class="hero-content text-center">
			<div class="max-w-md">
				<h1 class="text-5xl font-bold">
					Hola {#if data.user.name}{data.user.name}{/if}
				</h1>
				<p class="py-6">
					Tienes {data.notificationsCount} notificaciones pendientes
				</p>
			</div>
		</div>
	</div>
	<div class="">
		<ul>
			{#each data.notifications as notification}
				<li>
					{#if notification.type === 'gang-added'}
						<span>{notification.data.addedBy} ha añadido una peña nueva: </span><span>{notification.data.gang.name}</span>
						{#if notification.status === 'pending'}
							<button class="btn btn-accent m-6" on:click={showModal(notification)}>Validar</button>
						{:else if notification.status === 'validated'}
							<button class="btn btn-accent m-6" disabled>Validada por {notification.data.validatedBy}</button>
						{/if}
					{:else}
						<h2>{notification.title}</h2>
						<p>{notification.body}</p>
						<p>{notification.type}</p>
						<p>{notification.data}</p>
					{/if}
				</li>
			{/each}
		</ul>
	</div>
</div>

<dialog id="validate_modal" class="modal">
	<div class="modal-box">
		<h3 class="text-lg font-bold">Validar peña {currentNotification?.data?.gang.name}</h3>
		<form method="POST" action="{Routes.add_gang.url}?/validate" class="">
			<span class="">{currentNotification?.data?.addedBy} ha añadido una peña nueva: </span><span
				class="">{currentNotification?.data?.gang.name}</span
			>
			<label
				><input
					type="hidden"
					class="input w-full max-w-xs"
					name="userId"
					value={data.user.id}
				/></label
			>
			<label
				><input
					type="hidden"
					class="input w-full max-w-xs"
					name="notificationId"
					value={currentNotification?.id}
				/></label
			>
			<label
				><input
					type="hidden"
					class="input w-full max-w-xs"
					name="gangId"
					value={currentNotification?.data?.gangId}
				/></label
			>
			<div id="map" class="z-0"></div>

			<button type="submit" class="btn btn-accent m-6">Validar</button>
		</form>
		<form method="POST" action="{Routes.add_gang.url}?/refuse" class="">
			<button type="submit" class="btn btn-accent m-6">Rechazar</button>
		</form>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>

<link
	rel="stylesheet"
	href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
	integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
	crossorigin=""
/>

<style>
	#map {
		height: 40vh;
	}
</style>
