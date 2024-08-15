<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Routes } from '$lib/routes';
	import wellcome from '$lib/stores/wellcome';

	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	onMount(async () => {
		if (form?.success) {
			const redirect = !$wellcome.profileName;
			wellcome.update((value) => {
				return {
					...value,
					profileName: true
				};
			});
			if (redirect) {
				goto(Routes.wellcome.url);
			}
		}
	});

	function showMyGangModal() {
		document.getElementById('my_gang').showModal();
	}
</script>

<div class="flex flex-col">
	<div class="hero">
		<div class="hero-content text-center">
			<div class="max-w-md">
				<h1 class="text-5xl font-bold">
					Hola {#if data.user.name}{data.user.name}{/if}
				</h1>
				<p class="py-6">
					Tienes {data.notificationsCount} notificaciones pendientes
					<a href={Routes.notification_my.url} class="btn">Ver notificaciones</a>
				</p>
			</div>
		</div>
	</div>
	<div class="container mx-auto px-4">
		<form class="mt-8" method="POST" action="?/save">
			<div class="mb-4">
				<label for="name" class="">Nombre:</label>
				<input
					type="text"
					name="name"
					value={data.user?.name}
					class="input w-full max-w-xs border-solid border-slate-600"
					required
				/>
			</div>
			<div class="mb-4">
				<label for="gang" class="">Peña:</label>
				<button on:click={showMyGangModal} class="btn">{data.user?.gang?.name || 'Añadir una peña'}</button>
			</div>
			<div class="flex items-center justify-between">
				<button type="submit" class="btn btn-accent">Guardar</button>
			</div>
		</form>
	</div>
</div>

<dialog id="my_gang" class="modal">
  <div class="modal-box">
    <h3 class="text-lg font-bold">Hello!</h3>
    <p class="py-4">Press ESC key or click the button below to close</p>
    <div class="modal-action">
      <form method="dialog">
        <!-- if there is a button in form, it will close the modal -->
        <button class="btn">Close</button>
      </form>
    </div>
  </div>
</dialog>