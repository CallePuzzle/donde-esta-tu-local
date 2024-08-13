<script lang="ts">
	import { Routes } from '$lib/routes';

	import type { PageData } from './$types';

	export let data: PageData;
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
			<div class="flex items-center justify-between">
				<button type="submit" class="btn btn-accent">Guardar</button>
			</div>
		</form>
	</div>
</div>
