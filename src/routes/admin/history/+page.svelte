<script lang="ts">
	import type { PageData } from './$types';
	import History from '@lucide/svelte/icons/history';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Calendar from '@lucide/svelte/icons/calendar';
	import User from '@lucide/svelte/icons/user';
	import Building from '@lucide/svelte/icons/building';
	import TrendingUp from '@lucide/svelte/icons/trending-up';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';

	let { data }: { data: PageData } = $props();

	let historyGroupByDate = $derived.by(() => {
		const groups: Record<string, (typeof data.history)[number][]> = {};

		data.history.forEach((item) => {
			const date = new Date(item.createdAt).toLocaleDateString('es-ES', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});

			if (!groups[date]) {
				groups[date] = [];
			}
			groups[date].push(item);
		});

		return Object.entries(groups);
	});

	// Formatear fecha
	function formatDate(date: Date | string) {
		return new Date(date).toLocaleString('es-ES', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// Obtener badge para el tipo de cambio
	function getChangeTypeBadge(type: string) {
		switch (type) {
			case 'CREATE':
				return 'badge-success';
			case 'UPDATE':
				return 'badge-info';
			default:
				return 'badge-ghost';
		}
	}

	// Obtener texto para el tipo de cambio
	function getChangeTypeText(type: string) {
		switch (type) {
			case 'CREATE':
				return 'Creación';
			case 'UPDATE':
				return 'Actualización';
			default:
				return type;
		}
	}
</script>

<div class="container mx-auto p-4 pb-20 lg:pb-0">
	<!-- Header -->
	<div class="mb-8">
		<div class="mb-4 flex items-center gap-4">
			<a href="/admin" class="btn btn-ghost btn-sm">
				<ArrowLeft class="h-4 w-4" />
				Volver
			</a>
		</div>

		<div class="mb-4 flex items-center gap-3">
			<History class="h-10 w-10 text-accent" />
			<h1 class="text-3xl font-bold">Historial de Cambios</h1>
		</div>

		<p class="text-lg text-base-content/70">
			Registro completo de todas las modificaciones realizadas en las peñas.
		</p>
	</div>

	<!-- Estadísticas -->
	<div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
		<div class="stats shadow">
			<div class="stat">
				<div class="stat-figure text-primary">
					<History class="h-8 w-8" />
				</div>
				<div class="stat-title">Total de cambios</div>
				<div class="stat-value text-primary">{data.stats.total}</div>
				<div class="stat-desc">Últimos 100 registros</div>
			</div>
		</div>

		<div class="stats shadow">
			<div class="stat">
				<div class="stat-figure text-success">
					<Building class="h-8 w-8" />
				</div>
				<div class="stat-title">Creaciones</div>
				<div class="stat-value text-success">{data.stats.byType.CREATE || 0}</div>
				<div class="stat-desc">Nuevas peñas</div>
			</div>
		</div>

		<div class="stats shadow">
			<div class="stat">
				<div class="stat-figure text-info">
					<TrendingUp class="h-8 w-8" />
				</div>
				<div class="stat-title">Actualizaciones</div>
				<div class="stat-value text-info">{data.stats.byType.UPDATE || 0}</div>
				<div class="stat-desc">Modificaciones</div>
			</div>
		</div>
	</div>

	<!-- Historial de cambios agrupado por fecha -->
	<div class="space-y-6">
		{#each historyGroupByDate as [date, changes] (date)}
			<div class="card bg-base-100 shadow-xl">
				<div class="card-body">
					<h2 class="mb-4 card-title flex items-center gap-2 text-lg">
						<Calendar class="h-5 w-5" />
						{date}
						<span class="badge badge-ghost">{changes.length} cambios</span>
					</h2>

					<div class="space-y-4">
						{#each changes as change (change.id)}
							<div class="border-l-4 border-base-300 pl-4 transition-colors hover:border-primary">
								<div class="mb-2 flex flex-wrap items-start justify-between gap-2">
									<div class="flex items-center gap-2">
										<span class="badge {getChangeTypeBadge(change.changeType)}">
											{getChangeTypeText(change.changeType)}
										</span>
										<span class="font-semibold">
											{change.gang.name}
										</span>
										<span class="badge badge-sm badge-warning">
											{change.gang.status}
										</span>
									</div>
									<span class="text-sm text-base-content/60">
										{formatDate(change.createdAt)}
									</span>
								</div>

								<div class="grid grid-cols-1 gap-2 text-sm md:grid-cols-3">
									<div class="flex items-center gap-2">
										<Building class="h-4 w-4 text-base-content/60" />
										<span class="text-base-content/80">Nombre:</span>
										<span class="font-medium">{change.name}</span>
									</div>

									<div class="flex items-center gap-2">
										<MapPin class="h-4 w-4 text-base-content/60" />
										<span class="text-base-content/80">Lat:</span>
										<span class="font-mono">{change.latitude.toFixed(6)}</span>
									</div>

									<div class="flex items-center gap-2">
										<MapPin class="h-4 w-4 text-base-content/60" />
										<span class="text-base-content/80">Lng:</span>
										<span class="font-mono">{change.longitude.toFixed(6)}</span>
									</div>
								</div>

								{#if change.changedBy}
									<div class="mt-2 flex items-center gap-2 text-sm text-base-content/60">
										<User class="h-4 w-4" />
										<span
											>Modificado por: {change.changedBy.name || 'Sin nombre'} ({change.changedBy
												.email})</span
										>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/each}
	</div>

	{#if data.history.length === 0}
		<div class="alert alert-info">
			<History class="h-6 w-6" />
			<div>
				<h3 class="font-bold">No hay cambios registrados</h3>
				<div class="text-sm">
					El historial comenzará a registrarse cuando se realicen modificaciones en las peñas.
				</div>
			</div>
		</div>
	{/if}
</div>
