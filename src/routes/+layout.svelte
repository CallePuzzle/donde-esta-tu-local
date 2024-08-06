<script lang="ts">
	import '../app.css';
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { Icon } from 'svelte-icons-pack';
	import { BiMenu } from 'svelte-icons-pack/bi';
	import { clickOutside } from '$lib/utils/click-outside';
	import { SubscribeUser } from '$lib/utils/notification-subscribe-user';
	import { Routes } from './routes';
	import toast, { Toaster } from 'svelte-french-toast';

	import type { PageData } from './$types';

	export let data: PageData;

	onMount(async () => {
		const status = await Notification.requestPermission();
		if (status !== 'granted') alert('Por favor, activa las notificaciones para recibir los avisos');

		if ('serviceWorker' in navigator) {
			const reg = await navigator.serviceWorker.ready;
			await SubscribeUser(data.userIsLogged, data.user.id, reg, data.JWKpublicKey);
		}

		if (data.notifications && data.path !== Routes.notification_my.url) {
			if (data.notificationsCount == 1) {
				toast('Tienes una notificación sin leer', {
					icon: '🔔',
				});
			} else if (data.notificationsCount > 1) {
				toast.success(`Tienes ${data.notificationsCount} notificaciones sin leer`);
			}
		}
	});

	function closeNav(event) {
		event.target.open = false;
	}
</script>

<Toaster />

<div class="navbar bg-base-100">
	<div class="flex-1">
		<ul class="menu menu-horizontal px-1 z-50">
			<li class="z-50">
				<details use:clickOutside on:click_outside={closeNav} id="nav_details">
					<summary><Icon src={BiMenu} size="32" /></summary>
					<ul class="bg-base-100 rounded-t-none p-2">
						<li><button class="btn"><a href={Routes.home.url}>{Routes.home.name}</a></button></li>
						<li>
							<button class="btn"><a href={Routes.my_gang.url}>{Routes.my_gang.name}</a></button>
						</li>
						<li>
							<button class="btn"><a href={Routes.add_gang.url}>{Routes.add_gang.name}</a></button>
						</li>
						<!--<li>
							<div class="form-control">
								<input
									type="text"
									placeholder="Buscador"
									class="input input-bordered w-24 md:w-auto p-3"
								/>
							</div>
						</li>-->
						{#if data.userIsLogged}
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
	</div>
	<div class="flex gap-2">
		<a href="/" class="btn btn-ghost text-xl">Peñas Montemayor</a>

		{#if data.userIsLogged}
				<div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar {data.notificationsCount? 'online' : ''}">
					<div class="w-10 rounded-full">
						<a href="{Routes.notification_my.url}"><img alt="Profile image" src={data.user.picture} /></a>
					</div>
				</div>
		{:else}
			<ul class="menu menu-horizontal px-1">
				<li><a href="/login">Login</a></li>
			</ul>
		{/if}
	</div>
</div>

{#if data.isProtectedRoute && !data.userIsLogged}
	<div class="alert alert-error">
		<p>{data.protectedRouteMessage}</p>
		<p>
			<a href="/login" class="btn btn-accent">Iniciar sesión</a>
		</p>
	</div>
{:else}
	<slot />
{/if}
