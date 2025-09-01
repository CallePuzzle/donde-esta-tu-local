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
	import Dot from '@lucide/svelte/icons/dot';
	import { invalidateAll } from '$app/navigation';

	import FormFields from './FormFields.svelte';
	import { zodToFieldsJsonSchema } from '../schemas/utils.js';

	import { PinInput, REGEXP_ONLY_DIGITS, type PinInputRootSnippetProps } from 'bits-ui';

	export type Props = {
		debug?: boolean;
		afterCancelCallback?: () => void;
	};

	let { debug = false, afterCancelCallback = () => {} }: Props = $props();

	let message = $state<{ type: 'success' | 'error'; text: string } | null>(null);
	let sending = $state(false);
	let step = $state<number>(1);
	let otp = $state('');

	const uid = $props.id();

	const formValidated = defaults({ email: '' }, zod4(loginSchema));

	const form = superForm(formValidated, {
		id: uid,
		validators: zod4Client(loginSchema),
		dataType: 'json',
		async onSubmit({ cancel }) {
			sending = true;
			cancel();
			try {
				message = null;

				const { data, error } = await authClient.emailOtp.sendVerificationOtp({
					email: $formData.email,
					type: 'sign-in'
				});
				sending = false;
				if (data?.success) {
					step = 2;
				}
				if (error) {
					message = {
						type: 'error',
						text: error.message + ': ' + error.statusText
					};
				}
			} catch (error) {
				message = {
					type: 'error',
					text: error as string
				};
			}
		}
	});
	const { form: formData, enhance } = form;

	const fields = zodToFieldsJsonSchema(loginSchema);

	type CellProps = PinInputRootSnippetProps['cells'][0];

	async function onComplete() {
		sending = true;
		const { error } = await authClient.signIn.emailOtp({
			email: $formData.email,
			otp
		});
		sending = false;
		if (error) {
			message = {
				type: 'error',
				text: error.message + ': ' + error.statusText
			};
		} else {
			message = {
				type: 'success',
				text: m.form_login_success()
			};
			await invalidateAll();
			afterCancelCallback();
		}
	}
</script>

<div class="mx-auto flex max-w-xs flex-col justify-center">
	<ul class="steps">
		<li class="step step-primary">Introduce tu email</li>
		<li class="step {step == 2 ? 'step-primary' : ''}">Valida el código</li>
	</ul>
	<div class="divider"></div>
	{#if step == 1}
		<form use:enhance class="flex flex-col" method="POST">
			<FormFields {form} {formData} {fields} />
			<div class="my-2 flex justify-center">
				{#if sending}
					<span class="loading loading-lg loading-dots"></span>
				{:else if message}
					<div class="alert {message.type === 'success' ? 'alert-success' : 'alert-error'} text-sm">
						{message.text}
					</div>
				{:else}
					<button class="btn w-42 btn-accent"><Inbox />{m.form_login_sign_in()}</button>
				{/if}
			</div>
		</form>
		{#if debug}
			<SuperDebug data={$formData} />
		{/if}
	{/if}
	{#if step == 2}
		{#if sending}
			<span class="loading loading-lg loading-dots"></span>
		{:else if message}
			<div class="alert {message.type === 'success' ? 'alert-success' : 'alert-error'} text-sm">
				{message.text}
			</div>
		{:else}
			<PinInput.Root
				bind:value={otp}
				class="group/pininput text-foreground flex items-center has-disabled:opacity-30"
				maxlength={6}
				{onComplete}
				pattern={REGEXP_ONLY_DIGITS}
			>
				{#snippet children({ cells })}
					{#each cells.slice(0, 5) as cell, i (i)}
						<div class="flex">
							{@render Cell(cell)}
						</div>
						<div class="flex w-5 items-center justify-center">
							<Dot />
						</div>
					{/each}
					{#each cells.slice(5, 6) as cell, i (i)}
						<div class="flex">
							{@render Cell(cell)}
						</div>
					{/each}
				{/snippet}
			</PinInput.Root>
		{/if}

		{#snippet Cell(cell: CellProps)}
			<PinInput.Cell
				{cell}
				class="focus-override border-foreground/20 text-foreground group-focus-within/pininput:border-foreground/40 group-hover/pininput:border-foreground/40
				relative flex h-14
				w-9 items-center
				justify-center border-y border-r text-[2rem] outline-0 transition-all
				duration-75 first:rounded-l-md first:border-l
				last:rounded-r-md
				data-active:outline-1 data-active:outline-white"
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
		<p class="py-2">Introduce el código que has recibido en el correo</p>
	{/if}
	<div class="flex justify-center">
		<a class="btn w-42 btn-error" href="/" data-sveltekit-reload>Reset</a>
	</div>
</div>
