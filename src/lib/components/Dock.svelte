<script lang="ts">
	import DockLink from '$lib/components/DockLink.svelte';

	import { type Routes, getMenuRoutes } from '$lib/routes';

	export type Props = {
		routes: Routes;
		currentPath: string;
	};

	let { routes, currentPath }: Props = $props();
</script>

<nav class="dock flex lg:hidden">
	{#each getMenuRoutes(routes, true) as route (route.id)}
		<DockLink {route} {currentPath} href={route.id} />
	{/each}
</nav>
