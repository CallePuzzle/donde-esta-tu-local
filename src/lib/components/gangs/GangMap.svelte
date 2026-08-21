<script lang="ts">
	import { onMount } from 'svelte';
	import { initMap } from '$lib/utils/init-map';

	import type { Map } from 'leaflet';
	import type { Leaflet } from '$lib/utils/types';

	// Solo cubre lo que era idéntico en las 4 páginas con mapa: el contenedor,
	// su altura y el initMap() (que T18 ya había extraído, pero seguía
	// llamándose a mano en cada onMount). panTo/marker/click/showMyPosition
	// siguen siendo cosa de cada página: difieren demasiado entre ellas (Q12).
	type Props = {
		height?: string;
		onReady: (context: { L: Leaflet; map: Map }) => void;
	};

	let { height = '80vh', onReady }: Props = $props();

	onMount(async () => {
		const { L, map } = await initMap('map');
		onReady({ L, map });
	});
</script>

<div id="map" class="z-0" style="height: {height}"></div>
