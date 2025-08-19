<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Routes } from '$lib/routes.js';

	import Menu from '@lucide/svelte/icons/menu';
	import NavBarList from './NavBarList.svelte';

	import NavBarEnd from './NavBarEnd.svelte';
	import { type Props as NavBarEndProps } from './NavBarEnd.svelte';

	export type Props = {
		title: Snippet;
		routes: Routes;
		children: Snippet;
	} & NavBarEndProps;

	let {
		title,
		routes,
		children,
		// NavBarEndProps
		session,
		authClient,
		userHasNotification = false,
		notification = false,
		searcher = false
	}: Props = $props();
</script>

<div class="drawer">
	<input id="my-drawer-3" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content flex flex-col">
		<!-- Navbar -->
		<div class="navbar w-full bg-base-300">
			<div class="flex-none lg:hidden">
				<label for="my-drawer-3" aria-label="open sidebar" class="btn btn-square btn-ghost">
					<Menu />
				</label>
			</div>
			<div class="mx-2 navbar-start px-2">
				<a href={routes.home.url as string} data-sveltekit-reload>{@render title()}</a>
			</div>
			<nav class="navbar-center hidden lg:block">
				<NavBarList type="horizontal" {routes} />
			</nav>
			<NavBarEnd {session} {authClient} {userHasNotification} {notification} {searcher} {routes} />
		</div>
		<!-- Page content here -->
		{@render children()}
	</div>
	<nav class="drawer-side">
		<label for="my-drawer-3" aria-label="close sidebar" class="drawer-overlay"></label>
		<NavBarList type="drawer" {routes} />
	</nav>
</div>
