<script lang="ts">
	import { Routes } from '$lib/routes';
	import { enhance } from '$app/forms';

	let sending = false;
	let confirm = false;

	async function handleSubmit({
		submitter,
		formData,
		cancel
	}: {
		formData: FormData;
		submitter: HTMLButtonElement;
		cancel: () => void;
	}) {
		sending = true;
		if (submitter.innerText === 'Mandar') {
			const message = formData.get('message');
			const response = await fetch(Routes.events_check.url as string);
			console.log(response);
			const ret = await response.json();
			console.log(ret);
			cancel();
			if (ret.length > 0) {
				sending = false;
				confirm = true;
				cancel();
			}
		}
		return ({ update }: { update: (options?: { invalidateAll?: boolean }) => Promise<void> }) => {
			// Set invalidateAll to false if you don't want to reload page data when submitting
			update({ invalidateAll: true }).finally(async () => {
				sending = false;
			});
		};
	}
</script>

<div class="hero">
	<div class="hero-content text-center">
		<div class="max-w-md">
			<h1 class="text-5xl font-bold">{Routes.events.name}</h1>
			<p class="py-3">
				Manda una notificación a todos los usuarios con un mensaje sobre un evento de tu peña.
			</p>
			<p class="py-3">
				Por ejemplo: <span class="italic">Tamara KPY dice: "Chupitada en la peña en 15min!"</span>
			</p>
			<div role="alert" class="alert alert-warning py-3">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 shrink-0 stroke-current"
					fill="none"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>
				<span
					>Aviso: Sólo se permite un mensaje por peña cada 2 horas, usalo con responsabilidad</span
				>
			</div>
			<button class="btn btn-primary" onclick="send_event.showModal()">Manda un mensaje</button>
		</div>
	</div>
</div>

<dialog id="send_event" class="modal">
	<div class="modal-box">
		<div class="container pt-6">
			<form method="POST" action="?/send" class="flex flex-col" use:enhance={handleSubmit}>
				<label class="m-3"
					><input
						type="text"
						placeholder="Mensaje"
						class="input w-full"
						required
						name="message"
					/></label
				>
				{#if sending}
					<span class="loading loading-dots loading-lg"></span>
				{:else if confirm}
					<div class="alert alert-warning m-1 flex flex-col">
						<p>Parece que ya existe una o varias peñas con un nombre parecido:</p>
					</div>
					<p class="alert alert-warning m-1">¿Quieres añadir esta peña de todas formas?</p>
					<button type="submit" class="btn btn-accent m-3">Confirmar</button>
					<button type="reset" class="btn btn-error m-3">Cancelar</button>
				{:else}
					<button type="submit" class="btn btn-accent m-3">Mandar</button>
				{/if}
			</form>
		</div>

		<div class="modal-action">
			<form method="dialog">
				<!-- if there is a button in form, it will close the modal -->
				<button class="btn">Close</button>
			</form>
		</div>
	</div>
</dialog>
