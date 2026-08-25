<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import { detectBrowser, detectOs } from '$lib/utils/platform';
	import { pwaInstallStore } from '$lib/stores/pwaInstall.svelte';
	import { resolve } from '$app/paths';
	import Download from '@lucide/svelte/icons/download';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import ExternalLink from '@lucide/svelte/icons/external-link';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let os = $derived(detectOs(data.userAgent));
	let browserKind = $derived(detectBrowser(data.userAgent));
	// Chrome, Edge y Samsung Internet comparten el mismo flujo de instalación
	// nativo (basado en Chromium); Firefox y el resto tienen soporte parcial o nulo.
	let isChromiumLike = $derived(
		browserKind === 'chrome' || browserKind === 'edge' || browserKind === 'samsung'
	);
</script>

<div class="container mx-auto max-w-2xl p-4 pb-20 lg:pb-4">
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<h1 class="mb-2 card-title flex items-center gap-2 text-2xl">
				<Download class="h-8 w-8" />
				{m.on_boarding_install_title()}
			</h1>
			<p class="text-base-content/70">{m.on_boarding_install_subtitle()}</p>

			{#if pwaInstallStore.isStandalone}
				<div class="mt-4 alert alert-success">
					<CircleCheck class="h-5 w-5" />
					<span>{m.on_boarding_install_already_installed()}</span>
				</div>
			{:else if browserKind === 'in-app'}
				<div class="mt-4 alert alert-warning">
					<ExternalLink class="h-5 w-5" />
					<span>{m.on_boarding_install_open_in_browser()}</span>
				</div>
			{:else if os === 'ios' && browserKind === 'safari'}
				<ul class="steps steps-vertical mt-6">
					<li class="step step-primary">{m.on_boarding_install_ios_step_1()}</li>
					<li class="step step-primary">{m.on_boarding_install_ios_step_2()}</li>
					<li class="step step-primary">{m.on_boarding_install_ios_step_3()}</li>
				</ul>
			{:else if os === 'ios'}
				<div class="mt-4 alert alert-warning">
					<span>{m.on_boarding_install_ios_use_safari()}</span>
				</div>
			{:else if os === 'android' && isChromiumLike}
				<ul class="steps steps-vertical mt-6">
					<li class="step step-primary">{m.on_boarding_install_android_step_1()}</li>
					<li class="step step-primary">{m.on_boarding_install_android_step_2()}</li>
					<li class="step step-primary">{m.on_boarding_install_android_step_3()}</li>
				</ul>
			{:else if os === 'android'}
				<div class="mt-4 alert alert-info">
					<span>{m.on_boarding_install_android_other()}</span>
				</div>
			{:else}
				<div class="mt-4 alert alert-info">
					<span>{m.on_boarding_install_desktop_not_needed()}</span>
				</div>
			{/if}

			<div class="divider"></div>
			<a href={resolve('/')} class="btn btn-primary">{m.common_back()}</a>
		</div>
	</div>
</div>
