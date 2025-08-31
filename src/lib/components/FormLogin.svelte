<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { loginSchema } from '../schemas/login.js';
	import SuperDebug from 'sveltekit-superforms';
	import { m } from '../paraglide/messages.js';
	import Inbox from '@lucide/svelte/icons/inbox';
	import { defaults } from 'sveltekit-superforms/client';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { authClient } from '$lib/auth-client';
	import cn from 'clsx';

	import FormFields from './FormFields.svelte';
	import { zodToFieldsJsonSchema } from '../schemas/utils.js';

	import { PinInput, REGEXP_ONLY_DIGITS, type PinInputRootSnippetProps } from 'bits-ui';

	export type Props = {
		debug?: boolean;
		afterCancelCallback?: () => void;
	};

	let { debug = false, afterCancelCallback = () => {} }: Props = $props();

	let message = $state<{ type: 'success' | 'error'; text: string } | null>(null);
	let step = $state<number>(1);
	let otp = $state('');

	const uid = $props.id();

	const formValidated = defaults({ email: '' }, zod4(loginSchema));

	const form = superForm(formValidated, {
		id: uid,
		validators: zod4Client(loginSchema),
		dataType: 'json',
		async onSubmit({ cancel }) {
			cancel();
			try {
				message = null;

				const { data, error } = await authClient.emailOtp.sendVerificationOtp({
					email: $formData.email,
					type: 'sign-in'
				});

				if (data?.success) {
					step = 2;
				} else {
					message = {
						type: 'error',
						text: error.message + ': ' + error.statusText
					};
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

	type CellProps = PinInputRootSnippetProps['cells'][0];

	async function onComplete() {
		console.log(otp);
		const { data, error } = await authClient.signIn.emailOtp({
			email: $formData.email,
			otp
		});
		console.log(data, error);
	}
</script>

<div class="mx-auto flex max-w-xs flex-col">
	{#if step == 1}
		<form use:enhance class="flex flex-col" method="POST">
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
	{/if}
	{#if step == 2}
		<PinInput.Root
			bind:value={otp}
			class="group/pininput text-foreground flex items-center has-disabled:opacity-30"
			maxlength={6}
			{onComplete}
			pattern={REGEXP_ONLY_DIGITS}
		>
			{#snippet children({ cells })}
				<div class="flex">
					{#each cells.slice(0, 3) as cell, i (i)}
						{@render Cell(cell)}
					{/each}
				</div>

				<div class="flex w-10 items-center justify-center">
					<div class="bg-border h-1 w-3 rounded-full"></div>
				</div>

				<div class="flex">
					{#each cells.slice(3, 6) as cell, i (i)}
						{@render Cell(cell)}
					{/each}
				</div>
			{/snippet}
		</PinInput.Root>

		{#snippet Cell(cell: CellProps)}
			<PinInput.Cell
				{cell}
				class={cn(
					// Custom class to override global focus styles
					'focus-override',
					'relative h-14 w-10 text-[2rem]',
					'flex items-center justify-center',
					'transition-all duration-75',
					'border-foreground/20 border-y border-r first:rounded-l-md first:border-l last:rounded-r-md',
					'text-foreground group-focus-within/pininput:border-foreground/40 group-hover/pininput:border-foreground/40',
					'outline-0',
					'data-active:outline-1 data-active:outline-white'
				)}
			>
				{#if cell.char !== null}
					<div>
						{cell.char}
					</div>
				{/if}
				{#if cell.hasFakeCaret}
					<div
						class="animate-caret-blink pointer-events-none absolute inset-0 flex items-center justify-center"
					>
						<div class="h-8 w-px bg-white"></div>
					</div>
				{/if}
			</PinInput.Cell>
		{/snippet}
	{/if}

	<ul class="steps">
		<li class="step step-primary">Email</li>
		<li class="step {step == 2 ? 'step-primary' : ''}">Validar</li>
	</ul>
</div>
