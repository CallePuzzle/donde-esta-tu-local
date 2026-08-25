<script lang="ts">
	import { superForm, fileProxy } from 'sveltekit-superforms/client';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { gangImageSchema } from '$lib/schemas/gang.js';
	import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from '$lib/schemas/image.js';
	import { m } from '$lib/paraglide/messages.js';
	import Upload from '@lucide/svelte/icons/upload';
	import Image from '@lucide/svelte/icons/image';

	import type { SuperValidated } from 'sveltekit-superforms';
	import type { GangImageSchema } from '$lib/schemas/gang.js';

	export type Props = {
		dataForm: SuperValidated<GangImageSchema>;
		pageStatus: number;
		onUploaded?: () => void;
	};

	let { dataForm, pageStatus, onUploaded }: Props = $props();

	const uid = $props.id();

	// T5: superForm(dataForm) debe llamarse una sola vez por instancia (gestiona
	// su propio estado reactivo internamente); envolverlo en $derived o una
	// closure lo reinvocaría en cada cambio de dataForm y rompería el
	// formulario. No es el mismo bug que B9 (ver su commit).
	// svelte-ignore state_referenced_locally
	const form = superForm(dataForm, {
		id: uid,
		validators: zod4Client(gangImageSchema),
		dataType: 'json',
		resetForm: false,
		onUpdated({ form: result }) {
			if (result.valid && result.message && pageStatus === 200) {
				clearFileSelection();
				onUploaded?.();
			}
		}
	});

	const { enhance, delayed, message } = form;

	// Los mensajes de validación del fichero se generan en cliente, sin respuesta del servidor
	let clientError = $state(false);

	let messageClass = $derived.by(() => {
		if (clientError) return 'alert-error';
		if (pageStatus === 200) return 'alert-success';
		if (pageStatus === 400) return 'alert-warning';
		if (pageStatus === 500) return 'alert-error';
		return 'alert-info';
	});

	let fileInput = fileProxy(form, 'imageFile');
	let previewUrl = $state<string | null>(null);
	let selectedFileName = $state<string | null>(null);

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (file) {
			if (file.size > MAX_FILE_SIZE) {
				$message = m.schema_image_file_size_error();
				clientError = true;
				target.value = '';
				return;
			}

			if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
				$message = m.schema_image_file_type_error();
				clientError = true;
				target.value = '';
				return;
			}

			clientError = false;
			selectedFileName = file.name;

			const reader = new FileReader();
			reader.onload = (e) => {
				previewUrl = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		} else {
			selectedFileName = null;
			previewUrl = null;
		}
	}

	function clearFileSelection() {
		// Asignar un FileList vacío (vía DataTransfer) limpia también el input
		// real gracias a bind:files; solo vaciar el input dejaba el fichero en
		// $formData.
		$fileInput = new DataTransfer().files;
		selectedFileName = null;
		previewUrl = null;
	}
</script>

<form
	use:enhance
	class="mx-auto flex max-w-xs flex-col"
	method="POST"
	action="?/uploadImage"
	enctype="multipart/form-data"
>
	<div class="form-control my-4 w-full">
		<label class="label" for="imageFile">
			<span class="label-text flex items-center gap-2">
				<Image class="h-4 w-4" />
				{m.schema_gang_image_file_label()}
			</span>
		</label>

		<input
			bind:files={$fileInput}
			type="file"
			id="imageFile"
			name="imageFile"
			accept="image/jpeg,image/jpg,image/png,image/webp"
			class="file-input-bordered file-input w-full"
			onchange={handleFileSelect}
		/>

		<div class="label">
			<span class="label-text-alt">{m.schema_image_file_formats()}</span>
			<span class="label-text-alt">{m.schema_image_file_max_size()}</span>
		</div>

		{#if previewUrl}
			<div class="card mt-4 bg-base-200">
				<div class="card-body p-4">
					<h4 class="mb-2 text-sm font-semibold">{m.schema_image_file_preview()}</h4>
					<div class="flex items-center gap-4">
						<div class="avatar">
							<div class="w-20 rounded-lg ring ring-primary ring-offset-2 ring-offset-base-100">
								<img src={previewUrl} alt={m.schema_image_file_preview()} />
							</div>
						</div>
						<div class="flex-1">
							<p class="truncate text-sm">{selectedFileName}</p>
							<button type="button" class="btn mt-2 btn-ghost btn-xs" onclick={clearFileSelection}>
								{m.schema_image_file_remove()}
							</button>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<div class="my-2 flex flex-col items-center">
		{#if $delayed}
			<span class="loading loading-lg loading-dots"></span>
		{:else}
			<button class="btn w-45 btn-accent">
				<Upload />
				{m.form_gang_image_submit()}
			</button>
		{/if}
		{#if $message}
			<div class="my-2 alert {messageClass} text-sm">
				{$message}
			</div>
		{/if}
	</div>
</form>
