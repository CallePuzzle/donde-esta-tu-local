<script lang="ts">
	import { onMount } from 'svelte';
	import Modal from './Modal.svelte';
	import FormLogin from './FormLogin.svelte';
	import { loginModalStore } from '$lib/stores/loginModal';
	import { resolve } from '$app/paths';

	import type { Props as FormLoginProps } from './FormLogin.svelte';
	import type { User as UserPrisma } from '@prisma/client';
	import ModalType from './Modal.svelte';

	export type Props = {
		user: UserPrisma;
	} & FormLoginProps;

	let { user }: Props = $props();

	let modal = $state<ModalType | null>(null);
	let userIsLogged = $derived<boolean>(user ? true : false);

	async function afterCancelCallback() {
		await new Promise((resolve) => setTimeout(resolve, 2000));
		modal?.close();
	}

	onMount(() => {
		loginModalStore.set(modal);
	});
</script>

<div class="navbar-end w-auto md:w-[50%]">
	<div class="dropdown dropdown-end">
		{#if userIsLogged}
			<div class="btn avatar btn-circle btn-ghost">
				<div class="w-10 rounded-full">
					<a href={resolve('/profile')}>
						<img
							alt="{user?.name || 'User'} avatar"
							src={user?.image ||
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
