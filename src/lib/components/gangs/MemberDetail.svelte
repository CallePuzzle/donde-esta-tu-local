<script lang="ts">
	import UserRound from '@lucide/svelte/icons/user-round';

	export type Props = {
		image: string | null;
		name: string;
	};

	let { name, image }: Props = $props();
</script>

<div class="flex items-center py-1">
	<div class="avatar flex w-10 items-center justify-center">
		<div class="rounded-full">
			{#if image}
				<img alt="Profile" src={image} />
			{:else}
				<UserRound size={32} />
			{/if}
		</div>
	</div>
	<div class="ml-2">{name}</div>
</div>
