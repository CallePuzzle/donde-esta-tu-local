<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { addGangSchema } from '$lib/schemas/gang.js';
	import SuperDebug from 'sveltekit-superforms';
	import { m } from '$lib/paraglide/messages.js';
	import CirculePlus from '@lucide/svelte/icons/circle-plus';
	import { defaults } from 'sveltekit-superforms/client';
	import { zod4 } from 'sveltekit-superforms/adapters';

	import FormFields from '$lib/components/FormFields.svelte';
	import { zodToFieldsJsonSchema } from '$lib/schemas/utils.js';

	import type { LatLng } from '$lib/components/gangs/types.ts';

	export type Props = {
		latlng: LatLng;
		debug?: boolean;
	};

	let { latlng, debug = false }: Props = $props();

	let message = $state<{ type: 'success' | 'error'; text: string } | null>(null);

	const uid = $props.id();

	const formValidated = defaults(
		{ name: '', lat: latlng.lat, lng: latlng.lng },
		zod4(addGangSchema)
	);

	const form = superForm(formValidated, {
		id: uid,
		validators: zod4Client(addGangSchema),
		dataType: 'json'
	});
	const { form: formData, enhance, delayed } = form;

	const fields = zodToFieldsJsonSchema(addGangSchema);

	const filteredFields = fields.filter((field) => field.name !== 'lat' && field.name !== 'lng');
</script>

<form use:enhance class="mx-auto flex max-w-xs flex-col" method="POST">
	<FormFields {form} {formData} fields={filteredFields} />
	<input type="hidden" name="lat" value={latlng.lat} />
	<input type="hidden" name="lng" value={latlng.lng} />
	<div class="my-2 flex justify-center">
		{#if $delayed}
			<span class="loading loading-lg loading-dots"></span>
		{:else if message}
			<div class="alert {message.type === 'success' ? 'alert-success' : 'alert-error'} text-sm">
				{message.text}
			</div>
		{:else}
			<button class="btn btn-accent"><CirculePlus />{m.form_gang_add_submit()}</button>
		{/if}
	</div>
</form>
{#if debug}
	<SuperDebug data={$formData} />
{/if}
