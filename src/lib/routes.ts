import { m } from './paraglide/messages.js';

import type { RouteId } from '$app/types';

type RouteIdWithoutParams = Exclude<RouteId, `${string}[${string}`>;

import Map from '@lucide/svelte/icons/map';
import UserCircle from '@lucide/svelte/icons/user-circle';
import MapPinPlus from '@lucide/svelte/icons/map-pin-plus';
import Calendar from '@lucide/svelte/icons/calendar';
import Shield from '@lucide/svelte/icons/shield';
import Users from '@lucide/svelte/icons/users';
import UsersRound from '@lucide/svelte/icons/users-round';
// import Megaphone from '@lucide/svelte/icons/megaphone';

import type { Component } from 'svelte';

// Sin `id`: se deriva de la propia clave del objeto routes (Q6), en vez de
// repetirse a mano en cada entrada. La protección real vive en los
// +layout.server.ts (ver B20); `isProtected` no se llegó a leer en ningún
// sitio y se quita.
type RouteConfig = {
	name: string;
	short?: string;
	icon?: Component;
	showInMenu: boolean;
	showInMobile?: boolean;
};

type Route = RouteConfig & { id: RouteIdWithoutParams };

type Routes = Partial<Record<RouteId, RouteConfig>>;

const routes: Routes = {
	'/': {
		name: m.routes_home(),
		icon: Map,
		showInMenu: false,
		showInMobile: true
	},
	'/gang/add': {
		name: m.routes_gang_add(),
		short: m.routes_gang_add_short(),
		icon: MapPinPlus,
		showInMenu: true
	},
	'/activities': {
		name: m.routes_activities(),
		short: m.routes_activities_short(),
		icon: Calendar,
		showInMenu: true
	},
	'/profile': {
		name: m.routes_profile(),
		icon: UserCircle,
		showInMenu: false,
		showInMobile: true
	},
	'/admin': {
		name: m.routes_admin(),
		icon: Shield,
		showInMenu: false
	},
	'/admin/gangs': {
		name: m.routes_admin_gangs(),
		icon: Users,
		showInMenu: false
	},
	'/admin/members': {
		name: m.routes_admin_members(),
		icon: UsersRound,
		showInMenu: false
	}
};

function getMenuRoutes(routes: Routes, isMobile = false): Route[] {
	return Object.entries(routes)
		.filter(([, route]) => (isMobile && route?.showInMobile) || route?.showInMenu)
		.map(([id, route]) => ({ id: id as RouteIdWithoutParams, ...route! }));
}

export { routes, getMenuRoutes, type Routes, type Route };
