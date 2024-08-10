<script lang="ts">
	import type { PageData } from './$types';
	import { Routes } from '$lib/routes';

	export let data: PageData;
</script>

<div class="flex flex-col">
	<div class="hero">
		<div class="hero-content text-center">
			<div class="max-w-md">
				<h1 class="text-5xl font-bold">
					Hola {#if data.user.name}{data.user.name}{/if}
				</h1>
				<p class="py-6">
					Tienes {data.notificationsCount} notificaciones pendientes
				</p>
			</div>
		</div>
	</div>
	<div class="">
		<ul>
			{#each data.notifications as notification}
				<li>
					{#if notification.type === 'gang-added'}
						<form method="POST" action="{Routes.add_gang.url}?/validate" class="">
							<span class=""
								>{JSON.parse(notification.data).addedBy} ha añadido una peña nueva:
							</span><span class="">{JSON.parse(notification.data).gangName}</span>
							<label
								><input
									type="hidden"
									class="input w-full max-w-xs"
									name="userId"
									value={data.user.id}
								/></label
							>
							<label
								><input
									type="hidden"
									class="input w-full max-w-xs"
									name="notificationId"
									value={notification.id}
								/></label
							>
							<label
								><input
									type="hidden"
									class="input w-full max-w-xs"
									name="gangId"
									value={JSON.parse(notification.data).gangId}
								/></label
							>
							{#if notification.status === 'pending'}
								<button type="submit" class="btn btn-accent m-6">Validar</button>
							{:else}
								<button class="btn btn-accent m-6" disabled>Validada</button>
							{/if}
						</form>
					{:else}
						<h2>{notification.title}</h2>
						<p>{notification.body}</p>
						<p>{notification.type}</p>
						<p>{notification.data}</p>
					{/if}
				</li>
			{/each}
		</ul>
	</div>
</div>
