<script lang="ts">
	// import Cartel from '$lib/assets/actividades/actividades2025.jpg?enhanced';
	import ActivityCard from '$lib/components/ActivityCard.svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import { m } from '$lib/paraglide/messages.js';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Sin eager: los carteles (algunos pesan varios MB) solo se cargan cuando
	// una ActivityCard realmente necesita mostrar el suyo, no todos de golpe.
	const activityBannerLoaders = import.meta.glob(
		'$lib/assets/actividades/*.{avif,gif,heif,jpeg,jpg,png,tiff,webp,svg}',
		{
			query: {
				enhanced: true
			}
		}
	) as Record<string, () => Promise<{ default: string }>>;
</script>

<div class="hero">
	<div class="hero-content text-center">
		<div class="flex max-w-md">
			<h1 class="text-2xl font-bold">{m.routes_activities()}</h1>
		</div>
	</div>
</div>

<div class="container mx-auto my-2 pb-20 lg:pb-0">
	<Tabs tabStyle="underline">
		<!-- <TabItem open title={m.activities_tab_poster()} class="flex w-full justify-center">
			<enhanced:img src={Cartel} alt={m.activities_poster_alt()} />
		</TabItem> -->
		<TabItem title={m.activities_tab_upcoming()} class="flex w-full justify-center">
			{#if data.upcomingActivitiesTruncated}
				<div class="mb-4 alert alert-warning">
					<span>{m.activities_list_truncated({ count: data.upcomingActivities.length })}</span>
				</div>
			{/if}
			{#if data.upcomingActivities.length > 0}
				<div class="grid grid-cols-1 justify-center md:grid-cols-2 lg:grid-cols-3">
					{#each data.upcomingActivities as activity (activity.id)}
						<ActivityCard {activity} {activityBannerLoaders} />
					{/each}
				</div>
			{:else}
				<div role="alert" class="alert alert-warning">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6 shrink-0 stroke-current"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/>
					</svg>
					<span>{m.activities_empty_upcoming()}</span>
				</div>
			{/if}
		</TabItem>
		<TabItem title={m.activities_tab_past()} class="flex w-full justify-center">
			{#if data.pastActivitiesTruncated}
				<div class="mb-4 alert alert-warning">
					<span>{m.activities_list_truncated({ count: data.pastActivities.length })}</span>
				</div>
			{/if}
			{#if data.pastActivities.length > 0}
				<div class="grid grid-cols-1 justify-center opacity-75 md:grid-cols-2 lg:grid-cols-3">
					{#each data.pastActivities as activity (activity.id)}
						<ActivityCard {activity} {activityBannerLoaders} />
					{/each}
				</div>
			{:else}
				<div role="alert" class="alert alert-warning">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6 shrink-0 stroke-current"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/>
					</svg>
					<span>{m.activities_empty_past()}</span>
				</div>
			{/if}
		</TabItem>
	</Tabs>
</div>
