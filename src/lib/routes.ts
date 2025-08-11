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
		url: '/user/profile',
		isProtected: true,
		showInMenu: false
	},
	notifications: {
		name: m.routes_notifications(),
		url: '/user/notifications',
		isProtected: true,
		showInMenu: false
	}
};

export { routes, type Routes, type Route };
