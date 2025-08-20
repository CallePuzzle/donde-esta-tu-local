<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import CircleX from '@lucide/svelte/icons/circle-x';
	import Users from '@lucide/svelte/icons/users';
	import Clock from '@lucide/svelte/icons/clock';
	import UserX from '@lucide/svelte/icons/user-x';
	import UserCheck from '@lucide/svelte/icons/user-check';
	import Building from '@lucide/svelte/icons/building';
	import ButtonRequest from '$lib/components/ButtonRequest.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let activeTab: 'pending' | 'validated' = 'pending';

	// Función para manejar la actualización después de validar/rechazar
	async function handleActionComplete() {
		await invalidateAll();
	}
</script>

<div class="container mx-auto p-4">
	<div class="mb-8">
		<h1 class="text-3xl font-bold mb-4">Administración de Miembros</h1>

		<!-- Estadísticas -->
		<div class="stats shadow w-full mb-6">
			<div class="stat">
				<div class="stat-figure text-primary">
					<Users class="w-8 h-8" />
				</div>
				<div class="stat-title">Total Usuarios</div>
				<div class="stat-value text-primary">{data.stats.totalUsers}</div>
			</div>

			<div class="stat">
				<div class="stat-figure text-warning">
					<Clock class="w-8 h-8" />
				</div>
				<div class="stat-title">Pendientes</div>
				<div class="stat-value text-warning">{data.stats.pendingMembers}</div>
			</div>

			<div class="stat">
				<div class="stat-figure text-success">
					<UserCheck class="w-8 h-8" />
				</div>
				<div class="stat-title">Validados</div>
				<div class="stat-value text-success">{data.stats.validatedMembers}</div>
			</div>

			<div class="stat">
				<div class="stat-figure text-error">
					<UserX class="w-8 h-8" />
				</div>
				<div class="stat-title">Rechazados</div>
				<div class="stat-value text-error">{data.stats.refusedMembers}</div>
			</div>

			<div class="stat">
				<div class="stat-figure text-base-content">
					<Building class="w-8 h-8" />
				</div>
				<div class="stat-title">Sin Peña</div>
				<div class="stat-value text-base-content">{data.stats.usersWithoutGang}</div>
			</div>
		</div>

		<!-- Tabs -->
		<div class="tabs tabs-boxed mb-6">
			<button
				class="tab {activeTab === 'pending' ? 'tab-active' : ''}"
				on:click={() => activeTab = 'pending'}
			>
				Solicitudes Pendientes ({data.pendingMembers.length})
			</button>
			<button
				class="tab {activeTab === 'validated' ? 'tab-active' : ''}"
				on:click={() => activeTab = 'validated'}
			>
				Validados Recientemente ({data.recentlyValidatedMembers.length})
			</button>
		</div>

		<!-- Contenido de las tabs -->
		{#if activeTab === 'pending'}
			<div class="card bg-base-100 shadow-xl">
				<div class="card-body">
					<h2 class="card-title mb-4">Solicitudes de Membresía Pendientes</h2>

					{#if data.pendingMembers.length === 0}
						<div class="alert alert-info">
							<span>No hay solicitudes de membresía pendientes</span>
						</div>
					{:else}
						<div class="overflow-x-auto">
							<table class="table table-zebra">
								<thead>
									<tr>
										<th>Usuario</th>
										<th>Email</th>
										<th>Peña Solicitada</th>
										<th>Estado Peña</th>
										<th>Miembros Actuales</th>
										<th>Acciones</th>
									</tr>
								</thead>
								<tbody>
									{#each data.pendingMembers as member (member.id)}
										<tr>
											<td>
												<div class="flex items-center gap-3">
													{#if member.image}
														<div class="avatar">
															<div class="mask mask-squircle w-12 h-12">
																<img src={member.image} alt={member.name || 'Avatar'} />
															</div>
														</div>
													{:else}
														<div class="avatar placeholder">
															<div class="bg-neutral text-neutral-content rounded-full w-12">
																<span class="text-xl">{(member.name || member.email || '?')[0].toUpperCase()}</span>
															</div>
														</div>
													{/if}
													<div>
														<div class="font-bold">{member.name || 'Sin nombre'}</div>
														<div class="text-sm opacity-50">ID: {member.id.slice(0, 8)}...</div>
													</div>
												</div>
											</td>
											<td>{member.email}</td>
											<td>
												{#if member.gang}
													<a href="/gang/{member.gang.id}" class="link link-primary font-semibold" target="_blank">
														{member.gang.name}
													</a>
												{:else}
													<span class="text-base-content/60">-</span>
												{/if}
											</td>
											<td>
												{#if member.gang}
													{#if member.gang.status === 'VALIDATED'}
														<span class="badge badge-success">Validada</span>
													{:else if member.gang.status === 'PENDING'}
														<span class="badge badge-warning">Pendiente</span>
													{:else}
														<span class="badge badge-error">Rechazada</span>
													{/if}
												{:else}
													<span class="text-base-content/60">-</span>
												{/if}
											</td>
											<td>
												{#if member.gang && member.gang.members}
													<div class="flex items-center gap-1">
														<Users class="w-4 h-4" />
														<span>{member.gang.members.length}</span>
													</div>
													{#if member.gang.members.length > 0}
														<div class="text-xs text-base-content/60 mt-1">
															{member.gang.members.slice(0, 3).map(m => m.name || m.email).join(', ')}
															{#if member.gang.members.length > 3}
																...
															{/if}
														</div>
													{/if}
												{:else}
													<span class="text-base-content/60">-</span>
												{/if}
											</td>
											<td>
												{#if member.gang}
													<div class="flex gap-2">
														{#snippet validateButtonText()}
															<CircleCheck class="w-4 h-4" /> Validar
														{/snippet}
														<ButtonRequest
															buttonText={validateButtonText}
															url={`/gang/validateMember?userId=${member.id}&gangId=${member.gang.id}`}
															buttonClass="btn btn-sm btn-success"
															onSuccess={handleActionComplete}
														/>

														{#snippet rejectButtonText()}
															<CircleX class="w-4 h-4" /> Rechazar
														{/snippet}
														<ButtonRequest
															buttonText={rejectButtonText}
															url={`/gang/refuseMember?userId=${member.id}&gangId=${member.gang.id}`}
															buttonClass="btn btn-sm btn-error"
															onSuccess={handleActionComplete}
														/>
													</div>
												{:else}
													<span class="text-base-content/60">Sin peña asignada</span>
												{/if}
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
					<h2 class="card-title mb-4">Miembros Validados Recientemente (últimos 30 días)</h2>

					{#if data.recentlyValidatedMembers.length === 0}
						<div class="alert alert-info">
							<span>No hay miembros validados en los últimos 30 días</span>
						</div>
					{:else}
						<div class="overflow-x-auto">
							<table class="table table-zebra">
								<thead>
									<tr>
										<th>Usuario</th>
										<th>Email</th>
										<th>Peña</th>
										<th>Estado Peña</th>
										<th>Fecha Validación</th>
									</tr>
								</thead>
								<tbody>
									{#each data.recentlyValidatedMembers as member (member.id)}
										<tr>
											<td>
												<div class="flex items-center gap-3">
													{#if member.image}
														<div class="avatar">
															<div class="mask mask-squircle w-12 h-12">
																<img src={member.image} alt={member.name || 'Avatar'} />
															</div>
														</div>
													{:else}
														<div class="avatar placeholder">
															<div class="bg-neutral text-neutral-content rounded-full w-12">
																<span class="text-xl">{(member.name || member.email || '?')[0].toUpperCase()}</span>
															</div>
														</div>
													{/if}
													<div>
														<div class="font-bold">{member.name || 'Sin nombre'}</div>
														<div class="text-sm opacity-50">ID: {member.id.slice(0, 8)}...</div>
													</div>
												</div>
											</td>
											<td>{member.email}</td>
											<td>
												{#if member.gang}
													<a href="/gang/{member.gang.id}" class="link link-primary font-semibold" target="_blank">
														{member.gang.name}
													</a>
												{:else}
													<span class="text-base-content/60">-</span>
												{/if}
											</td>
											<td>
												{#if member.gang}
													{#if member.gang.status === 'VALIDATED'}
														<span class="badge badge-success">Validada</span>
													{:else if member.gang.status === 'PENDING'}
														<span class="badge badge-warning">Pendiente</span>
													{:else}
														<span class="badge badge-error">Rechazada</span>
													{/if}
												{:else}
													<span class="text-base-content/60">-</span>
												{/if}
											</td>
											<td>
												<span class="text-sm">
													{new Date(member.updatedAt).toLocaleDateString('es-ES', {
														year: 'numeric',
														month: 'short',
														day: 'numeric',
														hour: '2-digit',
														minute: '2-digit'
													})}
												</span>
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
