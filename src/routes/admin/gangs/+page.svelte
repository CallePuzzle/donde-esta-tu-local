<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import CircleX from '@lucide/svelte/icons/circle-x';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Users from '@lucide/svelte/icons/users';
	import Clock from '@lucide/svelte/icons/clock';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let activeTab: 'validated' | 'pending' = $state('pending');
	let processingGangId: number | null = $state(null);
</script>

<div class="container mx-auto p-4">
	<div class="mb-8">
		<h1 class="mb-4 text-3xl font-bold">Administración de Peñas</h1>

		<!-- Estadísticas -->
		<div class="stats mb-6 w-full shadow">
			<div class="stat">
				<div class="stat-figure text-primary">
					<Users class="h-8 w-8" />
				</div>
				<div class="stat-title">Total Peñas</div>
				<div class="stat-value text-primary">{data.stats.totalGangs}</div>
			</div>

			<div class="stat">
				<div class="stat-figure text-success">
					<CircleCheck class="h-8 w-8" />
				</div>
				<div class="stat-title">Validadas</div>
				<div class="stat-value text-success">{data.stats.validatedGangs}</div>
			</div>

			<div class="stat">
				<div class="stat-figure text-warning">
					<Clock class="h-8 w-8" />
				</div>
				<div class="stat-title">Pendientes</div>
				<div class="stat-value text-warning">{data.stats.pendingGangs}</div>
			</div>

			<div class="stat">
				<div class="stat-figure text-error">
					<CircleX class="h-8 w-8" />
				</div>
				<div class="stat-title">Rechazadas</div>
				<div class="stat-value text-error">{data.stats.refusedGangs}</div>
			</div>
		</div>

		<!-- Tabs -->
		<div class="tabs-boxed mb-6 tabs">
			<button
				class="tab {activeTab === 'pending' ? 'tab-active' : ''}"
				onclick={() => (activeTab = 'pending')}
			>
				Pendientes de Validación ({data.pendingGangs.length})
			</button>
			<button
				class="tab {activeTab === 'validated' ? 'tab-active' : ''}"
				onclick={() => (activeTab = 'validated')}
			>
				Gangs Validadas ({data.validatedGangs.length})
			</button>
		</div>

		<!-- Contenido de las tabs -->
		{#if activeTab === 'pending'}
			<div class="card bg-base-100 shadow-xl">
				<div class="card-body">
					<h2 class="mb-4 card-title">Gangs Pendientes de Validación</h2>

					{#if data.pendingGangs.length === 0}
						<div class="alert alert-info">
							<span>No hay gangs pendientes de validación</span>
						</div>
					{:else}
						<div class="overflow-x-auto">
							<table class="table table-zebra">
								<thead>
									<tr>
										<th>ID</th>
										<th>Nombre</th>
										<th>Ubicación</th>
										<th>Miembros</th>
										<th>Acciones</th>
									</tr>
								</thead>
								<tbody>
									{#each data.pendingGangs as gang (gang.id)}
										<tr>
											<td>{gang.id}</td>
											<td class="font-semibold">{gang.name}</td>
											<td>
												<div class="flex items-center gap-1">
													<MapPin class="h-4 w-4" />
													<span class="text-xs">
														{gang.latitude.toFixed(6)}, {gang.longitude.toFixed(6)}
													</span>
												</div>
											</td>
											<td>
												<div class="flex items-center gap-1">
													<Users class="h-4 w-4" />
													<span>{gang.members.length}</span>
												</div>
												{#if gang.members.length > 0}
													<div class="mt-1 text-xs text-base-content/60">
														{gang.members.map((m) => m.name || m.email).join(', ')}
													</div>
												{/if}
											</td>
											<td>
												<div class="flex gap-2">
													<form
														method="POST"
														action="?/validate"
														use:enhance={() => {
															processingGangId = gang.id;
															return async ({ result }) => {
																if (result.type === 'success') {
																	await invalidateAll();
																}
																processingGangId = null;
															};
														}}
													>
														<input type="hidden" name="gangId" value={gang.id} />
														<button
															class="btn btn-sm btn-success"
															disabled={processingGangId === gang.id}
														>
															{#if processingGangId === gang.id}
																<span class="loading loading-xs loading-spinner"></span>
															{:else}
																<CircleCheck class="h-4 w-4" />
															{/if}
															Validar
														</button>
													</form>

													<form
														method="POST"
														action="?/refuse"
														use:enhance={() => {
															processingGangId = gang.id;
															return async ({ result }) => {
																if (result.type === 'success') {
																	await invalidateAll();
																}
																processingGangId = null;
															};
														}}
													>
														<input type="hidden" name="gangId" value={gang.id} />
														<button
															class="btn btn-sm btn-error"
															disabled={processingGangId === gang.id}
														>
															{#if processingGangId === gang.id}
																<span class="loading loading-xs loading-spinner"></span>
															{:else}
																<CircleX class="h-4 w-4" />
															{/if}
															Rechazar
														</button>
													</form>

													<a href="/gang/{gang.id}" class="btn btn-ghost btn-sm" target="_blank">
														Ver
													</a>
												</div>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{/if}
				</div>
			</div>
		{:else if activeTab === 'validated'}
			<div class="card bg-base-100 shadow-xl">
				<div class="card-body">
					<h2 class="mb-4 card-title">Gangs Validadas</h2>

					{#if data.validatedGangs.length === 0}
						<div class="alert alert-info">
							<span>No hay gangs validadas</span>
						</div>
					{:else}
						<div class="overflow-x-auto">
							<table class="table table-zebra">
								<thead>
									<tr>
										<th>ID</th>
										<th>Nombre</th>
										<th>Ubicación</th>
										<th>Miembros</th>
										<th>Validado por</th>
										<th>Acciones</th>
									</tr>
								</thead>
								<tbody>
									{#each data.validatedGangs as gang (gang.id)}
										<tr>
											<td>{gang.id}</td>
											<td class="font-semibold">{gang.name}</td>
											<td>
												<div class="flex items-center gap-1">
													<MapPin class="h-4 w-4" />
													<span class="text-xs">
														{gang.latitude.toFixed(6)}, {gang.longitude.toFixed(6)}
													</span>
												</div>
											</td>
											<td>
												<div class="flex items-center gap-1">
													<Users class="h-4 w-4" />
													<span>{gang.members.length}</span>
												</div>
												{#if gang.members.length > 0}
													<div class="mt-1 text-xs text-base-content/60">
														{#each gang.members as member (member.id)}
															<div class="flex items-center gap-1">
																<span>{member.name || member.email}</span>
																{#if member.membershipGangStatus === 'VALIDATED'}
																	<span class="badge badge-xs badge-success">verificado</span>
																{:else if member.membershipGangStatus === 'PENDING'}
																	<span class="badge badge-xs badge-warning">pendiente</span>
																{/if}
															</div>
														{/each}
													</div>
												{/if}
											</td>
											<td>
												{#if gang.validatedBy}
													<div>
														<div class="font-medium">{gang.validatedBy.name}</div>
														<div class="text-xs text-base-content/60">{gang.validatedBy.email}</div>
													</div>
												{:else}
													<span class="text-base-content/60">-</span>
												{/if}
											</td>
											<td>
												<a href="/gang/{gang.id}" class="btn btn-ghost btn-sm" target="_blank">
													Ver
												</a>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>
