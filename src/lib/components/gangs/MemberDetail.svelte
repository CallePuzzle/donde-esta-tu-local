<script lang="ts">
	import UserRound from '@lucide/svelte/icons/user-round';

	export type Props = {
		image: string | null;
		name: string;
	};

	let { name, image }: Props = $props();
</script>

<div class="flex items-center">
	<div class="avatar">
		<div class="flex w-10 content-center justify-center rounded-full">
			{#if image}
				<img alt="Profile" src={image} />
			{:else}
				<UserRound />
			{/if}
		</div>
	</div>
	<div class="ml-2">{name}</div>
</div>
