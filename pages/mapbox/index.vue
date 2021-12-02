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
				style: "mapbox://styles/mapbox/light-v10",
				pitch: 45,
				bearing: -17.6,
				antialias: true,
				center: [106.675235, 10.771911], // starting position
				zoom: 16,
			});

			this.navControl();
			this.onLoad();
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
				this.mapView.on("load", () => {
					// Insert the layer beneath any symbol layer.
					const layers = this.mapView.getStyle().layers;
					const labelLayerId = layers.find(
						(layer) => layer.type === "symbol" && layer.layout["text-field"]
					).id;

					// The 'building' layer in the Mapbox Streets
					// vector tileset contains building height data
					// from OpenStreetMap.
					this.mapView.addLayer(
						{
							id: "add-3d-buildings",
							source: "composite",
							"source-layer": "building",
							filter: ["==", "extrude", "true"],
							type: "fill-extrusion",
							minzoom: 15,
							paint: {
								"fill-extrusion-color": "#aaa",

								// Use an 'interpolate' expression to
								// add a smooth transition effect to
								// the buildings as the user zooms in.
								"fill-extrusion-height": [
									"interpolate",
									["linear"],
									["zoom"],
									15,
									0,
									15.05,
									["get", "height"],
								],
								"fill-extrusion-base": [
									"interpolate",
									["linear"],
									["zoom"],
									15,
									0,
									15.05,
									["get", "min_height"],
								],
								"fill-extrusion-opacity": 0.6,
							},
						},
						labelLayerId
					);
				});
			}
		},
	},
};
</script>
<style scoped>
</style>