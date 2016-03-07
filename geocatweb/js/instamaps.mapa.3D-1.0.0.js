/*
Variables GLOBALS del 3D
 */

var viewer;
var mapaVista3D = null;
var capesActives3D;
var modul3D = true;
var terreny;
var _imageryLayers;
var scene;
var camera;
var ellipsoid;
var handler;
var baseLayer3D = [];
var overLayers3D = [];
var matriu3 = [];
var factorTerreny = 14;
var browserWebGL;
var disparaEventMapa=true;
var mapaEstatNOPublicacio=true;
var initAmbVistaControlada=false;
var msgHTML=""
function addModul3D() {

	browserWebGL = detectoCapacitatsWebGL();

	if (browserWebGL) {
		$("head").append('<link id="cesium_css" href="/llibreries/cesium/Cesium.css" type="text/css" rel="stylesheet" />');
		$("head").append('<script src="/llibreries/cesium/Cesium.js"  type="text/javascript"></script>');
		$("head").append('<script src="/llibreries/cesium/Cesium.PinBuilder_IM.js"  type="text/javascript"></script>');
		$("head").append('<script src="/llibreries/cesium/cesium-navigation.js"  type="text/javascript"></script>');
		$("body").append('<div id="map3D"></div>');
		$("body").append('<div id="popup3D"></div>');
		/*
		$("body").append('<div id="bt_pinch3D" class="leaflet-control btn btn-default btn-sm" lang="ca" title="Inclinar vista">'+
		'<span id="span_bt_pinch3D" class="glyphicon glyphicon-road grisfort"></span></div>');
*/
	}

	jQuery('.bt_3D_2D').on('click', function (event) {
		aturaClick(event);
		_gaq.push(['_trackEvent', 'mapa', tipus_user + '3D', 'label 3D', 1]);

		// mirar si el navegador suporta 3d
		browserWebGL ? canviaVista_3D_2D(this) : mostraMsgNo3D();

	});

	jQuery(document).on('click', "#tanca3D", function (e) {
		jQuery("#popup3D").hide();

	});
	
	/*
	jQuery(document).on('click', "#bt_pinch3D", function (e) {
		
		if (estatMapa3D) {
			mapaVista3D.changePitch();
		}
		

	});
	
	*/

	
	
}





function gestionFonsMapa3D() {


console.warn("gestionFonsMapa3D");
	if (estatMapa3D && mapaEstatNOPublicacio) {
		
		
		mapaVista3D.addBaseLayersCesium();
	}

}

function canviaVista_3D_2D(boto, event) {

	(jQuery(boto).text() == '3D') ? init3D(boto) : init2D(boto);

}


function initMapa3DfromMapConfig(){
	
	
	
	if(browserWebGL){
		
		console.warn(mapConfig.options.mapa3D);
		initAmbVistaControlada=true;
		jQuery('.bt_3D_2D').text('2D');
		inicialitzaMapa3D();	
	}
	 
 }	 


function inicialitzaMapa3D(){
	
	if(browserWebGL){
			if (mapaVista3D == null) {
				mapaVista3D = new IM_aplicacio({
						'mapId' : 'map',
						'mapId3D' : 'map3D'
					});

			}
			mapaVista3D.canviaVisor3D(map, controlCapes);
			ActDesOpcionsVista3D(true);

			drgFromMapa = null;
			creaAreesDragDropFiles();
	}
	
}	

function init3D(boto) {

	
	jQuery(boto).text('2D');
	inicialitzaMapa3D();
	
	

}

function init2D(boto) {
	jQuery(boto).text('3D');

	mapaVista3D.retornaPosicio2D().then(function (bbox) {
		map.fitBounds([[bbox.lat0, bbox.lng0], [bbox.lat1, bbox.lng1]]);
		map.spin(true);
		
		$("#map3D").fadeOut("slow", function () {
			jQuery('.leaflet-map-pane').show();
			jQuery("#map3D").hide();
			//jQuery("#bt_pinch3D").hide();
		jQuery("#map3D").html('');
		jQuery("#not_3d").remove();
			map.spin(false);
		});

		estatMapa3D = false;
		mapaVista3D = null;
		//drgFromMapa = null;
		//creaAreesDragDropFiles();
		ActDesOpcionsVista3D(false);

	});
}

function ActDesOpcionsVista3D(activa3D) {

	var crtl = ['.leaflet-control-scale',
				'.leaflet-control-minimap-toggle-display',
				'.leaflet-control-zoom',
				'.bt_geopdf',
				'.leaflet-control-draw-measure',
				'#dv_bt_Routing'
				];

	if (activa3D) {

		jQuery('#funcio_draw').prepend('<div id="not_3d">' +
			window.lang.convert('Operació no disponible en modus 3D') +
			'</div>');

		jQuery('.leaflet-control-minimap').css('visibility','hidden');
			$.each(crtl, function( index, value ) {
				jQuery(value).hide(); 
			});
			
		//jQuery(
		
		//jQuery('.leaflet-control-minimap').css('visibility', 'hidden');

	} else {

		
		jQuery('.leaflet-control-minimap').css('visibility','visible');
		
		$.each(crtl, function( index, value ) {
				jQuery(value).show(); 
			});
		
		//viewer.navigation.destroy();
		viewer.navigation = undefined;

		jQuery('.leaflet-control-minimap').css('visibility', 'visible');

	}

}

var IM_aplicacio = function (options) {

	this.options = options;
	this.cesium = undefined;
	this.leaflet = undefined;
	this.mapId = this.options.mapId;
	this.mapId3D = this.options.mapId3D;
	this.container = document.getElementById(this.mapId);
	this.matriuCapes = {};
	this.matriuCapes.base = [];
	this.matriuCapes.overlays = [];
	this.setVisor = function (isLeaflet) {
		this.leaflet = isLeaflet;

	},

	this.canviaVisor2D = function () {
		estatMapa3D = false;
	},

	this.canviaVisor3D = function (map, controlCapes) {
		this.bounds = map.getBounds();

		terreny = new Cesium.CesiumTerrainProvider({
				url : '/cesium/terrenys/demextes',
				credit : 'icgc'
			});

		this.gestionaTerrainProvaider(this.bounds.getCenter().lat, this.bounds.getCenter().lng, 'icgc').then(function (terrain) {

			if (terrain != null) {
				terreny = terrain;
			}

		});

		viewer = new Cesium.Viewer(this.mapId3D, {
				imageryProvider : false,
				timeline : false,
				navigationHelpButton : false,
				scene3DOnly : true,
				fullscreenButton : false,
				baseLayerPicker : false,
				homeButton : false,
				infoBox : false,
				sceneModePicker : false,
				animation : false,
				geocoder : false,
				contextOptions: {webgl:{preserveDrawingBuffer:true}},   
				showRenderLoopErrors : false,
				useDefaultRenderLoop : true,
				sceneMode : Cesium.SceneMode.SCENE3D,
				terrainProvider : terreny
			});

		navigationInitialization(this.mapId3D, viewer);
		scene = viewer.scene;
		scene.globe.depthTestingAgainstTerrain = true;
		camera = viewer.scene.camera;
		ellipsoid = scene.globe.ellipsoid;
		viewer.scene.globe.enableLighting = true;
		viewer.scene.fog.enabled = true;
		viewer.scene.fog.density = 0.0002;
		viewer.scene.fog.screenSpaceErrorFactor = 2;
		capesActives3D = viewer.scene.imageryLayers;
		_imageryLayers = viewer.imageryLayers;
		jQuery("#bt_pinch3D").show();
		map.spin(true);
		var zz = parseInt(map.getZoom());
		if (zz < 15) {
			//disparaEventMapa=false;
			//map.setZoom(parseInt(zz) + 1)
		}
		this.bounds = map.getBounds();
		$(".leaflet-map-pane").fadeOut("slow", function () {
			jQuery('#map3D').show();
			jQuery(".leaflet-map-pane").hide();
			//map.setZoom(1);

			map.spin(false);
		});

		
		estatMapa3D = true;
		//jQuery(".leaflet-map-pane").hide();
		
		// rectangle = Cesium.Rectangle.fromDegrees(0,40,3,43);
		// TODO-posar animació
		/*
		viewer.camera.setView({
		destination: rectangle,
		orientation: {
		heading: Cesium.Math.toRadians(0.0),
		pitch: Cesium.Math.toRadians(-45.0),
		roll: 0.0
		}
		});
		 */

		
		this.calculaPosicioInici(this.bounds).then(function (rectangle) {

		
		
		if(initAmbVistaControlada && mapConfig.options.cameraPos){
			
			var cameraPos=mapConfig.options.cameraPos;
			
			if(cameraPos.indexOf('NaN')!=-1){
			
			this.setPosicioCamera3D(cameraPos);
			
			}else{
			viewer.camera.setView({destination : rectangle.rectangle});
			
			}
		
		}else{
			
		
			viewer.camera.setView({destination : rectangle.rectangle});
		
		}
		
		
		
			
			
			
			
		/*
			viewer.camera.setView({
				destination : rectangle.rectangle2,
				orientation : {
					heading : Cesium.Math.toRadians(0.0),
					pitch : Cesium.Math.toRadians(-60.0),
					roll : 0.0
				}
			});
*/
			// console.warn(rectangle);
			/*
			viewer.camera.flyTo({
			destination : rectangle.rectangle,
			duration : 0,
			complete : function () {
			setTimeout(function () {
			viewer.camera.flyTo({
			destination : Cesium.Cartesian3.fromDegrees(rectangle.centerLng, rectangle.southLat),
			orientation : {
			heading : Cesium.Math.toRadians(0.0),
			pitch : Cesium.Math.toRadians(-60.0), //tilt
			},
			easingFunction : Cesium.EasingFunction.LINEAR_NONE
			});
			}, 2000);
			}
			});


			 */

		});

		
		this.addBaseLayersCesium();

		//Afegin Events Cesium hanlers

		handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
		var thet = this;
		handler.setInputAction(function (movement) {
			var pickedObjects = scene.drillPick(movement.position);
		msgHTML="";
			//this.getFeatureInfo(movement.position);
			jQuery("#popup3D").hide();
			var pickRay = viewer.camera.getPickRay(movement.position);
			var featuresPromise = viewer.imageryLayers.pickImageryLayerFeatures(pickRay, viewer.scene);
			if (!Cesium.defined(featuresPromise)) {
				//console.warn('No features picked.');
			} else {
				Cesium.when(featuresPromise, function (features) {
					console.warn('Number of features: ' + features.length);
					if (features.length > 0) {

						console.info(features[0]);
						thet.generaPopup(features[0], "raster");
					}
				});

			}

			if (Cesium.defined(pickedObjects)) {

				//pickedEntities.removeAll();
				//for (var i = 0; i < pickedObjects.length; ++i) {

				if (pickedObjects.length > 0) {

					thet.generaPopup(pickedObjects[0].id, "vector");

				}

			}
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

		handler.setInputAction(function (movement) {
			thet.miraPosicioXYZ(movement);
		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

		viewer.camera.moveEnd.addEventListener(function () {
			disparaEventMapa=true;
			var windowPosition = new Cesium.Cartesian2(viewer.container.clientWidth / 2, viewer.container.clientHeight / 2);
			var pickPosition = viewer.camera.pickEllipsoid(windowPosition);
			var pickPositionCartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(pickPosition);
			var lng = Cesium.Math.toDegrees(pickPositionCartographic.longitude);
			var lat = Cesium.Math.toDegrees(pickPositionCartographic.latitude);
			thet.gestionaTerrainProvaider(lat, lng, terreny.credit.text).then(function (terrain) {
				if (terrain != null) {
					terreny = terrain;
					viewer.terrainProvider = terreny;
				}
			});

		});

		this.miraCapesiExternes();
		this.activaEventLeaflet();

	},

	
	
	
		
	
	this.miraCapesiExternes = function () {

		this.addOverlaysLayersCesium(controlCapes);
	},

	this.activaEventLeaflet = function () {
		var thet = this;
		map.on('viewreset', function (e) {
			if (estatMapa3D && disparaEventMapa) {
				
			
				thet._goTo(map.getCenter().lat, map.getCenter().lng);

			}

		});

	},

	this.miraPosicioXYZ = function (movement) {
		matriu3 = [];

		var ellipsoid = viewer.scene.globe.ellipsoid;
		var cartesian = viewer.camera.pickEllipsoid(movement.endPosition, ellipsoid);

		if (cartesian) {
			var cartographic = ellipsoid.cartesianToCartographic(cartesian);
			var lon = Cesium.Math.toDegrees(cartographic.longitude);
			var lat = Cesium.Math.toDegrees(cartographic.latitude);
			var lonC = Cesium.Math.toRadians(lon);
			var latC = Cesium.Math.toRadians(lat);

			if (!isNaN(lonC)) {

				var text = '<div>WGS84 ' + lon.toFixed(5) + ' ' + lat.toFixed(5) + '</div>';
				jQuery('.leaflet-control-mouseposition').html(text);

				
			}

		}

	},
	this._goTo = function (lat, lng) {

		viewer.camera.setView({
			destination : Cesium.Cartesian3.fromDegrees(lng, lat, 3000)
		});

	},

	this.actualitzaVistaOverlays = function (obj, accio, visible) {

		//accio== remove | display	| add

		console.warn(mapaEstatNOPublicacio);
		
		if(mapaEstatNOPublicacio){

		if (accio == "add") {

			if (jQuery.inArray(obj.businessId, overLayers3D) == -1) {

				this.matriuCapes.overlays = [];
				this.addOverlaysLayersCesium();
			}

		} else if ((accio == "display") || (accio == "remove")) {

			if (obj.tipus.indexOf("wms") != -1) {
				
				jQuery.each(capesActives3D._layers, function (index, layer) {
					//_imageryLayers.remove(layer, true); //capesActives3D
					
					if (layer.id && layer.id == obj.businessId) {
						accio == "display" ? layer.show = visible : capesActives3D.remove(layer, true);
					}
				});

			} else {

				jQuery.each(viewer.entities.values, function (index, feature) {
					if (feature.properties.dataSource == obj.businessId) {
						accio == "display" ? feature.show = visible : viewer.entities.remove(feature);
					}
				});

			}

		} else {

			jQuery.each(viewer.entities.values, function (index, feature) {
				if (feature.properties.dataSource == obj.businessId) {
					feature.show = visible;
				}
			});

		}
		
		}
	},

	this.generaPopup = function (player, origen) {
		//var msgHTML = '';
		if (origen == "vector") {

			var out = [];
			if (player.properties.nom && !isBusinessId(player.properties.nom)) {
				msgHTML += '<h4>' + player.properties.nom + '</h4>';
			} else if (player.properties.name && !isBusinessId(player.properties.name)) {
				msgHTML += '<h4>' + player.properties.name + '</h4>';
			} else if (player.properties.Name && !isBusinessId(player.properties.Name)) {
				msgHTML += '<h4>' + player.properties.Name + '</h4>';
			}
			if (player.properties.description) {
				if (!$.isNumeric(player.properties.description))
					msgHTML += '<div>' + parseUrlTextPopUp(player.properties.description) + '</div>';
				else
					msgHTML += '<div>' + player.properties.description + '</div>';
			}
			msgHTML += '<div class="div_popup_visor"><div class="popup_pres">';
			var pp = player.properties;
			$.each(pp, function (key, value) {
				if (key != "styles" && key != "dataSource") {

					if (isValidValue(value)) {
						if (key != 'name' && key != 'Name' && key != 'description' && key != 'id' && key != 'businessId' && key != 'slotd50') {
							msgHTML += '<div class="popup_data_row">';
							var txt = value;
							if (!$.isNumeric(txt) && key != "styles") {

								txt = parseUrlTextPopUp(value, key);

								if (txt.indexOf("iframe") == -1 && txt.indexOf("img") == -1) {
									msgHTML += '<div class="popup_data_key">' + key + '</div>';
									msgHTML += '<div class="popup_data_value">' + txt + '</div>';
								} else {
									msgHTML += '<div class="popup_data_img_iframe">' + txt + '</div>';
								}
							} else {
								msgHTML += '<div class="popup_data_key">' + key + '</div>';
								msgHTML += '<div class="popup_data_value">' + txt + '</div>';
							}
							msgHTML += '</div>';
						}
					}

				}
			});

			msgHTML += '</div></div>';

		} else {

			
			msgHTML += player.data;

		}

		var html2 = '<div class="leaflet-popup leaflet-container leaflet-zoom-animated" style="opacity:1"><a id="tanca3D" class="leaflet-popup-close-button" href="#close">×</a>' +
			'<div class="leaflet-popup-content-wrapper">' +
			'<div class="leaflet-popup-content" style="width: 301px;">' +
			msgHTML +
			'</div></div></div>';

		jQuery("#popup3D").show();
		jQuery("#popup3D").html(html2);

	},
	this.addBaseLayersCesium = function () {

		if(mapaEstatNOPublicacio){
		
		console.warn("addBaseLayersCesiu2m");
		console.warn(mapaEstatNOPublicacio);

		
		
		jQuery.each(baseLayer3D, function (index, layer) {
			_imageryLayers.remove(layer, true); //capesActives3D
		});

		baseLayer3D = [];
		this.matriuCapes.base = map.getLGActiveMap().getLayers();
		this.matriuCapes.base.reverse();
		for (var i = 0; i < this.matriuCapes.base.length; i++) {
			var url = this.matriuCapes.base[i]._url;
			this.matriuCapes.base[i].options.tms ? url = url.replace('{y}', '{reverseY}') : url;

			var BB_layer = _imageryLayers.addImageryProvider(new Cesium.UrlTemplateImageryProvider({
						url : url,
						// maximumLevel : this.matriuCapes.base[i].options.maxZoom,
						maximumLevel : 18
						// minimumLevel:this.matriuCapes.base[i].options.minZoom
					}));
			_imageryLayers.lowerToBottom(BB_layer);
			baseLayer3D.push(BB_layer);
		}
		
		}
	},

	this.addOverlaysLayersCesium = function () {

		var that = this;

		jQuery.each(controlCapes._layers, function (i, item) {

			that._utilValidoClassificoTipusCapa(item);
			jQuery.each(item._layers, function (j, item2) {
				that._utilValidoClassificoTipusCapa(item2);
			});
		});

		this.addOverlaysVectorsCesium();
		this.addOverlaysRastersCesium();

	},

	this._utilValidoClassificoTipusCapa = function (item) {

		//if (document.getElementById('input-'+item.layer.options.businessId) != null) {

		if (item.layer._map != null) {

			if (item.layer.options.tipus != t_heatmap && item.layer.options.tipus != t_cluster && item.layer.options.tipus != t_size) {

				if (jQuery.inArray(item.layer.options.businessId, overLayers3D) == -1) {
					this.matriuCapes.overlays.push(this._utilDeterminaTipusItem(item, true));
				}
			} else {
				// ACTIVES tipus capes heatmaps,cluster o bombolla TODO

			}

		} else { //NO ACTIVES

			if (item.layer.options.tipus != t_heatmap && item.layer.options.tipus != t_cluster && item.layer.options.tipus != t_size) {
				if (jQuery.inArray(item.layer.options.businessId, overLayers3D) == -1) {
					this.matriuCapes.overlays.push(this._utilDeterminaTipusItem(item, false));
				}

			} else {
				// NO ACTIVES tipus capes heatmaps,cluster o bombolla TODO

			}
		} //FI ELSE NO actives
		//}
	},

	this.addOverlaysRastersCesium = function () {

		matriuCapesLL.layers = [];
		matriuCapesLL.n_layers = [];
		matriuCapesLL.id_layers = [];
		matriuCapesLL.t_layers = [];
		matriuCapesLL.c_layers = [];
		matriuCapesLL.v_layers = [];
		var _hihaVecras = false;
		for (var i = 0; i < this.matriuCapes.overlays.length; i++) {

			if (jQuery.inArray(this.matriuCapes.overlays[i].businessId, overLayers3D) == -1) {

				if (this.matriuCapes.overlays[i].tipus == "raster") {

					console.warn("HI HA RASTER");
					console.warn(this.matriuCapes.overlays[i]);
					console.warn("**********************************");

					var raster = this.matriuCapes.overlays[i].item;

					var visible = this.matriuCapes.overlays[i].show;
					if (raster.layer.options.tipus.indexOf("wms") != -1) {
						console.info(raster);
						var _url = raster.layer._url;
						if (_url.indexOf('?') == -1) {
							_url = _url + '?';
						}

						var opacity = 0.9;
						console.debug(raster.layer);
						if (raster.layer.options.opacity) {
							opacity = raster.layer.options.opacity;
						}

						var provider = new Cesium.WebMapServiceImageryProvider({
								url : _url,
								layers : raster.layer.wmsParams.layers,
								enablePickFeatures : true,
								getFeatureInfoAsXml : false,
								getFeatureInfoAsGeoJson : false,
								getFeatureInfoParameters : {
									info_format : 'text/plain'
								},
								parameters : {
									transparent : 'true',
									format : 'image/png',
									styles : 'default'
								},
								maximumLevel : 18,
								proxy : {
									getURL : function (url) {
										return paramUrl.proxy_betterWMS + '?url=' + encodeURIComponent(url);
									}
								}
							});

						provider.alpha = opacity;
						
						setTimeout(this.delayAddImageProvider(provider, visible, raster.layer.options.businessId), 3000);

					}

				} else if (this.matriuCapes.overlays[i].tipus == "vecras") {
					console.warn("HI HA VECRAS");
					console.warn(this.matriuCapes.overlays[i]);
					console.warn("**********************************");

					_hihaVecras = true;
					var vecras = this.matriuCapes.overlays[i].item;
					var visible = this.matriuCapes.overlays[i].show;

					try {
						ompleCapesMatriu(vecras, true);
						matriuCapesLL.v_layers.push(visible);
					} catch (Err) {}

				}

			}

		} //fi for

		if (_hihaVecras) {
			this.generaWMSfromCapesVector();

		}

	},

	this.generaWMSfromCapesVector = function () {

		var data = matriuCapesLL;

		var that = this;
		data.request = "createWMSfromMap";
		data.entitatUid = _UsrID,
		data.businessId = mapConfig.businessId;
		data.nomAplicacio = mapConfig.nomAplicacio;

		console.info(data);
		createMapToWMS(data).then(
			function (results) {
			if (results.status == "OK") {

				var url = results.url;
				if (url.indexOf('?') == -1) {
					url = url + '?';
				}

				that.addVectortoWMSToMatriuCapes(data.id_layers, data.n_layers, url, data.v_layers);
			} else if (results.status == "VOID") {}
			else {
				console.info(results.msg);
			}
		});
	},

	this.addVectortoWMSToMatriuCapes = function (layers, titles, url, visible) {

		var that = this;
		jQuery.each(layers, function (i, item) {

			var _bbox = 'bbox={westProjected}%2C{southProjected}%2C{eastProjected}%2C{northProjected}&';
			var srs = "EPSG:3857";

			var provider = new Cesium.UrlTemplateImageryProvider({

					enablePickFeatures : true,
					getFeatureInfoAsXml : false,
					getFeatureInfoAsGeoJson : false,
					getFeatureInfoParameters : {
						info_format : 'text/plain'
					},

					url : url + '&tiled=true&' +
					'transparent=true&format=image%2Fpng&exceptions=inimage&' +
					'styles=&service=WMS&version=1.1.1&request=GetMap&' +
					'layers=Capa_' + item + '&srs=' + encodeURI(srs) + '&' +
					_bbox +
					'width=256&height=256&',
					maximumLevel : 17
				});

			setTimeout(that.delayAddImageProvider(provider, visible[i], item), 3000);

		});

	},

	this.delayAddImageProvider = function (provider, visible, id) {

		var _tmpLayer = capesActives3D.addImageryProvider(provider);

		_tmpLayer.show = visible;
		_tmpLayer.id = id;

		//viewer.imageryLayers.addImageryProvider(provider);

		//provider.show=false;

		overLayers3D.push(_tmpLayer);

	},
	this.addOverlaysVectorsCesium = function () {
		/*
		 * item.layer.options.businessId;
		 * item.layer.options.geometryType;
		 * item.layer.options.nom;
		 * item.layer.options.tipus;
		 * item.layer.options.estil
		 * item.layer.toGeoJSONStyles2ToProperties();
		 */

		console.info(this.matriuCapes.overlays.length);

		for (var i = 0; i < this.matriuCapes.overlays.length; i++) {

			if (this.matriuCapes.overlays[i].tipus == "vector") {

				console.info("addOverlaysVectorsCesium");
				var vector = this.matriuCapes.overlays[i].item;
				var visible = this.matriuCapes.overlays[i].show;
				var gj = vector.layer.toGeoJSONStyles2ToProperties();

				var bb = vector.layer.options.businessId;

				console.info(jQuery.inArray(bb, overLayers3D));

				if (jQuery.inArray(bb, overLayers3D) == -1) {

					overLayers3D.push(bb);

					var promise = Cesium.GeoJsonDataSource.load(gj);
					var that = this;
					var ellipsoid = viewer.scene.globe.ellipsoid;

					promise.then(function (dataSource) {
						dataSource.id = bb;
						var dataL = dataSource;
						var XYZ_Edificis = [];
						that.calculaMatriuAlcades(dataL, XYZ_Edificis, 3, visible);

					}).otherwise(function (error) {
						console.warn(error);
					});
				}
			}
		}
	},

	this._utilDeterminaTipusItem = function (item, visibilitat) {

		var tmp_feature = {
			"item" : item,
			"show" : visibilitat,
			"businessId" : item.layer.options.businessId
		};
		var _factorNumVectors = 1000;

		try {
			var ff = item.layer.toGeoJSONcustom();
			var numFeatures = ff.features.length;

			if (item.layer.options.geometryType) {
				if (item.layer.options.geometryType.indexOf('polygon') != -1) {

					numFeatures <= _factorNumVectors ? tmp_feature.tipus = 'vector' : tmp_featuree.tipus = 'vecras';

				} else if (item.layer.options.geometryType.indexOf('polyline') != -1) {

					numFeatures <= (_factorNumVectors * 2) ? tmp_feature.tipus = 'vector' : tmp_feature.tipus = 'vecras';

				} else { //son punts

					numFeatures <= (_factorNumVectors * 5) ? tmp_feature.tipus = 'vector' : tmp_feature.tipus = 'vecras';

				}
			} else {

				numFeatures <= (_factorNumVectors * 2) ? tmp_feature.tipus = 'vector' : tmp_feature.tipus = 'vecras';

			}

			return tmp_feature;

		} catch (err) {

			tmp_feature.tipus = 'raster';

			return tmp_feature;
		}

	}

	this.calculaMatriuAlcades = function (dataSource, matriu, hFactor, visible) {
		var collection = dataSource.entities;
		var entities = collection.values;
		var length = entities.length;

		var that = this;
		for (var i = 0; i < length; ++i) {
			var entity = entities[i];
			entity.ellipsoid = viewer.scene.globe.ellipsoid;
		
			//codi enganxat

			if (entity.billboard) {

				var point = ellipsoid
					.cartesianToCartographic(entity.position._value)
					matriu
					.push(Cesium.Cartographic
						.fromRadians(
							point.longitude,
							point.latitude));

			} else if (entity.polyline) {

				for (var j = 0; j < entity.polyline.positions._value.length; ++j) {
					var point = ellipsoid
						.cartesianToCartographic(entity.polyline.positions._value[j])
						matriu
						.push(Cesium.Cartographic
							.fromRadians(
								point.longitude,
								point.latitude));
				}

			} else if (entity.polygon) {

				console.info("poligon");

				for (var j = 0; j < entity.polygon._hierarchy._value.positions.length; ++j) {

					var point = ellipsoid
						.cartesianToCartographic(entity.polygon._hierarchy._value.positions[j])
						//console.info(point);
						matriu.push(Cesium.Cartographic
							.fromRadians(
								point.longitude,
								point.latitude));
				}

			}

		} //fi bicle FOR

		var promise = Cesium.sampleTerrain(terreny, factorTerreny, matriu);

		Cesium.when(promise, function (updatedPositions) {

			that.addEntitiesVisorCesium(dataSource, matriu, 13, visible);

		});

	},

	this.addEntitiesVisorCesium = function (dataSource, matriu, hfactor, visible) {

		console.warn("addEntitiesVisorCesium");

		var entities = dataSource.entities.values;
		var z = 0;
		console.warn(entities.length);
		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			entity.show = visible;
			entity.properties.dataSource = dataSource.id;
			var ellipsoid = viewer.scene.globe.ellipsoid;
			entity.ellipsoid = ellipsoid;
			
			//console.info(entity);
			if (entity.polyline) {

				var entityMatriu = [];

				for (var j = 0; j < entity.polyline.positions._value.length; ++j) {
					z = z + 1;
					entityMatriu.push(matriu[z - 1]);

				}

				var cartesianPositions = Cesium.Ellipsoid.WGS84.cartographicArrayToCartesianArray(entityMatriu);

				var _newEntity = {

					properties : entity.properties,

					polyline : {
						positions : cartesianPositions,
						outline : true,
						show : visible,
						width : entity.properties.styles.weight,
						material : new Cesium.ColorMaterialProperty(Cesium.Color.fromCssColorString(entity.properties.styles.color))
					}
				}
				viewer.entities.add(_newEntity);

			} else if (entity.billboard) {

				entity.ellipsoid = ellipsoid;
				entity.position._value = ellipsoid.cartographicToCartesian(matriu[i]);

				if (entity.properties.styles.icon) {

					var _alt = parseInt(matriu[i].height + 100)

						var redEllipse = viewer.entities.add({
							position : ellipsoid.cartographicToCartesian(matriu[i]),
							height : matriu[i].height,
							properties : entity.properties,
							ellipse : {
								semiMinorAxis : 0.75,
								semiMajorAxis : 0.75,
								perPositionHeight : false,
								height : matriu[i].height,
								material : Cesium.Color.WHITE,
								extrudedHeight : parseInt(_alt)
							}
						});

					matriu[i].height = _alt;
					entity.position._value = ellipsoid.cartographicToCartesian(matriu[i]);

					console.info("addEntitiesVisorCesium");

					//var pinBuilder = new Cesium.PinBuilder();

					var pinBuilder = new PinBuilder_IM();
					entity.billboard.color = Cesium.Color.WHITE;
					console.info(entity);
					if (entity.properties.styles.icon.options.markerColor) {

						var colorPUNT = entity.properties.styles.icon.options.markerColor; //

						entity.billboard.image = pinBuilder.fromColor(
								Cesium.Color[colorPUNT.toUpperCase()], 48);

					} else if (entity.properties.styles.icon.options.iconUrl) {

						var url = Cesium.buildModuleUrl(entity.properties.styles.icon.options.iconUrl);

						entity.billboard.image = url;
						//entity.billboard.image = pinBuilder.fromUrl(url,Cesium.Color.BLUE, 48);

					}

					//viewer.entities.add(entity);

				} else if (!entity.properties.styles.icon) {

				
				
					entity.billboard = "";
					entity.point = {
						show : true, // default
						color : Cesium.Color
						.fromCssColorString(entity.properties.styles.fillColor), // default:
						// //
						// WHITE
						pixelSize : (parseInt(entity.properties.styles.radius) * 1.5), // default:
						// // 1
						outlineColor : Cesium.Color
						.fromCssColorString(entity.properties.styles.color), // default:
						// //
						// BLACK
						outlineWidth : 2
						// default: 0
					};

				} else {

					console.err("No hauria entrar aqui");
				}
				
				viewer.entities.add(entity); //add billboard
			} else if (entity.polygon) {

				entity.ellipsoid = ellipsoid;
				entity.polygon.perPositionHeight = new Cesium.ConstantProperty(false);

				var borderColor = entity.properties.styles.borderColor;
				var fillOpacity = entity.properties.styles.fillOpacity;
				var fillColor = entity.properties.styles.fillColor;
				var outlineWidth = entity.properties.styles.weight;

				if (fillColor == "") {
					fillColor = entity.properties.styles.color
				};
				if (borderColor == "" || borderColor == "#FFC400") {
					borderColor = entity.properties.styles.color
				};
				if (!fillOpacity) {
					fillOpacity = 0.5;
				};

				var alcada = 0;
				var _tenimAlcada = false;

				if (entity.properties.elevation) {
					alcada = parseInt(entity.properties.elevation);
					_tenimAlcada = true;
				} else if (entity.properties.ELEVATION) {
					alcada = parseInt(entity.properties.ELEVATION);
					_tenimAlcada = true;
				} else if (entity.properties.height) {
					alcada = parseInt(entity.properties.height);
					_tenimAlcada = true;
				} else if (entity.properties.HEIGHT) {
					alcada = parseInt(entity.properties.HEIGHT);
					_tenimAlcada = true;
				} else if (entity.properties.altura) {
					alcada = parseInt(entity.properties.altura);
					_tenimAlcada = true;
				} else if (entity.properties.ALTURA) {
					alcada = parseInt(entity.properties.ALTURA);
					_tenimAlcada = true;
				} else {
					_tenimAlcada = false;

				}

				var entityMatriu = [];
				var _matriuAlcada = [];
				var _extrudeAlcada;
				for (var j = 0; j < entity.polygon._hierarchy._value.positions.length; ++j) {
					z = z + 1;
					entityMatriu.push(matriu[z - 1]);

					if (_tenimAlcada) {

						_matriuAlcada.push(matriu[z - 1].height);
					}

				}

				var cartesianPositions = Cesium.Ellipsoid.WGS84.cartographicArrayToCartesianArray(entityMatriu);

				//entity.properties.dataset=dataSource.id;

				var _newEntity = {

					properties : entity.properties,
					show : visible,
					polygon : {
						hierarchy : cartesianPositions,
						outline : true,
						// fill:true,
						outlineColor : Cesium.Color.fromCssColorString(borderColor),
						material : Cesium.Color.fromCssColorString(fillColor).withAlpha(fillOpacity),
						// outlineWidth : 3.0,
						perPositionHeight : true,
						// extrudedHeight:3000

					}
				};

				if (_tenimAlcada) {
					_extrudeAlcada = Math.max.apply(Math, _matriuAlcada) + parseInt(alcada);
					_newEntity.polygon.extrudedHeight = _extrudeAlcada;
					_newEntity.polygon.material= Cesium.Color.fromCssColorString(fillColor);
					_newEntity.polygon.outline = false;
				}

				viewer.entities.add(_newEntity);

			}

		} // final for afegim el DataSource

		//dataSource = "";

		//console.info(dataSource);
		//viewer.dataSources.add(dataSource);
		console.info("arribo final");
	},
	
	this.getPosicioCamera3D=function(){
		var dfd = $.Deferred();

		try {
		var cameraPos = viewer.camera._position.x + ',' + viewer.camera._position.y + ',' + viewer.camera._position.z + ','
				+viewer.camera._directionWC.x + ',' + viewer.camera._directionWC.y + ',' + viewer.camera._directionWC.z + ','
				+viewer.camera._up.x + ',' + viewer.camera._up.y + ',' + viewer.camera._up.z;
		
		dfd.resolve(cameraPos);
		} catch (Err) {
			console.warn(Err);
			dfd.reject(Err);
		}
		return dfd.promise();
	},	
	
	this.setPosicioCamera3D=function(cameraPos){
		
		var v = cameraPos.split(",");

				//_postion
				eye = new Cesium.Cartesian3(parseFloat(v[0]), parseFloat(v[1]), parseFloat(v[2]));
				target = Cesium.Cartesian3.add(eye, new Cesium.Cartesian3(parseFloat(v[3]), parseFloat(v[4]), parseFloat(v[5])),
						new Cesium.Cartesian3());
				up = new Cesium.Cartesian3(parseFloat(v[6]), parseFloat(v[7]), parseFloat(v[8]));
				
				vewer.camera.flyTo({
					destination : new Cesium.Cartesian3(parseFloat(v[0]), parseFloat(v[1]), parseFloat(v[2])),
					orientation : {
						direction : new Cesium.Cartesian3(parseFloat(v[3]), parseFloat(v[4]), parseFloat(v[5])),
						up : new Cesium.Cartesian3(parseFloat(v[6]), parseFloat(v[7]), parseFloat(v[8]))
					},
					duration : 0
				});
		
	},	
	
	this.gestionaTerrainProvaider = function (lat, lng, credit) {

		// var pos = this._miraPosicioCamera();
		var dfd = $.Deferred();

		try {
			if (this._miraCentreDins(lat, lng) && credit != 'icgc') {

				terreny = new Cesium.CesiumTerrainProvider({
						url : '/cesium/terrenys/demextes',
						credit : 'icgc'

					});

				dfd.resolve(terreny);

			} else if (!this._miraCentreDins(lat, lng) && credit != 'cesium') {

				terreny = new Cesium.CesiumTerrainProvider({
						url : 'http://assets.agi.com/stk-terrain/world',
						credit : 'cesium'

					});

				dfd.resolve(terreny);
			} else {

				dfd.resolve(null);
			}

		} catch (Err) {
			console.warn(Err);
			dfd.reject(Err);
		}
		return dfd.promise();
	},

	this._ActivaDesactivaCapa = function (bi, visible) {

		//viewer.dataSources.
		//capesActives3D

		for (var i = 0; i < viewer.dataSources.length; i++) {

			console.info(viewer.dataSources[i]);
			console.info(viewer.dataSources[i].entities.values.length);
			console.info(viewer.dataSources[i].id);
			viewer.dataSources[i].show = false;

		}

	},

	this._miraPosicioCamera = function () {

		var pos = viewer.camera.positionCartographic;
		var obj = new Object;
		obj.x = parseFloat(pos.longitude * (180.0 / Math.PI));
		obj.y = parseFloat(pos.latitude * (180.0 / Math.PI));
		obj.z = pos.height;
		// document.getElementById(div).innerHTML = '<div>Longitud:' +
		// x.toFixed(5) + '</div><div>Latitud:' + y.toFixed(5) +
		// '</div><div>Alçada de càmera:' + z.toFixed(0) + ' m</div>';
		return obj;

	},

	this.calculaPosicioInici = function (bounds) {

		var dfd = $.Deferred();

		try {
			var ns = parseFloat(bounds.getNorth() - bounds.getSouth());
			var we = parseFloat(bounds.getEast() - bounds.getWest());
			var ew = parseFloat(bounds.getWest() - bounds.getEast());
			var centerLng = parseFloat(bounds.getEast()) + parseFloat(ew / 2);
			var inNS = parseFloat(ns / 3);
			var inWE = parseFloat(we / 3);
			var southLat = bounds.getSouth();
			var factor = 1;
			var rectangle2 = Cesium.Rectangle.fromDegrees((bounds
						.getWest() + inWE),
					((bounds.getSouth()) - ns), (bounds
						.getEast() - inWE),
					((bounds.getNorth()) - ns));

			var rectangle = Cesium.Rectangle.fromDegrees((bounds
						.getWest()),
					((bounds.getSouth())), (bounds
						.getEast()),
					((bounds.getNorth())));

			var posicioMapa3D = {
				'rectangle' : rectangle,
				'rectangle2' : rectangle2,
				'centerLng' : centerLng,
				'southLat' : southLat,
				'x0':bounds.getWest(),
				'y0':bounds.getSouth(),
				'x1':bounds.getEast(),
				'y1':bounds.getNorth()
				
			};

			dfd.resolve(posicioMapa3D);

		} catch (Err) {

			dfd.reject(Err);
		}
		return dfd.promise();

	},

	this.retornaPosicio2D = function () {

		var dfd = $.Deferred();
		try {
			var windowPosition = new Cesium.Cartesian2(viewer.container.clientWidth / 2, viewer.container.clientHeight / 2);
			var pickPosition = viewer.camera.pickEllipsoid(windowPosition);
			var pickPositionCartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(pickPosition);
			setTimeout(function () {
				viewer.camera.flyTo({
					destination : pickPositionCartographic,
					orientation : {
						heading : Cesium.Math.toRadians(0.0),
						pitch : Cesium.Math.toRadians(0.0), //tilt
					},
					easingFunction : Cesium.EasingFunction.LINEAR_NONE
				});
			}, 2000);

			var posUL = new Cesium.Cartesian2(0, 0);
			var posLR = new Cesium.Cartesian2(viewer.container.clientWidth, viewer.container.clientHeight);
			var pickPositionUL = viewer.camera.pickEllipsoid(posUL);
			var pickPositionCartographicUL = viewer.scene.globe.ellipsoid.cartesianToCartographic(pickPositionUL);
			var pickPositionLR = viewer.camera.pickEllipsoid(posLR);
			var pickPositionCartographicLR = viewer.scene.globe.ellipsoid.cartesianToCartographic(pickPositionLR);
			var bbox = {};
				bbox.lng0 = Cesium.Math.toDegrees(pickPositionCartographicUL.longitude);
				bbox.lat0 = Cesium.Math.toDegrees(pickPositionCartographicUL.latitude);
				bbox.lng1 = Cesium.Math.toDegrees(pickPositionCartographicLR.longitude);
				bbox.lat1 = Cesium.Math.toDegrees(pickPositionCartographicLR.latitude);

			var zoomLevel;
			var latDiff =parseFloat(bbox.lat1) - parseFloat(bbox.lat0);
			var lngDiff = parseFloat(bbox.lng1) - parseFloat(bbox.lng1);
			
			var centerLat=parseFloat(bbox.lat0) +(parseFloat(latDiff/2));
			var centerLng=parseFloat(bbox.lng0) +(parseFloat(lngDiff/2));
			
			

			var maxDiff = (lngDiff > latDiff) ? lngDiff : latDiff;
			if (maxDiff < 360 / Math.pow(2, 20)) {
				zoomLevel = 21;
			} else {
				zoomLevel = parseInt( (-1*( (Math.log(maxDiff)/Math.log(2)) - (Math.log(360)/Math.log(2)))));
				if (zoomLevel < 1)
					zoomLevel = 1;
			}
						
			bbox.centerLat=	 centerLat;
			bbox.centerLng=centerLat;
			bbox.zoomLevel=	 zoomLevel;
			
			
			
			
			
			
			dfd.resolve(bbox);

		} catch (Err) {

			dfd.reject(Err);
		}
		return dfd.promise();

	},

	this._miraCentreDins = function (y, x) {
		var x0 = 0.1087; // 0.7525
		var y0 = 40.4763; // 40.5263
		var x1 = 3.33669; // 3.3563
		var y1 = 42.8855; // 42.3748
		if (x >= x0 && x <= x1 && y >= y0 && y <= y1) {

			return true;
		} else {
			return false;
		}
	}

} // fi objecte


function mostraMsgNo3D() {
	alert("El seu Navegador no suporta el WebGL");
}

function detectoCapacitatsWebGL() {
	var soc3D = true;
	if (!Modernizr.webgl) {
		soc3D = false;
	} else if (!window.WebGLRenderingContext) {
		soc3D = false;
	} else {
		var canvas = document.createElement('canvas');
		var webglOptions = {
			alpha : false,
			stencil : false,
			failIfMajorPerformanceCaveat : true
		};
		var gl = canvas.getContext("webgl", webglOptions) || canvas.getContext("experimental-webgl", webglOptions);
		if (!gl) {
			soc3D = false;
		}
	}
	return soc3D;
}
