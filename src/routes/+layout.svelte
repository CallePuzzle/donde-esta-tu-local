<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { routes } from '$lib/routes';
	import { session, authClient } from '$lib/auth-client';

	import type { PageData } from './$types';
	import type { Snippet } from 'svelte';

	let { children, data }: { children: Snippet; data: PageData } = $props();
</script>

<div class="main-div h-screen">
	<Header title="Montemayor de Pililla" {routes} {session} {authClient}>
		{@render children()}
	</Header>
	<Footer />
</div>
