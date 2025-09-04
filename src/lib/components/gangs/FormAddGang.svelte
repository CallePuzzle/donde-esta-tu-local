<script lang="ts">
	import { goto } from '$app/navigation';
	import SuperDebug from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms/client';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import FormFields from '$lib/components/FormFields.svelte';
	import { zodToFieldsJsonSchema } from '$lib/schemas/utils.js';
	import { addGangSchema } from '$lib/schemas/gang.js';

	import type { SuperValidated } from 'sveltekit-superforms';
	import type { AddGangSchema } from '$lib/schemas/gang.js';
	import type { LatLng } from '$lib/components/gangs/types.ts';
	import type { Snippet } from 'svelte';
	import type { RouteId } from '$app/types';

	export type Props = {
		dataForm: SuperValidated<AddGangSchema>;
		latlng: LatLng;
		pageStatus: number;
		buttonText: Snippet;
		callbackUrl?: Partial<RouteId>;
		debug?: boolean;
	};

	let { dataForm, latlng, pageStatus, buttonText, callbackUrl, debug = false }: Props = $props();

	const uid = $props.id();

	const form = superForm(dataForm, {
		id: uid,
		validators: zod4Client(addGangSchema),
		dataType: 'json',
		resetForm: false,
		onResult({ result }) {
			if (result.type === 'success' && callbackUrl) {
				setTimeout(() => {
					// eslint-disable-next-line
					goto(callbackUrl);
				}, 1000);
			}
		}
	});

	const { form: formData, enhance, delayed, message } = form;

	const fields = zodToFieldsJsonSchema(addGangSchema);

	const filteredFields = fields.filter((field) => field.name !== 'lat' && field.name !== 'lng');

	$effect(() => {
		if (latlng.lat !== undefined && latlng.lng !== undefined) {
			$formData.lat = latlng.lat;
			$formData.lng = latlng.lng;
		}
	});

	let messageClass = $derived.by(() => {
		if (pageStatus === 200) return 'alert-success';
		if (pageStatus === 400) return 'alert-warning';
		if (pageStatus === 500) return 'alert-error';
	});
</script>

<form use:enhance class="mx-auto flex max-w-xs flex-col" method="POST">
	<FormFields {form} {formData} fields={filteredFields} />
	<input type="hidden" name="lat" bind:value={$formData.lat} />
	<input type="hidden" name="lng" bind:value={$formData.lng} />
	<div class="my-2 flex flex-col items-center">
		{#if $delayed}
			<span class="loading loading-lg loading-dots"></span>
		{:else}
			<button class="btn w-fit btn-accent">{@render buttonText()}</button>
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
