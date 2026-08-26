<script lang="ts">
	import Modal from '$lib/components/Modal.svelte';
	import FormGangImage from './FormGangImage.svelte';
	import Camera from '@lucide/svelte/icons/camera';
	import { m } from '$lib/paraglide/messages.js';

	import type { SuperValidated } from 'sveltekit-superforms';
	import type { GangImageSchema } from '$lib/schemas/gang.js';

	export type Props = {
		name: string;
		image: string | null;
		canUpload: boolean;
		dataForm: SuperValidated<GangImageSchema> | null;
		pageStatus: number;
	};

	let { name, image, canUpload, dataForm, pageStatus }: Props = $props();

	let photoModal: Modal | undefined = $state();
	let uploadModal: Modal | undefined = $state();
</script>

<div class="flex items-center gap-1">
	{#if image}
		<button
			type="button"
			class="avatar cursor-zoom-in"
			aria-label={m.gang_image_view({ name })}
			onclick={() => photoModal?.showModal()}
		>
			<div class="w-16 rounded-lg md:w-20">
				<img src={image} alt="" />
			</div>
		</button>
	{/if}

	{#if canUpload}
		<div class="tooltip" data-tip={m.gang_image_add()}>
			<button
				type="button"
				class="btn btn-circle btn-ghost btn-sm"
				aria-label={image ? m.gang_image_change() : m.gang_image_add()}
				onclick={() => uploadModal?.showModal()}
			>
				<Camera />
			</button>
		</div>
	{/if}
</div>

{#if image}
	<Modal
		title={m.gang_image_upload_title()}
		showButton={false}
		boxClass="modal-box max-w-3xl"
		bind:this={photoModal}
	>
		<h3 class="text-lg font-bold">{m.gang_image_upload_title()}</h3>
		<img class="mt-4 w-full rounded-lg" src={image} alt={m.gang_image_alt({ name })} />
	</Modal>
{/if}

{#if canUpload}
	<Modal title={m.gang_image_upload_title()} showButton={false} type="X" bind:this={uploadModal}>
		<h3 class="text-lg font-bold">{m.gang_image_upload_title()}</h3>
		{#if dataForm}
			<FormGangImage {dataForm} {pageStatus} onUploaded={() => uploadModal?.close()} />
		{/if}
	</Modal>
{/if}
