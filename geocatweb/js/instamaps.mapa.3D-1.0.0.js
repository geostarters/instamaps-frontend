/*
Variables GLOBALS del 3D

 */
var map3D;
var mapaVista3D;
var capesActives3D;

function canviaVista_3D_2D(boto, event) {

	(jQuery(boto).text() == '3D') ? init3D(boto) : init2D(boto);

	/*

	 */
}

function init3D(boto) {

	mapaVista3D = new IM_aplicacio({
			'mapId' : 'map',
			'mapId3D' : 'map3D'
		});

	mapaVista3D.canviaVisor3D(map, controlCapes);
	jQuery(boto).text('2D');
	/*
	$('.bt_3D_2D').tooltip({
	placement : 'left',
	container : 'body',
	title : window.lang.convert("Veure Mapa en 2D")
	});
	 */
}

function init2D(boto) {

	jQuery(boto).text('3D');

	/*
	$('.bt_3D_2D').tooltip('destroy').tooltip({
	placement : 'left',
	container : 'body',
	title : window.lang.convert("Veure Mapa en 3D")
	});
	 */
}

var IM_aplicacio = function (options) {

	this.options = options;
	this.cesium = undefined;
	this.leaflet = undefined;
	this.mapId = this.options.mapId;
	this.mapId3D = this.options.mapId3D;
	//this.mapId3D = 'map3D';
	this.container = document.getElementById(this.mapId);
	this.matriuCapes = {};
	this.matriuCapes.base = [];
	this.matriuCapes.overlays = [];

	this.setVisor = function (isLeaflet) {

		this.leaflet = isLeaflet;
		console.info(this.leaflet);
	},

	this.canviaVisor2D = function () {},

	this.canviaVisor3D = function (map, controlCapes) {

		this.bounds = map.getBounds();

		//document.getElementById(this.mapId).style.display = 'none';
		//document.getElementById("leaflet-map-pane").style.display = 'none';
		jQuery(".leaflet-map-pane").hide();

		map.setZoom(1);
		
		document.getElementById(this.mapId3D).style.display = 'block';

		//console.info(map.getLGActiveMap().getLayers());


		//document.getElementById(this.mapId).innerHTML = "";
		map3D = new Cesium.Viewer(this.mapId3D, {
				/*
				imageryProvider : new Cesium.OpenStreetMapImageryProvider({
				url : 'http://otile1.mqcdn.com/tiles/1.0.0/map/',
				fileExtension : 'png'
				}),
				 */
				imageryProvider : false,
				timeline : false,
				navigationHelpButton : false,
				scene3DOnly : true,
				fullscreenButton : false,
				baseLayerPicker : false,
				homeButton : false,
				infoBox : true,
				sceneModePicker : false,
				animation : false,
				geocoder : false,
				targetFrameRate : 40,
				showRenderLoopErrors : false,
				useDefaultRenderLoop : true,
				sceneMode : Cesium.SceneMode.SCENE3D,
				terrainProvider : new Cesium.CesiumTerrainProvider({
					url : 'https://cesiumjs.org/stk-terrain/tilesets/world/tiles'
					//url : '/cesium/terrenys/demextes'
				})
			});
		capesActives3D = map3D.scene.imageryLayers;
		//var rectangle = Cesium.Rectangle.fromDegrees(bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth());
		var ww = parseFloat(this.bounds.getNorth() - this.bounds.getSouth());
		var rectangle = Cesium.Rectangle.fromDegrees(this.bounds.getWest(), (this.bounds.getSouth() - ww), this.bounds.getEast(), this.bounds.getSouth());

		map3D.camera.viewRectangle(rectangle);

		/*
		var terrainProvider = new Cesium.CesiumTerrainProvider({
		url : '//cesiumjs.org/smallterrain'
		});
		 */
		/*
		var imageryLayers = map3D.imageryLayers;
		var imge = new Cesium.OpenStreetMapImageryProvider({
		url : 'http://otile1.mqcdn.com/tiles/1.0.0/map/',
		fileExtension : 'png'
		});

		var layer = new Cesium.ImageryLayer(imge);
		 */
		

		/*
		var orto_lyr = capesActives3D.addImageryProvider(new Cesium.OpenStreetMapImageryProvider({
		url : 'http://www.instamaps.cat/mapcache/tms/1.0.0/cat1936_3857@GM14/',
		fileExtension : 'png',

		}));
		 */

		//http://172.70.1.11/mapcache/wmts/1.0.0/A250TARJ3857/default/GMTOT/9/191/256.png

		

		/*
		var orto_lyr = capesActives3D.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({
		url : 'http://www.instamaps.cat/mapcache/wmts',
		layer : 'A250TARJ3857',
		style : 'default',
		format : 'image/png',
		tileMatrixSetID : 'GMTOT'
		}));
		 */
		 
		 this.addBaseLayersCesium();
		map3D.camera.setView({
			heading : Cesium.Math.toRadians(0.0),
			pitch : Cesium.Math.toRadians(-45.0), //tilt
			roll : 0.0
		});

		//console.debug(this.getCapesControlCapes(controlCapes));
		//console.debug(this.matriuCapes.overlays);
		//console.info(this.matriuCapes.base);


	},

			this.addBaseLayersCesium=function(){
		this.matriuCapes.base = map.getLGActiveMap().getLayers();
		for (var i = 0; i < this.matriuCapes.base.length; i++) {

			console.info(this.matriuCapes.base[i]);
			this._generaTipusLayerCesium(this.matriuCapes.base[i]);
			//capesActives3D.addImageryProvider(this._generaTipusLayerCesium(this.matriuCapes.base[i]));

		}
		/*
		var orto_lyr = capesActives3D.addImageryProvider(new Cesium.TileMapServiceImageryProvider({
					url : 'http://www.instamaps.cat/mapcache/tms/1.0.0/A250TARJ3857@GMTOT',
					fileExtension : 'png',
					maximumLevel : 16,
					credit : 'Black Marble imagery courtesy NASA Earth Observatory'
				}));
		*/
		
		
	}	,
	
	
	this._generaTipusLayerCesium = function (capa) {

		console.info(capa);

	},

	this.getCapesControlCapes = function (controlCapes) {

		var that = this;
		jQuery.each(controlCapes._layers, function (i, item) {
			//console.info(item);
			that._getCapesMatriuOverlays(item);
			jQuery.each(item._layers, function (j, item2) {
				//console.info(item2);
				that._getCapesMatriuOverlays(item);
			});
		});

		return this.matriuCapes;

	},

	this._getCapesMatriuOverlays = function (item) {

		var _item = this._validoTipusCapa(item);

		if (_item.valid) {

			console.info(_item);

			if (_item.tipus == "vector") {
				var L_JSON = item.layer.toGeoJSONcustom();

				this.matriuCapes.overlays.push({
					"tipus" : _item.tipus,
					"nom" : item.name,
					"businessId" : item.layer.options.businessId,
					"geojson" : JSON.stringify(L_JSON)
				});

			} else if (_item.tipus == "wms") {

				this.matriuCapes.overlays.push({
					"tipus" : _item.tipus,
					"nom" : item.name,
					"businessId" : item.layer.options.businessId,
					"url" : item.layer.options.url
				});

			}

		}

	},

	this.getCapesReferencia = function (map) {},

	this._validoTipusCapa = function (item) {
		var passo = {};
		if (document.getElementById('input-' + item.layer.options.businessId) != null) {

			if (item.layer._map != null &&
				item.layer.options.tipus != t_heatmap &&
				item.layer.options.tipus != t_cluster &&
				item.layer.options.tipus != t_size) {

				passo.valid = true;

				try {
					item.layer.toGeoJSONcustom();
					passo.tipus = "vector";
				} catch (err) {
					passo.tipus = "wms";
					console.debug(passo);
					return passo;

				}

			}

		} else {

			passo.valid = false;
			passo.tipus = false;

		}

		console.debug(passo);
		return passo;

	}

};
