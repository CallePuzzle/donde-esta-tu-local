<script lang="ts">
	import { onMount } from 'svelte';
	import { Routes } from '$lib/routes';
	import { register } from 'swiper/element/bundle';

	import step1 from '$lib/assets/step1.png';
	import step2 from '$lib/assets/step2.png';
	import step3 from '$lib/assets/step3.png';
	import step4 from '$lib/assets/step4.png';

	onMount(async () => {
		register();
	});
</script>

<div class="flex flex-col">
	<div class="hero">
		<div class="hero-content text-center">
			<div class="max-w-md">
				<h1 class="text-5xl font-bold">Pasos para instalar</h1>
			</div>
		</div>
	</div>
	<div class="container mx-auto px-4 text-center">
		<swiper-container
			class="steps"
			pagination="true"
			pagination-type="progressbar"
			navigation="true"
		>
			<swiper-slide class="flex justify-center"><img src={step1} alt="step1" /></swiper-slide>
			<swiper-slide class="flex justify-center"><img src={step2} alt="step2" /></swiper-slide>
			<swiper-slide class="flex justify-center"><img src={step3} alt="step3" /></swiper-slide>
			<swiper-slide class="flex justify-center"><img src={step4} alt="step4" /></swiper-slide>
			<swiper-slide class="flex justify-center"
				><a class="return" href={Routes.wellcome.url}>Volver</a></swiper-slide
			>
		</swiper-container>
	</div>
</div>

<style>
	.return {
		font-size: 1.5rem;
		margin-top: 10rem;
	}
</style>
