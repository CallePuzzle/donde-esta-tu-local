<script lang="ts">
	import { onMount } from 'svelte';
	import Search from '@lucide/svelte/icons/search';
	import BellRing from '@lucide/svelte/icons/bell-ring';
	import Modal from './Modal.svelte';
	import FormLogin from './FormLogin.svelte';
	import { loginModalStore } from '$lib/stores/loginModal';

	import type { Session } from '$lib/auth-client';
	import type { Props as FormLoginProps } from './FormLogin.svelte';
	import type { Routes } from '$lib/routes';
	import ModalType from './Modal.svelte';

	export type Props = {
		routes: Routes;
		session: Session;
		userHasNotification?: boolean;
		notification?: boolean;
		searcher?: boolean;
	} & FormLoginProps;

	let {
		routes,
		session,
		userHasNotification = false,
		notification = false,
		searcher = false
	}: Props = $props();

	let modal = $state<ModalType | null>(null);
	let userIsLogged = $derived<boolean>($session?.data ? true : false);

	async function afterCancelCallback() {
		await new Promise((resolve) => setTimeout(resolve, 2000));
		modal?.close();
	}

	onMount(() => {
		loginModalStore.set(modal);
	});
</script>

<div class="navbar-end w-auto md:w-[50%]">
	{#if searcher}
		<button class="btn btn-circle btn-ghost">
			<Search />
		</button>
	{/if}
	{#if notification}
		<a href={routes.notifications.url as string} class="btn btn-circle btn-ghost">
			<div class="indicator">
				<BellRing />
				{#if userIsLogged && userHasNotification}
					<span class="indicator-item badge badge-xs badge-primary"></span>
				{/if}
			</div>
		</a>
	{/if}

	<div class="dropdown dropdown-end">
		{#if userIsLogged}
			<div class="btn avatar btn-circle btn-ghost">
				<div class="w-10 rounded-full">
					<a href={routes.profile.url}>
						<img
							alt="{$session?.data?.user?.name || 'User'} avatar"
							src={$session?.data?.user?.image ||
								'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp'}
						/>
					</a>
				</div>
			</div>
		{:else}
			<Modal title="Login" bind:this={modal} type="X">
				<FormLogin {afterCancelCallback} />
			</Modal>
		{/if}
	</div>
</div>
