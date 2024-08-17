<script lang="ts">
	import { enhance } from '$app/forms';
	import { Icon } from 'svelte-icons-pack';
	import { BiMenu } from 'svelte-icons-pack/bi';
	import { clickOutside } from '$lib/utils/click-outside';
	import { Routes } from '$lib/routes';
	import Logo from '$lib/assets/logo.png';

	export let userIsLogged: boolean;
	export let notificationsCount: number;
	export let userPicture: string | null;

	function closeNav(event) {
		event.target.open = false;
	}
</script>

<div class="navbar bg-base-100">
	<div class="flex-1">
		<ul class="menu menu-horizontal px-1 z-50">
			<li class="z-50">
				<details use:clickOutside on:click_outside={closeNav} id="nav_details">
					<summary><Icon src={BiMenu} size="32" /></summary>
					<ul class="bg-base-100 rounded-t-none p-2">
						<li><button class="btn"><a href={Routes.home.url}>{Routes.home.name}</a></button></li>
						<!--					<li>
							<button class="btn"><a href={Routes.my_gang.url}>{Routes.my_gang.name}</a></button>
						</li>
-->
						<li>
							<button class="btn"><a href={Routes.add_gang.url}>{Routes.add_gang.name}</a></button>
						</li>
						{#if userIsLogged}
							<li>
								<form method="post" use:enhance action={Routes.logout.url}>
									<button class="btn" type="submit">{Routes.logout.name}</button>
								</form>
							</li>
						{/if}
					</ul>
				</details>
			</li>
		</ul>
		<a href={Routes.home.url}><img src={Logo} alt="Icono cabecera" class="max-w-14" /></a>
	</div>

	<div class="flex gap-2">
		<div class="name">
			<a href={Routes.home.url} class="btn btn-ghost text-xl flex">
				<span>Montemayor</span> <span class="depililla text-sm -mt-3">de Pililla</span>
			</a>
		</div>

		{#if userIsLogged}
			<div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar indicator">
				{#if notificationsCount}<span class="indicator-item badge badge-warning"
						>{notificationsCount}</span
					>{/if}
				<div class="w-10 rounded-full">
					<a href={Routes.profile.url}><img alt="Profile image" src={userPicture} /></a>
				</div>
			</div>
		{:else}
			<ul class="menu menu-horizontal px-1">
				<li><a href={Routes.login.url}>Login</a></li>
			</ul>
		{/if}
	</div>
</div>

<style>
	.name {
		width: 150px;
	}
	@media (min-width: 478px) {
		.depililla {
			margin-top: 0;
			font-size: 1.25rem; /* 20px */
			line-height: 1.75rem; /* 28px */
		}
		.name {
			width: 267px;
		}
	}
</style>
