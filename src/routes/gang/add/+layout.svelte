<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import UserNotLogged from '$lib/components/UserNotLogged.svelte';

	import type { PageData } from './$types';
	import type { Snippet } from 'svelte';

	let { children, data }: { children: Snippet; data: PageData } = $props();
</script>

{#if data.user}
	{@render children()}
{:else}
	<UserNotLogged text={m.routes_add_gang_user_not_logged_in()} />
{/if}
