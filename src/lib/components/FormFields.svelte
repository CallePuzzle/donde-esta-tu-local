<script lang="ts" generics="T extends Record<string, unknown>">
	import FormString from './FormString.svelte';
	import type { SuperForm } from 'sveltekit-superforms';
	import type { SuperFormData } from 'sveltekit-superforms/client';
	import type { Fields } from '$lib/schemas/utils.js';

	type Props = {
		form: SuperForm<T, unknown>;
		formData: SuperFormData<T>;
		fields: Fields;
	};

	let { form, formData, fields }: Props = $props();
</script>

<div>
	{#each fields as field (field.name)}
		<FormString
			{form}
			{formData}
			field={field.name}
			type={field.format ?? 'text'}
			placeholder={field.placeholder}
			description={field.description}
			required={field.required}
		/>
	{/each}
</div>
