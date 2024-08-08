<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { SubscribeUser } from '$lib/utils/notification-subscribe-user';
	import { Routes } from '$lib/routes';
	import toast, { Toaster } from 'svelte-french-toast';
	import Nav from '$lib/components/layout/Nav.svelte';

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

<Nav
	userIsLogged={data.userIsLogged}
	notificationsCount={data.notificationsCount}
	userPicture={data.user?.picture}
/>

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
