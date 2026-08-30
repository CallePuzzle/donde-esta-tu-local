<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { onDestroy, onMount } from 'svelte';
	import { coordsMonte } from '$lib/utils/coords-monte';
	import { showMyPosition } from '$lib/utils/show-my-position';
	import GangMap from '$lib/components/gangs/GangMap.svelte';
	import GangImage from '$lib/components/gangs/GangImage.svelte';
	import Share2 from '@lucide/svelte/icons/share-2';
	import UserPlus from '@lucide/svelte/icons/user-plus';
	import Check from '@lucide/svelte/icons/check';
	import CircleFadingArrowUp from '@lucide/svelte/icons/circle-fading-arrow-up';
	import Locate from '@lucide/svelte/icons/locate';
	import X from '@lucide/svelte/icons/x';
	import { m } from '$lib/paraglide/messages.js';
	import Modal from '$lib/components/Modal.svelte';
	import ButtonRequest from '$lib/components/ButtonRequest.svelte';
	import MemberDetail from '$lib/components/gangs/MemberDetail.svelte';
	import { loginModalStore } from '$lib/stores/loginModal.svelte';
	import { resolve } from '$app/paths';
	import { goto, invalidateAll } from '$app/navigation';
	import { logger } from '$lib/logger';
	import { isAdmin } from '$lib/utils/roles';
	import { continueOnboardingTour } from '$lib/utils/tour';
	import '@sjmc11/tourguidejs/src/scss/tour.scss';

	import type { PageData } from './$types';
	import type { Map } from 'leaflet';
	import type { GangDetailData, Member } from './type';
	import type { Leaflet } from '$lib/utils/types';

	let { data }: { data: PageData } = $props();
	let L: Leaflet;
	let map: Map;
	let gang: GangDetailData = $derived(data.gang);
	let showImHere = $state(false);
	let members: Member[] = $derived(data.members);
	let pendingMembers: Member[] = $derived(data.pendingMembers || []);
	let isValidatedMember: boolean = $derived(data.isValidatedMember || false);
	let currentGang = $derived(data.currentGang);

	let joinLoading = $state(false);
	let joinMessage = $state('');
	let joinMessageClass = $state('');
	let confirmModal: Modal | undefined = $state();
	let loginRequiredModal: Modal | undefined = $state();
	let notMemberModal: Modal | undefined = $state();
	let processingMemberId = $state<string | null>(null);
	let resolvedMemberId = $state<string | null>(null);

	async function handleActionComplete(memberId: string) {
		resolvedMemberId = memberId;
		await invalidateAll();
	}

	function handleMapReady(context: { L: Leaflet; map: Map }) {
		({ L, map } = context);

		map.panTo([gang.latitude, gang.longitude]);
		const popupContent = document.createElement('span');
		popupContent.textContent = gang.name;
		L.marker([gang.latitude, gang.longitude]).addTo(map).bindPopup(popupContent);
		showImHere = true;
	}

	let webShareAPISupported = $state(browser && typeof navigator.share !== 'undefined');

	const handleWebShare = async () => {
		try {
			navigator.share({
				title: m.gang_share_title({ name: gang.name }),
				text: m.gang_share_text({ name: gang.name }),
				url: data.appUrl + `/gang/${gang.id}`
			});
		} catch (error) {
			logger.error(error, 'Error sharing');
			webShareAPISupported = false;
		}
	};

	function handleLogin() {
		loginModalStore.value?.showModal();
	}

	function handleUpdateClick() {
		if (!data.user) {
			loginRequiredModal?.showModal();
			return;
		}
		if (!isValidatedMember && !isAdmin(data.user)) {
			notMemberModal?.showModal();
			return;
		}
		goto(resolve('/gang/[slug]/update', { slug: gang.id.toString() }));
	}

	function handleJoinClick() {
		joinMessage = '';
		if (currentGang) {
			confirmModal?.showModal();
		} else {
			requestJoin();
		}
	}

	function closeConfirmModal() {
		confirmModal?.close();
	}

	async function requestJoin(confirmed = false) {
		joinLoading = true;
		joinMessage = '';
		try {
			const response = await fetch('/gang/addMember', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId: data.user?.id, gangId: gang.id, confirmed })
			});
			const responseData = await response.json();
			if (response.ok) {
				joinMessage = responseData.message;
				joinMessageClass = 'alert-success';
			} else {
				closeConfirmModal();
				joinMessage = responseData.message || m.request_new_member_error();
				joinMessageClass = response.status === 404 ? 'alert-warning' : 'alert-error';
			}
		} catch (error) {
			logger.error(error, 'Error joining gang');
			joinMessage = m.request_new_member_error();
			joinMessageClass = 'alert-error';
		} finally {
			joinLoading = false;
		}
	}

	let stopWatchingPosition: (() => void) | undefined;

	function imHere() {
		stopWatchingPosition?.();
		stopWatchingPosition = showMyPosition(L, map, coordsMonte);
	}

	onMount(() => {
		continueOnboardingTour(
			page.url.pathname,
			data.user ?? null,
			[data.gang],
			isValidatedMember ? data.gang.id : undefined
		);
	});

	onDestroy(() => stopWatchingPosition?.());
</script>

<div class="hero">
	<div class="hero-content text-center">
		<div class="flex max-w-md items-center gap-3">
			<GangImage
				id="tour-gang-image"
				name={gang.name}
				image={gang.image}
				canUpload={data.canUploadImage}
				dataForm={data.imageForm}
				pageStatus={page.status}
			/>
			<h1 class="text-3xl font-bold md:text-5xl">
				{m.gang_detail_title({ name: gang.name })}
			</h1>
		</div>
	</div>
</div>

<GangMap height="30vh" onReady={handleMapReady} />

{#if showImHere}
	<button
		type="button"
		id="imhere"
		onclick={imHere}
		class="btn absolute top-[39vh] right-3 btn-active btn-circle btn-primary"><Locate /></button
	>
{/if}

<div class="container mx-auto my-2 pb-20 lg:pb-0">
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<div class="rounded-lg bg-neutral p-2 shadow sm:p-4">
			<div class="m-2 flex justify-between">
				<h3 class="m-1 mr-5 text-2xl font-bold">{m.gang_members_title()}</h3>
				{#if data.user && !isValidatedMember && !data.userHasPendingRequest}
					{#if joinLoading}
						<span class="loading loading-lg loading-dots"></span>
					{:else if joinMessage}
						<div class="alert {joinMessageClass} text-sm">
							{joinMessage}
						</div>
					{:else}
						<button
							type="button"
							id="tour-join-gang"
							class="btn w-fit btn-accent"
							onclick={handleJoinClick}
						>
							<UserPlus />{m.request_new_member_title()}
						</button>
					{/if}

					{#if currentGang}
						<Modal
							title={m.request_new_member_confirm_title()}
							showButton={false}
							type="X"
							bind:this={confirmModal}
						>
							<p class="py-4">
								{m.request_new_member_confirm_message({
									name: currentGang.name,
									newName: gang.name
								})}
							</p>
							<div class="modal-action">
								<button type="button" class="btn" onclick={closeConfirmModal}>
									{m.request_new_member_cancel_button()}
								</button>
								<button
									type="button"
									class="btn btn-warning"
									onclick={() => {
										closeConfirmModal();
										requestJoin(true);
									}}
									disabled={joinLoading}
								>
									{#if joinLoading}
										<span class="loading loading-sm loading-spinner"></span>
									{/if}
									{m.request_new_member_confirm_button()}
								</button>
							</div>
						</Modal>
					{/if}
				{:else if data.userHasPendingRequest}
					<p class="m-1 self-center text-sm italic">{m.gang_request_pending()}</p>
				{:else if !data.user}
					<button
						type="button"
						class="btn flex h-full w-48 flex-col text-neutral btn-secondary xl:h-[38px] xl:w-80 xl:flex-row"
						onclick={handleLogin}
						><span>{m.gang_login_prompt_start()}</span><span>{m.gang_login_prompt_end()}</span
						></button
					>
				{/if}
			</div>

			<!-- Validated members -->
			<ul>
				{#each members as member (member.id)}
					<MemberDetail name={member.displayName} image={member.image} />
				{/each}
			</ul>

			<!-- Pending members section for validated members -->
			{#if pendingMembers.length > 0}
				<div class="divider"></div>
				<h4 class="mb-2 text-xl font-bold">{m.gang_pending_requests_title()}</h4>
				<ul>
					{#each pendingMembers as pendingMember (pendingMember.id)}
						<li
							class="my-2 flex flex-col justify-between bg-base-100 p-2 lg:flex-row lg:items-center"
						>
							<MemberDetail name={pendingMember.displayName} image={pendingMember.image} />
							{#if isValidatedMember}
								<div class="flex gap-2">
									{#snippet validateButtonText()}
										<Check size="1rem" /> {m.action_validate()}
									{/snippet}
									<ButtonRequest
										buttonText={validateButtonText}
										endpoint="/gang/validateMember"
										body={{ userId: pendingMember.id, gangId: gang.id }}
										buttonClass="btn btn-sm btn-accent"
										disabled={processingMemberId === pendingMember.id ||
											resolvedMemberId === pendingMember.id}
										onStart={() => (processingMemberId = pendingMember.id)}
										onComplete={() => (processingMemberId = null)}
										onSuccess={() => handleActionComplete(pendingMember.id)}
									/>

									{#snippet rejectButtonText()}
										<X size="1rem" /> {m.action_reject()}
									{/snippet}
									<ButtonRequest
										buttonText={rejectButtonText}
										endpoint="/gang/refuseMember"
										body={{ userId: pendingMember.id, gangId: gang.id }}
										buttonClass="btn btn-sm btn-error"
										disabled={processingMemberId === pendingMember.id ||
											resolvedMemberId === pendingMember.id}
										onStart={() => (processingMemberId = pendingMember.id)}
										onComplete={() => (processingMemberId = null)}
										onSuccess={() => handleActionComplete(pendingMember.id)}
									/>
								</div>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
		</div>
		<div class="order-first rounded-lg bg-neutral p-4 shadow md:order-last">
			<div class="m-2 flex justify-between">
				<button type="button" class="btn btn-soft text-accent" onclick={handleUpdateClick}>
					<CircleFadingArrowUp />
					{m.gang_update()}
				</button>
				{#if webShareAPISupported}
					<button type="button" class="btn btn-soft text-[#ee3616]" onclick={handleWebShare}
						><Share2 size="1.2rem" /> {m.gang_share()}</button
					>
				{/if}
			</div>

			<Modal
				title={m.gang_update_login_required_title()}
				showButton={false}
				type="X"
				bind:this={loginRequiredModal}
			>
				<p class="py-4">{m.gang_update_login_required_message()}</p>
				<button
					type="button"
					class="btn w-full text-neutral btn-secondary"
					onclick={() => {
						loginRequiredModal?.close();
						handleLogin();
					}}
				>
					{m.form_login_sign_in()}
				</button>
			</Modal>

			<Modal title={m.gang_update_not_member_title()} showButton={false} bind:this={notMemberModal}>
				<p class="py-4">
					{m.gang_update_not_member_message()}
				</p>
				<p class="py-4">
					{m.gang_update_not_member_message_2({ name: gang.name })}
				</p>
			</Modal>
		</div>
	</div>
</div>
