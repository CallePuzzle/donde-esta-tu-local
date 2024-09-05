<script lang="ts">
	import { onMount } from 'svelte';
	import { Routes } from '$lib/routes';
	import wellcome from '$lib/stores/wellcome';
	import { copy } from 'svelte-copy';

	import type { PageData } from './$types';

	export let data: PageData;
	let isChrome: boolean;

	$: stepsHidden = true;
	$: copiedHidden = true;

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
	function showCopiedMessage() {
		copiedHidden = false;
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
			<a on:click={showSteps}>
				<li class="step {$wellcome.installed ? 'step-primary' : ''}">
					{Routes.step_to_install.name}
				</li>
			</a>
			<a href={Routes.login.url}>
				<li class="step {$wellcome.login ? 'step-primary' : ''}">Logeate</li>
			</a>
			<a href={Routes.profile.url}>
				<li class="step {$wellcome.profileName ? 'step-primary' : ''}">
					Edita tu nombre de usuario
				</li>
			</a>
			<a href={Routes.profile.url}>
				<li class="step {$wellcome.addGang ? 'step-primary' : ''}">Añade o busca tu peña</li>
			</a>
		</ul>
	</div>
	<div class="container mx-auto px-4 pl-10 {stepsHidden ? 'hidden' : ''}">
		<ul class="steps steps-vertical">
			<li class="step {isChrome ? 'step-primary' : ''}">
				<p>
					Usa
					<a
						href="https://play.google.com/store/apps/details?id=com.android.chrome&hl=es"
						class="italic">Chrome</a
					>
					o
					<a
						href="https://play.google.com/store/apps/details?id=com.brave.browser&hl=es"
						class="italic">Brave</a
					>
				</p>
			</li>
			<li class="step">
				<p class="text-left {!copiedHidden ? 'hidden' : ''}">
					<button use:copy={data.appUrl} on:svelte-copy={(event) => showCopiedMessage()}>
						Copia y pega en el navegador: {data.appUrl}
					</button>
				</p>
				<p class="text-left {copiedHidden ? 'hidden' : ''}">Copiado</p>
			</li>
			<a href={Routes.step_to_install.url}>
				<li class="step {$wellcome.installed ? 'step-primary' : ''}">
					<p class="text-left">Añade a pantalla de inicio, muestrame cómo</p>
				</li>
			</a>
		</ul>
	</div>
</div>
