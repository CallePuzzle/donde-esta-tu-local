<script lang="ts">
	import type { Route } from '$lib/routes';
	import { resolve } from '$app/paths';
	import { tourMobileElementIds } from '$lib/utils/tour';
	export type Props = {
		route: Route;
		href: Route['id'];
		currentPath: string;
	};

	let { route, href, currentPath }: Props = $props();
</script>

<a
	href={resolve(href)}
	class={currentPath == route.id ? 'dock-active' : ''}
	id={tourMobileElementIds[route.id]}
>
	{#if route.icon}
		{@const Component = route.icon}
		<Component size={20} />
	{/if}
	<span class="dock-label">{route.short || route.name}</span>
</a>
