import { browser } from '$app/environment';
import { writable } from 'svelte/store';

interface Wellcome {
	installed: boolean;
	login: boolean;
	profileName: boolean;
	addGang: boolean;
}

export const defaultValue = {
	installed: false,
	login: false,
	profileName: false,
	addGang: false
} as Wellcome;

const _initialValue = browser ? window.localStorage.getItem('wellcome') : false;

const initialValue = _initialValue
	? (JSON.parse(window.localStorage.getItem('wellcome') || '{}') ?? defaultValue)
	: defaultValue;

const wellcome = writable<Wellcome>(initialValue);

wellcome.subscribe((value: Wellcome) => {
	if (browser) {
		window.localStorage.setItem('wellcome', JSON.stringify(value));
	}
});

export default wellcome;
