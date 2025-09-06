<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import NavBarList from './NavBarList.svelte';
	import NavBarEnd from './NavBarEnd.svelte';
	import { resolve } from '$app/paths';

	import type { Snippet } from 'svelte';
	import type { Routes } from '$lib/routes';
	import { type Props as NavBarEndProps } from './NavBarEnd.svelte';

	export type Props = {
		title: Snippet;
		routes: Routes;
	} & NavBarEndProps;

	let {
		title,
		routes,
		// NavBarEndProps
		user
	}: Props = $props();
</script>

<div class="navbar flex min-h-px justify-between bg-base-300 shadow-sm">
	<div class="hidden w-full lg:flex">
		<div class="mx-2 navbar-start px-2">
			<a href={resolve('/')} data-sveltekit-reload>{@render title()}</a>
		</div>
		<nav class="my-2 navbar-center hidden lg:block">
			<NavBarList type="horizontal" {routes} />
		</nav>
	</div>
	<div class="flex lg:hidden">
		<button class="" onclick={() => history.back()}>
			<ChevronLeft size={30} />
		</button>
		<div class="mx-2 px-2">
			<a href={resolve('/')} data-sveltekit-reload>{@render title()}</a>
		</div>
	</div>
	<NavBarEnd {user} />
</div>
