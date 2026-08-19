<script lang="ts">
	import type { Route } from '$lib/routes';
	import { resolve } from '$app/paths';
	export type Props = {
		route: Route;
		href: Route['id'];
	};

	let { route, href }: Props = $props();
</script>

<a href={resolve(href)}>{route.name}</a>
