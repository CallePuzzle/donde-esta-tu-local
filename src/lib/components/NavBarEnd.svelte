<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { NavBarEnd as LibNavBarEnd } from '@callepuzzle/svelte-ui';
	import { FormLoginOtp } from '@callepuzzle/svelte-ui/otp';
	import { createLoginSchema } from '@callepuzzle/core/schema';
	import Modal from './Modal.svelte';
	import { loginModalStore } from '$lib/stores/loginModal.svelte';
	import { authClient } from '$lib/auth-client';
	import { m } from '$lib/paraglide/messages.js';

	// El tipo de sesión inferido de better-auth, no el User del cliente Prisma
	// (que no es lo que viaja en locals.user/data.user).
	export type Props = {
		user: App.Locals['user'];
	};

	let { user }: Props = $props();

	let modal = $state<Modal | null>(null);

	onMount(() => {
		loginModalStore.value = modal;
	});

	async function onLoginSuccess() {
		// La librería no invalida ni navega: aquí invalidamos (el layout repinta la
		// navbar con el usuario) y cerramos el modal; sin setTimeout(2000).
		await invalidateAll();
		modal?.close();
	}

	// El schema se construye EN RENDER, nunca en scope de módulo (regla i18n de la
	// librería): los textos de Paraglide se resuelven con el locale activo.
	const loginSchema = $derived(
		createLoginSchema({
			emailPlaceholder: 'jesus-asereje@kyp.es',
			emailDescription: m.schema_login_email_describe(),
			emailError: m.schema_login_email_error()
		})
	);
</script>

<!-- id="tour-login": target del paso de login del tour guiado. -->
<LibNavBarEnd
	{user}
	{authClient}
	profileHref="/profile"
	id="tour-login"
	strings={{
		userMenu: m.layout_user_menu(),
		profile: m.routes_profile(),
		signOut: m.form_login_sign_out(),
		avatarAlt: (name) => m.common_avatar_alt({ name })
	}}
>
	{#snippet login()}
		<Modal title={m.form_login_sign_in()} bind:this={modal} type="X">
			<FormLoginOtp
				{authClient}
				schema={loginSchema}
				startOverHref="/"
				onSuccess={onLoginSuccess}
				strings={{
					signIn: m.form_login_sign_in(),
					stepEmail: m.form_login_step_email(),
					stepOtp: m.form_login_step_otp(),
					otpLabel: m.form_login_otp_label(),
					otpDescription: m.form_login_otp_description(),
					success: m.form_login_success(),
					rateLimited: m.form_login_rate_limited(),
					invalidCode: m.form_login_invalid_code(),
					error: m.form_login_error(),
					startOver: m.form_login_start_over(),
					required: m.form_required(),
					optional: m.form_optional()
				}}
			/>
		</Modal>
	{/snippet}
</LibNavBarEnd>
