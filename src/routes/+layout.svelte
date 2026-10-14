<script lang="ts">
	import '../app.css';
	import { page, navigating } from '$app/state';
	import { resolve } from '$app/paths';
	import { Header } from '@callepuzzle/svelte-ui';
	import NavBarEnd from '$lib/components/NavBarEnd.svelte';
	import NavBarList from '$lib/components/NavBarList.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Dock from '$lib/components/Dock.svelte';
	import { getRoutes } from '$lib/routes';
	import Logo from '$lib/assets/logo.png?enhanced';
	import { m } from '$lib/paraglide/messages.js';

	import type { Snippet } from 'svelte';
	import type { PageData } from './$types';

	let { children, data }: { children: Snippet; data: PageData } = $props();

	let user = $derived(data.user);

	// Factoría en render (nunca en scope de módulo): las etiquetas i18n se
	// resuelven con el locale activo.
	const routes = $derived(getRoutes());
</script>

<div class="main-div h-screen min-w-[348px]">
	<!-- El título NO va por homeHref (la librería envolvería el título en un Link
	     sin data-sveltekit-reload): el enlace a "/" con reload se conserva aquí. -->
	<Header showBack strings={{ back: m.common_back() }}>
		{#snippet title()}
			<a href={resolve('/')} data-sveltekit-reload>
				<div class="flex items-center">
					<enhanced:img src={Logo} alt={m.layout_header_icon_alt()} class="w-6 lg:m-1 lg:w-14" />
					<div class="m-1">
						<span>Montemayor de Pililla</span>
					</div>
				</div>
			</a>
		{/snippet}
		{#snippet navCenter()}
			<nav aria-label={m.layout_nav_label()}>
				<NavBarList {routes} />
			</nav>
		{/snippet}
		{#snippet navEnd()}
			<NavBarEnd {user} />
		{/snippet}
	</Header>

	{#if navigating.to}
		<div class="flex h-1/2 w-full justify-center">
			<span class="loading loading-xl loading-dots"></span>
		</div>
		<Footer visibleOnlyOnMobile={true} {user} />
	{:else}
		{@render children()}
	{/if}
	<Footer {user} />
	<Dock {routes} currentPath={page.url.pathname} />
</div>
