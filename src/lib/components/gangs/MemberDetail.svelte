<script lang="ts">
	import UserRound from '@lucide/svelte/icons/user-round';
	import { m } from '$lib/paraglide/messages.js';
	import Modal from '$lib/components/Modal.svelte';

	export type Props = {
		image: string | null;
		name: string;
	};

	let { name, image }: Props = $props();
	let photoModal: Modal | undefined = $state();
</script>

<div class="flex items-center py-1">
	{#if image}
		<button
			type="button"
			class="avatar flex w-10 cursor-zoom-in items-center justify-center"
			aria-label={m.member_image_view({ name })}
			onclick={() => photoModal?.showModal()}
		>
			<div class="rounded-full">
				<img alt={m.common_avatar_alt({ name })} src={image} />
			</div>
		</button>
	{:else}
		<div class="avatar flex w-10 items-center justify-center">
			<div class="rounded-full">
				<UserRound size={32} />
			</div>
		</div>
	{/if}
	<div class="ml-2">{name}</div>
</div>

{#if image}
	<Modal
		title={m.member_image_alt({ name })}
		showButton={false}
		boxClass="modal-box max-w-3xl"
		bind:this={photoModal}
	>
		<h3 class="text-lg font-bold">{m.member_image_alt({ name })}</h3>
		<img class="mt-4 w-full rounded-lg" src={image} alt={m.member_image_alt({ name })} />
	</Modal>
{/if}
