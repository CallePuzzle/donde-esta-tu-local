<script lang="ts">
	import type { Route } from '$lib/routes';
	import Link from './Link.svelte';

	export type Props = {
		type: 'horizontal' | 'drawer';
		routes: Route[];
	};

	let { type, routes }: Props = $props();

	function getClass() {
		if (type === 'horizontal') {
			return 'menu menu-horizontal';
		} else if (type === 'drawer') {
			return 'menu bg-base-200 min-h-full w-80 p-4 py-10';
		}
	}
</script>

<ul class={getClass()}>
	{#each routes as route (route.url)}
		<li><Link {route} /></li>
	{/each}
</ul>
