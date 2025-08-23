<script lang="ts">
	import type { Routes, Route } from '$lib/routes';
	import type { Session } from '$lib/auth-client';
	import Link from './Link.svelte';

	export type Props = {
		type: 'horizontal' | 'drawer';
		routes: Routes;
		session?: Session;
	};

	let { type, routes, session }: Props = $props();

	function getClass() {
		if (type === 'horizontal') {
			return 'menu menu-horizontal';
		} else if (type === 'drawer') {
			return 'menu bg-base-200 min-h-full w-80 p-4 py-10';
		}
	}

	// Filtrar rutas basándose en showInMenu y permisos del usuario
	const routesArray: Route[] = Object.entries(routes)
		.filter(([key, route]: [string, Route]) => {
			// Primero verificar si debe mostrarse en el menú
			if (!route.showInMenu) return false;

			// Si es una ruta de admin, verificar el rol del usuario
			if (key === 'admin' || key === 'admin_gangs' || key === 'admin_members') {
				const userRole = $session?.data?.user?.role;
				return userRole === 'admin' || userRole === 'system';
			}

			// Para otras rutas, mostrar normalmente
			return true;
		})
		.map(([_, route]) => route);
</script>

<ul class={getClass()}>
	{#each routesArray as route (route.url)}
		<li><Link {route} /></li>
	{/each}
</ul>
