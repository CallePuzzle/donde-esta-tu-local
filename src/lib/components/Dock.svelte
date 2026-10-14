<script lang="ts">
	import { DockLink } from '@callepuzzle/svelte-ui';
	import { getMenuRoutes, type RouteMap } from '@callepuzzle/core';
	import type { RouteId } from '$app/types';
	import { tourMobileElementIds } from '$lib/utils/tour';
	import { pwaInstallStore } from '$lib/stores/pwaInstall.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import Download from '@lucide/svelte/icons/download';

	export type Props = {
		routes: RouteMap<RouteId>;
		currentPath: string;
	};

	let { routes, currentPath }: Props = $props();

	// No forma parte del registro central de routes.ts porque no es una página de
	// navegación normal: solo se muestra en el Dock (que ya está oculto en desktop,
	// donde instalar no aplica) y solo mientras la PWA no esté instalada.
	const installRoute = {
		id: '/on-boarding-install' as const,
		label: m.routes_on_boarding_install(),
		icon: Download,
		showInMenu: false
	};
</script>

<!-- nav propio (y no el Dock de la librería): los DockLink internos necesitan
     los id del tour, que el Dock de la librería no reparte. -->
<nav class="dock flex lg:hidden" aria-label={m.layout_dock_nav_label()}>
	{#each getMenuRoutes(routes, { mobile: true }) as route (route.id)}
		<DockLink {route} {currentPath} id={tourMobileElementIds[route.id]} />
	{/each}
	{#if !pwaInstallStore.isStandalone}
		<DockLink route={installRoute} {currentPath} />
	{/if}
</nav>
