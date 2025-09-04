<script lang="ts">
	import type { Route } from '$lib/routes';
	import type { RouteId } from '$app/types';
	export type Props = {
		route: Route;
		href: Partial<RouteId>;
	};

	let { route, href }: Props = $props();
</script>

<a {href}>{route.name}</a>
