// Único sitio con el locale 'es-ES' hardcodeado para fechas (antes repetido
// en cuatro componentes distintos, cada uno con sus propias opciones).
const LOCALE = 'es-ES';

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
