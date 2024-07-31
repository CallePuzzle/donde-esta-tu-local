<script>
	import '../app.css';
	import { goto } from '$app/navigation';

	export let data;

	function addGang(event) {
		if (!data.userIsLogged) {
			document.getElementById('add_gang').showModal();
		} else {
			goto('/gangs/add');
		}
	}
	function gotoLogin() {
		goto('/login');
	}
</script>

<div class="navbar bg-base-100">
	<div class="flex-1">
		<a href="/" class="btn btn-ghost text-xl">Peñas Montemayor</a>
	</div>
	<div class="flex-none gap-2">
		<ul class="menu menu-horizontal px-1">
			<li><button class="btn" on:click={addGang}>Añadir peña</button></li>
		</ul>

		<dialog id="add_gang" class="modal">
			<div class="modal-box">
				<h3 class="text-lg font-bold">Para añadir una peña tienes que estar logado</h3>
				<button class="btn btn-accent" on:click={gotoLogin}>Login</button>
				<div class="modal-action">
					<form method="dialog">
						<!-- if there is a button in form, it will close the modal -->
						<button class="btn">Cerrar</button>
					</form>
				</div>
			</div>
		</dialog>

		<div class="form-control">
			<input
				type="text"
				placeholder="Buscador de peñas"
				class="input input-bordered w-24 md:w-auto"
			/>
		</div>
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

<slot />
