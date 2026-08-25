export type Os = 'ios' | 'android' | 'desktop';
export type BrowserKind = 'safari' | 'chrome' | 'firefox' | 'samsung' | 'edge' | 'in-app' | 'other';

export function detectOs(userAgent: string): Os {
	if (/ip(hone|ad|od)/i.test(userAgent)) return 'ios';
	if (/android/i.test(userAgent)) return 'android';
	return 'desktop';
}

// Orden importante: los navegadores in-app, Edge, Samsung Internet y Chrome
// en iOS todos incluyen "Chrome" y/o "Safari" en su user-agent, así que las
// comprobaciones más específicas van antes que las genéricas.
export function detectBrowser(userAgent: string): BrowserKind {
	if (/fban|fbav|instagram|line\/|micromessenger|twitter/i.test(userAgent)) return 'in-app';
	if (/edg(a|ios)?\//i.test(userAgent)) return 'edge';
	if (/samsungbrowser/i.test(userAgent)) return 'samsung';
	if (/crios|chrome/i.test(userAgent)) return 'chrome';
	if (/firefox|fxios/i.test(userAgent)) return 'firefox';
	if (/safari/i.test(userAgent)) return 'safari';
	return 'other';
}
