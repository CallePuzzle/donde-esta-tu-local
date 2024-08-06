interface ProtectedRoute {
	path: string;
	message: string;
}

interface Route {
	name: string;
	url: string;
}

interface Routes {
	[id: string]: Route;
}

export const ProtectedRoutes: ProtectedRoute[] = [
	{
		path: '/gangs',
		message: 'No tienes permisos para añadir una peña, por favor inicia sesión'
	},
	{
		path: '/my-gang',
		message: 'Para ver tu peña necesitas iniciar sesión'
	}
];

export const Routes: Routes = {
	home: {
		name: 'Inicio',
		url: '/'
	},
	login: {
		name: 'Login',
		url: '/login'
	},
	logout: {
		name: 'Logout',
		url: '/logout'
	},
	add_gang: {
		name: 'Añadir Peña',
		url: '/gang/add'
	},
	my_gang: {
		name: 'Mi Peña',
		url: '/gang/my'
	},
	notification_my: {
		name: 'Mis notificaciones',
		url: '/notification/my'
	},
	notification_subscribe: {
		name: 'Subscribe',
		url: '/notification/subscribe'
	}
};
