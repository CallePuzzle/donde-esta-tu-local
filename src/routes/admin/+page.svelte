<script lang="ts">
	import { resolve } from '$app/paths';
	import Users from '@lucide/svelte/icons/users';
	import Building from '@lucide/svelte/icons/building';
	import Shield from '@lucide/svelte/icons/shield';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import History from '@lucide/svelte/icons/history';
	import { m } from '$lib/paraglide/messages.js';
</script>

<div class="container mx-auto p-4 pb-20 lg:pb-0">
	<div class="mb-8">
		<div class="mb-4 flex items-center gap-3">
			<Shield class="h-10 w-10 text-primary" />
			<h1 class="text-3xl font-bold">{m.admin_title()}</h1>
		</div>

		<p class="text-lg text-base-content/70">
			{m.admin_welcome()}
		</p>
	</div>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		<!-- Card para Administración de Gangs -->
		<div class="card bg-base-100 shadow-xl transition-shadow hover:shadow-2xl">
			<div class="card-body">
				<div class="mb-4 flex items-center gap-3">
					<div class="rounded-lg bg-primary/10 p-3">
						<Building class="h-8 w-8 text-primary" />
					</div>
					<h2 class="card-title text-2xl">{m.admin_gangs_title()}</h2>
				</div>

				<p class="mb-4 text-base-content/70">
					{m.admin_gangs_description()}
				</p>

				<div class="stats mb-4 stats-vertical shadow">
					<div class="stat py-2">
						<div class="stat-title text-sm">{m.admin_available_functions()}</div>
						<ul class="mt-2 space-y-1 text-sm">
							<li class="flex items-center gap-2">
								<span class="text-success">•</span>
								{m.admin_gangs_feature_validate()}
							</li>
							<li class="flex items-center gap-2">
								<span class="text-error">•</span>
								{m.admin_gangs_feature_refuse()}
							</li>
							<li class="flex items-center gap-2">
								<span class="text-info">•</span>
								{m.admin_gangs_feature_history()}
							</li>
							<li class="flex items-center gap-2">
								<span class="text-warning">•</span>
								{m.admin_gangs_feature_who_validated()}
							</li>
						</ul>
					</div>
				</div>

				<div class="card-actions justify-end">
					<a href={resolve('/admin/gangs')} class="btn btn-primary">
						{m.admin_go_to_gangs()}
						<ArrowRight class="h-4 w-4" />
					</a>
				</div>
			</div>
		</div>

		<!-- Card para Administración de Miembros -->
		<div class="card bg-base-100 shadow-xl transition-shadow hover:shadow-2xl">
			<div class="card-body">
				<div class="mb-4 flex items-center gap-3">
					<div class="rounded-lg bg-secondary/10 p-3">
						<Users class="h-8 w-8 text-secondary" />
					</div>
					<h2 class="card-title text-2xl">{m.admin_members_title()}</h2>
				</div>

				<p class="mb-4 text-base-content/70">
					{m.admin_members_description()}
				</p>

				<div class="stats mb-4 stats-vertical shadow">
					<div class="stat py-2">
						<div class="stat-title text-sm">{m.admin_available_functions()}</div>
						<ul class="mt-2 space-y-1 text-sm">
							<li class="flex items-center gap-2">
								<span class="text-success">•</span>
								{m.admin_members_feature_validate()}
							</li>
							<li class="flex items-center gap-2">
								<span class="text-error">•</span>
								{m.admin_members_feature_refuse()}
							</li>
							<li class="flex items-center gap-2">
								<span class="text-info">•</span>
								{m.admin_members_feature_recent()}
							</li>
							<li class="flex items-center gap-2">
								<span class="text-warning">•</span>
								{m.admin_members_feature_stats()}
							</li>
						</ul>
					</div>
				</div>

				<div class="card-actions justify-end">
					<a href={resolve('/admin/members')} class="btn btn-secondary">
						{m.admin_go_to_members()}
						<ArrowRight class="h-4 w-4" />
					</a>
				</div>
			</div>
		</div>

		<!-- Card para Historial de Cambios -->
		<div class="card bg-base-100 shadow-xl transition-shadow hover:shadow-2xl">
			<div class="card-body">
				<div class="mb-4 flex items-center gap-3">
					<div class="rounded-lg bg-accent/10 p-3">
						<History class="h-8 w-8 text-accent" />
					</div>
					<h2 class="card-title text-2xl">{m.admin_history_title()}</h2>
				</div>

				<p class="mb-4 text-base-content/70">
					{m.admin_history_description()}
				</p>

				<div class="stats mb-4 stats-vertical shadow">
					<div class="stat py-2">
						<div class="stat-title text-sm">{m.admin_available_info()}</div>
						<ul class="mt-2 space-y-1 text-sm">
							<li class="flex items-center gap-2">
								<span class="text-success">•</span>
								{m.admin_history_feature_name_changes()}
							</li>
							<li class="flex items-center gap-2">
								<span class="text-info">•</span>
								{m.admin_history_feature_location_changes()}
							</li>
							<li class="flex items-center gap-2">
								<span class="text-warning">•</span>
								{m.admin_history_feature_datetime()}
							</li>
							<li class="flex items-center gap-2">
								<span class="text-primary">•</span>
								{m.admin_history_feature_user()}
							</li>
						</ul>
					</div>
				</div>

				<div class="card-actions justify-end">
					<a href={resolve('/admin/history')} class="btn btn-accent">
						{m.admin_go_to_history()}
						<ArrowRight class="h-4 w-4" />
					</a>
				</div>
			</div>
		</div>
	</div>

	<!-- Información adicional -->
	<div class="mt-8">
		<div class="alert alert-info">
			<Shield class="h-6 w-6" />
			<div>
				<h3 class="font-bold">{m.admin_important_info_title()}</h3>
				<div class="text-sm">
					{m.admin_important_info_text()}
				</div>
			</div>
		</div>
	</div>
</div>
