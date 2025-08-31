<script lang="ts">
	import { superForm, fileProxy } from 'sveltekit-superforms/client';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { updateUserSchema } from '$lib/schemas/user.js';
	import SuperDebug from 'sveltekit-superforms';
	import { m } from '$lib/paraglide/messages.js';
	import UserCheck from '@lucide/svelte/icons/user-check';
	import Upload from '@lucide/svelte/icons/upload';
	import Image from '@lucide/svelte/icons/image';
	import FormFields from './FormFields.svelte';
	import { zodToFieldsJsonSchema } from '$lib/schemas/utils.js';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { UpdateUserSchema } from '$lib/schemas/user.js';

	export type Props = {
		dataForm: SuperValidated<UpdateUserSchema>;
		debug?: boolean;
	};

	let { dataForm, debug = false }: Props = $props();

	const uid = $props.id();

	const form = superForm(dataForm, {
		id: uid,
		validators: zod4Client(updateUserSchema),
		dataType: 'json',
		resetForm: false
	});

	const { form: formData, enhance, delayed, message } = form;

	const fields = zodToFieldsJsonSchema(updateUserSchema);

	let messageClass = $derived.by(() => {
		if ($message && $message.includes('éxito')) return 'alert-success';
		if ($message && $message.includes('Error')) return 'alert-error';
		return 'alert-info';
	});

	let fileInput = fileProxy(form, 'imageFile');
	let previewUrl = $state<string | null>(null);
	let selectedFileName = $state<string | null>(null);

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (file) {
			// Validate file size (5MB max)
			if (file.size > 5 * 1024 * 1024) {
				$message = m.schema_user_image_file_size_error();
				target.value = '';
				return;
			}

			// Validate file type
			const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
			if (!acceptedTypes.includes(file.type)) {
				$message = m.schema_user_image_file_type_error();
				target.value = '';
				return;
			}

			selectedFileName = file.name;

			// Create preview URL
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
		if ($fileInput) {
			const input = document.getElementById('imageFile') as HTMLInputElement;
			input.value = '';
		}
		selectedFileName = null;
		previewUrl = null;
	}

	const filteredFields = fields.filter((field) => field.name !== 'imageFile');
</script>

<form
	use:enhance
	class="mx-auto flex max-w-xs flex-col"
	method="POST"
	enctype="multipart/form-data"
>
	<FormFields {form} {formData} fields={filteredFields} />

	<!-- File Upload Section -->
	<div class="form-control my-4 w-full">
		<label class="label" for="imageFile">
			<span class="label-text flex items-center gap-2">
				<Image class="h-4 w-4" />
				{m.schema_user_image_file_label()}
			</span>
			<span class="label-text-alt">{m.form_optional()}</span>
		</label>

		<!-- File Input -->
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
			<span class="label-text-alt">{m.schema_user_image_file_formats()}</span>
			<span class="label-text-alt">{m.schema_user_image_file_max_size()}</span>
		</div>

		<!-- Preview Section -->
		{#if previewUrl}
			<div class="card mt-4 bg-base-200">
				<div class="card-body p-4">
					<h4 class="mb-2 text-sm font-semibold">{m.schema_user_image_file_preview()}</h4>
					<div class="flex items-center gap-4">
						<div class="avatar">
							<div class="w-20 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100">
								<img src={previewUrl} alt="Vista previa" />
							</div>
						</div>
						<div class="flex-1">
							<p class="truncate text-sm">{selectedFileName}</p>
							<button type="button" class="btn mt-2 btn-ghost btn-xs" onclick={clearFileSelection}>
								{m.schema_user_image_file_remove()}
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
				{#if selectedFileName}
					<Upload />
				{:else}
					<UserCheck />
				{/if}
				{m.form_user_update_submit()}
			</button>
		{/if}
		{#if $message}
			<div class="my-2 alert {messageClass} text-sm">
				{$message}
			</div>
		{/if}
	</div>
</form>
{#if debug}
	<SuperDebug data={$formData} />
{/if}
