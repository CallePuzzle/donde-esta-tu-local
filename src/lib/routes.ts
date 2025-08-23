import { m } from './paraglide/messages.js';

import { resolve } from '$app/paths';

import type { User } from '@prisma/client';
import type { Component } from 'svelte';
import Map from '@lucide/svelte/icons/map';
import UserCircle from '@lucide/svelte/icons/user-circle';
import MapPinPlus from '@lucide/svelte/icons/map-pin-plus';
import Calendar from '@lucide/svelte/icons/calendar';
import Shield from '@lucide/svelte/icons/shield';
import Users from '@lucide/svelte/icons/users';
import UsersRound from '@lucide/svelte/icons/users-round';

type Route = {
	name: string;
	short?: string;
	url: string;
	icon?: Component;
	isProtected: boolean;
	showInMenu: boolean;
	showInMobile?: boolean;
};

interface Routes {
	[id: string]: Route;
}

const routes: Routes = {
	home: {
		name: m.routes_home(),
		url: resolve(`/`),
		icon: Map,
		isProtected: false,
		showInMenu: false,
		showInMobile: true
	},
	gang_add: {
		name: m.routes_gang_add(),
		short: m.routes_gang_add_short(),
		url: resolve(`/gang/add`),
		icon: MapPinPlus,
		isProtected: true,
		showInMenu: true
	},
	activities: {
		name: m.routes_activities(),
		url: resolve(`/activities`),
		short: m.routes_activities_short(),
		icon: Calendar,
		isProtected: false,
		showInMenu: true
	},
	profile: {
		name: m.routes_profile(),
		url: resolve(`/profile`),
		icon: UserCircle,
		isProtected: true,
		showInMenu: false,
		showInMobile: true
	},
	admin: {
		name: 'Admin',
		url: resolve(`/admin`),
		icon: Shield,
		isProtected: true,
		showInMenu: true
	},
	admin_gangs: {
		name: 'Admin Gangs',
		url: resolve(`/admin/gangs`),
		icon: Users,
		isProtected: true,
		showInMenu: false
	},
	admin_members: {
		name: 'Admin Miembros',
		url: resolve(`/admin/members`),
		icon: UsersRound,
		isProtected: true,
		showInMenu: false
	}
};

function getMenuRoutes(user: User | null, isMobile = false): Route[] {
	return Object.entries(routes)
		.filter(([key, route]: [string, Route]) => {
			if (isMobile && route.showInMobile) return true;
			if (!route.showInMenu) return false;
			return true;
		})
		.map(([_, route]) => route);
}

export { routes, getMenuRoutes, type Routes, type Route };
