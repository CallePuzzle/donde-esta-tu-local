<script lang="ts">

</script>

<dialog id="validate_modal" class="modal">
	<div class="modal-box">
		<h3 class="text-lg font-bold py-4">Validar peña {currentNotification?.data?.gang.name}</h3>
		<div id="map" class="z-0"></div>
		<p class="pt-4">
			{currentNotification?.data?.addedBy?.name} ha añadido una peña nueva:
			<span class="">{currentNotification?.data?.gang.name}</span>
		</p>
		{#if currentNotification?.status === 'PENDING'}
			<div class="flex items-stretch">
				<form method="POST" action="{Routes.add_gang.url}?/validate" class="grow m-3">
					<label
						><input
							type="hidden"
							class="input w-full max-w-xs"
							name="userId"
							value={data.user.id}
						/></label
					>
					<label
						><input
							type="hidden"
							class="input w-full max-w-xs"
							name="notificationId"
							value={currentNotification?.id}
						/></label
					>
					<label
						><input
							type="hidden"
							class="input w-full max-w-xs"
							name="gangId"
							value={currentNotification?.data?.gangId}
						/></label
					>
					<button type="submit" class="btn btn-accent w-full">Validar</button>
				</form>
				<form method="POST" action="{Routes.add_gang.url}?/refuse" class="grow m-3">
					<label
						><input
							type="hidden"
							class="input w-full max-w-xs"
							name="userId"
							value={data.user.id}
						/></label
					>
					<label
						><input
							type="hidden"
							class="input w-full max-w-xs"
							name="notificationId"
							value={currentNotification?.id}
						/></label
					>
					<label
						><input
							type="hidden"
							class="input w-full max-w-xs"
							name="gangId"
							value={currentNotification?.data?.gangId}
						/></label
					>
					<button type="submit" class="btn btn-error w-full">Rechazar</button>
				</form>
			</div>
		{/if}
	</div>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>

