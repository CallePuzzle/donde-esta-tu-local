<script lang="ts">
	import type { Route } from '$lib/routes';
	import { resolve } from '$app/paths';
	export type Props = {
		route: Route;
		href: Route['id'];
		id?: string;
	};

	let { route, href, id }: Props = $props();
</script>

<a {id} href={resolve(href)}>{route.name}</a>
