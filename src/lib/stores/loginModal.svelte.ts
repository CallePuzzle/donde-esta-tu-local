import type Modal from '$lib/components/Modal.svelte';

let modal = $state<Modal | null>(null);

export const loginModalStore = {
	get value() {
		return modal;
	},
	set value(newModal: Modal | null) {
		modal = newModal;
	}
};
