<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { goto } from '$app/navigation';

	import type { AuthClient } from '$lib/auth-client';

	export type Props = {
		authClient: AuthClient;
		classNames?: string;
	};

	let { authClient, classNames }: Props = $props();
</script>

<button
	class={classNames}
	onclick={async () => {
		await authClient.signOut();
		goto('/');
	}}
>
	{m.form_login_sign_out()}
</button>
