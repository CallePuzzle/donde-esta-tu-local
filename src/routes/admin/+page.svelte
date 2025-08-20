<script lang="ts">
	import { page } from '$app/stores';
	import Users from '@lucide/svelte/icons/users';
	import Building from '@lucide/svelte/icons/building';
	import Shield from '@lucide/svelte/icons/shield';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
</script>

<div class="container mx-auto p-4">
	<div class="mb-8">
		<div class="flex items-center gap-3 mb-4">
			<Shield class="w-10 h-10 text-primary" />
			<h1 class="text-3xl font-bold">Panel de Administración</h1>
		</div>

		<p class="text-lg text-base-content/70">
			Bienvenido al panel de administración. Desde aquí puedes gestionar las peñas y los miembros del sistema.
		</p>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<!-- Card para Administración de Gangs -->
		<div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
			<div class="card-body">
				<div class="flex items-center gap-3 mb-4">
					<div class="p-3 bg-primary/10 rounded-lg">
						<Building class="w-8 h-8 text-primary" />
					</div>
					<h2 class="card-title text-2xl">Gestión de Peñas</h2>
				</div>

				<p class="text-base-content/70 mb-4">
					Administra las peñas del sistema. Puedes validar nuevas peñas, rechazar solicitudes y ver el historial de peñas validadas.
				</p>

				<div class="stats stats-vertical shadow mb-4">
					<div class="stat py-2">
						<div class="stat-title text-sm">Funciones disponibles</div>
						<ul class="mt-2 space-y-1 text-sm">
							<li class="flex items-center gap-2">
								<span class="text-success">•</span> Validar peñas pendientes
							</li>
							<li class="flex items-center gap-2">
								<span class="text-error">•</span> Rechazar peñas no válidas
							</li>
							<li class="flex items-center gap-2">
								<span class="text-info">•</span> Ver historial de validaciones
							</li>
							<li class="flex items-center gap-2">
								<span class="text-warning">•</span> Ver quién validó cada peña
							</li>
						</ul>
					</div>
				</div>

				<div class="card-actions justify-end">
					<a href="/admin/gangs" class="btn btn-primary">
						Ir a Peñas
						<ArrowRight class="w-4 h-4" />
					</a>
				</div>
			</div>
		</div>

		<!-- Card para Administración de Miembros -->
		<div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
			<div class="card-body">
				<div class="flex items-center gap-3 mb-4">
					<div class="p-3 bg-secondary/10 rounded-lg">
						<Users class="w-8 h-8 text-secondary" />
					</div>
					<h2 class="card-title text-2xl">Gestión de Miembros</h2>
				</div>

				<p class="text-base-content/70 mb-4">
					Administra las solicitudes de membresía. Puedes validar o rechazar usuarios que quieren unirse a una peña.
				</p>

				<div class="stats stats-vertical shadow mb-4">
					<div class="stat py-2">
						<div class="stat-title text-sm">Funciones disponibles</div>
						<ul class="mt-2 space-y-1 text-sm">
							<li class="flex items-center gap-2">
								<span class="text-success">•</span> Validar solicitudes pendientes
							</li>
							<li class="flex items-center gap-2">
								<span class="text-error">•</span> Rechazar solicitudes
							</li>
							<li class="flex items-center gap-2">
								<span class="text-info">•</span> Ver miembros validados recientes
							</li>
							<li class="flex items-center gap-2">
								<span class="text-warning">•</span> Ver estadísticas de usuarios
							</li>
						</ul>
					</div>
				</div>

				<div class="card-actions justify-end">
					<a href="/admin/members" class="btn btn-secondary">
						Ir a Miembros
						<ArrowRight class="w-4 h-4" />
					</a>
				</div>
			</div>
		</div>
	</div>

	<!-- Información adicional -->
	<div class="mt-8">
		<div class="alert alert-info">
			<Shield class="w-6 h-6" />
			<div>
				<h3 class="font-bold">Información importante</h3>
				<div class="text-sm">
					Las acciones realizadas en este panel son definitivas. Asegúrate de revisar bien antes de validar o rechazar gangs y miembros.
				</div>
			</div>
		</div>
	</div>
</div>
