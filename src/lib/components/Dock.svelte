<script lang="ts">
	import type { Route } from '$lib/routes';

	export type Props = {
		menuRoutes: Route[];
		currentPath: string;
	};

	let { menuRoutes, currentPath }: Props = $props();
</script>

<nav class="dock flex lg:hidden">
	{#each menuRoutes as route (route.url)}
		<a href={route.url} class={currentPath == route.url ? 'dock-active' : ''}>
			{#if route.icon}
				{@const Component = route.icon}
				<Component size={20} />
			{/if}
			<span class="dock-label">{route.short || route.name}</span>
		</a>
	{/each}
</nav>
