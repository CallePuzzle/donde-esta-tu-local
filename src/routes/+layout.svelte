<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { SubscribeUser } from '$lib/utils/notification/notification-subscribe-user';
	import { Routes } from '$lib/routes';
	import toast, { Toaster } from 'svelte-french-toast';
	import Nav from '$lib/components/layout/Nav.svelte';
	import { Icon } from 'svelte-icons-pack';
	import { BiSolidHeart } from 'svelte-icons-pack/bi';
	import { BiLogoGithub } from 'svelte-icons-pack/bi';

	import type { PageData } from './$types';

	export let data: PageData;

	onMount(async () => {
		const status = await Notification.requestPermission();
		//if (status !== 'granted') alert('Por favor, activa las notificaciones para recibir los avisos'); quitamos esto de momento

		if ('serviceWorker' in navigator && data.userIsLogged) {
			const reg = await navigator.serviceWorker.ready;
			await SubscribeUser(data.userIsLogged, data.user.id, reg, data.JWKpublicKey);
		}

		if (data.notifications && data.path !== Routes.notification_my.url) {
			if (data.notificationsCount == 1) {
				toast('Tienes una notificación sin leer', {
					icon: '🔔'
				});
			} else if (data.notificationsCount > 1) {
				toast(`Tienes ${data.notificationsCount} notificaciones sin leer`, {
					icon: '🔔'
				});
			}
		}
	});
</script>

<Toaster />

<div class="h-screen main-div">
	<Nav
		userIsLogged={data.userIsLogged}
		notificationsCount={data.notificationsCount}
		userPicture={data.user?.picture}
		userGangId={data.user?.gangId}
	/>

	{#if data.isProtectedRoute && !data.userIsLogged}
		<div class="alert alert-error">
			<p>{data.protectedRouteMessage}</p>
			<p>
				<a href={Routes.wellcome.url} class="btn btn-accent">{Routes.wellcome.name}</a>
			</p>
		</div>
	{:else}
		<slot />
	{/if}

	<footer class="container mx-auto flex justify-around absolute bottom-0 justify-center">
		<p class="md:flex-1 m-4 flex items-center justify-center">
			<span class="mr-2">Made with</span><Icon src={BiSolidHeart} size="16" color="red" /><span
				class="ml-2">by KPY</span
			>
		</p>
		<a
			class="md:flex-1 m-4 flex items-center justify-center"
			href="https://github.com/CallePuzzle/donde-esta-tu-local"
			target="_blank"
			rel="noopener noreferrer"><Icon src={BiLogoGithub} size="32" /></a
		>
	</footer>
</div>

<style>
	footer {
		left: 50%;
		transform: translateX(-50%);
	}
	.main-div {
		min-width: 353px;
	}
</style>
