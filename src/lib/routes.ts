interface ProtectedRoute {
	path: string;
	message: string;
}

interface Route {
	name: string;
	url?: string;
	generateUrl?: (params: any) => string;
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
	check_new_gang: {
		name: 'Comprobar Peña',
		url: '/gang/add/check'
	},
	gang: {
		name: 'Peña',
		generateUrl: (params: { id: string }) => `/gang/${params.id}`
	},
	gang_update: {
		name: 'Actualizar Peña',
		generateUrl: (params: { id: string }) => `/gang/${params.id}/update`
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
	},
	wellcome: {
		name: 'Pantalla de bienvenida',
		url: '/wellcome'
	},
	step_to_install: {
		name: 'Instalar la aplicación',
		url: '/wellcome/step-to-install'
	},
	activities: {
		name: 'Actividades de Peña',
		url: '/activities'
	},
	events: {
		name: 'Mensajes de eventos',
		url: '/events'
	},
	events_check: {
		name: 'Probar eventos',
		url: '/events/check'
	}
};
