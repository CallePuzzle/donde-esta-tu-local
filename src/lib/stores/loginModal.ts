import { writable } from 'svelte/store';
import type Modal from '$lib/components/Modal.svelte';

function createModalStore() {
	const { subscribe, set, update } = writable<Modal | null>(null);

	return {
		subscribe,
		set,
		update
	};
}

export const loginModalStore = createModalStore();
