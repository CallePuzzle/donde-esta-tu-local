<script lang="ts">
	import type { PageData } from './$types';
	import FormUser from '$lib/components/FormUser.svelte';
	import { m } from '$lib/paraglide/messages';
	import User from '@lucide/svelte/icons/user';
	import Mail from '@lucide/svelte/icons/mail';
	import Calendar from '@lucide/svelte/icons/calendar';
	import Shield from '@lucide/svelte/icons/shield';

	let {
		data
	}: {
		data: PageData;
	} = $props();

	const formatDate = (date: string | Date) => {
		return new Date(date).toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};
</script>

<div class="container mx-auto max-w-2xl p-4">
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<h1 class="mb-6 card-title flex items-center gap-2 text-2xl">
				<User class="h-8 w-8" />
				{m.routes_profile()}
			</h1>

			<!-- User Info Section -->
			<div class="mb-8 rounded-lg bg-base-200 p-4">
				<h2 class="mb-4 text-lg font-semibold">Información de la cuenta</h2>
				<div class="space-y-3">
					<!-- Email (readonly) -->
					<div class="flex items-center gap-3">
						<Mail class="h-5 w-5 text-base-content/60" />
						<div>
							<span class="text-sm text-base-content/60">Email:</span>
							<p class="font-medium">{data.user.email}</p>
						</div>
					</div>

					<!-- Role -->
					{#if data.user.role}
						<div class="flex items-center gap-3">
							<Shield class="h-5 w-5 text-base-content/60" />
							<div>
								<span class="text-sm text-base-content/60">Rol:</span>
								<p class="font-medium capitalize">{data.user.role}</p>
							</div>
						</div>
					{/if}

					<!-- Created Date -->
					<div class="flex items-center gap-3">
						<Calendar class="h-5 w-5 text-base-content/60" />
						<div>
							<span class="text-sm text-base-content/60">Miembro desde:</span>
							<p class="font-medium">{formatDate(data.user.createdAt)}</p>
						</div>
					</div>

					<!-- Email Verification Status -->
					<div class="flex items-center gap-3">
						<div class="flex h-5 w-5 items-center justify-center">
							{#if data.user.emailVerified}
								<span class="text-success">✓</span>
							{:else}
								<span class="text-warning">⚠</span>
							{/if}
						</div>
						<div>
							<span class="text-sm text-base-content/60">Estado del email:</span>
							<p class="font-medium">
								{data.user.emailVerified ? 'Verificado' : 'Pendiente de verificación'}
							</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Update Form -->
			<div class="divider">Actualizar información</div>
			<FormUser dataForm={data.form} />
		</div>
	</div>
</div>
