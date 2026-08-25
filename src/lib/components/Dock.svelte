<script lang="ts">
	import DockLink from '$lib/components/DockLink.svelte';

	import { type Routes, getMenuRoutes } from '$lib/routes';
	import { pwaInstallStore } from '$lib/stores/pwaInstall.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import Download from '@lucide/svelte/icons/download';

	export type Props = {
		routes: Routes;
		currentPath: string;
	};

	let { routes, currentPath }: Props = $props();

	// No forma parte del registro central de routes.ts porque no es una página de
	// navegación normal: solo se muestra en el Dock (que ya está oculto en desktop,
	// donde instalar no aplica) y solo mientras la PWA no esté instalada.
	const installRoute = {
		id: '/on-boarding-install' as const,
		name: m.routes_on_boarding_install(),
		icon: Download,
		showInMenu: false
	};
</script>

<nav class="dock flex lg:hidden">
	{#each getMenuRoutes(routes, true) as route (route.id)}
		<DockLink {route} {currentPath} href={route.id} />
	{/each}
	{#if !pwaInstallStore.isStandalone}
		<DockLink route={installRoute} href={installRoute.id} {currentPath} />
	{/if}
</nav>
