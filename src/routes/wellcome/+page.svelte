<script lang="ts">
	import { Routes } from '$lib/routes';
	import wellcome from '$lib/stores/wellcome';

	import type { PageData } from './$types';

	export let data: PageData;

	if (data.userIsLogged) {
		wellcome.update((value) => {
			return {
				...value,
				login: true
			};
		});
	}
</script>

<div class="flex flex-col">
	<div class="hero">
		<div class="hero-content text-center">
			<div class="max-w-md">
				<h1 class="text-5xl font-bold">Hola</h1>
				<p class="py-6">
					Bienvenido/a a Peñas de Montemayor de Pililla. Un mapa con todas las peñas del pueblo.
				</p>
			</div>
		</div>
	</div>
	<div class="container mx-auto px-4">
		<ul class="steps">
			<li class="step {$wellcome.login ? 'step-primary' : ''}">
				<a href={Routes.login.url}>Logeate</a>
			</li>
			<li class="step {$wellcome.profileName ? 'step-primary' : ''}">
				<a href={Routes.profile.url}>Edita tu nombre de usuario</a>
			</li>
			<li class="step {$wellcome.addGang ? 'step-primary' : ''}">
				<a href={Routes.profile.url}>Añade tu peña</a>
			</li>
			<li class="step {$wellcome.reviewGang ? 'step-primary' : ''}">
				<a href={Routes.notification_my.url}>Revisa las peñas creadas por otros usuarios</a>
			</li>
		</ul>
	</div>
</div>
