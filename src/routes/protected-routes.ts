interface ProtectedRoute {
	path: string;
	message: string;
}

export const ProtectedRoutes: ProtectedRoute[] = [
	{
		path: '/gangs',
		message: 'No tienes permisos para ver las bandas'
	}
];
