<template>
	<section class="h-full w-full flex justify-center items-center bg-white">
		<div
			id="map_container"
			class="h-full w-full"
		>

		</div>
	</section>
</template>
<script>
import mapboxgl from "mapbox-gl/dist/mapbox-gl.js";
import "mapbox-gl/dist/mapbox-gl.css";
export default {
	layout: "Map",
	data() {
		return {
			mapView: null,
		};
	},

	mounted() {
		this.$nextTick(() => {
			this.$nuxt.$loading.start();
			setTimeout(() => this.$nuxt.$loading.finish(), 500);
			this.initMap();
		});
	},

	methods: {
		async initMap() {
			mapboxgl.accessToken = this.$config.mapBoxKey;
			this.mapView = await new mapboxgl.Map({
				container: "map_container",
				style: "mapbox://styles/mapbox/streets-v11",
				center: [106.675235, 10.771911], // starting position
				zoom: 9,
			});

			this.navControl();
		},

		navControl() {
			if (this.mapView) {
				console.debug("call to ");
				// Add zoom and rotation controls to the map.
				this.mapView.addControl(new mapboxgl.NavigationControl());
			}
		},
	},
};
</script>
<style scoped>
</style>