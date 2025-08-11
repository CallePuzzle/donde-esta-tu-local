<script lang="ts">
	import FormString from './FormString.svelte';
	import type { SuperForm } from 'sveltekit-superforms';
	import type { SuperFormData } from 'sveltekit-superforms/client';
	import type { Fields } from '$lib/schemas/utils.js';

	export type Props = {
		form: SuperForm<any, any>;
		formData: SuperFormData<any>;
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
			type={(field.format as string) ?? 'text'}
			placeholder={field.placeholder}
			description={(field.description as string) ?? undefined}
			required={field.required}
		/>
	{/each}
</div>
