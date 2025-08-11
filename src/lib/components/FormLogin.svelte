<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { loginSchema } from '../schemas/login.js';
	import SuperDebug from 'sveltekit-superforms';
	import { m } from '../paraglide/messages.js';
	import Inbox from '@lucide/svelte/icons/inbox';
	import { defaults } from 'sveltekit-superforms/client';
	import { zod } from 'sveltekit-superforms/adapters';
	import { signIn } from '$lib/auth-client';

	import FormFields from './FormFields.svelte';
	import { zodToFieldsJsonSchema } from '../schemas/utils.js';

	export type Props = {
		debug?: boolean;
		afterCancelCallback?: () => void;
	};

	let { debug = false, afterCancelCallback = () => {} }: Props = $props();

	let message = $state<{ type: 'success' | 'error'; text: string } | null>(null);

	const uid = $props.id();

	const formValidated = defaults({ email: '' }, zod(loginSchema));

	const form = superForm(formValidated, {
		id: uid,
		validators: zodClient(loginSchema),
		dataType: 'json',
		async onSubmit({ cancel }) {
			cancel();
			try {
				message = null;
				const result = await signIn.magicLink({
					email: $formData.email
				});
				console.log(result);
				if (result.error) {
					message = {
						type: 'error',
						text: result.error.status + ': ' + result.error.statusText
					};
				} else {
					message = { type: 'success', text: m.form_login_magic_link_sent() };
					afterCancelCallback();
				}
			} catch (error) {
				message = {
					type: 'error',
					text: 'An unexpected error occurred. Please try again.'
				};
			}
		}
	});
	const { form: formData, enhance, delayed } = form;

	const fields = zodToFieldsJsonSchema(loginSchema);
</script>

<form use:enhance class="mx-auto flex max-w-xs flex-col" method="POST">
	<FormFields {form} {formData} {fields} />
	<div class="my-2 flex justify-center">
		{#if $delayed}
			<span class="loading loading-lg loading-dots"></span>
		{:else if message}
			<div class="alert {message.type === 'success' ? 'alert-success' : 'alert-error'} text-sm">
				{message.text}
			</div>
		{:else}
			<button class="btn btn-accent"><Inbox />{m.form_login_sign_in()}</button>
		{/if}
	</div>
</form>
{#if debug}
	<SuperDebug data={$formData} />
{/if}
