<script lang="ts">
	import { onMount } from 'svelte';
	import { Routes } from '$lib/routes';
	import Swiper from 'swiper';

	import { Navigation, Pagination, Scrollbar } from 'swiper/modules';

	import 'swiper/css';
	import 'swiper/css/navigation';
	import 'swiper/css/pagination';

	import step0 from '$lib/assets/step0.png';
	import step1 from '$lib/assets/step1.png';
	import step2 from '$lib/assets/step2.png';
	import step3 from '$lib/assets/step3.png';
	import step4 from '$lib/assets/step4.png';

	onMount(async () => {
		new Swiper('.steps', {
			modules: [Navigation, Pagination, Scrollbar],
			speed: 500,
			navigation: {
				nextEl: '.swiper-button-next',
				prevEl: '.swiper-button-prev'
			}
		});
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
		<div class="swiper steps">
			<div class="swiper-wrapper">
				<div class="swiper-slide"><img src={step0} alt="step0" /></div>
				<div class="swiper-slide"><img src={step1} alt="step1" /></div>
				<div class="swiper-slide"><img src={step2} alt="step2" /></div>
				<div class="swiper-slide"><img src={step3} alt="step3" /></div>
				<div class="swiper-slide"><img src={step4} alt="step4" /></div>
				<div class="swiper-slide"><a class="return" href={Routes.wellcome.url}>Volver</a></div>
			</div>
			<!-- If we need pagination -->
			<div class="swiper-pagination"></div>

			<!-- If we need navigation buttons -->
			<div class="swiper-button-prev"></div>
			<div class="swiper-button-next"></div>

			<!-- If we need scrollbar -->
			<div class="swiper-scrollbar"></div>
		</div>
	</div>
</div>

<style>
	.return {
		font-size: 1.5rem;
		margin-top: 10rem;
	}
</style>
