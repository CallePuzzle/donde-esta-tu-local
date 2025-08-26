<script lang="ts">
	import type { PageData } from './$types';
	import type { Snippet } from 'svelte';
	import { m } from '$lib/paraglide/messages.js';
	import UserNotLogged from '$lib/components/UserNotLogged.svelte';

	let { children, data }: { children: Snippet; data: PageData } = $props();
</script>

{#if data.user}
	{@render children()}
{:else}
	<UserNotLogged text={m.routes_notices_user_not_logged_in()} />
{/if}
