<script lang="ts">
	import { currentNotification } from '$lib/stores/validationCurrentNotification';
	import ValidateForm from './ValidateForm.svelte';

	export let userId: number;
</script>

<div class="modal-box">
	<h3 class="text-lg font-bold py-4">Validar nuevo miembro/a</h3>
	<p class="pt-4">
		{$currentNotification.addedBy?.name} quiere ser miembro/a de la peña:
		<span class="">{$currentNotification.relatedGang?.name}</span>
	</p>
	{#if $currentNotification.status === 'PENDING'}
		<div class="flex items-stretch">
			<ValidateForm {userId} type="validateMember" />
			<ValidateForm {userId} type="refuseMember" buttonType="btn-error" buttonMessage="Rechazar" />
		</div>
	{/if}
</div>
