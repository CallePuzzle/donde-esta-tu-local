import { browser } from '$app/environment';
import { writable } from 'svelte/store';

interface Wellcome {
	wellcome: boolean;
	login: boolean;
	profileName: boolean;
	addGang: boolean;
	reviewGang: boolean;
}

export const defaultValue = {
	wellcome: false,
	login: false,
	profileName: false,
	addGang: false,
	reviewGang: false
} as Wellcome;

const _initialValue = browser ? window.localStorage.getItem('wellcome') : false;

const initialValue = _initialValue
	? JSON.parse(window.localStorage.getItem('wellcome') || '{}') ?? defaultValue
	: defaultValue;

const wellcome = writable<Wellcome>(initialValue);

wellcome.subscribe((value: Wellcome) => {
	if (browser) {
		window.localStorage.setItem('wellcome', JSON.stringify(value));
	}
});

export default wellcome;
