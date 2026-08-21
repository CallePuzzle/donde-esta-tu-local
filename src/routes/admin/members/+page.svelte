<script lang="ts">
	import { resolve } from '$app/paths';
	import { invalidateAll } from '$app/navigation';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import CircleX from '@lucide/svelte/icons/circle-x';
	import Users from '@lucide/svelte/icons/users';
	import Clock from '@lucide/svelte/icons/clock';
	import UserX from '@lucide/svelte/icons/user-x';
	import UserCheck from '@lucide/svelte/icons/user-check';
	import Building from '@lucide/svelte/icons/building';
	import ButtonRequest from '$lib/components/ButtonRequest.svelte';
	import { memberDisplayName, memberInitial } from '$lib/utils/member-display';
	import { formatDateTimeShort } from '$lib/utils/format-date';
	import { m } from '$lib/paraglide/messages.js';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let activeTab: 'pending' | 'validated' = $state('pending');

	// Función para manejar la actualización después de validar/rechazar
	async function handleActionComplete() {
		await invalidateAll();
	}
</script>

<div class="container mx-auto p-4">
	<div class="mb-8">
		<h1 class="mb-4 text-3xl font-bold">{m.admin_members_page_title()}</h1>

		<!-- Estadísticas -->
		<div class="stats mb-6 w-full shadow">
			<div class="stat">
				<div class="stat-figure text-primary">
					<Users class="h-8 w-8" />
				</div>
				<div class="stat-title">{m.admin_members_stat_total()}</div>
				<div class="stat-value text-primary">{data.stats.totalUsers}</div>
			</div>

			<div class="stat">
				<div class="stat-figure text-warning">
					<Clock class="h-8 w-8" />
				</div>
				<div class="stat-title">{m.admin_members_stat_pending()}</div>
				<div class="stat-value text-warning">{data.stats.pendingMembers}</div>
			</div>

			<div class="stat">
				<div class="stat-figure text-success">
					<UserCheck class="h-8 w-8" />
				</div>
				<div class="stat-title">{m.admin_members_stat_validated()}</div>
				<div class="stat-value text-success">{data.stats.validatedMembers}</div>
			</div>

			<div class="stat">
				<div class="stat-figure text-error">
					<UserX class="h-8 w-8" />
				</div>
				<div class="stat-title">{m.admin_members_stat_refused()}</div>
				<div class="stat-value text-error">{data.stats.refusedMembers}</div>
			</div>

			<div class="stat">
				<div class="stat-figure text-base-content">
					<Building class="h-8 w-8" />
				</div>
				<div class="stat-title">{m.admin_members_stat_without_gang()}</div>
				<div class="stat-value text-base-content">{data.stats.usersWithoutGang}</div>
			</div>
		</div>

		<!-- Tabs -->
		<div class="tabs-boxed tabs mb-6">
			<button
				class="tab {activeTab === 'pending' ? 'tab-active' : ''}"
				onclick={() => (activeTab = 'pending')}
			>
				{m.admin_members_tab_pending({ count: data.pendingMembers.length })}
			</button>
			<button
				class="tab {activeTab === 'validated' ? 'tab-active' : ''}"
				onclick={() => (activeTab = 'validated')}
			>
				{m.admin_members_tab_validated({ count: data.recentlyValidatedMembers.length })}
			</button>
		</div>

		<!-- Contenido de las tabs -->
		{#if activeTab === 'pending'}
			<div class="card bg-base-100 shadow-xl">
				<div class="card-body">
					<h2 class="mb-4 card-title">{m.admin_members_pending_title()}</h2>

					{#if data.pendingMembersTruncated}
						<div class="mb-4 alert alert-warning">
							<span>{m.admin_members_list_truncated({ count: data.pendingMembers.length })}</span>
						</div>
					{/if}

					{#if data.pendingMembers.length === 0}
						<div class="alert alert-info">
							<span>{m.admin_members_pending_empty()}</span>
						</div>
					{:else}
						<div class="overflow-x-auto">
							<table class="table table-zebra">
								<thead>
									<tr>
										<th>{m.admin_table_user()}</th>
										<th>{m.admin_table_email()}</th>
										<th>{m.admin_table_gang_requested()}</th>
										<th>{m.admin_table_gang_status()}</th>
										<th>{m.admin_table_current_members()}</th>
										<th>{m.admin_table_actions()}</th>
									</tr>
								</thead>
								<tbody>
									{#each data.pendingMembers as member (member.id)}
										<tr>
											<td>
												<div class="flex items-center gap-3">
													{#if member.image}
														<div class="avatar">
															<div class="mask h-12 w-12 mask-squircle">
																<img src={member.image} alt={memberDisplayName(member)} />
															</div>
														</div>
													{:else}
														<div class="placeholder avatar">
															<div class="w-12 rounded-full bg-neutral text-neutral-content">
																<span class="text-xl">{memberInitial(member)}</span>
															</div>
														</div>
													{/if}
													<div>
														<div class="font-bold">{memberDisplayName(member)}</div>
														<div class="text-sm opacity-50">ID: {member.id.slice(0, 8)}...</div>
													</div>
												</div>
											</td>
											<td>{member.email}</td>
											<td>
												{#if member.gang}
													<a
														href={resolve('/gang/[slug]', { slug: member.gang.id.toString() })}
														class="link font-semibold link-primary"
														target="_blank"
													>
														{member.gang.name}
													</a>
												{:else}
													<span class="text-base-content/60">-</span>
												{/if}
											</td>
											<td>
												{#if member.gang}
													{#if member.gang.status === 'VALIDATED'}
														<span class="badge badge-success">{m.badge_gang_validated()}</span>
													{:else if member.gang.status === 'PENDING'}
														<span class="badge badge-warning">{m.badge_gang_pending()}</span>
													{:else}
														<span class="badge badge-error">{m.badge_gang_refused()}</span>
													{/if}
												{:else}
													<span class="text-base-content/60">-</span>
												{/if}
											</td>
											<td>
												{#if member.gang && member.gang.members}
													<div class="flex items-center gap-1">
														<Users class="h-4 w-4" />
														<span>{member.gang.members.length}</span>
													</div>
													{#if member.gang.members.length > 0}
														<div class="mt-1 text-xs text-base-content/60">
															{member.gang.members
																.slice(0, 3)
																.map((m) => m.displayName)
																.join(', ')}
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
															<CircleCheck class="h-4 w-4" /> {m.action_validate()}
														{/snippet}
														<ButtonRequest
															buttonText={validateButtonText}
															endpoint="/gang/validateMember"
															body={{ userId: member.id, gangId: member.gang.id }}
															buttonClass="btn btn-sm btn-success"
															onSuccess={handleActionComplete}
														/>

														{#snippet rejectButtonText()}
															<CircleX class="h-4 w-4" /> {m.action_reject()}
														{/snippet}
														<ButtonRequest
															buttonText={rejectButtonText}
															endpoint="/gang/refuseMember"
															body={{ userId: member.id, gangId: member.gang.id }}
															buttonClass="btn btn-sm btn-error"
															onSuccess={handleActionComplete}
														/>
													</div>
												{:else}
													<span class="text-base-content/60">{m.admin_members_no_gang()}</span>
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
					<h2 class="mb-4 card-title">{m.admin_members_validated_title()}</h2>

					{#if data.recentlyValidatedMembers.length === 0}
						<div class="alert alert-info">
							<span>{m.admin_members_validated_empty()}</span>
						</div>
					{:else}
						<div class="overflow-x-auto">
							<table class="table table-zebra">
								<thead>
									<tr>
										<th>{m.admin_table_user()}</th>
										<th>{m.admin_table_email()}</th>
										<th>{m.admin_table_gang()}</th>
										<th>{m.admin_table_gang_status()}</th>
										<th>{m.admin_table_validated_date()}</th>
									</tr>
								</thead>
								<tbody>
									{#each data.recentlyValidatedMembers as member (member.id)}
										<tr>
											<td>
												<div class="flex items-center gap-3">
													{#if member.image}
														<div class="avatar">
															<div class="mask h-12 w-12 mask-squircle">
																<img src={member.image} alt={memberDisplayName(member)} />
															</div>
														</div>
													{:else}
														<div class="placeholder avatar">
															<div class="w-12 rounded-full bg-neutral text-neutral-content">
																<span class="text-xl">{memberInitial(member)}</span>
															</div>
														</div>
													{/if}
													<div>
														<div class="font-bold">{memberDisplayName(member)}</div>
														<div class="text-sm opacity-50">ID: {member.id.slice(0, 8)}...</div>
													</div>
												</div>
											</td>
											<td>{member.email}</td>
											<td>
												{#if member.gang}
													<a
														href={resolve('/gang/[slug]', { slug: member.gang.id.toString() })}
														class="link font-semibold link-primary"
														target="_blank"
													>
														{member.gang.name}
													</a>
												{:else}
													<span class="text-base-content/60">-</span>
												{/if}
											</td>
											<td>
												{#if member.gang}
													{#if member.gang.status === 'VALIDATED'}
														<span class="badge badge-success">{m.badge_gang_validated()}</span>
													{:else if member.gang.status === 'PENDING'}
														<span class="badge badge-warning">{m.badge_gang_pending()}</span>
													{:else}
														<span class="badge badge-error">{m.badge_gang_refused()}</span>
													{/if}
												{:else}
													<span class="text-base-content/60">-</span>
												{/if}
											</td>
											<td>
												<span class="text-sm">
													{formatDateTimeShort(member.updatedAt)}
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
