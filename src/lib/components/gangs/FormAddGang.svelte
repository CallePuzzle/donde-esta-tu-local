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
	import type { ResolvedPathname } from '$app/types';

	export type Props = {
		dataForm: SuperValidated<AddGangSchema>;
		latlng: LatLng;
		pageStatus: number;
		buttonText: Snippet;
		callbackUrl?: Partial<ResolvedPathname>;
		debug?: boolean;
	};

	let { dataForm, latlng, pageStatus, buttonText, callbackUrl, debug = false }: Props = $props();

	const uid = $props.id();

	// T5: superForm(dataForm) debe llamarse una sola vez por instancia (gestiona
	// su propio estado reactivo internamente); envolverlo en $derived o una
	// closure lo reinvocaría en cada cambio de dataForm y rompería el
	// formulario. No es el mismo bug que B9 (ver su commit).
	// svelte-ignore state_referenced_locally
	const form = superForm(dataForm, {
		id: uid,
		validators: zod4Client(addGangSchema),
		dataType: 'json',
		resetForm: false,
		onResult({ result }) {
			if (result.type === 'success' && callbackUrl) {
				setTimeout(() => {
					goto(callbackUrl);
				}, 1000);
			}
		}
	});

	const { form: formData, enhance, delayed, message } = form;

	const fields = zodToFieldsJsonSchema(addGangSchema);

	const filteredFields = fields.filter((field) => field.name !== 'lat' && field.name !== 'lng');

	// latlng.lat/lng nunca son undefined (LatLng los tipa como number), así que
	// no hace falta comprobarlo; se sincronizan en $formData porque son los
	// campos que se envían (dataType: 'json' serializa $formData entero).
	$effect(() => {
		$formData.lat = latlng.lat;
		$formData.lng = latlng.lng;
	});

	let messageClass = $derived.by(() => {
		if (pageStatus === 200) return 'alert-success';
		if (pageStatus >= 500) return 'alert-error';
		if (pageStatus >= 400) return 'alert-warning';
		return 'alert-info';
	});
</script>

<form use:enhance class="mx-auto flex max-w-xs flex-col" method="POST">
	<FormFields {form} {formData} fields={filteredFields} />
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
