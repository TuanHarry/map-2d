<template>
	<section class="h-full w-full flex justify-center items-center bg-white">
		<div
			id="map_container"
			class="h-full w-full relative"
		>
			<button
				@click="handleVeVongTron"
				class="w-fit h-10 px-3 absolute top-10 left-10 bg-blue-400 "
				:style="'z-index:1'"
			> Vẽ vòng tròn</button>
		</div>
	</section>
</template>
<script>
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import CircleMode from "../../lib/modes/CircleMode";
import drawStyles from "../../lib/modes/styles";
import rewind from "@mapbox/geojson-rewind";
import { geojsonToLayer } from "../../lib/ui/util";

var dataFeatures = {
	type: "FeatureCollection",
	features: [],
};

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
			this.$SLMap.init("map_container", this.onLoad);
		});
	},

	methods: {
		onLoad(e) {
			let map = e.target;
			console.debug("mapbox loaded");

			// Add the Draw control to your map
			this.initMapboxglDraw();
			map.addControl(this.drawMap);
			// listen draw.create
			map.on("draw.create", this.createLayer);
			map.on("idle", this.onHandleIdle);
		},

		initMapboxglDraw() {
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
				styles: drawStyles,
				defaultMode: "draw_circle",
			});

			console.debug("hi");
		},

		stripIds(features) {
			return features.map((feature) => {
				delete feature.id;
				return feature;
			});
		},

		createLayer(e) {
			this.updateDrawLayer(this.stripIds(e.features));
		},

		updateDrawLayer(features) {
			console.debug("run cai update draw layer", features);
			let map = this.$SLMap.mapView;
			if (!map) return;

			console.debug("map current data scr", map, this.drawMap);
			let currentData = this.drawMap.getAll();
			console.debug("abc", currentData, currentData.features, features);
			dataFeatures.features = [...currentData.features, ...features];
			dataFeatures = rewind(dataFeatures);
			console.debug("abc111", dataFeatures);

			// console.debug("getSrc", map.getSource("map-data"));
			map.getSource("map-data").setData(dataFeatures);

			this.$SLMap.registerDataSource("map-data", dataFeatures);
			this.$SLMap.registerLayer(
				"test",
				"map-data",
				"fill",
				{
					paint: {
						"fill-color": "#DB877A",
						"fill-opacity": 0.55,
					},
				},
				"admin-0-boundary"
			);
		},

		onHandleIdle(e) {
			let map = e.target;
			if (!map) return;
			console.debug("map idle");
			map.addSource("map-data", {
				type: "geojson",
				data: dataFeatures,
			});
		},

		handleVeVongTron() {
			this.drawMap.changeMode("draw_circle");
		},
	},
};
</script>
<style scoped>
</style>