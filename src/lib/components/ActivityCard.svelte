<script lang="ts">
	import type { Activity, Gang } from '$lib/generated/prisma/client';
	import Clock from '@lucide/svelte/icons/clock';
	import MapPinned from '@lucide/svelte/icons/map-pinned';
	import Users from '@lucide/svelte/icons/users';
	import FileText from '@lucide/svelte/icons/file-text';
	import Image from '@lucide/svelte/icons/image';
	import { resolve } from '$app/paths';
	import Modal from '$lib/components/Modal.svelte';
	import { m } from '$lib/paraglide/messages.js';
	import { formatActivityDateTime } from '$lib/utils/format-date';

	type ActivityCard = Activity & {
		placeGang: Pick<Gang, 'id' | 'name'> | null;
		collaboratingGangs: Pick<Gang, 'id' | 'name'>[];
	};

	interface Props {
		activity: ActivityCard;
	}

	let { activity }: Props = $props();

	function formatActivityDate(activity: Activity) {
		return formatActivityDateTime(activity.date, activity.dateDesc);
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

	const location = $derived(getActivityLocation(activity));
	const organisers = $derived(getOrganisers(activity.collaboratingGangs));
</script>

<div class="card my-2 w-full bg-base-200 shadow-sm card-md lg:w-70 xl:w-96">
	<div class="card-body">
		<h2 class="card-title uppercase">{activity.name}</h2>
		<div class="mb-3">
			<p class="flex text-sm text-gray-600">
				<Clock /><span class="mx-1">{m.activity_date_label()}</span>
				<span class="font-medium text-base-content">{formatActivityDate(activity)}</span>
			</p>
		</div>
		{#if location}
			<div class="mb-3">
				<p class="flex items-center text-sm text-gray-600">
					<MapPinned /><span class="mx-1">{m.activity_place_label()}</span>
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
					<Users /><span class="mx-1">{m.activity_organisers_label()}</span><span
						class="font-medium text-base-content">{organisers}</span
					>
				</p>
			</div>
		{/if}
		{#if activity.notes}
			<div class="mb-3">
				<p class="flex text-sm text-gray-600">
					<FileText /><span class="mx-1">{m.activity_notes_label()}</span><span
						class="font-medium text-base-content">{activity.notes}</span
					>
				</p>
			</div>
		{/if}
		{#if activity.bannerPath}
			<div class="mb-3">
				<p class="flex items-center text-sm text-gray-600">
					<Image /><span class="mx-1">{m.activity_poster_label()}</span><Modal
						title={m.activity_poster_modal_title()}
						type="button"
						buttonClass="btn btn-dash btn-accent"
						buttonCloseClass="btn btn-dash btn-accent"
					>
						<img src={activity.bannerPath} alt={m.activity_poster_alt({ name: activity.name })} />
					</Modal>
				</p>
			</div>
		{/if}
	</div>
</div>
