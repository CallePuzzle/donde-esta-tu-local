<script lang="ts">
	import { OiUnread16 } from 'svelte-icons-pack/oi';
	import { AiOutlineHome } from 'svelte-icons-pack/ai';
	import { BsPersonPlus } from 'svelte-icons-pack/bs';
	import { ImCancelCircle } from 'svelte-icons-pack/im';
	import { Icon } from 'svelte-icons-pack';

	import type { NotificationDetail } from '$lib/utils/notification/notifications';

	interface Filters {
		unread: boolean;
		members: boolean;
		gangs: boolean;
	}

	let filters: Filters;
	export let notifications: NotificationDetail[];

	$: notifications = notifications;
	$: filters = { unread: false, members: false, gangs: false };

	const allNotifications = notifications;

	function unread() {
		filters.unread = !filters.unread;
		filterNotification();
	}
	function members() {
		filters.members = !filters.members;
		filters.gangs = false;
		filterNotification();
	}
	function gangs() {
		filters.gangs = !filters.gangs;
		filters.members = false;
		filterNotification();
	}
	function reset() {
		filters = { unread: false, members: false, gangs: false };
		filterNotification();
	}

	function filterNotification() {
		notifications = allNotifications;
		if (filters.unread) {
			notifications = notifications.filter((n) => n.status === 'PENDING');
		}
		if (filters.members) {
			notifications = notifications.filter((n) => n.type === 'gang-member-request');
		}
		if (filters.gangs) {
			notifications = notifications.filter((n) => n.type === 'gang-added');
		}
		console.log(notifications);
	}
</script>

<div class="flex items-center">
	<span class="m-1">Filtrar por:</span>
	<button on:click={unread} class="m-1">
		<Icon src={OiUnread16} size="2rem" color={filters.unread ? 'green' : 'undefined'} />
	</button>
	<button on:click={gangs} class="m-1">
		<Icon src={AiOutlineHome} size="2rem" color={filters.gangs ? 'green' : 'undefined'} />
	</button>
	<button on:click={members} class="m-1">
		<Icon src={BsPersonPlus} size="2rem" color={filters.members ? 'green' : 'undefined'} />
	</button>
	<button on:click={reset} class="m-1">
		<Icon src={ImCancelCircle} size="2rem" />
	</button>
</div>
