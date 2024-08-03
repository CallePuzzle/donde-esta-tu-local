<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

{#if data.userHasGang}
	<div class="container">
		<h2>{data.gang.name}</h2>
	</div>
{:else}
	<div class="container">
		<h2>No tienes peña, selecciona una</h2>
		<ul>
			{#each data.gangs as gang}
				<li class="m-2">
					<form method="POST" action="?/join">
						<label class="input flex items-center gap-2">
							{gang.name}
							<input type="text" placeholder="Daisy" hidden value={gang.id} name="id" />
							<button class="btn btn-accent m-2" type="submit">Solicitar unirme</button>
						</label>
					</form>
				</li>
			{/each}
		</ul>
	</div>
{/if}
