<script lang="ts">
	import { currentNotification } from '$lib/stores/validationCurrentNotification';
	import { Routes } from '$lib/routes';

	export let userId: number;
	export let type: string;
	export let buttonType: string = 'btn-accent';
	export let buttonMessage: string = 'Validar';
</script>

<form method="POST" action="{Routes.notification_my.url}?/{type}" class="grow m-3">
	<label>
		<input type="hidden" class="input w-full max-w-xs" name="userId" value={userId} />
	</label>
	<label>
		<input
			type="hidden"
			class="input w-full max-w-xs"
			name="notificationId"
			value={$currentNotification.id}
		/>
	</label>
	<button type="submit" class="btn {buttonType} w-full">{buttonMessage}</button>
</form>
