<script lang="ts">
	import '../app.css';
	import { TabGroup, TabAnchor } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';
</script>

<TabGroup
	justify="justify-center"
	active="variant-filled-primary"
	hover="hover:variant-soft-primary"
	flex="flex-1 lg:flex-none"
	rounded=""
	border=""
	class="bg-surface-100-800-token w-full"
>
	<TabAnchor selected={$page.url.pathname === '/'} href="/">
		<svelte:fragment slot="lead"><i class="fa-solid fa-book"></i></svelte:fragment>
		Home
	</TabAnchor>
	<TabAnchor selected={$page.url.pathname === '/map'} href="/map/">
		<svelte:fragment slot="lead"><i class="fa-solid fa-film"></i></svelte:fragment>
		Mapa
	</TabAnchor>
</TabGroup>

<slot />
