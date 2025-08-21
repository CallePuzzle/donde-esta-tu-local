<script lang="ts">
	import Search from '@lucide/svelte/icons/search';
	import BellRing from '@lucide/svelte/icons/bell-ring';
	import Link from './Link.svelte';
	import type { Routes } from '$lib/routes';
	import Modal from './Modal.svelte';
	import FormLogin from './FormLogin.svelte';
	import type { AuthClient, Session } from '$lib/auth-client';
	import type { Props as FormLoginProps } from './FormLogin.svelte';
	import { loginModalStore } from '$lib/stores/loginModal';

	export type Props = {
		routes: Routes;
		session: Session;
		authClient: AuthClient;
		userHasNotification?: boolean;
		notification?: boolean;
		searcher?: boolean;
	} & FormLoginProps;

	let {
		routes,
		session,
		authClient,
		userHasNotification = false,
		notification = false,
		searcher = false
	}: Props = $props();

	let userIsLogged = $derived<boolean>($session?.data ? true : false);

	async function afterCancelCallback() {
		await new Promise((resolve) => setTimeout(resolve, 2000));
		$loginModalStore?.close();
	}
</script>

<div class="navbar-end">
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
			<div tabindex="0" role="button" class="btn avatar btn-circle btn-ghost">
				<div class="w-10 rounded-full">
					<img
						alt="{$session?.data?.user?.name || 'User'} avatar"
						src={$session?.data?.user?.image ||
							'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp'}
					/>
				</div>
			</div>
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<ul
				tabindex="0"
				class="dropdown-content menu z-1 mt-3 w-52 menu-sm rounded-box bg-base-100 p-2 shadow"
			>
				<li><Link route={routes.profile} /></li>
				<li>
					<button
						onclick={async () => {
							await authClient.signOut();
						}}
					>
						Sign Out
					</button>
				</li>
			</ul>
		{:else}
			<Modal title="Login" bind:this={$loginModalStore}>
				<FormLogin {afterCancelCallback} />
			</Modal>
		{/if}
	</div>
</div>
