import { describe, expect, it } from 'vitest';
import { detectBrowser, detectOs } from './platform';

const UA = {
	iosSafari:
		'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
	iosChrome:
		'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/125.0.0.0 Mobile/15E148 Safari/604.1',
	androidChrome:
		'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36',
	androidSamsung:
		'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/115.0.0.0 Mobile Safari/537.36',
	androidFirefox: 'Mozilla/5.0 (Android 14; Mobile; rv:126.0) Gecko/126.0 Firefox/126.0',
	desktopChrome:
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
	desktopEdge:
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0',
	desktopSafari:
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
	instagramInApp:
		'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 312.0.0.0.0'
};

describe('detectOs', () => {
	it('detects iOS from iPhone/iPad/iPod user agents', () => {
		expect(detectOs(UA.iosSafari)).toBe('ios');
		expect(detectOs(UA.iosChrome)).toBe('ios');
	});

	it('detects android', () => {
		expect(detectOs(UA.androidChrome)).toBe('android');
	});

	it('falls back to desktop', () => {
		expect(detectOs(UA.desktopChrome)).toBe('desktop');
		expect(detectOs('')).toBe('desktop');
	});
});

describe('detectBrowser', () => {
	it('distinguishes Safari from Chrome on iOS even though both mention Safari', () => {
		expect(detectBrowser(UA.iosSafari)).toBe('safari');
		expect(detectBrowser(UA.iosChrome)).toBe('chrome');
	});

	it('distinguishes Samsung Internet and Edge from plain Chrome', () => {
		expect(detectBrowser(UA.androidSamsung)).toBe('samsung');
		expect(detectBrowser(UA.desktopEdge)).toBe('edge');
		expect(detectBrowser(UA.androidChrome)).toBe('chrome');
		expect(detectBrowser(UA.desktopChrome)).toBe('chrome');
	});

	it('detects Firefox and desktop Safari', () => {
		expect(detectBrowser(UA.androidFirefox)).toBe('firefox');
		expect(detectBrowser(UA.desktopSafari)).toBe('safari');
	});

	it('detects in-app webviews that cannot install a PWA', () => {
		expect(detectBrowser(UA.instagramInApp)).toBe('in-app');
	});
});
