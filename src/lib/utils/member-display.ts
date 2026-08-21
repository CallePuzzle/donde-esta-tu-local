import { m } from '$lib/paraglide/messages.js';

// Nombre visible de un miembro: usa el nombre si existe, si no el email.
export function memberDisplayName(member: { name: string | null; email: string | null }): string {
	return member.name || member.email || m.common_no_name();
}

// Inicial para el avatar placeholder, a partir del mismo fallback nombre→email.
export function memberInitial(member: { name: string | null; email: string | null }): string {
	return memberDisplayName(member)[0].toUpperCase();
}
