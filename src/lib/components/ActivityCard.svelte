<script lang="ts">
	import type { Activity, Gang } from '@prisma/client';
	import Clock from '@lucide/svelte/icons/clock';
	import MapPinned from '@lucide/svelte/icons/map-pinned';
	import Users from '@lucide/svelte/icons/users';
	import { resolve } from '$app/paths';
	import Modal from '$lib/components/Modal.svelte';

	type ActivityCard = Activity & {
		placeGang: Pick<Gang, 'id' | 'name'> | null;
		collaboratingGangs: Pick<Gang, 'id' | 'name'>[];
	};

	interface Props {
		activity: ActivityCard;
		activityBanners: Record<string, unknown>;
	}

	let { activity, activityBanners }: Props = $props();

	const activityBannerPath = '/src/lib/assets/actividades/circus-party.png';
	console.log(activityBanners);
	const ActivityBannerSrc = activityBanners[activityBannerPath].default;

	function formatActivityDate(activity: Activity) {
		const d = new Date(activity.date);

		if (activity.dateDesc)
			return (
				new Intl.DateTimeFormat('es-ES', {
					weekday: 'long',
					day: 'numeric'
				}).format(d) +
				', ' +
				activity.dateDesc
			);

		return new Intl.DateTimeFormat('es-ES', {
			weekday: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(d);
	}

	function getActivityLocation(activity: ActivityCard) {
		if (activity.placeGang) {
			return { id: activity.placeGang.id, name: activity.placeGang.name };
		} else if (activity.placeDesc) {
			return activity.placeDesc;
		}
		return false;
	}

	function getOrganisers(gangs: Pick<Gang, 'id' | 'name'>[]) {
		if (gangs.length === 0) return false;
		return gangs.map((g) => g.name).join(', ');
	}

	const location = getActivityLocation(activity);
	const organisers = getOrganisers(activity.collaboratingGangs);
</script>

<div class="card my-2 w-full bg-base-200 shadow-sm card-md lg:w-70 xl:w-96">
	<div class="card-body">
		<h2 class="card-title uppercase">{activity.name}</h2>
		<div class="mb-3">
			<p class="flex text-sm text-gray-600">
				<Clock /><span class="mx-1">Fecha y hora:</span>
				<span class="font-medium text-base-content">{formatActivityDate(activity)}</span>
			</p>
		</div>
		{#if location}
			<div class="mb-3">
				<p class="flex items-center text-sm text-gray-600">
					<MapPinned /><span class="mx-1">Lugar:</span>
					{#if typeof location === 'string'}
						<span class="font-medium text-base-content">{location}</span>
					{:else}
						<span class="font-medium text-base-content">
							<a
								href={resolve('/gang/[slug]', { slug: location.id.toString() })}
								class="btn btn-dash btn-info">{location.name}</a
							>
						</span>
					{/if}
				</p>
			</div>
		{/if}

		{#if organisers}
			<div class="mb-3">
				<p class="flex text-sm text-gray-600">
					<Users /><span class="mx-1">Colaboran:</span><span class="font-medium text-base-content"
						>{organisers}</span
					>
				</p>
			</div>
		{/if}
		{#if ActivityBannerSrc}
			<Modal title="Cartel" type="X" buttonClass="btn btn-dash btn-accent">
				<enhanced:img src={ActivityBannerSrc} alt="Cartel de {activity.name}" />
			</Modal>
		{/if}
	</div>
</div>
