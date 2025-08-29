<script lang="ts">
	import Cartel from '$lib/assets/actividades2025.jpg?enhanced';
	import ActivityCard from '$lib/components/ActivityCard.svelte';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Separar actividades pasadas y futuras
	const now = new Date();
	let upcomingActivities = data.activities.filter((a) => new Date(a.date) >= now);
	let pastActivities = data.activities.filter((a) => new Date(a.date) < now);
</script>

<div class="hero">
	<div class="hero-content text-center">
		<div class="flex max-w-md">
			<h1 class="text-2xl font-bold">Actividades de peñas</h1>
		</div>
	</div>
</div>

<div class="container mx-auto my-2">
	<!-- name of each tab group should be unique -->
	<div class="tabs-lift tabs flex justify-center">
		<input
			type="radio"
			name="activities_tabs"
			class="tab bg-base-200 text-base-content"
			aria-label="Cartel"
			checked={true}
		/>
		<div class="tab-content mb-20 border-base-300 bg-base-100 p-2 lg:mb-0">
			<enhanced:img src={Cartel} alt="Cartel actividades" />
		</div>

		<input
			type="radio"
			name="activities_tabs"
			class="tab bg-base-200 text-base-content"
			aria-label="Próximas"
		/>
		<div class="tab-content mb-20 border-base-300 bg-base-100 p-2 lg:mb-0">
			{#if upcomingActivities.length > 0}
				<div class="grid grid-cols-1 justify-center md:grid-cols-2 lg:grid-cols-3">
					{#each upcomingActivities as activity (activity.id)}
						<ActivityCard {activity} />
					{/each}
				</div>
			{:else}
				<div class="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
					<p class="text-blue-800">No hay actividades próximas programadas.</p>
				</div>
			{/if}
		</div>

		<input
			type="radio"
			name="activities_tabs"
			class="tab bg-base-200 text-base-content"
			aria-label="Pasadas"
		/>
		<div class="tab-content mb-20 border-base-300 bg-base-100 p-2 lg:mb-0">
			{#if pastActivities.length > 0}
				<div class="grid grid-cols-1 justify-center opacity-75 md:grid-cols-2 lg:grid-cols-3">
					{#each pastActivities as activity (activity.id)}
						<ActivityCard {activity} />
					{/each}
				</div>
			{:else}
				<div class="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
					<p class="text-gray-600">No hay actividades pasadas registradas.</p>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.tabs input[type='radio']:checked {
		background-image: none;
	}
</style>
