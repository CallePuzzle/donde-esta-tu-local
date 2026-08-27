<script lang="ts">
	import FormUser from '$lib/components/FormUser.svelte';
	import { m } from '$lib/paraglide/messages';
	import { authClient } from '$lib/auth-client';
	import User from '@lucide/svelte/icons/user';
	import Mail from '@lucide/svelte/icons/mail';
	import Camera from '@lucide/svelte/icons/camera';
	import Calendar from '@lucide/svelte/icons/calendar';
	import MapPinned from '@lucide/svelte/icons/map-pinned';
	import UserRound from '@lucide/svelte/icons/user-round';
	import ButtonSignOut from '$lib/components/ButtonSignOut.svelte';
	import NotificationToggle from '$lib/components/NotificationToggle.svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { isAdmin } from '$lib/utils/roles';
	import { formatDateLong } from '$lib/utils/format-date';

	import type { PageData } from './$types';

	let {
		data
	}: {
		data: PageData;
	} = $props();

	// profile/+layout.svelte solo renderiza esta página cuando data.user existe,
	// así que form y userGangDetail (que el load solo omite sin user) también.
	let user = $derived(data.user)!;
	let form = $derived(data.form)!;
	let userGangDetail = $derived(data.userGangDetail)!;
</script>

<div class="container mx-auto max-w-2xl p-4 pb-20 lg:pb-0">
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<h1 class="mb-6 card-title flex items-center gap-2 text-2xl">
				<User class="h-8 w-8" />
				{m.routes_profile()}
			</h1>

			<!-- User Info Section -->
			<div class="mb-8 rounded-lg bg-base-200 p-4">
				<h2 class="mb-4 text-lg font-semibold">{m.profile_account_info_title()}</h2>
				<div class="space-y-3">
					<!-- image view (readonly) -->

					<div class="flex items-center gap-3">
						<Camera class="h-5 w-5 text-base-content/60" />
						<div>
							<span class="text-sm text-base-content/60">{m.profile_image_label()}</span>
							<div class="avatar px-4">
								<div class="flex w-10 content-center justify-center rounded-full">
									{#if user.image}
										<img alt={m.common_avatar_alt({ name: user.name })} src={user.image} />
									{:else}
										<UserRound />
									{/if}
								</div>
							</div>
						</div>
					</div>

					<!-- Email (readonly) -->
					<div class="flex items-center gap-3">
						<Mail class="h-5 w-5 text-base-content/60" />
						<div>
							<span class="text-sm text-base-content/60">{m.profile_email_label()}</span>
							<p class="font-medium">{user.email}</p>
						</div>
					</div>

					<!-- Gang -->
					<div class="flex items-center gap-3">
						<MapPinned class="h-5 w-5 text-base-content/60" />
						<div>
							<span class="text-sm text-base-content/60">{m.profile_gang_label()}</span>
							<p class="font-medium">
								{#if userGangDetail.id}
									<a
										href={resolve('/gang/[slug]', { slug: userGangDetail.id.toString() })}
										class="link link-primary">{userGangDetail.name}</a
									>
								{:else}
									{userGangDetail.name}
								{/if}
							</p>
						</div>
					</div>

					<!-- Created Date -->
					<div class="flex items-center gap-3">
						<Calendar class="h-5 w-5 text-base-content/60" />
						<div>
							<span class="text-sm text-base-content/60">{m.profile_member_since_label()}</span>
							<p class="font-medium">{formatDateLong(user.createdAt)}</p>
						</div>
					</div>

					<!-- Email Verification Status -->
					<div class="flex items-center gap-3">
						<div class="flex h-5 w-5 items-center justify-center">
							{#if user.emailVerified}
								<span class="text-success">✓</span>
							{:else}
								<span class="text-warning">⚠</span>
							{/if}
						</div>
						<div>
							<span class="text-sm text-base-content/60">{m.profile_email_status_label()}</span>
							<p class="font-medium">
								{user.emailVerified ? m.profile_email_verified() : m.profile_email_pending()}
							</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Update Form -->
			<div class="divider">{m.profile_update_info_divider()}</div>
			<FormUser dataForm={form} pageStatus={page.status} />

			<div class="divider">{m.push_notifications_title()}</div>
			<NotificationToggle vapidPublicKey={data.vapidPublicKey} />

			<div class="flex justify-center">
				<ButtonSignOut {authClient} classNames="btn w-45 btn-error" />
			</div>

			<!-- Admin Panel Link -->
			{#if isAdmin(user)}
				<div class="divider">{m.profile_admin_divider()}</div>
				<div class="flex justify-center">
					<a href={resolve('/admin')} class="btn w-45 btn-primary">{m.admin_title()}</a>
				</div>
			{/if}
		</div>
	</div>
</div>
