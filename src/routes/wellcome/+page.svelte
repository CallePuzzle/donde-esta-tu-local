<script lang="ts">
	import { onMount } from 'svelte';
	import { Routes } from '$lib/routes';
	import wellcome from '$lib/stores/wellcome';

	import type { PageData } from './$types';

	export let data: PageData;
	let isChrome: boolean;

	$: stepsHidden = true;

	if (data.userIsLogged) {
		wellcome.update((value) => {
			return {
				...value,
				login: true
			};
		});
	}

	onMount(async () => {
		if (window.matchMedia('(display-mode: standalone)').matches) {
			wellcome.update((value) => {
				return {
					...value,
					installed: true
				};
			});
		}

		isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
	});

	function showSteps() {
		stepsHidden = !stepsHidden;
	}
</script>

<div class="flex flex-col">
	<div class="hero">
		<div class="hero-content text-center">
			<div class="max-w-md">
				<h1 class="text-5xl font-bold">Hola</h1>
				<p class="py-6">
					Bienvenido/a a Peñas de Montemayor de Pililla. Un mapa con las peñas del pueblo.
				</p>
			</div>
		</div>
	</div>
	<div class="container mx-auto px-4 text-center">
		<ul class="steps w-full">
			<li class="step {$wellcome.installed ? 'step-primary' : ''}">
				<button on:click={showSteps}>{Routes.step_to_install.name}</button>
			</li>
			<li class="step {$wellcome.login ? 'step-primary' : ''}">
				<a href={Routes.login.url}>Logeate</a>
			</li>
			<li class="step {$wellcome.profileName ? 'step-primary' : ''}">
				<a href={Routes.profile.url}>Edita tu nombre de usuario</a>
			</li>
			<li class="step {$wellcome.addGang ? 'step-primary' : ''}">
				<a href={Routes.profile.url}>Añade o busca tu peña</a>
			</li>
		</ul>
	</div>
	<div class="container mx-auto px-4 pl-10 {stepsHidden ? 'hidden' : ''}">
		<ul class="steps steps-vertical">
			<li class="step {isChrome ? 'step-primary' : ''}">
				<p>
					Usa
					<a href="https://play.google.com/store/apps/details?id=com.android.chrome&hl=es">Chrome</a
					>
					o
					<a href="https://play.google.com/store/apps/details?id=com.brave.browser&hl=es">Brave</a>
				</p>
			</li>
			<li class="step {$wellcome.installed ? 'step-primary' : ''}">
				<a href={Routes.step_to_install.url}>Añade a pantalla de inicio, muestrame cómo</a>
			</li>
		</ul>
	</div>
</div>
