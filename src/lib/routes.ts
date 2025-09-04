import { m } from './paraglide/messages.js';

import type { RouteId } from '$app/types';

import Map from '@lucide/svelte/icons/map';
import UserCircle from '@lucide/svelte/icons/user-circle';
import MapPinPlus from '@lucide/svelte/icons/map-pin-plus';
import Calendar from '@lucide/svelte/icons/calendar';
import Shield from '@lucide/svelte/icons/shield';
import Users from '@lucide/svelte/icons/users';
import UsersRound from '@lucide/svelte/icons/users-round';
// import Megaphone from '@lucide/svelte/icons/megaphone';

import type { Component } from 'svelte';

type Route = {
	id: Partial<RouteId>;
	name: string;
	short?: string;
	icon?: Component;
	isProtected: boolean;
	showInMenu: boolean;
	showInMobile?: boolean;
};

type Routes = Partial<Record<RouteId, Route>>;

const routes: Routes = {
	'/': {
		id: '/',
		name: m.routes_home(),
		icon: Map,
		isProtected: false,
		showInMenu: false,
		showInMobile: true
	},
	'/gang/add': {
		id: '/gang/add',
		name: m.routes_gang_add(),
		short: m.routes_gang_add_short(),
		icon: MapPinPlus,
		isProtected: true,
		showInMenu: true
	},
	'/activities': {
		id: '/activities',
		name: m.routes_activities(),
		short: m.routes_activities_short(),
		icon: Calendar,
		isProtected: false,
		showInMenu: true
	},
	// notices: {
	// 	name: m.routes_notices(),
	// 	url: notices',
	// 	icon: Megaphone,
	// 	isProtected: false,
	// 	showInMenu: true
	// },
	'/profile': {
		id: '/profile',
		name: m.routes_profile(),
		icon: UserCircle,
		isProtected: true,
		showInMenu: false,
		showInMobile: true
	},
	'/admin': {
		id: '/admin',
		name: 'Admin',
		icon: Shield,
		isProtected: true,
		showInMenu: false
	},
	'/admin/gangs': {
		id: '/admin/gangs',
		name: 'Admin Gangs',
		icon: Users,
		isProtected: true,
		showInMenu: false
	},
	'/admin/members': {
		id: '/admin/members',
		name: 'Admin Miembros',
		icon: UsersRound,
		isProtected: true,
		showInMenu: false
	}
};

function getMenuRoutes(routes: Routes, isMobile = false): Route[] {
	return (
		Object.entries(routes)
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			.filter(([key, route]: [string, Route]) => {
				if (isMobile && route.showInMobile) return true;
				if (!route.showInMenu) return false;
				return true;
			})
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			.map(([_, route]) => route)
	);
}

export { routes, getMenuRoutes, type Routes, type Route };
