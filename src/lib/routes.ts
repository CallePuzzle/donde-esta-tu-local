import { m } from './paraglide/messages.js';

import { resolve } from '$app/paths';

type Route = {
	name: string;
	url: string;
	isProtected: boolean;
	showInMenu: boolean;
};

interface Routes {
	[id: string]: Route;
}

const routes: Routes = {
	home: {
		name: m.routes_home(),
		url: resolve(`/`),
		isProtected: false,
		showInMenu: false
	},
	profile: {
		name: m.routes_profile(),
		url: resolve(`/profile`),
		isProtected: true,
		showInMenu: false
	},
	gang_add: {
		name: m.routes_gang_add(),
		url: resolve(`/gang/add`),
		isProtected: true,
		showInMenu: true
	},
	activities: {
		name: m.routes_activities(),
		url: resolve(`/activities`),
		isProtected: false,
		showInMenu: true
	},
	admin: {
		name: 'Admin',
		url: resolve(`/admin`),
		isProtected: true,
		showInMenu: true
	},
	admin_gangs: {
		name: 'Admin Gangs',
		url: resolve(`/admin/gangs`),
		isProtected: true,
		showInMenu: false
	},
	admin_members: {
		name: 'Admin Miembros',
		url: resolve(`/admin/members`),
		isProtected: true,
		showInMenu: false
	}
};

export { routes, type Routes, type Route };
