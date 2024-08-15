<script lang="ts">
	import type { Gang } from '@prisma/client';
	import type { S } from 'vitest/dist/reporters-yx5ZTtEV.js';

	export let gangs: Gang[] = [];
    export let myGangId: number | null = null;
	let searchTerm = '';
	let filteredOptions = gangs;

	// Filtrar las opciones basadas en el término de búsqueda
	$: filteredOptions = gangs.filter((gang) =>
		gang.name.toLowerCase().includes(searchTerm.toLowerCase())
	);
</script>

	<input
		type="text"
		placeholder="Busca tu peña"
		bind:value={searchTerm}
		class="border border-gray-300 rounded-md p-2 w-full mb-2"
	/>
    <label for="gang" class="">Peña:</label>
	<select bind:value={myGangId} class="border border-gray-300 rounded-md p-2 w-full">
		{#each filteredOptions as gang}
			<option value={gang.id}>{gang.name}</option>
		{/each}
	</select>
