import { m } from './paraglide/messages.js';

type URL<T extends string = string> = T | ((id: string, ...params: string[]) => T);

type Permissions = {
	[entity: string]: string[];
};

type Route = {
	name: string;
	url: URL;
	isProtected: boolean;
	showInMenu: boolean;
	permissions?: Permissions;
};

interface Routes {
	[id: string]: Route;
}

const routes: Routes = {
	home: {
		name: m.routes_home(),
		url: '/',
		isProtected: false,
		showInMenu: false
	},
	profile: {
		name: m.routes_profile(),
		url: '/profile',
		isProtected: true,
		showInMenu: false
	},
	notifications: {
		name: m.routes_notifications(),
		url: '/user/notifications',
		isProtected: true,
		showInMenu: false
	},
	user: {
		name: m.routes_user(),
		url: '/user/:id',
		isProtected: true,
		showInMenu: false
	},
	gang_add: {
		name: m.routes_gang_add(),
		url: '/gang/add',
		isProtected: true,
		showInMenu: true
	},
	activities: {
		name: m.routes_activities(),
		url: '/activities',
		isProtected: false,
		showInMenu: true
	},
	admin: {
		name: 'Admin',
		url: '/admin',
		isProtected: true,
		showInMenu: true
	},
	admin_gangs: {
		name: 'Admin Gangs',
		url: '/admin/gangs',
		isProtected: true,
		showInMenu: false
	},
	admin_members: {
		name: 'Admin Miembros',
		url: '/admin/members',
		isProtected: true,
		showInMenu: false
	}
};

export { routes, type Routes, type Route };
