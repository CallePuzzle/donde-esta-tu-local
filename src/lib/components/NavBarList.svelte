<script lang="ts">
	import { Link } from '@callepuzzle/svelte-ui';
	import { getMenuRoutes, type RouteMap } from '@callepuzzle/core';
	import type { RouteId } from '$app/types';
	import { tourDesktopElementIds } from '$lib/utils/tour';

	export type Props = {
		routes: RouteMap<RouteId>;
	};

	let { routes }: Props = $props();
</script>

<!-- ul propio (y no el NavBarList de la librería): los Link internos necesitan
     los id del tour, que el NavBarList de la librería no reparte. -->
<ul class="menu menu-horizontal">
	{#each getMenuRoutes(routes) as route (route.id)}
		<li>
			<Link {route} href={route.id} id={tourDesktopElementIds[route.id]} />
		</li>
	{/each}
</ul>
