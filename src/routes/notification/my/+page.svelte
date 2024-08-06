<script lang="ts">
	import type { PageData } from './$types';

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
				<h2>{notification.title}</h2>
				<p>{notification.body}</p>
			</li>
		{/each}
	</ul>
</div>
