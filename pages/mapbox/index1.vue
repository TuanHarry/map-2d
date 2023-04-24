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
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import CircleMode from "../../lib/modes/CircleMode";
export default {
	layout: "Map",
	data() {
		return {
			mapView: null,
			drawMap: null,
		};
	},

	mounted() {
		this.$nextTick(() => {
			this.$nuxt.$loading.start();
			setTimeout(() => this.$nuxt.$loading.finish(), 500);
			// this.initMap();
			this.$SLMap.init("map_container", this.onLoad);
		});
	},

	methods: {
		async initMap() {
			mapboxgl.accessToken = this.$config.mapBoxKey;
			this.mapView = await new mapboxgl.Map({
				container: "map_container",
				style: "mapbox://styles/mapbox/light-v10",
				antialias: false,
				center: [106.675235, 10.771911], // starting position
				zoom: 16,
			});

			this.initMapboxglDraw();

			// Add the Draw control to your map
			this.mapView.addControl(this.drawMap);
			this.navControl();
			this.onLoad();
			this.mapView.on("draw.create", this.updateArea);
		},

		navControl() {
			if (this.mapView) {
				console.debug("call to ");
				// Add zoom and rotation controls to the map.
				this.mapView.addControl(new mapboxgl.NavigationControl());
			}
		},

		onLoad() {
			if (this.mapView) {
				this.mapView.on("load", () => {});
			}
		},

		initMapboxglDraw() {
			const RadiusMode = MapboxDraw.modes.draw_line_string;
			this.drawMap = new MapboxDraw({
				displayControlsDefault: true,
				modes: {
					...MapboxDraw.modes,
					draw_circle: CircleMode,
				},

				controls: {
					polygon: true,
					trash: true,
				},

				defaultMode: "draw_circle",
			});
		},
	},
};
</script>
<style scoped>
</style>