<script lang="ts">
	import Cartel from '$lib/assets/actividades2025.jpg?enhanced';

	import type { PageData } from './$types';
	import type { Gang } from '@prisma/client';

	let { data }: { data: PageData } = $props();

	function formatActivityDate(date: Date | string) {
		const d = new Date(date);
		return new Intl.DateTimeFormat('es-ES', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(d);
	}

	function getActivityLocation(activity: (typeof data.activities)[0]) {
		if (activity.placeGang) {
			return activity.placeGang.name;
		} else if (activity.placeDesc) {
			return activity.placeDesc;
		}
		return false;
	}

	function getOrganisers(gangs: Gang[]) {
		if (gangs.length === 0) return false;
		return gangs.map((g) => g.name).join(', ');
	}

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
				<div>
					{#each upcomingActivities as activity (activity.id)}
						<div class="card w-96 bg-base-200 shadow-sm card-md">
							<div class="card-body">
								<h2 class="card-title">{activity.name}</h2>
								<div class="mb-3">
									<p class="text-sm text-gray-600">Fecha y hora:</p>
									<p class="font-medium">{formatActivityDate(activity.date)}</p>
								</div>
								{#if getActivityLocation(activity)}
									<div class="mb-3">
										<p class="text-sm text-gray-600">Lugar:</p>
										<p class="font-medium">{getActivityLocation(activity)}</p>
									</div>
								{/if}

								{#if getOrganisers(activity.collaboratingGangs)}
									<div class="mb-3">
										<p class="text-sm text-gray-600">Colaboran:</p>
										<p class="font-medium">{getOrganisers(activity.collaboratingGangs)}</p>
									</div>
								{/if}
							</div>
						</div>
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
				<div class="grid gap-6 opacity-75 md:grid-cols-2 lg:grid-cols-3">
					{#each pastActivities as activity (activity.id)}
						<div class="rounded-lg border-l-4 border-gray-400 bg-gray-50 p-6 shadow-md">
							<h3 class="mb-2 text-xl font-bold">{activity.name}</h3>

							<div class="mb-3">
								<p class="text-sm text-gray-600">Fecha y hora:</p>
								<p class="font-medium">{formatActivityDate(activity.date)}</p>
							</div>

							<div class="mb-3">
								<p class="text-sm text-gray-600">Lugar:</p>
								<p class="font-medium">{getActivityLocation(activity)}</p>
							</div>

							<div class="mb-3">
								<p class="text-sm text-gray-600">Organizó:</p>
								<p class="font-medium">{getOrganisers(activity.organisingGangs)}</p>
							</div>

							{#if activity.desc}
								<div class="mt-4 border-t border-gray-200 pt-4">
									<p class="text-gray-700">{activity.desc}</p>
								</div>
							{/if}
						</div>
					{/each}
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
