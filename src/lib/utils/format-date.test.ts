import { describe, expect, it } from 'vitest';
import {
	formatDateLong,
	formatDateTimeShort,
	formatWeekdayDay,
	formatWeekdayDayTime
} from './format-date';

// TZ fija para que los tests no dependan de la zona horaria local (fallarían
// en TZ ≥ UTC+13, donde 12:34 UTC ya es el día siguiente)
process.env.TZ = 'Europe/Madrid';

// 2026-03-05 12:34 UTC es jueves
const date = new Date('2026-03-05T12:34:00Z');

describe('format-date', () => {
	it('formatDateLong: año, mes largo y día', () => {
		expect(formatDateLong(date)).toBe('5 de marzo de 2026');
	});

	it('formatDateTimeShort: año, mes corto, día y hora', () => {
		expect(formatDateTimeShort(date)).toContain('2026');
		expect(formatDateTimeShort(date)).toMatch(/mar/i);
	});

	it('formatWeekdayDay: día de la semana y número', () => {
		expect(formatWeekdayDay(date)).toBe('jueves 5');
	});

	it('formatWeekdayDayTime: incluye hora y minuto', () => {
		expect(formatWeekdayDayTime(date)).toMatch(/jueves/i);
	});
});
