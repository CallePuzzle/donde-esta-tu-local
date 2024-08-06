<script lang="ts">
	import type { PageData } from './$types';
	import { Routes } from '../../routes';

	export let data: PageData;
</script>

<div class="container">
	<h1>
		Hola {#if data.user.name}
			{data.user.name}{/if}
	</h1>
	<p>Tienes {data.notificationsCount} notificaciones pendientes</p>
	<ul>
		{#each data.notifications as notification}
			<li>
				{#if notification.type === 'gang-added'}
					<h2>{notification.title}</h2>
					<p>{notification.body} por {JSON.parse(notification.data).addedBy}</p>
					<form method="POST" action="{Routes.add_gang.url}?/validate">
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
						<button type="submit" class="btn btn-accent m-6">Validar</button>
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
