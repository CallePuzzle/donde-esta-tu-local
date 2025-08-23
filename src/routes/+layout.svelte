<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { routes } from '$lib/routes';
	import { session, authClient } from '$lib/auth-client';
	import Logo from '$lib/assets/logo.png';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';

	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="main-div h-screen">
	<Header {routes} {session} {authClient}>
		<button class="fixed top-22 left-2 z-10" onclick={() => history.back()}>
			<ChevronLeft size={35} />
		</button>
		{@render children()}

		{#snippet title()}
			<div class="flex items-center">
				<img src={Logo} alt="Icono cabecera" class="m-1 max-w-14" />
				<div class="m-1">
					<span>Montemayor</span> <span class="depililla -mt-3 text-sm">de Pililla</span>
				</div>
			</div>
		{/snippet}
	</Header>
	<Footer />
</div>
