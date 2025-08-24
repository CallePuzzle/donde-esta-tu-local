<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Route, Routes } from '$lib/routes';

	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import NavBarList from './NavBarList.svelte';

	import NavBarEnd from './NavBarEnd.svelte';
	import { type Props as NavBarEndProps } from './NavBarEnd.svelte';

	export type Props = {
		title: Snippet;
		routes: Routes;
		menuRoutes: Route[];
	} & NavBarEndProps;

	let {
		title,
		menuRoutes,
		routes,
		// NavBarEndProps
		session,
		authClient,
		userHasNotification = false,
		notification = false,
		searcher = false
	}: Props = $props();
</script>

<div class="navbar hidden bg-base-300 shadow-sm lg:flex">
	<div class="mx-2 navbar-start px-2">
		<a href={routes.home.url as string} data-sveltekit-reload>{@render title()}</a>
	</div>
	<nav class="navbar-center hidden lg:block">
		<NavBarList type="horizontal" routes={menuRoutes} />
	</nav>
	<NavBarEnd {session} {authClient} {userHasNotification} {notification} {searcher} {routes} />
</div>

<div class="navbar flex min-h-px bg-base-300 shadow-sm lg:hidden">
	<button class="" onclick={() => history.back()}>
		<ChevronLeft size={30} />
	</button>
	<div class="mx-2 px-2">
		<a href={routes.home.url as string} data-sveltekit-reload>{@render title()}</a>
	</div>
</div>
