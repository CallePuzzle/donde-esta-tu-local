<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { getMenuRoutes, routes } from '$lib/routes';
	import { session, authClient } from '$lib/auth-client';
	import Logo from '$lib/assets/logo.png';

	import type { Snippet } from 'svelte';

	let menuRoutes = $state(getMenuRoutes($session?.data?.user));

	let { children }: { children: Snippet } = $props();
</script>

<div class="main-div h-screen">
	<Header {routes} {menuRoutes} {session} {authClient}>
		{#snippet title()}
			<div class="flex items-center">
				<img src={Logo} alt="Icono cabecera" class="m-1 max-w-14" />
				<div class="m-1">
					<span>Montemayor</span> <span class="depililla -mt-3 text-sm">de Pililla</span>
				</div>
			</div>
		{/snippet}
	</Header>
	{@render children()}
	<Footer />
</div>
