<script lang="ts">
	import SuperDebug from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms/client';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { m } from '$lib/paraglide/messages.js';
	import UserPlus from '@lucide/svelte/icons/user-plus';

	import { newMemberSchema } from '$lib/schemas/gang.js';

	import type { SuperValidated } from 'sveltekit-superforms';
	import type { NewMemberSchema } from '$lib/schemas/gang.js';

	export type Props = {
		dataForm: SuperValidated<NewMemberSchema>;
		userId: string;
		gangId: number;
		pageStatus: number;
		debug?: boolean;
	};

	let { dataForm, userId, gangId, pageStatus, debug = false }: Props = $props();

	const uid = $props.id();

	const form = superForm(dataForm, {
		id: uid,
		validators: zod4Client(newMemberSchema),
		dataType: 'json'
	});

	const { form: formData, enhance, delayed, message } = form;

	$effect(() => {
		$formData.userId = userId;
		$formData.gangId = gangId;
	});

	let messageClass = $derived.by(() => {
		if (pageStatus === 200) return 'alert-success';
		if (pageStatus === 400) return 'alert-warning';
		if (pageStatus === 500) return 'alert-error';
	});
</script>

<form use:enhance class="mx-auto flex max-w-xs flex-col" method="POST">
	<input type="hidden" name="userId" bind:value={$formData.userId} />
	<input type="hidden" name="gangId" bind:value={$formData.gangId} />
	<div class="my-2 flex flex-col items-center">
		{#if $delayed}
			<span class="loading loading-lg loading-dots"></span>
		{:else}
			<button class="btn w-fit btn-accent"><UserPlus />{m.form_gang_add_submit()}</button>
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
