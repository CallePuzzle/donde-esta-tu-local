<script lang="ts">
	import FormString from './FormString.svelte';
	import type { SuperForm } from 'sveltekit-superforms';
	import type { SuperFormData } from 'sveltekit-superforms/client';
	import type { Fields } from '$lib/schemas/utils.js';

	export type Props = {
		// eslint-disable-next-line  @typescript-eslint/no-explicit-any
		form: SuperForm<any, unknown>;
		formData: SuperFormData<Record<string, unknown>>;
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
