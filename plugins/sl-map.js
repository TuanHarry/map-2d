import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js'
import _ from "lodash"
import { MapboxTheme } from "~/models/definitions.js";
class SLMap {
  MapTheme = {
    street: 'mapbox://styles/mapbox/streets-v12',
    light: 'mapbox://styles/mapbox/light-v11',
    satellite: 'mapbox://styles/mapbox/satellite-streets-v11'
  }
  EmptyFeature = {
    type: 'FeatureCollection',
    features: []  // <--- no features
  }
  mapView = null // map instance
  mapReady = false
  registerLayers = []
  registerDataSources = []

  /**
 * variable Start
 */
  popup = null // popup instance
  tooltip = null // tooltip instance
  vnBBOX = [102.074771, 8.441735, 109.573388, 23.367988]
  styleCache = null
  defaultLayerList = []
  defaultSourcesList = []
  styleMap = {}

  //== variable End ==========================

  constructor(store, app) {
    this.store = store
    this.app = app
  }

  async init(container = 'map_container', onload = null, opts = null) {
    // init once
    if (this.mapView !== null) return

    var defaultOpts = {
      startPoint: [106.675235, 10.771911],
      zoom: 16,
      pitch: 0,
      minZoom: 3,
      maxZoom: 22
    }

    var options = _.assign({}, defaultOpts, opts);

    mapboxgl.accessToken = this.app.$config.mapBoxKey
    this.mapView = await new mapboxgl.Map({
      container: container,
      antialias: true,
      center: options.startPoint, // starting position
      zoom: options.zoom,
      pitch: options.pitch,
      attributionControl: false,
      projection: 'mercator',
      renderingMode: '2d',
      style: "mapbox://styles/mapbox/light-v10",
    })
    this.mapView.setRenderWorldCopies(true)
    this.mapView.setMinZoom(options.minZoom)
    this.mapView.setMaxZoom(options.maxZoom)
    // this.mapView.setStyle(this.MapTheme.light)
    // this.setMapboxTheme()

    if (onload !== null) {
      // khong bat su kien load vi ban do v11 khong load font kip de render layer, phai doi sang bat
      // event styledata de dam bao co du lieu font
      this.mapView.once('styledata', onload)
      this.mapView._on = this.onEvent.bind(this)
      this.mapView._off = this.offEvent.bind(this)
      //prevent duplicate
      this.mapView.off('click', this.handleCustomEvent)

      this.mapView.on('click', this.handleCustomEvent.bind(this))

    }
  }

  async clearAll() {
    await this.clearAllLayers()
    this.mapView = null
    this.mapReady = false
    this.popup = null
  }

  async clearAllLayers() {
    if (!this.mapView) return

    _.forEach(this.registerLayers, (layer) => {
      if (this.mapView.getLayer(layer)) {
        this.unregisterLayer(layer)
      }
    });

    _.forEach(this.registerDataSources, (sourceName) => {
      if (this.mapView.getSource(sourceName)) {
        this.unregisterDataSource(sourceName)
      }
    });
  }

  /**
   * Register data source for map
   * @param {String} sourceName 
   * @param {FeatureCollection} data if set null, will add datasource with empty data
   * @returns Boolean
   */
  registerDataSource(sourceName, data = null, optional = null) {
    if (!this.mapView) return false

    if (!this.mapView.getSource(sourceName)) {
      // merger data && optional
      let defaultData = {
        type: 'geojson',
        data: (data) ? data : this.EmptyFeature,
        tolerance: 0
      }
      let dataSrcConfig = _.merge(defaultData, optional)
      // add data source
      this.mapView.addSource(sourceName, dataSrcConfig)
      // add source name to array, that will help to clean later
      if (_.indexOf(this.registerDataSources, sourceName) == -1) {
        this.registerDataSources.push(sourceName)
      }
    } else {
      this.setClusterDataSource(sourceName, data)
    }

    return true
  }

  /**
   * 
   * @param {String} sourceName 
   * @returns Boolean
   */
  unregisterDataSource(sourceName) {
    if (!this.mapView || !this.mapView.getSource(sourceName)) return false

    this.mapView.removeSource(sourceName)
    _.remove(this.registerDataSources, sourceName)

    return true
  }

  /**
   * 
   * @param {String} sourceName 
   * @param {FeatureCollection} data if set null, will add datasource with empty data
   * @returns Boolean
   */
  setClusterDataSource(sourceName, data = null) {
    if (!this.mapView || !this.mapView.getSource(sourceName)) return false

    this.mapView.getSource(sourceName).setData((data) ? data : this.EmptyFeature)
    return true
  }

  /**
   * 
   * @param {String} layerID 
   * @param {String} sourceName 
   * @param {String} type (follow https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/#type)
   * @param {Object} opts 
   * @returns Boolean
   */
  registerLayer(layerID, sourceName, type, opts = null, beforeId = null) {
    if (!this.mapView) return false

    // add layer if map dont have any same layer id that was added
    if (!this.mapView.getLayer(layerID)) {

      var options = _.assign({}, {
        id: layerID,
        source: sourceName,
        type: type
      }, opts);

      this.mapView.addLayer(options, beforeId)
    }

    // add layers have data to array, that will help to clean later
    if (_.indexOf(this.registerLayers, layerID) == -1) {
      this.registerLayers.push(layerID)
    }

    return true
  }

  /**
   * 
   * @param {String} layerID 
   * @returns Boolean
   */
  unregisterLayer(layerID) {
    if (!this.mapView) return false
    if (this.mapView.getLayer(layerID)) {
      this.mapView.removeLayer(layerID)
    }
    _.remove(this.registerLayers, layerID)

    return true
  }

  /**
   * Tuan Code Start
   */
  initPopup(classname) {
    if (this.popup) return
    this.popup = new mapboxgl.Popup({
      offset: [0, -28],
      closeButton: false,
      closeOnClick: false,
      closeOnMove: false,
      maxWidth: 'none',
      className: classname ? classname : 'cluster-popup',
      anchor: 'bottom'
    })
  }

  setDataPopup({ lnglat, content, isDOMContent = false }, popupClassName) {
    // check map is exist
    if (!this.mapView) return
    // check data latlng, domContent is exist
    if (!lnglat || !content)
      return
    // check popup is exist
    if (!this.popup) {
      this.initPopup(popupClassName)
    }

    let curPopupClassname = this.popup.options.className
    if (curPopupClassname != popupClassName) {
      this.popup.addClassName(popupClassName)
      this.popup.removeClassName(curPopupClassname)
    }

    // set data popup
    if (isDOMContent) {
      this.popup.setLngLat(lnglat)
        .setDOMContent(content)
        .addTo(this.mapView)
    } else {
      this.popup.setLngLat(lnglat)
        .setHTML(content)
        .addTo(this.mapView)
    }
  }

  removePopup() {
    if (this.popup) {
      this.popup.remove()
    }
  }

  setMapboxTheme(payload) {
    // Default theme 
    if (!this.store.state.mapboxTheme) {
      this.mapView.setStyle(this.MapTheme.light)
      this.store.dispatch('setMapboxTheme', MapboxTheme.LIGHT)
      return
    }
    // Set theme for mapbox
    if (payload) {
      this.store.dispatch('setMapboxTheme', payload)
    }
    // Get styleCache from map style
    this.styleCache = this.mapView.getStyle();

    // Get current theme 
    let maptheme = this.store.state.mapboxTheme
    switch (maptheme) {
      case MapboxTheme.STREET:
        this.mapView.setStyle(this.MapTheme.street)
        break;
      case MapboxTheme.SATELLITE:
        this.mapView.setStyle(this.MapTheme.satellite)
        break;
      default:
        this.mapView.setStyle(this.MapTheme.light)
        break;
    }
  }

  restoreLayers() {
    if (!this.styleCache || !this.mapView)
      return

    this.defaultSourcesList = new Set(
      [...this.defaultSourcesList].concat(
        Object.keys(this.mapView.getStyle().sources || {})
      )
    );
    this.defaultLayerList = new Set(
      [...this.defaultLayerList].concat(
        this.mapView.getStyle().layers?.map((l) => l.id) || []
      )
    );

    //Readd sources
    const sources = this.styleCache.sources;
    if (sources) {
      for (const source in sources) {
        if (!this.defaultSourcesList.has(source)) {
          this.mapView.addSource(source, sources[source]);
        }
      }
    }

    //Readd layers
    const layers = this.styleCache.layers;
    if (layers) {
      for (let i = 0; i < layers.length; i++) {
        if (!this.defaultLayerList.has(layers[i].id)) {
          this.mapView.addLayer(layers[i]);
        }
      }
    }
  }

  registerImage(imageID, url, width, height, isSdf = false) {
    if (!this.mapView || _.isEmpty(url)) return
    let imageSrc = require(`~/${url}.png`)
    let image = new Image(width, height)
    image.onload = () => {
      if (!this.mapView.hasImage(imageID)) {
        this.mapView.addImage(imageID, image, { pixelRatio: 3, sdf: isSdf })
      }
    }
    image.src = imageSrc
  }

  initLngLatBounds(coordinates = []) {
    return new mapboxgl.LngLatBounds(coordinates)
  }

  toggleOnOffLayer(layer, condition) {
    if (this.mapView.getLayer(layer)) {
      this.mapView.setLayoutProperty(layer, 'visibility', condition ? 'visible' : 'none')
    }
  }

  registerDataSourceVector(sourceName, tilesUrls = null) {
    if (!this.mapView) return false

    if (!this.mapView.getSource(sourceName)) {
      // merger data && optional
      let defaultData = {
        type: 'vector',
        tiles: [tilesUrls],
        tolerance: 0
      }
      // add data source
      this.mapView.addSource(sourceName, defaultData)
      // add source name to array, that will help to clean later
      if (_.indexOf(this.registerDataSources, sourceName) == -1) {
        this.registerDataSources.push(sourceName)
      }
    } else {
      this.setClusterDataSourceVector(sourceName, tilesUrls)
    }

    return true
  }

  setClusterDataSourceVector(sourceName, tilesUrl = null) {
    if (!this.mapView || !this.mapView.getSource(sourceName) || !tilesUrl) return false

    this.mapView.getSource(sourceName).setTiles([tilesUrl])
    return true
  }

  initTooltip(classname, opt = null) {
    if (this.tooltip) return
    let config = {
      offset: [0, -28],
      closeButton: false,
      closeOnClick: false,
      closeOnMove: false,
      maxWidth: 'none',
      className: classname ? classname : 'cluster-popup',
      anchor: 'bottom'
    }
    let popupConfig = _.merge(config, opt)
    this.tooltip = new mapboxgl.Popup(popupConfig)
  }

  setDataTooltip({ lnglat, content, isDOMContent = false }, popupClassName) {
    // check map is exist
    if (!this.mapView) return
    // check data latlng, domContent is exist
    if (!lnglat || !content)
      return
    // check popup is exist
    if (!this.tooltip) {
      this.initTooltip(popupClassName)
    }

    // let curPopupClassname = this.popup.options.className
    // if (curPopupClassname != popupClassName) {
    //   this.popup.addClassName(popupClassName)
    //   this.popup.removeClassName(curPopupClassname)
    // }

    // set data popup
    if (isDOMContent) {
      this.tooltip.setLngLat(lnglat)
        .setDOMContent(content)
        .addTo(this.mapView)
    } else {
      this.tooltip.setLngLat(lnglat)
        .setHTML(content)
        .addTo(this.mapView)
    }
  }

  removeTooltip() {
    if (this.tooltip) {
      this.tooltip.remove()
    }
  }

  //==Tuan Code End==========================

  /**
   * Custom Event Handler
   */
  _CustomListeners = {}

  onEvent(eventType, layerId, listener) {
    if (this._CustomListeners[eventType] == undefined) {
      this._CustomListeners[eventType] = {};
    }
    this._CustomListeners[eventType][layerId] = listener;
  }

  offEvent(eventType, layerId) {
    if (this._CustomListeners[eventType] == undefined) {
      this._CustomListeners[eventType] = {}
    }
    if (this._CustomListeners[eventType][layerId]) {
      delete this._CustomListeners[eventType][layerId]
    }
  }

  handleCustomEvent(event) {
    const features = this.mapView.queryRenderedFeatures(event.point);

    if (!event.stopPropagation) {
      event.stopPropagation = function () {
        this.originalEvent.cancelBubble = true;
      }
    }

    features.forEach(feature => {
      if (event.originalEvent.cancelBubble) return

      if (this._CustomListeners[event.type] && this._CustomListeners[event.type][feature.layer.id]) {
        const listener = this._CustomListeners[event.type][feature.layer.id];
        event.feature = feature;
        listener(event);
      }
    });

    if (event.originalEvent.cancelBubble) return true
  }
  //== Custom Event Handler End==========================
}

export default ({ store, app }, inject) => {
  var slMap = new SLMap(store, app)
  inject('SLMap', slMap);
}