import { browser } from '$app/environment';

// No existe un único flag cross-browser para "¿está instalada?": display-mode
// cubre Chrome/Edge/Android, navigator.standalone es exclusivo de iOS Safari,
// y el referrer android-app:// cubre las TWA. Se combinan las tres señales.
function detectStandalone(): boolean {
	if (!browser) return false;
	const nav = navigator as Navigator & { standalone?: boolean };
	return (
		window.matchMedia('(display-mode: standalone)').matches ||
		window.matchMedia('(display-mode: fullscreen)').matches ||
		window.matchMedia('(display-mode: minimal-ui)').matches ||
		nav.standalone === true ||
		document.referrer.startsWith('android-app://')
	);
}

let isStandalone = $state(detectStandalone());

if (browser) {
	// display-mode puede cambiar sin recargar la pestaña (p.ej. Chrome Android
	// justo después de instalar), así que se escucha el cambio en vez de comprobarlo una sola vez.
	window
		.matchMedia('(display-mode: standalone)')
		.addEventListener('change', () => (isStandalone = detectStandalone()));
}

export const pwaInstallStore = {
	get isStandalone() {
		return isStandalone;
	}
};
