import { m } from './paraglide/messages.js';

import type { RouteId } from '$app/types';
import type { RouteMap } from '@callepuzzle/core';

import Map from '@lucide/svelte/icons/map';
import UserCircle from '@lucide/svelte/icons/user-circle';
import MapPinPlus from '@lucide/svelte/icons/map-pin-plus';
import Calendar from '@lucide/svelte/icons/calendar';
import Shield from '@lucide/svelte/icons/shield';
import Users from '@lucide/svelte/icons/users';
import UsersRound from '@lucide/svelte/icons/users-round';
// import Megaphone from '@lucide/svelte/icons/megaphone';

// Factoría, no `const`: las etiquetas `m.*` se resuelven en render, nunca en
// scope de módulo (regla dura de la librería, ver docs/i18n.md). La clave del
// mapa ES la ruta y no hay `isProtected`: la protección real vive en los
// +layout.server.ts. Ojo: el `getMenuRoutes` de la librería filtra ESTRICTO por
// `showInMenu` en escritorio y por `showInMobile` en móvil (el filtro local
// hacía la unión de ambos), así que toda ruta que deba salir en los dos menús
// declara los dos flags.
export function getRoutes(): RouteMap<RouteId> {
	return {
		'/': {
			label: m.routes_home(),
			icon: Map,
			showInMenu: false,
			showInMobile: true
		},
		'/gang/add': {
			label: m.routes_gang_add(),
			short: m.routes_gang_add_short(),
			icon: MapPinPlus,
			showInMenu: true,
			showInMobile: true
		},
		'/activities': {
			label: m.routes_activities(),
			short: m.routes_activities_short(),
			icon: Calendar,
			showInMenu: true,
			showInMobile: true
		},
		'/profile': {
			label: m.routes_profile(),
			icon: UserCircle,
			showInMenu: false,
			showInMobile: true
		},
		'/admin': {
			label: m.routes_admin(),
			icon: Shield,
			showInMenu: false
		},
		'/admin/gangs': {
			label: m.routes_admin_gangs(),
			icon: Users,
			showInMenu: false
		},
		'/admin/members': {
			label: m.routes_admin_members(),
			icon: UsersRound,
			showInMenu: false
		}
	};
}
