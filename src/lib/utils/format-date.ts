// Único sitio con el locale 'es-ES' hardcodeado para fechas (antes repetido
// en cuatro componentes distintos, cada uno con sus propias opciones).
const LOCALE = 'es-ES';

// Necesaria en servidor (p. ej. al construir el texto de una notificación
// push): el runtime de Vercel corre en UTC, así que sin fijarla explícitamente
// una actividad de las 20:30 se anunciaría como las 18:30.
export const TIME_ZONE = 'Europe/Madrid';

export function formatTimeShort(date: Date | string): string {
	return new Date(date).toLocaleTimeString(LOCALE, {
		hour: '2-digit',
		minute: '2-digit',
		timeZone: TIME_ZONE
	});
}

export function formatDateLong(date: Date | string): string {
	return new Date(date).toLocaleDateString(LOCALE, {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
}

export function formatDateTimeShort(date: Date | string): string {
	return new Date(date).toLocaleString(LOCALE, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

export function formatWeekdayDay(date: Date | string): string {
	return new Intl.DateTimeFormat(LOCALE, { weekday: 'long', day: 'numeric' }).format(
		new Date(date)
	);
}

export function formatWeekdayDayTime(date: Date | string): string {
	return new Intl.DateTimeFormat(LOCALE, {
		weekday: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	}).format(new Date(date));
}

/**
 * Combina el instante real de una actividad con su descripción festiva.
 * Opción A para actividades de madrugada: `date` es el instante físico real y
 * `dateDesc` lleva el encuadre social (p. ej. "Noche del jueves 10").
 */
export function formatActivityDateTime(
	date: Date | string,
	dateDesc: string | null | undefined
): string {
	const base = formatWeekdayDayTime(date);
	if (!dateDesc) return base;
	return `${base} · ${dateDesc}`;
}
