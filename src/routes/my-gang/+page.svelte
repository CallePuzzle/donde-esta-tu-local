<script lang="ts">
import type { PageData } from './$types';

export let data: PageData;
</script>

{#if data.userHasGang}

{:else}
	<div>
		<p>No tienes peña</p>
	</div>
	{#each data.gangs as gang}
	<div>
		<p>{gang.name}</p>
	</div>
{/each}
{/if}


