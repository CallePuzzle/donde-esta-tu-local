<script lang="ts">
	import { resolve } from '$app/paths';
	import Users from '@lucide/svelte/icons/users';
	import Building from '@lucide/svelte/icons/building';
	import Shield from '@lucide/svelte/icons/shield';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import History from '@lucide/svelte/icons/history';
</script>

<div class="container mx-auto p-4 pb-20 lg:pb-0">
	<div class="mb-8">
		<div class="mb-4 flex items-center gap-3">
			<Shield class="h-10 w-10 text-primary" />
			<h1 class="text-3xl font-bold">Panel de Administración</h1>
		</div>

		<p class="text-lg text-base-content/70">
			Bienvenido al panel de administración. Desde aquí puedes gestionar las peñas y los miembros
			del sistema.
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
					<h2 class="card-title text-2xl">Gestión de Peñas</h2>
				</div>

				<p class="mb-4 text-base-content/70">
					Administra las peñas del sistema. Puedes validar nuevas peñas, rechazar solicitudes y ver
					el historial de peñas validadas.
				</p>

				<div class="stats mb-4 stats-vertical shadow">
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
					<a href={resolve('/admin/gangs')} class="btn btn-primary">
						Ir a Peñas
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
					<h2 class="card-title text-2xl">Gestión de Miembros</h2>
				</div>

				<p class="mb-4 text-base-content/70">
					Administra las solicitudes de membresía. Puedes validar o rechazar usuarios que quieren
					unirse a una peña.
				</p>

				<div class="stats mb-4 stats-vertical shadow">
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
					<a href={resolve('/admin/members')} class="btn btn-secondary">
						Ir a Miembros
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
					<h2 class="card-title text-2xl">Historial de Cambios</h2>
				</div>

				<p class="mb-4 text-base-content/70">
					Consulta el historial de modificaciones de las peñas. Revisa cambios en nombres,
					ubicaciones y otros datos importantes.
				</p>

				<div class="stats mb-4 stats-vertical shadow">
					<div class="stat py-2">
						<div class="stat-title text-sm">Información disponible</div>
						<ul class="mt-2 space-y-1 text-sm">
							<li class="flex items-center gap-2">
								<span class="text-success">•</span> Cambios de nombre
							</li>
							<li class="flex items-center gap-2">
								<span class="text-info">•</span> Cambios de ubicación
							</li>
							<li class="flex items-center gap-2">
								<span class="text-warning">•</span> Fecha y hora del cambio
							</li>
							<li class="flex items-center gap-2">
								<span class="text-primary">•</span> Usuario que realizó el cambio
							</li>
						</ul>
					</div>
				</div>

				<div class="card-actions justify-end">
					<a href={resolve('/admin/history')} class="btn btn-accent">
						Ver Historial
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
				<h3 class="font-bold">Información importante</h3>
				<div class="text-sm">
					Las acciones realizadas en este panel son definitivas. Asegúrate de revisar bien antes de
					validar o rechazar gangs y miembros.
				</div>
			</div>
		</div>
	</div>
</div>
