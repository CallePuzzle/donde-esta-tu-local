<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { coordsMonte } from '$lib/utils/coords-monte';
	import Share2 from '@lucide/svelte/icons/share-2';
	import UserPlus from '@lucide/svelte/icons/user-plus';
	import Check from '@lucide/svelte/icons/check';
	import X from '@lucide/svelte/icons/x';
	import { m } from '$lib/paraglide/messages.js';
	import ButtonRequest from '$lib/components/ButtonRequest.svelte';
	import MemberDetail from '$lib/components/gangs/MemberDetail.svelte';
	import { loginModalStore } from '$lib/stores/loginModal';

	import type { PageData } from './$types';

	import type { GangData, Member } from './type';

	let { data }: { data: PageData } = $props();

	let gang: GangData = data.gang;

	let members: Member[] = $state(data.members);
	let pendingMembers: Member[] = $state(data.pendingMembers || []);
	let isValidatedMember: boolean = $state(data.isValidatedMember || false);

	onMount(async () => {
		const L = await import('leaflet');
		const map = L.map('map').setView(coordsMonte, 17);
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);

		map.panTo([gang.latitude, gang.longitude]);
		L.marker([gang.latitude, gang.longitude]).addTo(map).bindPopup(gang.name);
	});

	let webShareAPISupported = $state(browser && typeof navigator.share !== 'undefined');

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

	function handleLogin() {
		if ($loginModalStore) $loginModalStore.showModal();
	}
</script>

<div class="hero">
	<div class="hero-content text-center">
		<div class="flex max-w-md">
			<h1 class="text-5xl font-bold">
				Peña {gang.name}
			</h1>
			{#if webShareAPISupported}
				<button onclick={handleWebShare} class="ml-4"
					><Share2 size="1.2rem" color="#ee3616" /></button
				>
			{/if}
		</div>
	</div>
</div>

<div id="map" class="z-0"></div>

<div class="container mx-auto my-2">
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<div class="rounded-lg bg-neutral p-4 shadow">
			<div class="flex justify-between">
				<h3 class="text-2xl font-bold">Miembros</h3>
				{#if data.user && !isValidatedMember && !pendingMembers.some((m) => m.id === data.user?.id)}
					{#snippet buttonText()}
						<UserPlus />{m.request_new_member_title()}
					{/snippet}
					<ButtonRequest
						{buttonText}
						url={`/gang/addMember?userId=${data.user.id}&gangId=${gang.id}`}
					/>
				{:else if !data.user}
					<button
						class="btn flex h-full w-48 flex-col btn-secondary xl:h-[38px] xl:w-80 xl:flex-row"
						onclick={handleLogin}
						><span>Inicia sesión </span><span>para unirte a la peña</span></button
					>
				{/if}
			</div>

			<!-- Validated members -->
			<ul>
				{#each members as member (member.id)}
					<MemberDetail name={member.name} image={member.image} />
				{/each}
			</ul>

			<!-- Pending members section for validated members -->
			{#if isValidatedMember && pendingMembers.length > 0}
				<div class="divider"></div>
				<h4 class="mb-2 text-xl font-bold">Solicitudes pendientes</h4>
				<ul>
					{#each pendingMembers as pendingMember (pendingMember.id)}
						<li class="my-2 flex items-center justify-between">
							<MemberDetail name={pendingMember.name} image={pendingMember.image} />
							<div class="flex gap-2">
								{#snippet validateButtonText()}
									<Check size="1rem" /> Validar
								{/snippet}
								<ButtonRequest
									buttonText={validateButtonText}
									url={`/gang/validateMember?userId=${pendingMember.id}&gangId=${gang.id}`}
									buttonClass="btn btn-sm btn-success"
								/>

								{#snippet rejectButtonText()}
									<X size="1rem" /> Rechazar
								{/snippet}
								<ButtonRequest
									buttonText={rejectButtonText}
									url={`/gang/refuseMember?userId=${pendingMember.id}&gangId=${gang.id}`}
									buttonClass="btn btn-sm btn-error"
								/>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
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
