<script>
	import '../app.css';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Icon } from 'svelte-icons-pack';
	import { BiMenu } from 'svelte-icons-pack/bi';
	import { clickOutside } from '$lib/utils/click-outside';

	export let data;

	function addGang(event) {
		if (!data.userIsLogged) {
			document.getElementById('nav_add_gang').showModal();
		} else {
			document.getElementById('nav_details').open = false;
			goto('/gangs');
		}
	}
	function gotoLogin() {
		goto('/login');
	}

	function closeNav(event) {
		event.target.open = false;
	}
</script>

<div class="navbar bg-base-100">
	<div class="flex-1">
		<ul class="menu menu-horizontal px-1 z-50">
			<li class="z-50">
				<details use:clickOutside on:click_outside={closeNav} id="nav_details">
					<summary><Icon src={BiMenu} size="32" /></summary>
					<ul class="bg-base-100 rounded-t-none p-2">
						<li><button class="btn"><a href="/">Inicio</a></button></li>
						<li><button class="btn" on:click={addGang}>Añadir peña</button></li>
						<li>
							<div class="form-control">
								<input
									type="text"
									placeholder="Buscador"
									class="input input-bordered w-24 md:w-auto p-3"
								/>
							</div>
						</li>
						{#if data.userIsLogged}
							<li>
								<form method="post" use:enhance action="/logout">
									<button class="btn" type="submit">Logout</button>
								</form>
							</li>
						{/if}
					</ul>
				</details>
			</li>
		</ul>
	</div>
	<div class="flex gap-2">
		<a href="/" class="btn btn-ghost text-xl">Peñas Montemayor</a>

		{#if data.userIsLogged}
			<div class="dropdown dropdown-end">
				<div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
					<div class="w-10 rounded-full">
						<img alt="Profile image" src={data.user.picture} />
					</div>
				</div>

				<ul
					tabindex="0"
					class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
				>
					<li><a>Mi peña</a></li>
				</ul>
			</div>
		{:else}
			<ul class="menu menu-horizontal px-1">
				<li><a href="/login">Login</a></li>
			</ul>
		{/if}
	</div>
</div>

<dialog id="nav_add_gang" class="modal">
	<div class="modal-box">
		<div class="flex flex-col items-center">
			<h3 class="text-lg font-bold">Para añadir una peña tienes que estar logado</h3>
			<button class="btn btn-accent mt-6 w-24" on:click={gotoLogin}>Login</button>
		</div>
		<div class="modal-action m-0">
			<form method="dialog">
				<!-- if there is a button in form, it will close the modal -->
				<button class="btn">Cerrar</button>
			</form>
		</div>
	</div>
</dialog>
{#if data.isProtectedRoute && !data.userIsLogged}
	<div class="alert alert-error">
		<p>{data.protectedRouteMessage}</p>
		<p>
			<a href="/login" class="btn btn-accent">Iniciar sesión</a>
		</p>
	</div>
{:else}
	<slot />
{/if}
