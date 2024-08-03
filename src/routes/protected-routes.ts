interface ProtectedRoute {
	path: string;
	message: string;
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
