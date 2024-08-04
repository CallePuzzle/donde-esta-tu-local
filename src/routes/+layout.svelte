<script>
	import '../app.css';
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { Icon } from 'svelte-icons-pack';
	import { BiMenu } from 'svelte-icons-pack/bi';
	import { clickOutside } from '$lib/utils/click-outside';
	import { Routes } from './routes';

	export let data;

	onMount(async () => {
		const status = await Notification.requestPermission();
		if (status !== 'granted')
			alert('Please allow notifications to make sure that the application works.');

		if ('serviceWorker' in navigator) {
			const reg = await navigator.serviceWorker.ready;
			let sub = await reg.pushManager.getSubscription();
			console.log(sub);
			if (!sub) {
				// Fetch VAPID public key
				const res = await fetch(Routes.notification_vapidkeys.url);
				const data = await res.text();
				sub = await reg.pushManager.subscribe({
					userVisibleOnly: true,
					applicationServerKey: data
				});
			}
			if (sub && data.userIsLogged) {
				const res = await fetch(Routes.notification_subscribe.url, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ sub: sub, userId: data.user.id })
				});
				console.log(res);
			}
		}
	});

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
			<div class="dropdown dropdown-end">
				<div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
					<div class="w-10 rounded-full">
						<img alt="Profile image" src={data.user.picture} />
					</div>
				</div>

				<ul
					tabindex="0"
					class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
				>
					<li><a>Mi peña</a></li>
				</ul>
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
