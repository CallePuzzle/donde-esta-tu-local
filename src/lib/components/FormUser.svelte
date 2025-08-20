<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { updateUserSchema } from '$lib/schemas/user.js';
	import SuperDebug from 'sveltekit-superforms';
	import { m } from '$lib/paraglide/messages.js';
	import UserCheck from '@lucide/svelte/icons/user-check';
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
		dataType: 'json'
	});

	const { form: formData, enhance, delayed, message } = form;

	const fields = zodToFieldsJsonSchema(updateUserSchema);

	let messageClass = $derived.by(() => {
		if ($message && $message.includes('éxito')) return 'alert-success';
		if ($message && $message.includes('Error')) return 'alert-error';
		return 'alert-info';
	});
</script>

<form use:enhance class="mx-auto flex max-w-xs flex-col" method="POST">
	<FormFields {form} {formData} {fields} />
	<div class="my-2 flex flex-col items-center">
		{#if $delayed}
			<span class="loading loading-lg loading-dots"></span>
		{:else}
			<button class="btn w-fit btn-accent"><UserCheck />{m.form_user_update_submit()}</button>
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
