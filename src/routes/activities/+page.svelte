<script lang="ts">
	import Cartel from '$lib/assets/actividades2025.jpg?enhanced';
	import ActivityCard from '$lib/components/ActivityCard.svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';

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

<div class="container mx-auto my-2 pb-20 lg:pb-0">
	<Tabs tabStyle="underline">
		<TabItem open title="Cartel" class="flex w-full justify-center">
			<enhanced:img src={Cartel} alt="Cartel actividades" />
		</TabItem>
		<TabItem title="Próximas" class="flex w-full justify-center">
			{#if upcomingActivities.length > 0}
				<div class="grid grid-cols-1 justify-center md:grid-cols-2 lg:grid-cols-3">
					{#each upcomingActivities as activity (activity.id)}
						<ActivityCard {activity} />
					{/each}
				</div>
			{:else}
				<div role="alert" class="alert alert-warning">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6 shrink-0 stroke-current"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/>
					</svg>
					<span>No hay actividades próximas</span>
				</div>
			{/if}
		</TabItem>
		<TabItem title="Pasadas" class="flex w-full justify-center">
			{#if pastActivities.length > 0}
				<div class="grid grid-cols-1 justify-center opacity-75 md:grid-cols-2 lg:grid-cols-3">
					{#each pastActivities as activity (activity.id)}
						<ActivityCard {activity} />
					{/each}
				</div>
			{:else}
				<div role="alert" class="alert alert-warning">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6 shrink-0 stroke-current"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/>
					</svg>
					<span>No hay actividades pasadas</span>
				</div>
			{/if}
		</TabItem>
	</Tabs>
</div>
