<script lang="ts">
	import { browser } from '$app/environment';
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { coordsMonte } from '$lib/utils/coords-monte';
	import { Icon } from 'svelte-icons-pack';
	import { BsShareFill } from 'svelte-icons-pack/bs';
	import { HasPermission } from '$lib/permissions';
	import { Routes } from '$lib/routes';

	import type { PageData, ActionData } from './$types';
	import type { Gang, User } from '@prisma/client';

	export let data: PageData;
	export let form: ActionData;
	let sending = false;

	export let gang: Gang = data.gang;
	export let user: User = data.user;
	export let members: User[] = data.members;

	onMount(async () => {
		const L = (await import('leaflet')).default;
		const map = L.map('map').setView(coordsMonte, 17);
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);

		map.panTo([gang.latitude, gang.longitude]);
		L.marker([gang.latitude, gang.longitude]).addTo(map).bindPopup(gang.name);
	});

	$: webShareAPISupported = browser && typeof navigator.share !== 'undefined';

	$: handleWebShare;
	const handleWebShare = async () => {
		try {
			navigator.share({
				title: `Peña: ${gang.name}`,
				text: `Hola, te comparto esta peña: ${gang.name}`,
				url: data.appUrl + `/gang/${gang.id}`
			});
		} catch (error) {
			console.error('Error sharing:', error);
			webShareAPISupported = false;
		}
	};
</script>

<div class="hero">
	<div class="hero-content text-center">
		<div class="max-w-md flex">
			<h1 class="text-5xl font-bold">
				Peña {gang.name}
			</h1>
			{#if webShareAPISupported}
				<button on:click={handleWebShare} class="ml-4"
					><Icon src={BsShareFill} size="1.2rem" color="#ee3616" /></button
				>
			{/if}
		</div>
		{#if HasPermission(data.user, 'ADMIN')}
			<a href={Routes.gang_update.generateUrl({ id: gang.id })} class="ml-4 btn btn-info"
				>{Routes.gang_update.name}</a
			>
		{/if}
	</div>
</div>

{#if data.userIsLogged}
	<div class="container mx-auto my-2">
		<div class="mx-4 flex">
			{#if data.user.gangId !== gang.id}
				<form
					class="basis-1/2 flex justify-center"
					method="POST"
					action="?/requestNewMember"
					use:enhance={() => {
						sending = true;
						return ({ update }) => {
							// Set invalidateAll to false if you don't want to reload page data when submitting
							update({ invalidateAll: true }).finally(async () => {
								sending = false;
							});
						};
					}}
				>
					<input type="hidden" name="gangId" value={gang.id} />
					<input type="hidden" name="userId" value={user.id} />
					{#if sending}
						<span class="loading loading-dots loading-lg"></span>
					{:else}
						<button
							class="px-4 py-2 btn btn-info"
							disabled={form?.success || data.userHasAMembershipRequestForThisGang > 0}
						>
							{#if form?.success || data.userHasAMembershipRequestForThisGang > 0}
								Solicitado
							{:else}
								Solicitar unirme a esta peña
							{/if}
						</button>
					{/if}
				</form>
			{/if}
			<form
				class="basis-1/2 flex justify-center"
				method="POST"
				action="?/visitGang"
				use:enhance={() => {
					sending = true;
					return ({ update }) => {
						// Set invalidateAll to false if you don't want to reload page data when submitting
						update({ invalidateAll: true }).finally(async () => {
							sending = false;
						});
					};
				}}
			>
				<input type="hidden" name="gangId" value={gang.id} />
				<input type="hidden" name="userId" value={user.id} />
				{#if sending}
					<span class="loading loading-dots loading-lg"></span>
				{:else}
					<button
						class="px-4 py-2 btn btn-accent"
						disabled={form?.success || data.userHasAMembershipRequestForThisGang > 0}
					>
						{#if form?.success || data.userHasAMembershipRequestForThisGang > 0}
							Visitado
						{:else}
							Marcar como visitado
						{/if}
					</button>
				{/if}
			</form>
		</div>
	</div>
{/if}

<div id="map" class="z-0"></div>

<div class="container mx-auto my-2">
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<div class="p-4 bg-white rounded-lg shadow">
			<h2 class="text-2xl font-bold">Miembros</h2>
			<ul>
				{#each members as member}
					<li class="my-2 flex items-center">
						<div class="avatar">
							<div class="w-10 rounded-full">
								<img alt="Profile image" src={member.picture} />
							</div>
						</div>
						<div class="ml-2">{member.name}</div>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</div>

<link
	rel="stylesheet"
	href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
	integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
	crossorigin=""
/>

<style>
	#map {
		height: 30vh;
	}
</style>
