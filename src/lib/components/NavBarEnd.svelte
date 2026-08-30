<script lang="ts">
	import { onMount } from 'svelte';
	import Modal from './Modal.svelte';
	import FormLogin from './FormLogin.svelte';
	import { loginModalStore } from '$lib/stores/loginModal.svelte';
	import { resolve } from '$app/paths';
	import { memberDisplayName, memberInitial } from '$lib/utils/member-display';
	import { m } from '$lib/paraglide/messages.js';

	// El tipo de sesión inferido de better-auth, no el User del cliente Prisma
	// (que no es lo que viaja en locals.user/data.user).
	export type Props = {
		user: App.Locals['user'];
	};

	let { user }: Props = $props();

	let modal = $state<Modal | null>(null);
	let userIsLogged = $derived<boolean>(user ? true : false);

	async function afterCancelCallback() {
		await new Promise((resolve) => setTimeout(resolve, 2000));
		modal?.close();
	}

	onMount(() => {
		loginModalStore.value = modal;
	});
</script>

<div class="navbar-end w-auto md:w-[50%]" id="tour-login">
	<div class="dropdown dropdown-end">
		{#if userIsLogged && user}
			<div class="btn avatar btn-circle btn-ghost">
				<div class="w-10 rounded-full">
					<a href={resolve('/profile')}>
						{#if user.image}
							<img alt={m.common_avatar_alt({ name: memberDisplayName(user) })} src={user.image} />
						{:else}
							<div
								class="flex h-full w-full items-center justify-center bg-neutral text-neutral-content"
							>
								{memberInitial(user)}
							</div>
						{/if}
					</a>
				</div>
			</div>
		{:else}
			<Modal title={m.form_login_sign_in()} bind:this={modal} type="X">
				<FormLogin {afterCancelCallback} />
			</Modal>
		{/if}
	</div>
</div>
