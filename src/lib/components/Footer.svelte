<script lang="ts">
	import Heart from '@lucide/svelte/icons/heart';
	import MailQuestionMark from '@lucide/svelte/icons/mail-question-mark';
</script>

<footer class="bottom-0 container mx-auto hidden justify-center lg:flex">
	<p class="mx-4 flex items-center justify-center md:flex-1">
		<span class="mr-2">Made with</span><Heart size="16" color="red" strokeWidth="4" /><span
			class="ml-2">by KPY</span
		>
	</p>
	<p class="mx-4 flex items-center justify-center md:flex-1">
		<a
			href="https://github.com/CallePuzzle/donde-esta-tu-local"
			target="_blank"
			rel="noopener noreferrer"
			aria-label="GitHub repository"
			><svg
				xmlns="http://www.w3.org/2000/svg"
				width="32"
				height="32"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="icon icon-tabler icons-tabler-outline icon-tabler-brand-github"
				><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
					d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5"
				/></svg
			></a
		>
		<a href="mailto:app@montemayordepililla.cc" aria-label="Contact via email"
			><MailQuestionMark size="32" /></a
		>
	</p>
</footer>

<footer class="dock flex lg:hidden">
	<button>
		<svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
			><g fill="currentColor" stroke-linejoin="miter" stroke-linecap="butt"
				><polyline
					points="1 11 12 2 23 11"
					fill="none"
					stroke="currentColor"
					stroke-miterlimit="10"
					stroke-width="2"
				></polyline><path
					d="m5,13v7c0,1.105.895,2,2,2h10c1.105,0,2-.895,2-2v-7"
					fill="none"
					stroke="currentColor"
					stroke-linecap="square"
					stroke-miterlimit="10"
					stroke-width="2"
				></path><line
					x1="12"
					y1="22"
					x2="12"
					y2="18"
					fill="none"
					stroke="currentColor"
					stroke-linecap="square"
					stroke-miterlimit="10"
					stroke-width="2"
				></line></g
			></svg
		>
		<span class="dock-label">Home</span>
	</button>

	<button class="dock-active">
		<svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
			><g fill="currentColor" stroke-linejoin="miter" stroke-linecap="butt"
				><polyline
					points="3 14 9 14 9 17 15 17 15 14 21 14"
					fill="none"
					stroke="currentColor"
					stroke-miterlimit="10"
					stroke-width="2"
				></polyline><rect
					x="3"
					y="3"
					width="18"
					height="18"
					rx="2"
					ry="2"
					fill="none"
					stroke="currentColor"
					stroke-linecap="square"
					stroke-miterlimit="10"
					stroke-width="2"
				></rect></g
			></svg
		>
		<span class="dock-label">Inbox</span>
	</button>

	<button>
		<svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
			><g fill="currentColor" stroke-linejoin="miter" stroke-linecap="butt"
				><circle
					cx="12"
					cy="12"
					r="3"
					fill="none"
					stroke="currentColor"
					stroke-linecap="square"
					stroke-miterlimit="10"
					stroke-width="2"
				></circle><path
					d="m22,13.25v-2.5l-2.318-.966c-.167-.581-.395-1.135-.682-1.654l.954-2.318-1.768-1.768-2.318.954c-.518-.287-1.073-.515-1.654-.682l-.966-2.318h-2.5l-.966,2.318c-.581.167-1.135.395-1.654.682l-2.318-.954-1.768,1.768.954,2.318c-.287.518-.515,1.073-.682,1.654l-2.318.966v2.5l2.318.966c.167.581.395,1.135.682,1.654l-.954,2.318,1.768,1.768,2.318-.954c.518.287,1.073.515,1.654.682l.966,2.318h2.5l.966-2.318c.581-.167,1.135-.395,1.654-.682l2.318.954,1.768-1.768-.954-2.318c.287-.518.515-1.073.682-1.654l2.318-.966Z"
					fill="none"
					stroke="currentColor"
					stroke-linecap="square"
					stroke-miterlimit="10"
					stroke-width="2"
				></path></g
			></svg
		>
		<span class="dock-label">Settings</span>
	</button>
</footer>
