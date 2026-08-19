<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import CircleX from '@lucide/svelte/icons/circle-x';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Users from '@lucide/svelte/icons/users';
	import Clock from '@lucide/svelte/icons/clock';
	import { m } from '$lib/paraglide/messages.js';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let activeTab: 'validated' | 'pending' = $state('pending');
	let processingGangId: number | null = $state(null);
	let actionMessage: { type: 'success' | 'error'; text: string } | null = $state(null);

	// result.data no está tipado igual en éxito (objeto plano) que en fail()
	// (ActionFailure<T>), así que se extrae el mensaje con una comprobación
	// en tiempo de ejecución en vez de asumir su forma.
	function extractMessage(data: unknown): string {
		return data !== null &&
			typeof data === 'object' &&
			'message' in data &&
			typeof data.message === 'string'
			? data.message
			: '';
	}
</script>

<div class="container mx-auto p-4">
	<div class="mb-8">
		<h1 class="mb-4 text-3xl font-bold">{m.admin_gangs_page_title()}</h1>

		{#if actionMessage}
			<div class="alert {actionMessage.type === 'success' ? 'alert-success' : 'alert-error'} mb-4">
				<span>{actionMessage.text}</span>
			</div>
		{/if}

		<!-- Estadísticas -->
		<div class="stats mb-6 w-full shadow">
			<div class="stat">
				<div class="stat-figure text-primary">
					<Users class="h-8 w-8" />
				</div>
				<div class="stat-title">{m.admin_gangs_stat_total()}</div>
				<div class="stat-value text-primary">{data.stats.totalGangs}</div>
			</div>

			<div class="stat">
				<div class="stat-figure text-success">
					<CircleCheck class="h-8 w-8" />
				</div>
				<div class="stat-title">{m.admin_gangs_stat_validated()}</div>
				<div class="stat-value text-success">{data.stats.validatedGangs}</div>
			</div>

			<div class="stat">
				<div class="stat-figure text-warning">
					<Clock class="h-8 w-8" />
				</div>
				<div class="stat-title">{m.admin_gangs_stat_pending()}</div>
				<div class="stat-value text-warning">{data.stats.pendingGangs}</div>
			</div>

			<div class="stat">
				<div class="stat-figure text-error">
					<CircleX class="h-8 w-8" />
				</div>
				<div class="stat-title">{m.admin_gangs_stat_refused()}</div>
				<div class="stat-value text-error">{data.stats.refusedGangs}</div>
			</div>
		</div>

		<!-- Tabs -->
		<div class="tabs-boxed tabs mb-6">
			<button
				class="tab {activeTab === 'pending' ? 'tab-active' : ''}"
				onclick={() => (activeTab = 'pending')}
			>
				{m.admin_gangs_tab_pending({ count: data.pendingGangs.length })}
			</button>
			<button
				class="tab {activeTab === 'validated' ? 'tab-active' : ''}"
				onclick={() => (activeTab = 'validated')}
			>
				{m.admin_gangs_tab_validated({ count: data.validatedGangs.length })}
			</button>
		</div>

		<!-- Contenido de las tabs -->
		{#if activeTab === 'pending'}
			<div class="card bg-base-100 shadow-xl">
				<div class="card-body">
					<h2 class="mb-4 card-title">{m.admin_gangs_pending_title()}</h2>

					{#if data.pendingGangsTruncated}
						<div class="mb-4 alert alert-warning">
							<span>{m.admin_gangs_list_truncated({ count: data.pendingGangs.length })}</span>
						</div>
					{/if}

					{#if data.pendingGangs.length === 0}
						<div class="alert alert-info">
							<span>{m.admin_gangs_pending_empty()}</span>
						</div>
					{:else}
						<div class="overflow-x-auto">
							<table class="table table-zebra">
								<thead>
									<tr>
										<th>{m.admin_table_id()}</th>
										<th>{m.admin_table_name()}</th>
										<th>{m.admin_table_location()}</th>
										<th>{m.admin_table_members()}</th>
										<th>{m.admin_table_actions()}</th>
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
														{gang.members.map((member) => member.displayName).join(', ')}
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
															actionMessage = null;
															return async ({ result }) => {
																if (result.type === 'success' || result.type === 'failure') {
																	actionMessage = {
																		type: result.type === 'success' ? 'success' : 'error',
																		text: extractMessage(result.data)
																	};
																}
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
															{m.action_validate()}
														</button>
													</form>

													<form
														method="POST"
														action="?/refuse"
														use:enhance={() => {
															processingGangId = gang.id;
															actionMessage = null;
															return async ({ result }) => {
																if (result.type === 'success' || result.type === 'failure') {
																	actionMessage = {
																		type: result.type === 'success' ? 'success' : 'error',
																		text: extractMessage(result.data)
																	};
																}
																if (result.type === 'success') {
																	await invalidateAll();
																}
																processingGangId = null;
															};
														}}
													>
														<input type="hidden" name="gangId" value={gang.id} />
														<button
															class="btn btn-error btn-sm"
															disabled={processingGangId === gang.id}
														>
															{#if processingGangId === gang.id}
																<span class="loading loading-xs loading-spinner"></span>
															{:else}
																<CircleX class="h-4 w-4" />
															{/if}
															{m.action_reject()}
														</button>
													</form>

													<a
														href={resolve('/gang/[slug]', { slug: gang.id.toString() })}
														class="btn btn-ghost btn-sm"
													>
														{m.admin_action_view()}
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
					<h2 class="mb-4 card-title">{m.admin_gangs_validated_title()}</h2>

					{#if data.validatedGangsTruncated}
						<div class="mb-4 alert alert-warning">
							<span>{m.admin_gangs_list_truncated({ count: data.validatedGangs.length })}</span>
						</div>
					{/if}

					{#if data.validatedGangs.length === 0}
						<div class="alert alert-info">
							<span>{m.admin_gangs_validated_empty()}</span>
						</div>
					{:else}
						<div class="overflow-x-auto">
							<table class="table table-zebra">
								<thead>
									<tr>
										<th>{m.admin_table_id()}</th>
										<th>{m.admin_table_name()}</th>
										<th>{m.admin_table_location()}</th>
										<th>{m.admin_table_members()}</th>
										<th>{m.admin_table_validated_by()}</th>
										<th>{m.admin_table_actions()}</th>
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
																<span>{member.displayName}</span>
																{#if member.membershipGangStatus === 'VALIDATED'}
																	<span class="badge badge-xs badge-success"
																		>{m.admin_badge_verified()}</span
																	>
																{:else if member.membershipGangStatus === 'PENDING'}
																	<span class="badge badge-xs badge-warning"
																		>{m.admin_badge_pending()}</span
																	>
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
												<a
													href={resolve('/gang/[slug]', { slug: gang.id.toString() })}
													class="btn btn-ghost btn-sm"
													target="_blank"
												>
													{m.admin_action_view()}
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
