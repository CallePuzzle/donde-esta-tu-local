<script lang="ts">
	import { resolve } from '$app/paths';
	import History from '@lucide/svelte/icons/history';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Calendar from '@lucide/svelte/icons/calendar';
	import User from '@lucide/svelte/icons/user';
	import Building from '@lucide/svelte/icons/building';
	import TrendingUp from '@lucide/svelte/icons/trending-up';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { m } from '$lib/paraglide/messages.js';
	import { formatDateLong, formatDateTimeShort } from '$lib/utils/format-date';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let historyGroupByDate = $derived.by(() => {
		const groups: Record<string, (typeof data.history)[number][]> = {};

		data.history.forEach((item) => {
			const date = formatDateLong(item.createdAt);

			if (!groups[date]) {
				groups[date] = [];
			}
			groups[date].push(item);
		});

		return Object.entries(groups);
	});

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
				return m.admin_history_change_type_create();
			case 'UPDATE':
				return m.admin_history_change_type_update();
			default:
				return type;
		}
	}
</script>

<div class="container mx-auto p-4 pb-20 lg:pb-0">
	<!-- Header -->
	<div class="mb-8">
		<div class="mb-4 flex items-center gap-4">
			<a href={resolve('/admin')} class="btn btn-ghost btn-sm">
				<ArrowLeft class="h-4 w-4" />
				{m.common_back()}
			</a>
		</div>

		<div class="mb-4 flex items-center gap-3">
			<History class="h-10 w-10 text-accent" />
			<h1 class="text-3xl font-bold">{m.admin_history_title()}</h1>
		</div>

		<p class="text-lg text-base-content/70">
			{m.admin_history_page_description()}
		</p>
	</div>

	<!-- Estadísticas -->
	<div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
		<div class="stats shadow">
			<div class="stat">
				<div class="stat-figure text-primary">
					<History class="h-8 w-8" />
				</div>
				<div class="stat-title">{m.admin_history_stat_total()}</div>
				<div class="stat-value text-primary">{data.stats.total}</div>
				<div class="stat-desc">{m.admin_history_stat_total_desc()}</div>
			</div>
		</div>

		<div class="stats shadow">
			<div class="stat">
				<div class="stat-figure text-success">
					<Building class="h-8 w-8" />
				</div>
				<div class="stat-title">{m.admin_history_stat_creates()}</div>
				<div class="stat-value text-success">{data.stats.byType.CREATE || 0}</div>
				<div class="stat-desc">{m.admin_history_stat_creates_desc()}</div>
			</div>
		</div>

		<div class="stats shadow">
			<div class="stat">
				<div class="stat-figure text-info">
					<TrendingUp class="h-8 w-8" />
				</div>
				<div class="stat-title">{m.admin_history_stat_updates()}</div>
				<div class="stat-value text-info">{data.stats.byType.UPDATE || 0}</div>
				<div class="stat-desc">{m.admin_history_stat_updates_desc()}</div>
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
						<span class="badge badge-ghost"
							>{m.admin_history_changes_badge({ count: changes.length })}</span
						>
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
										{formatDateTimeShort(change.createdAt)}
									</span>
								</div>

								<div class="grid grid-cols-1 gap-2 text-sm md:grid-cols-3">
									<div class="flex items-center gap-2">
										<Building class="h-4 w-4 text-base-content/60" />
										<span class="text-base-content/80">{m.admin_history_field_name()}</span>
										<span class="font-medium">{change.name}</span>
									</div>

									<div class="flex items-center gap-2">
										<MapPin class="h-4 w-4 text-base-content/60" />
										<span class="text-base-content/80">{m.admin_history_field_lat()}</span>
										<span class="font-mono">{change.latitude.toFixed(6)}</span>
									</div>

									<div class="flex items-center gap-2">
										<MapPin class="h-4 w-4 text-base-content/60" />
										<span class="text-base-content/80">{m.admin_history_field_lng()}</span>
										<span class="font-mono">{change.longitude.toFixed(6)}</span>
									</div>
								</div>

								{#if change.changedBy}
									<div class="mt-2 flex items-center gap-2 text-sm text-base-content/60">
										<User class="h-4 w-4" />
										<span
											>{m.admin_history_modified_by({
												name: change.changedBy.name || m.common_no_name(),
												email: change.changedBy.email
											})}</span
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
				<h3 class="font-bold">{m.admin_history_empty_title()}</h3>
				<div class="text-sm">
					{m.admin_history_empty_text()}
				</div>
			</div>
		</div>
	{/if}
</div>
