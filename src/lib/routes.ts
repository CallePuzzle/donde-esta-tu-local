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
		path: '/gang/add',
		message: 'No tienes permisos para añadir una peña, por favor inicia sesión'
	},
	{
		path: '/gang/my',
		message: 'Para ver tu peña necesitas iniciar sesión'
	},
	{
		path: '/notification/my',
		message: 'Para ver tus notificaciones necesitas iniciar sesión'
	},
	{
		path: '/profile',
		message: 'Para ver tu perfil necesitas iniciar sesión'
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
	},
	profile: {
		name: 'Perfil',
		url: '/profile'
	}
};
