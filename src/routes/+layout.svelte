<script lang="ts">
	import '../app.css';
	import { page, navigating } from '$app/state';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Dock from '$lib/components/Dock.svelte';
	import { getMenuRoutes, routes } from '$lib/routes';
	import Logo from '$lib/assets/logo.png?enhanced';

	import type { Snippet } from 'svelte';
	import type { PageData } from './$types';
	import type { User as UserPrisma } from '@prisma/client';

	let { children, data }: { children: Snippet; data: PageData } = $props();

	let user = $derived(data.user) as UserPrisma;
</script>

<div class="main-div h-screen min-w-[348px]">
	<Header {routes} menuRoutes={getMenuRoutes()} {user}>
		{#snippet title()}
			<div class="flex items-center">
				<enhanced:img src={Logo} alt="Icono cabecera" class="w-6 lg:m-1 lg:w-14" />
				<div class="m-1">
					<span>Montemayor de Pililla</span>
				</div>
			</div>
		{/snippet}
	</Header>

	{#if navigating.to}
		<div class="flex h-1/2 w-full justify-center">
			<span class="loading loading-xl loading-dots"></span>
		</div>
		<Footer visibleOnlyOnMobile={true} />
	{:else}
		{@render children()}
	{/if}
	<Footer />
	<Dock menuRoutes={getMenuRoutes(true)} currentPath={page.url.pathname} />
</div>
