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
import turfDistance from "@turf/distance";
import turfArea from "@turf/area";
import turfAlong from "@turf/along";
import turfCentroid from "@turf/centroid";
import * as turfhelp from "@turf/helpers";
import * as turfMeta from "@turf/invariant";
import numeral from "numeral";

import { geojsonToLayer } from "../../lib/ui/util";
import turfBearing from "@turf/bearing";
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
			map.on("draw.render", this.onHandleDrawRender);
			map.on("idle", this.onHandleIdle);
			this.$SLMap.registerDataSource("_measurements", dataFeatures);
			this.$SLMap.registerLayer("_measurements", "_measurements", "symbol", {
				paint: {
					"text-color": "hsl(234, 100%, 32%)",
					"text-halo-color": "hsl(0, 0%, 100%)",
					"text-halo-width": 2,
				},
				layout: {
					"text-field": "{label}",
					"text-size": 16,
				},
			});

			var point1 = [106.67304032029568, 10.771402539442903];
			var point4 = [106.67469728478446, 10.771402535044022];
			var point5 = [106.67421930309979, 10.770244327318778];
			var point2 = [106.67391115986482, 10.772784491263138];
			var point6 = [106.67146970296034, 10.77183023409036];
			var point3 = [106.67207401107453, 10.770090176787747];

			this.$SLMap.initMarker(point1);
			this.$SLMap.initMarker(point2);
			this.$SLMap.initMarker(point3);
			this.$SLMap.initMarker(point4);
			this.$SLMap.initMarker(point5);
			this.$SLMap.initMarker(point6);

			var bearing = turfBearing(point1, point2);
			console.debug("test", bearing);

			const datasrc = {
				id: "line",
				type: "Feature",
				properties: {
					type: "Text",
					coordinates: [point1, point2],
				},
				geometry: {
					coordinates: [point1, point2],
					type: "LineString",
				},
			};

			this.$SLMap.registerDataSource("testline", datasrc);

			this.$SLMap.registerLayer("layerline", "testline", "line", {
				layout: {
					"line-join": "round",
					"line-cap": "round",
				},
				paint: {
					"line-color": "red",
					"line-width": 1.5,
				},
			});

			// this.$SLMap.registerLayer("layertext", "testline", "symbol", {
			// 	layout: {
			// 		"symbol-placement": "line-center",
			// 		"text-size": [
			// 			"interpolate",
			// 			["exponential", 1.5],
			// 			["zoom"],
			// 			5,
			// 			10,
			// 			10,
			// 			12,
			// 		],
			// 		"text-field": "noi dung",
			// 		"text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
			// 		"text-allow-overlap": true,
			// 		"text-ignore-placement": true,
			// 		"text-offset": [0.5, -1.35],
			// 	},
			// 	paint: {
			// 		"text-color": ["get", "color"],
			// 		"text-halo-blur": 1,
			// 		"text-halo-color": "#fff",
			// 		"text-halo-width": 2,
			// 	},
			// });

			const centroid = turfCentroid(datasrc);

			console.debug("centroid ", centroid);

			const datasrcCentroild = {
				id: "centroid",
				type: "Feature",
				properties: {
					type: "Point",
					coordinates: [point1, point2],
				},
				geometry: {
					coordinates: point1,
					type: "Point",
				},
			};

			this.$SLMap.registerDataSource("testlineCentroild", datasrcCentroild);

			this.$SLMap.registerLayer("centroid", "testlineCentroild", "symbol", {
				layout: {
					"text-size": [
						"interpolate",
						["exponential", 1.5],
						["zoom"],
						5,
						10,
						10,
						12,
					],
					"text-field": `noi dung ${bearing}`,
					"text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
					"text-allow-overlap": true,
					"text-ignore-placement": true,
					"text-offset": [0.5, -4],
					"text-rotate": bearing < 0 ? 90 + bearing : bearing - 90,
				},
				paint: {
					"text-color": ["get", "color"],
					"text-halo-blur": 1,
					"text-halo-color": "#fff",
					"text-halo-width": 2,
				},
			});
		},

		initMapboxglDraw() {
			this.drawMap = new MapboxDraw({
				displayControlsDefault: true,
				userProperties: true,
				modes: {
					...MapboxDraw.modes,
					draw_circle: CircleMode,
				},

				controls: {
					polygon: true,
					trash: true,
				},
				styles: drawStyles,
				// defaultMode: "draw_circle",
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
			// let currentData = this.drawMap.getAll();
			// console.debug("abc", currentData, currentData.features, features);
			const currentFeatures = dataFeatures.features;
			dataFeatures.features = [...currentFeatures, ...features];
			dataFeatures = rewind(dataFeatures);
			console.debug("abc111", dataFeatures);

			// console.debug("getSrc", map.getSource("map-data"));
			// map.getSource("map-data").setData(dataFeatures);

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
			// map.addSource("map-data", {
			// 	type: "geojson",
			// 	data: dataFeatures,
			// });
		},

		onHandleDrawRender(e) {
			// console.debug("onHandleDrawRender");
			// let map = e.target;
			// if (!map) return;
			// var labelFeatures = [];
			// var all = this.drawMap.getAll();
			// if (all && all.features) {
			// 	console.debug("features", all, all.features);
			// 	all.features.forEach(function (feature) {
			// 		console.debug("feature", feature);
			// 		switch (turfMeta.getType(feature)) {
			// 			case "Point":
			// 				// label Points
			// 				if (feature.geometry.coordinates.length > 1) {
			// 					labelFeatures.push(
			// 						turfhelp.point(feature.geometry.coordinates, {
			// 							type: "point",
			// 							label:
			// 								feature.geometry.coordinates[1].toFixed(6) +
			// 								", " +
			// 								feature.geometry.coordinates[0].toFixed(6),
			// 						})
			// 					);
			// 				}
			// 				break;
			// 			case "LineString":
			// 				// label Lines
			// 				if (feature.geometry.coordinates.length > 1) {
			// 					var length = turfDistance(feature.geometry.coordinates);
			// 					console.debug("abc", length);
			// 					var label = numeral(length).format("0,0.0a") + "m";
			// 					var midpoint = turfAlong(
			// 						feature.geometry.coordinates,
			// 						length / 2,
			// 						{ units: "kilometers" }
			// 					);
			// 					labelFeatures.push(
			// 						turfhelp.point(midpoint, {
			// 							type: "line",
			// 							label: label,
			// 						})
			// 					);
			// 				}
			// 				break;
			// 			case "Polygon":
			// 				// label Polygons
			// 				if (
			// 					feature.geometry.coordinates.length > 0 &&
			// 					feature.geometry.coordinates[0].length > 3
			// 				) {
			// 					var area = turfArea(feature.geometry.coordinates);
			// 					var label = numeral(area).format("0,0.0a") + "m²";
			// 					labelFeatures.push(
			// 						turfCentroid(feature, {
			// 							type: "area",
			// 							label: label,
			// 						})
			// 					);
			// 				}
			// 				break;
			// 		}
			// 	});
			// }
			// map.getSource("_measurements").setData({
			// 	type: "FeatureCollection",
			// 	features: labelFeatures,
			// });
		},

		handleVeVongTron() {
			this.drawMap.changeMode("draw_circle");
		},
	},
};
</script>
<style scoped>
</style>