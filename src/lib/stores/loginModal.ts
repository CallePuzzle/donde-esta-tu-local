import { writable } from 'svelte/store';
import type Modal from '$lib/components/Modal.svelte';

function createModalStore() {
	const { subscribe, set, update } = writable<Modal | null>(null);

	return {
		subscribe,
		set,
		update,
		open: (modal: Modal) => set(modal),
		close: () => {
			update((modal) => {
				modal?.close();
				return null;
			});
		},
		reset: () => set(null)
	};
}

export const loginModalStore = createModalStore();
