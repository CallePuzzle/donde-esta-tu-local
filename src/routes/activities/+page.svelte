<script lang="ts">
	import Cartel from '$lib/assets/actividades2025.jpg?enhanced';

	import type { PageData } from './$types';
	import type { Activity, Gang } from '@prisma/client';

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
		} else if (activity.latitude && activity.longitude) {
			return `Coordenadas: ${activity.latitude.toFixed(6)}, ${activity.longitude.toFixed(6)}`;
		}
		return 'Ubicación no especificada';
	}

	function getOrganisers(gangs: Gang[]) {
		if (gangs.length === 0) return 'Sin organizadores';
		return gangs.map((g) => g.name).join(', ');
	}

	// Separar actividades pasadas y futuras
	const now = new Date();
	let upcomingActivities = data.activities.filter((a) => new Date(a.date) >= now);
	let pastActivities = data.activities.filter((a) => new Date(a.date) < now);
</script>

<div class="container mx-auto px-4 py-8">
	<!-- name of each tab group should be unique -->
	<div class="tabs-lift mb-15 tabs lg:mb-0">
		<input
			type="radio"
			name="activities_tabs"
			class="tab bg-base-200 text-base-content"
			aria-label="Cartel"
			checked={true}
		/>
		<div class="tab-content border-base-300 bg-base-100 p-2">
			<enhanced:img src={Cartel} alt="Cartel actividades" />
		</div>

		<input
			type="radio"
			name="activities_tabs"
			class="tab bg-base-200 text-base-content"
			aria-label="Próximas Actividades"
		/>
		<div class="tab-content border-base-300 bg-base-100 p-2">
			{#if upcomingActivities.length > 0}
				<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each upcomingActivities as activity (activity.id)}
						<div class="rounded-lg border-l-4 border-green-500 bg-white p-6 shadow-md">
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
								<p class="text-sm text-gray-600">Organiza:</p>
								<p class="font-medium">{getOrganisers(activity.organisingGangs)}</p>
							</div>

							{#if activity.desc}
								<div class="mt-4 border-t border-gray-200 pt-4">
									<p class="text-gray-700">{activity.desc}</p>
								</div>
							{/if}

							{#if activity.latitude && activity.longitude && !activity.placeGang}
								<div class="mt-4">
									<a
										href={`https://www.google.com/maps?q=${activity.latitude},${activity.longitude}`}
										target="_blank"
										rel="noopener noreferrer"
										class="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
									>
										<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
											></path>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
											></path>
										</svg>
										Ver en el mapa
									</a>
								</div>
							{/if}
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
			aria-label="Actividades Pasadas"
		/>
		<div class="tab-content border-base-300 bg-base-100 p-2">
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
