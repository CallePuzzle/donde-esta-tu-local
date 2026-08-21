<script lang="ts" generics="T extends Record<string, unknown>">
	import { Control, Field, FieldErrors, Description } from 'formsnap';
	import { m } from '../paraglide/messages.js';
	import type { SuperForm, FormPath } from 'sveltekit-superforms';
	import type { SuperFormData } from 'sveltekit-superforms/client';

	type Props = {
		form: SuperForm<T, unknown>;
		formData: SuperFormData<T>;
		field: string;
		type: string;
		placeholder: string;
		description?: string;
		required?: boolean;
	};

	let { form, formData, field, type, placeholder, description, required = false }: Props = $props();

	// field llega como string desde los campos generados en tiempo de ejecución a
	// partir del schema (ver $lib/schemas/utils.ts); no hay forma de que TypeScript
	// verifique estáticamente que corresponde a una clave real de T.
	const fieldPath = $derived(field as FormPath<T>);
</script>

<Field {form} name={fieldPath}>
	<Control>
		{#snippet children({ props })}
			<fieldset class={type == 'hidden' ? 'fieldset hidden' : 'fieldset'}>
				{#if description}
					<legend class="fieldset-legend"><Description>{description}</Description></legend>
				{/if}
				<input
					class="input w-full"
					{...props}
					{type}
					bind:value={$formData[field]}
					{placeholder}
					{required}
				/>
				{#if required}
					<p class="fieldset-label">{m.form_required()}</p>
				{:else}
					<p class="fieldset-label">{m.form_optional()}</p>
				{/if}
			</fieldset>
		{/snippet}
	</Control>
	<FieldErrors />
</Field>
