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
var handler = null;
var baseLayer3D = [];
var overLayers3D = [];
var matriu3 = [];
var factorTerreny = 14;
var browserWebGL;
var disparaEventMapa = true;
var mapaEstatNOPublicacio = true;
var initAmbVistaControlada = false;
var testModel3D=false;
var msgHTML = "";
//var _urlTerrenys = '/terrenys/demextes'; //'/cesium/terrenys/demextes'
var _urlTerrenys = 'http://tilemaps.icgc.cat/terrenys/demextes'; //'/cesium/terrenys/demextes'
var _urlModels3D='/cesium/terrenys/model3D/test/Prova1_cesium.json';

var appl='mapa';
var factorNavegador=1000;
function addModul3D(config) {

	mapConfig = config || mapConfig;
	
	var socChrome=isChrome();

	if(socChrome){factorNavegador=600;}
		
	if(!getModeMapa()){appl='visor';}
	
	browserWebGL = detectoCapacitatsWebGL();

	if (browserWebGL) {
		//$("head").append('<link id="cesium_css" href="/llibreries/cesium/Cesium.css" type="text/css" rel="stylesheet" />');
		//$("head").append('<script src="/llibreries/cesium/Cesium.js"  type="text/javascript"></script>');
		//$("head").append('<script src="/llibreries/cesium/Cesium.PinBuilder_IM.js"  type="text/javascript"></script>');
		//$("head").append('<script src="/llibreries/cesium/cesium-navigation.js"  type="text/javascript"></script>');
		$("body").append('<div id="map3D"></div>');
		$("body").append('<div id="popup3D"></div>');
		/*
		$("body").append('<div id="bt_pinch3D" class="leaflet-control btn btn-default btn-sm" lang="ca" title="Inclinar vista">'+
		'<span id="span_bt_pinch3D" class="glyphicon glyphicon-road grisfort"></span></div>');
		 */

		_gaq.push(['_trackEvent', appl, 'siWebGL3D', 'label 3D', 1]);

	}

	jQuery('.bt_3D_2D').on('click', function (event) {
		aturaClick(event);
		_gaq.push(['_trackEvent', appl, tipus_user + '3D', 'label 3D', 1]);
		$('.tooltip').hide();
		activaVista3d_2d(this);
	});

	jQuery(document).on('click', "#tanca3D", function (e) {
		jQuery("#popup3D").hide();

	});

	jQuery(document).on('click', "#chk_ad_3d", function (e) {
		$.cookie('msg3D', true, {
			path : '/',
			expires: 365
		});

	});

	/*
	jQuery(document).on('click', "#bt_pinch3D", function (e) {

	if (estatMapa3D) {
	mapaVista3D.changePitch();
	}


	});

	 */

	if (url('?3D') == 'true') {
		var fT = parseInt(mapConfig.servidorsWMS.length * 1000 / 2);

		setTimeout(initMapa3DfromMapConfig, fT);
	} else if (mapConfig.options && mapConfig.options.mapa3D) {

		var fT = parseInt(mapConfig.servidorsWMS.length * 1000 / 2);

		setTimeout(initMapa3DfromMapConfig, fT);
	}
	
	console.info(testModel3D);
	
	if (url('?testModel3D') == 'true') {	
	
	console.info("entro");
	
		testModel3D=true;
		//_urlTerrenys='http://assets.agi.com/stk-terrain/world';
		_urlTerrenys='//assets.agi.com/stk-terrain/world';
	
	}	
	

}

function activaVista3d_2d(_this){
	// mirar si el navegador suporta 3d
	browserWebGL ? canviaVista_3D_2D(_this) : mostraMsgNo3D();
}

function gestionFonsMapa3D() {

	if (estatMapa3D && mapaEstatNOPublicacio) {
		mapaVista3D.addBaseLayersCesium();
	}

}

function canviaVista_3D_2D(boto, event) {
	
	(jQuery(boto).text() == '3D') ? init3D(boto) : init2D(boto);

}

function initMapa3DfromMapConfig() {
	if (browserWebGL) {
		initAmbVistaControlada = true;
		jQuery('.bt_3D_2D').text('2D');
		inicialitzaMapa3D('_fromConfig');
	}
}

function inicialitzaMapa3D(origen) {
	if (browserWebGL) {
		if (mapaVista3D == null) {
			mapaVista3D = new IM_aplicacio({
				'mapId' : 'map',
				'mapId3D' : 'map3D'
			});
		}
		mapaVista3D.canviaVisor3D(map, controlCapes, origen);
		ActDesOpcionsVista3D(true);
		if (getModeMapa()) {
			if (drgFromMapa) {
				drgFromMapa.destroy();
				drgFromMapa = null;
				creaAreesDragDropFiles();
			}
		}
	}
}

function init3D(boto) {
	map.spin(true);
	if (browserWebGL) {
		initAmbVistaControlada = false;
		if (!$.cookie('msg3D')) {
			jQuery("#dialgo_ad_3D").modal('show');
		}
		jQuery(boto).text('2D');
		inicialitzaMapa3D('_fromBoto');
	} else {}

}

function init2D(boto) {
	jQuery(boto).text('3D');

	mapaVista3D.retornaPosicio2D().then(function (bbox) {
		map.fitBounds([[bbox.lat0, bbox.lng0], [bbox.lat1, bbox.lng1]]);
		map.spin(true);

		$("#map3D").fadeOut("slow", function () {
			jQuery('.leaflet-map-pane').show();
			jQuery("#map3D").hide();
			jQuery("#popup3D").hide();
			//jQuery("#bt_pinch3D").hide();
			jQuery("#map3D").html('');
			jQuery("#not_3d").remove();
			jQuery("#not_3d_mini").remove();
			map.spin(false);
		});

		estatMapa3D = false;
		mapaVista3D = null;

		if (getModeMapa()) {
			drgFromMapa.destroy();
			drgFromMapa = null;
			creaAreesDragDropFiles();
		}

		ActDesOpcionsVista3D(false);

		jQuery('label span').each(function (index) {
			jQuery(this).css('text-decoration', 'none');
		});

		setTimeout(function () {
			handler = null;
			viewer = null
		}, 2000);

	});

	map.spin(false);

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
			window.lang.convert('Operacions no disponibles en modus 3D') +
			'</div>');

		jQuery('.leaflet-control-minimap').css('visibility', 'hidden');
		$.each(crtl, function (index, value) {

			jQuery(value).hide();

		});

	} else {

		jQuery('.leaflet-control-minimap').css('visibility', 'visible');

		$.each(crtl, function (index, value) {
			jQuery(value).show();
		});

	
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

	this.canviaVisor3D = function (map, controlCapes, origen) {

		overLayers3D = [];

		this.bounds = map.getBounds();
		this.center = map.getCenter()

			terreny = new Cesium.CesiumTerrainProvider({
				url : _urlTerrenys,
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
				contextOptions : {
					webgl : {
						preserveDrawingBuffer : true
					}
				},
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
		this.mapZoom = map.getZoom();

		$(".leaflet-map-pane").fadeOut("slow", function () {

			jQuery('#map3D').show();
			document.getElementById('map3D').style.display = 'block';
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
		 
			

		this.calculaPosicioInici(this.bounds, this.mapZoom).then(function (rectangle) {

			if (initAmbVistaControlada && mapConfig.options) {

				if (mapConfig.options && mapConfig.options.camera3D) {

					var cameraPos = mapConfig.options.camera3D;

					if (cameraPos.indexOf('NaN') == -1) {

						mapaVista3D.setPosicioCamera3D(cameraPos);

					} else {

						viewer.camera.setView({
							destination : rectangle.rectangle
						});

					}

				} else {

					viewer.camera.setView({
						destination : rectangle.rectangle
					});
				}

			} else {

				if (origen == '_fromBoto') {

					var _altu = parseFloat(rectangle.altMetres) + parseFloat(rectangle.newAlt[0].height);

					/*
					viewer.camera.setView({
					//destination : rectangle.rectangle3,
					destination : Cesium.Cartesian3.fromDegrees(rectangle.centerLng, rectangle.newLat,(_altu)),
					orientation : {
					heading : Cesium.Math.toRadians(0.0),
					pitch : Cesium.Math.toRadians(rectangle._picth),
					roll : 0.0
					}
					});
					 */

					if (terreny.credit.text = 'icgc' && !testModel3D) {

						viewer.camera.flyTo({
							destination : rectangle.rectangle,
							duration : 0,
							complete : function () {
								setTimeout(function () {
									viewer.camera.flyTo({
										destination : Cesium.Cartesian3.fromDegrees(rectangle.centerLng, rectangle.newLat, (parseFloat(rectangle.altMetres) + parseFloat(rectangle.newAlt[0].height * 1.5))),
										//destination : rectangle.rectangle3,
										orientation : {
											heading : Cesium.Math.toRadians(0.0),
											pitch : Cesium.Math.toRadians(rectangle._picth), //tilt
										},
										easingFunction : Cesium.EasingFunction.LINEAR_NONE
									});
								}, 2000);
							}
						});

					} else {

						viewer.camera.setView({
							destination : rectangle.rectangle
						});
					}

				} else {

					viewer.camera.setView({
						destination : rectangle.rectangle
					});

				}

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
			// //console.warn(rectangle);
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

		//console.warn("addOverlaysLayersCesium");
		var that=this;
		setTimeout(function(){			
			that.miraCapesiExternes();
		},factorNavegador*3);

		//Afegin Events Cesium hanlers

		if (handler == null) {

			handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
			var thet = this;
			handler.setInputAction(function (movement) {
				if (estatMapa3D) {

					var pickedObjects = scene.drillPick(movement.position);
					msgHTML = "";
					jQuery("#popup3D").hide();
					var pickRay = viewer.camera.getPickRay(movement.position);
					var featuresPromise = viewer.imageryLayers.pickImageryLayerFeatures(pickRay, viewer.scene);
					if (!Cesium.defined(featuresPromise)) {}
					else {
						Cesium.when(featuresPromise, function (features) {

							if (features.length > 0) {

								if (features[0].data.properties) {

									thet.generaPopup(features[0].data, "vector");
								} else {

									thet.generaPopup(features[0], "raster");
								}
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

				}

			}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

			handler.setInputAction(function (movement) {
				if (estatMapa3D) {
					thet.miraPosicioXYZ(movement);
				}
			}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
			/*
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

			 */

		}

		this.activaEventLeaflet();

	},

	this.miraCapesiExternes = function () {

		this.addOverlaysLayersCesium(controlCapes);
	},

	this.activaEventLeaflet = function () {
		var thet = this;

		map.on('viewreset', function (e) {

			//map.on('zoomend', function (e) {

			if (estatMapa3D && disparaEventMapa) {

				thet._goToBounds(map.getBounds(), map.getZoom());
				//thet._goTo(map.getCenter().lat, map.getCenter().lng);

			}

		});

	},

	this.miraPosicioXYZ = function (movement) {

		matriu3 = [];

		try {

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

		} catch (Err) {

			_gaq.push(['_trackEvent', 'error3D', Err, 'miraPosicioXYZ', 1]);

		}

	},

	this._goToBounds = function (bounds, mapZoom) {

		//this.calculaPosicioInici(bounds,mapZoom).then(function (rectangle) {


		var rectangle = Cesium.Rectangle.fromDegrees((bounds
					.getWest()),
				((bounds.getSouth())), (bounds
					.getEast()),
				((bounds.getNorth())));

		viewer.camera.setView({
			destination : rectangle
		});

		//});

	},

	this._goTo = function (lat, lng) {

		viewer.camera.setView({
			destination : Cesium.Cartesian3.fromDegrees(lng, lat, viewer.camera.positionCartographic.height),
			orientation : {
				heading : viewer.camera.heading,
				pitch : viewer.camera.pitch,
				roll : viewer.camera.roll
			}
		});

		/*

		viewer.camera.setView({
		destination : Cesium.Cartesian3.fromDegrees(lng, lat, 3000)
		});

		 */

	},

	this.canviaOpacity = function (businessId, opacity) {
		jQuery.each(capesActives3D._layers, function (index, layer) {
			//_imageryLayers.remove(layer, true); //capesActives3D

			if (layer.id == businessId) {
				layer.alpha = opacity;
			}
		});

	},

	this.actualitzaVistaOverlays = function (obj, accio, visible) {

		//accio== remove | display	| add


		if (mapaEstatNOPublicacio) {

			if (accio == "add") {

				if (jQuery.inArray(obj.businessId, overLayers3D) == -1) {
					this.matriuCapes.overlays = [];
					this.addOverlaysLayersCesium();
				}

			} else if ((accio == "display") || (accio == "remove")) {

				var trobatCapa = false;
				//if (obj.tipus.indexOf("wms") != -1) {

				jQuery.each(capesActives3D._layers, function (index, layer) {
					//_imageryLayers.remove(layer, true); //capesActives3D

					if (layer && layer.id == obj.businessId) {
						trobatCapa = true;
						if (accio == "display") {
							layer.show = visible
						} else if (accio == "remove") {
							capesActives3D.remove(layer, true)

						}

					}
				});

				//} else {


				var n = 0;

				for (var f = 0; f < viewer.entities.values.length; f++) {

					var feature = viewer.entities.values[f];

					if (feature && feature.properties) {
						if (feature.properties.dataSource == obj.businessId) {
							trobatCapa = true;
							if (accio == "display") {
								feature.show = visible;

							} else if (accio == "remove") {

								feature.show = false;
								/*
								try{
								viewer.entities.remove(feature);
								}catch(err){
								console.debug(err);
								}
								 */

							}

						}
					} else {
						//console.debug(feature);
					}

				}

				if (!trobatCapa) {
					map.spin(true);
					//console.debug("No he trobat capa");
					if (jQuery.inArray(obj.businessId, overLayers3D) == -1) {
						this.matriuCapes.overlays = [];
						this.addOverlaysLayersCesium();
						map.spin(false);
					}

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
		if (origen == "vector" && player.properties) {

			var out = [];
			if (player.properties.nom && !isBusinessId(player.properties.nom)) {
				msgHTML += '<h4>' + player.properties.nom + '</h4>';
			} else if (player.properties.name && !isBusinessId(player.properties.name)) {
				msgHTML += '<h4>' + player.properties.name + '</h4>';
			} else if (player.properties.Name && !isBusinessId(player.properties.Name)) {
				msgHTML += '<h4>' + player.properties.Name + '</h4>';
			}
			if (player.properties.description) {
				if (!$.isNumeric(player.properties.description) && !validateWkt(player.properties.description))
					msgHTML += '<div>' + parseUrlTextPopUp(player.properties.description) + '</div>';
				else
					msgHTML += '<div>' + player.properties.description + '</div>';
			}
			msgHTML += '<div class="div_popup_visor"><div class="popup_pres">';
			var pp = player.properties;
			$.each(pp, function (key, value) {
				if (key != "styles" && key != "dataSource" && key != "OGR" && key != "OGR_STYLE") {

					if (isValidValue(value)) {
						if (key != 'name' && key != 'Name' && key != 'description' && key != 'id' && key != 'businessId' && key != 'slotd50') {
							msgHTML += '<div class="popup_data_row">';
							var txt = value;
							if (!$.isNumeric(txt) && key != "styles" && !validateWkt(txt)) {

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

		if (mapaEstatNOPublicacio) {

			jQuery.each(baseLayer3D, function (index, layer) {
				_imageryLayers.remove(layer, true); //capesActives3D
			});

			baseLayer3D = [];
			this.matriuCapes.base = map.getLGActiveMap().getLayers();
			this.matriuCapes.base.reverse();
			for (var i = 0; i < this.matriuCapes.base.length; i++) {
				var url = this.matriuCapes.base[i]._url;
				//var _maximumLevel = this.matriuCapes.base[i].options.maxZoom;
				//var _minimumLevel = this.matriuCapes.base[i].options.maxZoom;

				if (url.indexOf('osm.org') != -1 || url.indexOf('openstreetmap.org') != -1) {

					//url = url.replace('{s}.mqcdn.com', 'otile1.mqcdn.com');

					if (!this._miraCentreDins(this.center.lat, this.center.lng)) {

						this.matriuCapes.base[i].options.tms ? url = url.replace('{y}', '{reverseY}') : url;

						var BB_layer = _imageryLayers.addImageryProvider(new Cesium.UrlTemplateImageryProvider({
									url : url,

									maximumLevel : 18,
									minimumLevel : 3
								}));

						_imageryLayers.lowerToBottom(BB_layer);
						baseLayer3D.push(BB_layer);
					}

				} else {

					this.matriuCapes.base[i].options.tms ? url = url.replace('{y}', '{reverseY}') : url;
					
					
				
					url=url.replace('www.{s}.instamaps','www.instamaps');
					
					

					var BB_layer = _imageryLayers.addImageryProvider(new Cesium.UrlTemplateImageryProvider({
								url : url,

								maximumLevel : 19,
								minimumLevel : 3

							}));
					_imageryLayers.lowerToBottom(BB_layer);
					baseLayer3D.push(BB_layer);

				}

			}

			
			
			if(testModel3D){
					
							var tileset=viewer.scene.primitives.add( new Cesium.Cesium3DTileset({
						url: _urlModels3D,
						maximumScreenSpaceError: 2,
						maximumNumberOfLoadedTiles: 1000
					}));	 
				
				}	
			
		}
	},

	this.addOverlaysLayersCesium = function () {

		var that = this;

		var numCapes = 1;
		var numCapesActives = 0;
		try {
			numCapes = controlCapes.getCountLayers();

			jQuery.each(controlCapes._layers, function (i, item) {
				if (item.layer._map != null) {
					numCapesActives = numCapesActives + 1;
				}

				jQuery.each(item._layers, function (j, item2) {

					if (item2.layer._map != null) {
						numCapesActives = numCapesActives + 1;
					}

				});
			});

			numCapes = numCapesActives;

		} catch (Err) {
			numCapes = 1;
		}

		jQuery.each(controlCapes._layers, function (i, item) {

			that._utilValidoClassificoTipusCapa(item, numCapes);
			jQuery.each(item._layers, function (j, item2) {
				that._utilValidoClassificoTipusCapa(item2, numCapes);
			});
		});

		this.addOverlaysVectorsCesium();
		this.addOverlaysRastersCesium();

	},

	this._utilValidoClassificoTipusCapa = function (item, numCapes) {

		if (item.layer._map != null) {

			if (item.layer.options.tipusRang != tem_heatmap && item.layer.options.tipusRang != tem_cluster && item.layer.options.wmstime != true) {

				if (jQuery.inArray(item.layer.options.businessId, overLayers3D) == -1) {
					this.matriuCapes.overlays.push(this._utilDeterminaTipusItem(item, true, numCapes));
				}
			} else {
				
				jQuery('label span#' + item.layer._leaflet_id).css('text-decoration', 'line-through');
				jQuery('.leaflet-bar-timecontrol').hide();

			}

		} else { //NO ACTIVES

			//if (item.layer.options.tipus != t_heatmap && item.layer.options.tipus != t_cluster && item.layer.options.tipus != t_size) {
			if (item.layer.options.tipusRang != tem_heatmap && item.layer.options.tipusRang != tem_cluster && item.layer.options.wmstime != true) {

				//if (jQuery.inArray(item.layer.options.businessId, overLayers3D) == -1) {
				//this.matriuCapes.overlays.push(this._utilDeterminaTipusItem(item, false, numCapes));
				//}

			} else {
				
				jQuery('label span#' + item.layer._leaflet_id).css('text-decoration', 'line-through');
				jQuery('.leaflet-bar-timecontrol').hide();

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

					var raster = this.matriuCapes.overlays[i].item;

					var visible = this.matriuCapes.overlays[i].show;
					if (raster.layer.options.tipus.indexOf("wms") != -1) {

						var _url = raster.layer._url;

						if (_url) {

							if (_url.indexOf('?') == -1) {
								_url = _url + '?';
							}
						} else {}

						var opacity = 0.9;

						if (raster.layer.options.opacity) {
							opacity = raster.layer.options.opacity;
						}
						if (urlApp.indexOf('172.70.1.11') != -1) {
							_url = _url.replace('betaserver.icgc.cat', '172.70.1.31');
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
									styles : ''
								},
								maximumLevel : 18,
								minimumLevel : 5,
								proxy : {
									getURL : function (url) {
										return paramUrl.proxy_betterWMS + '?url=' + encodeURIComponent(url);
									}
								}
							});

						provider.alpha = opacity;

						setTimeout(this.delayAddImageProvider(provider, visible, raster.layer.options.businessId), 1000);

					}

				} else if (this.matriuCapes.overlays[i].tipus == "vecras") {

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
		data.businessId = mapConfig.businessId;
		data.nomAplicacio = mapConfig.nomAplicacio;
		data.modeMapa = getModeMapa();

		getModeMapa() ? data.entitatUid = _UsrID : data.entitatUid = mapConfig.servidorsWMS[0].entitatUid;

		if (mapConfig.entitatUid && mapConfig.entitatUid.indexOf("random_") != -1) {
			data.entitatUid = "randomuser"

		}

		//if(getModeMapa()){

		if (data.c_layers.length > 0) {
			map.spin(true);

			for (var z = 0; z < data.c_layers.length; z++) {

				var _newData = {};

				_newData.request = data.request;
				_newData.businessId = data.id_layers[z];
				_newData.nomAplicacio = data.nomAplicacio;
				_newData.modeMapa = data.modeMapa;
				_newData.entitatUid = data.entitatUid;

				_newData.layers = [data.layers[z]];
				_newData.n_layers = [data.n_layers[z]];
				_newData.id_layers = [data.id_layers[z]];
				_newData.t_layers = [data.t_layers[z]];
				_newData.c_layers = [data.c_layers[z]];
				_newData.v_layers = [data.v_layers[z]];

				createMapToWMS(_newData).then(
					function (results) {

					if (results.status == "OK") {

						setTimeout(function () {

							var url = results.url;
							if (url.indexOf('?') == -1) {
								url = url + '?';
							}
							that.addVectortoWMSToMatriuCapes(_newData.id_layers[0], _newData.n_layers[0], url, _newData.v_layers[0]);
						}, factorNavegador);

					} else if (results.status == "VOID") {}
					else {
						//console.info(results.msg);
					}
				});

			} //fi for

		} //fi bucle

	},

	this.addVectortoWMSToMatriuCapes = function (layers, titles, url, visible) {

		var that = this;
		//jQuery.each(layers, function (i, item) {

		//url=url.replace('172.70.1.11','localhost');

		var _bbox = 'bbox={westProjected}%2C{southProjected}%2C{eastProjected}%2C{northProjected}&';
		var srs = "EPSG:3857";

		/*
		var provider = new Cesium.WebMapServiceImageryProvider({
		url : url,
		layers : 'Capa_' + layers ,
		enablePickFeatures : true,
		getFeatureInfoAsXml : false,
		getFeatureInfoAsGeoJson : true,
		getFeatureInfoParameters : {
		info_format : 'geojson'
		},
		parameters : {
		transparent : 'true',
		format : 'image/png',
		styles : 'default'
		},
		maximumLevel : 19

		});

		 */
		/*
	,
		proxy : {
		getURL : function (url) {
		return paramUrl.proxy_betterWMS + '?url=' + encodeURIComponent(url);
		}
		}

		pickFeaturesUrl: url + '&tiled=true&' +
		'transparent=true&format=image%2Fpng&exceptions=application/vnd.ogc.se_blank&' +
		'styles=&service=WMS&version=1.1.1&request=GetFeatureInfo&' +
		'layers=Capa_' + item + '&X={x}&Y={i}&INFO_FORMAT=geojson&QUERY_LAYERS=Capa_' + item + '&srs=' + encodeURI(srs) + '&' +
		_bbox +'&',
		 */

		provider = new Cesium.UrlTemplateImageryProvider({

				enablePickFeatures : true,
				getFeatureInfoAsXml : false,
				getFeatureInfoAsGeoJson : true,
				getFeatureInfoParameters : {
					info_format : 'geojson'
				},

				url : url + '&tiled=true&' +
				'transparent=true&format=image%2Fpng&exceptions=application/vnd.ogc.se_blank&' +
				'styles=&service=WMS&version=1.1.1&request=GetMap&' +
				'layers=Capa_' + layers + '&srs=' + encodeURI(srs) + '&' +
				_bbox +
				'width=256&height=256&',
				maximumLevel : 19,
				minimumLevel : 3
			});

		//application/vnd.ogc.se_blank


		setTimeout(that.delayAddImageProvider(provider, visible, layers), 100);
		//that.delayAddImageProvider(provider, visible[i], item);

		//});

	},

	this.delayAddImageProvider = function (provider, visible, id) {

		var _tmpLayer = capesActives3D.addImageryProvider(provider);
		_tmpLayer.id = id;
		_tmpLayer.show = false;

		setTimeout(function () {

			_tmpLayer.show = visible;
			map.spin(false);
		}, factorNavegador *2);

		//viewer.imageryLayers.addImageryProvider(provider);

		//provider.show=false;

		overLayers3D.push(_tmpLayer);

	},
	this.addOverlaysVectorsCesium = function () {
		
	
var that = this;
		for (var i = 0; i < this.matriuCapes.overlays.length; i++) {

			if (this.matriuCapes.overlays[i].tipus == "vector") {
				
				//setTimeout(function(){

				var vector = this.matriuCapes.overlays[i].item;											
				var visible = this.matriuCapes.overlays[i].show;							
				var gj = vector.layer.toGeoJSONStyles2ToProperties();
				
				var msg = this.matriuCapes.overlays[i].msg;
				var bb = vector.layer.options.businessId;

				if (jQuery.inArray(bb, overLayers3D) == -1) {

					overLayers3D.push(bb);

					
					
					var promise = Cesium.GeoJsonDataSource.load(gj);
					
					var ellipsoid = viewer.scene.globe.ellipsoid;

					promise.then(function (dataSource) {															
						dataSource.id = bb;
						var dataL = dataSource;
						var XYZ_Edificis = [];							
						setTimeout(function(){
						//that.calculaMatriuAlcades(dataL, XYZ_Edificis, 3, visible, msg);
						that.calculaMatriuAlcadesClaimTerrain(dataL, XYZ_Edificis, 3, visible, msg);
						},factorNavegador);												
					}).otherwise(function (error) {
						console.warn(error);
					});
				}
			
			//},500);
			
			}
			
		}
	},

	this._utilDeterminaTipusItem = function (item, visibilitat, numCapes) {

		var tmp_feature = {
			"item" : item,
			"show" : visibilitat,
			"businessId" : item.layer.options.businessId,
			"msg" : 'vector'
		};

		var factor = 1;
		var mapZoom = this.mapZoom;
		if (numCapes <= 15) {
			factor = 3
		}
		if (numCapes >= 15) {
			factor = 1
		}

		var _factorNumVectorsPol = 450 * factor;
		var _factorNumVectorsLin = 300 * factor;
		var _factorNumVectorsPunt = 500 * factor;

		

		if (numCapes >= 25) {

			_factorNumVectorsPol = 10;
			_factorNumVectorsLin = 20;
			_factorNumVectorsPunt = 30;

		}

		try {
			var ff = item.layer.toGeoJSON();

					
			var numFeatures = ff.features.length;
			
			
			if (item.layer.options.geometryType) {
				if (item.layer.options.geometryType.indexOf('polygon') != -1) {

			
					if (item.layer.options.source && item.layer.options.source == 'geojson') {

					
					
						numFeatures <= _factorNumVectorsPol ? tmp_feature.tipus = 'vector' : tmp_feature.tipus = 'vecras';

						if (tmp_feature.tipus == 'vector') {

							for (var j = 0; j < numFeatures; j++) {

								var vertex = ff.features[j].geometry.coordinates[0].length;
								if (vertex > 46000) {
									tmp_feature.msg = 'none';
								}
								break;
							}

						}

						if (mapZoom <= 10 && numFeatures < 3500) {

							tmp_feature.msg = 'none';
							tmp_feature.tipus = 'vector'

						}

					
						
					} else if (item.layer.options.source && item.layer.options.source.indexOf('xls') != -1) {

						numFeatures <= 1000 ? tmp_feature.tipus = 'vector' : tmp_feature.tipus = 'vecras';

						tmp_feature.msg = 'none';

					} else if (item.layer.options.source && item.layer.options.source.indexOf('csv') != -1) {

						numFeatures <= 1000 ? tmp_feature.tipus = 'vector' : tmp_feature.tipus = 'vecras';

						tmp_feature.msg = 'none';

					} else if (!item.layer.options.source) {

					
						numFeatures <= _factorNumVectorsPol ? tmp_feature.tipus = 'vector' : tmp_feature.tipus = 'vecras';
						//tmp_featuree.tipus = 'vecras';

					} else {

						tmp_feature.tipus = 'vecras';

					}

				} else if (item.layer.options.geometryType.indexOf('polyline') != -1) {

				
				
					numFeatures <= (_factorNumVectorsLin) ? tmp_feature.tipus = 'vector' : tmp_feature.tipus = 'vecras';

				} else { //son punts


					numFeatures <= (_factorNumVectorsPunt) ? tmp_feature.tipus = 'vector' : tmp_feature.tipus = 'vecras';

				}

			} else if (item.layer.options.tipusRang) {

				tmp_feature.tipus = 'vecras';
			} else {

				numFeatures <= (_factorNumVectorsPunt) ? tmp_feature.tipus = 'vector' : tmp_feature.tipus = 'vecras';

			}

			ff = "";

			
			
			return tmp_feature;

		} catch (err) {

			_gaq.push(['_trackEvent', 'error3D', err, '_utilDeterminaTipusItem', 1]);

			if (item.layer.options.tipusRang) {

				tmp_feature.tipus = 'vecras';
			} else {
				tmp_feature.tipus = 'raster';
			}
			
			return tmp_feature;
		}

	},

	this.calculaMatriuAlcades = function (dataSource, matriu, hFactor, visible, msg) {

		//console.warn("calculaMatriuAlcades");
		//Deprecated
			


		var collection = dataSource.entities;
		var entities = collection.values;
		var length = entities.length;

		var that = this;

		if (msg == 'vector') {

			for (var i = 0; i < length; ++i) {
				var entity = entities[i];
				entity.ellipsoid = viewer.scene.globe.ellipsoid;

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

					for (var j = 0; j < entity.polygon._hierarchy._value.positions.length; ++j) {

						var point = ellipsoid
							.cartesianToCartographic(entity.polygon._hierarchy._value.positions[j])

						
							
							matriu.push(Cesium.Cartographic
								.fromRadians(
									point.longitude,
									point.latitude));
					}

				}

			} //fi bicle FOR

			var promise = Cesium.sampleTerrain(terreny, factorTerreny, matriu);

			
			
			Cesium.when(promise, function (updatedPositions) {
				
				
				if(length >50){
					setTimeout(function(){
						that.addEntitiesVisorCesium(dataSource, matriu, 13, visible, msg);
					},factorNavegador);
				}else{				
					that.addEntitiesVisorCesium(dataSource, matriu, 13, visible, msg);
				}	
			});

			

			map.spin(true);

		} else {

			that.addEntitiesVisorCesium(dataSource, matriu, 13, visible, msg);

		}

	},

	this.calculaMatriuAlcadesClaimTerrain = function (dataSource, matriu, hFactor, visible, msg) {

		console.warn("calculaMatriuAlcadesClaimTerrain");

		var collection = dataSource.entities;
		var entities = collection.values;
		var length = entities.length;

		var that = this;

		console.info(entities[0]);
		
		if (msg == 'vector' && !entities[0].polyline) {
				console.info("No hauria entrar");
			for (var i = 0; i < length; ++i) {
				var entity = entities[i];
				entity.ellipsoid = viewer.scene.globe.ellipsoid;

				if (entity.billboard) {

					var point = ellipsoid
						.cartesianToCartographic(entity.position._value)
						matriu
						.push(Cesium.Cartographic
							.fromRadians(
								point.longitude,
								point.latitude));

				} 
				/*
				else if (entity.polyline) {

					for (var j = 0; j < entity.polyline.positions._value.length; ++j) {
						var point = ellipsoid
							.cartesianToCartographic(entity.polyline.positions._value[j])
							matriu
							.push(Cesium.Cartographic
								.fromRadians(
									point.longitude,
									point.latitude));
					}

				} */
				else if (entity.polygon) {

					for (var j = 0; j < entity.polygon._hierarchy._value.positions.length; ++j) {

						var point = ellipsoid
							.cartesianToCartographic(entity.polygon._hierarchy._value.positions[j])

						
							
							matriu.push(Cesium.Cartographic
								.fromRadians(
									point.longitude,
									point.latitude));
					}

				}

			} //fi bicle FOR

			var promise = Cesium.sampleTerrain(terreny, factorTerreny, matriu);

			
			
			Cesium.when(promise, function (updatedPositions) {
				
				
				if(length >50){
					setTimeout(function(){
						this.addEntitiesVisorCesiumClamTerrain(dataSource, matriu, 13, visible, msg);

				//this.addEntitiesVisorCesiumClamTerrain(dataSource, matriu, 13, visible, msg);						
					},factorNavegador);
				}else{				
					this.addEntitiesVisorCesiumClamTerrain(dataSource, matriu, 13, visible, msg);	
				}	
			});

			

			map.spin(true);

		} else {

			this.addEntitiesVisorCesiumClamTerrain(dataSource, matriu, 13, visible, msg);	

		}

	},
	
	
	
	
	
	
	
	
	
	
	this.addEntitiesVisorCesiumClamTerrain = function (dataSource, matriu, hfactor, visible, msg) {

		console.warn("addEntitiesVisorCesiumClamTerrain");
		var entities = dataSource.entities.values;
		var z = 0;

		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			entity.show = true;
			entity.properties.dataSource = dataSource.id;
			var ellipsoid = viewer.scene.globe.ellipsoid;
			entity.ellipsoid = ellipsoid;

			
		
			if (entity.polyline) {

				var colorLin=entity.properties.styles.color;
				var wLin=entity.properties.styles.weight;
				if(!colorLin){colorLin="#FFCC00";}
				if(!wLin){wLin=2;}
				
				
				
				var _newEntity = {
					properties : entity.properties,
					polyline : {
						positions : entity.polyline.positions._value,
						//outline : true,
						show : visible,
						width :(parseInt(wLin)*4),
						material : new Cesium.ColorMaterialProperty(Cesium.Color.fromCssColorString(colorLin)),
						color : new Cesium.ColorMaterialProperty(Cesium.Color.fromCssColorString(colorLin)),
						heightReference :Cesium.HeightReference.CLAMP_TO_GROUND
					}
				}
			
				console.warn(_newEntity);
			
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

					var pinBuilder = new PinBuilder_IM();
					entity.billboard.color = Cesium.Color.WHITE;

					if (entity.properties.styles.icon.options.markerColor) {
						
						var colorPUNT = entity.properties.styles.icon.options.markerColor; //

						if (colorPUNT.indexOf('punt_r') == -1) {
							entity.billboard.image = pinBuilder.fromColor(
									Cesium.Color[colorPUNT.toUpperCase()], 48);

						} else {

							entity.billboard = "";
							entity.point = {
								show : visible, // default
								color : Cesium.Color
								.fromCssColorString(entity.properties.styles.icon.options.fillColor), // default:
								// //
								// WHITE
								pixelSize : (parseInt(entity.properties.styles.icon.options.radius) * 1.5), // default:
								// // 1
								outlineColor : Cesium.Color
								.fromCssColorString(entity.properties.styles.icon.options.color), // default:
								// //
								// BLACK
								outlineWidth : 2
								// default: 0
							};

						}

					} else if (entity.properties.styles.icon.options.iconUrl) {

						//var url = Cesium.buildModuleUrl(entity.properties.styles.icon.options.iconUrl);
						var url = entity.properties.styles.icon.options.iconUrl;

						entity.billboard.image = url;
						//entity.billboard.image = pinBuilder.fromUrl(url,Cesium.Color.BLUE, 48);

					}

					//viewer.entities.add(entity);

				} else if (!entity.properties.styles.icon) {

					var _color="#FFCC00";
					entity.properties.styles.color?_color=entity.properties.styles.color:_color=_color;
					
					
					entity.billboard = "";
					entity.point = {
						show : visible, // default
						color : Cesium.Color
						.fromCssColorString(entity.properties.styles.fillColor), // default:
						// //
						// WHITE
						pixelSize : (parseInt(entity.properties.styles.radius) * 1.5), // default:
						// // 1
						outlineColor : Cesium.Color
						.fromCssColorString(_color), // default:
						// //
						// BLACK
						outlineWidth : 2
						// default: 0
					};

				} else {

					console.debug("No hauria entrar aqui");
				}

				viewer.entities.add(entity); //add billboard
			
			
			
			} else if (entity.polygon) {

				entity.ellipsoid = ellipsoid;
				entity.polygon.perPositionHeight = new Cesium.ConstantProperty(false);

				var borderColor = entity.properties.styles.borderColor ? entity.properties.styles.borderColor : "";
				var fillOpacity = entity.properties.styles.fillOpacity ? entity.properties.styles.fillOpacity : false;
				var fillColor = entity.properties.styles.fillColor ? entity.properties.styles.fillColor : "";
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
				} else if (entity.properties.z) {
					alcada = parseInt(entity.properties.z);
					_tenimAlcada = true;
				} else if (entity.properties.Z) {
					alcada = parseInt(entity.properties.Z);
					_tenimAlcada = true;

				} else if (entity.properties.volum) {
					alcada = parseInt(entity.properties.volum);
					_tenimAlcada = true;
				} else if (entity.properties.VOLUM) {
					alcada = parseInt(entity.properties.VOLUM);
					_tenimAlcada = true;
				} else {
					_tenimAlcada = false;

				}

				var entityMatriu = [];
				var _matriuAlcada = [];
				var _extrudeAlcada;

				
				
				if (msg == 'vector') {
					for (var j = 0; j < entity.polygon._hierarchy._value.positions.length; ++j) {
						z = z + 1;
						entityMatriu.push(matriu[z - 1]);

						if (_tenimAlcada) {

							_matriuAlcada.push(matriu[z - 1].height);
						}

					}

					var cartesianPositions = Cesium.Ellipsoid.WGS84.cartographicArrayToCartesianArray(entityMatriu);

		
				
				} else {

					var cartesianPositions = entity.polygon._hierarchy._value;
					//var cartesianPositions =Cesium.Ellipsoid.WGS84.cartographicArrayToCartesianArray(entityMatriu);

				}
				var _newEntity;

				if (_tenimAlcada) {

					var terra = 0;
					if (msg == 'vector') {
						terra = (Math.max.apply(Math, _matriuAlcada));
					}
					_extrudeAlcada = terra + parseInt(alcada);
					
					
					_newEntity = {

						properties : entity.properties,
						show : visible,
						polygon : {
							hierarchy : cartesianPositions,
							outline : true,
							extrudedHeight : _extrudeAlcada,
							fill : true,
							outlineColor : Cesium.Color.fromCssColorString(borderColor),
							material : Cesium.Color.fromCssColorString(fillColor).withAlpha(fillOpacity),
							// outlineWidth : 3.0,
							perPositionHeight : true

						}
					};

					
					
				} else {

				
				
					_newEntity = {

						properties : entity.properties,
						show : visible,
						polygon : {
							hierarchy : cartesianPositions,
							outline : true,
							// fill:true,
							outlineColor : Cesium.Color.fromCssColorString(borderColor),
							material : Cesium.Color.fromCssColorString(fillColor).withAlpha(fillOpacity),
							// outlineWidth : 3.0,
							//perPositionHeight : true,
							// extrudedHeight:3000
							heightReference :Cesium.HeightReference.CLAMP_TO_GROUND

						}
					};
					
					
					/*
					entity.show=visible;
					entity.polygon.outline = true;
					entity.polygon.perPositionHeight=true;
					entity.polygon.outlineColor = Cesium.Color.fromCssColorString(borderColor);
					entity.polygon.material =Cesium.Color.fromCssColorString(fillColor).withAlpha(fillOpacity);

					_newEntity=entity;
					*/
				}

				viewer.entities.add(_newEntity);

			}

		} // final for afegim el DataSource

		dataSource = "";

		map.spin(false);
		matriu = [];

	},
	
	
	
	
	
	this.addEntitiesVisorCesium = function (dataSource, matriu, hfactor, visible, msg) {

	
		var entities = dataSource.entities.values;
		var z = 0;

		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			entity.show = true;
			entity.properties.dataSource = dataSource.id;
			var ellipsoid = viewer.scene.globe.ellipsoid;
			entity.ellipsoid = ellipsoid;

			
		
			if (entity.polyline) {					
				var entityMatriu = [];

				for (var j = 0; j < entity.polyline.positions._value.length; ++j) {
					z = z + 1;
					entityMatriu.push(matriu[z - 1]);

				}

				var cartesianPositions = Cesium.Ellipsoid.WGS84.cartographicArrayToCartesianArray(entityMatriu);
				var colorLin=entity.properties.styles.color;
				var wLin=entity.properties.styles.weight;
				if(!colorLin){colorLin="#FFCC00";}
				if(!wLin){wLin=2;}			
				var _newEntity = {

					properties : entity.properties,

					polyline : {
						positions : cartesianPositions,
						outline : true,
						show : visible,
						width :wLin,
						material : new Cesium.ColorMaterialProperty(Cesium.Color.fromCssColorString(colorLin))
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

					var pinBuilder = new PinBuilder_IM();
					entity.billboard.color = Cesium.Color.WHITE;
					entity.billboard.heightReference=Cesium.HeightReference.NONE ;
					if (entity.properties.styles.icon.options.markerColor) {
						
						var colorPUNT = entity.properties.styles.icon.options.markerColor; //

						if (colorPUNT.indexOf('punt_r') == -1) {
							entity.billboard.image = pinBuilder.fromColor(
									Cesium.Color[colorPUNT.toUpperCase()], 48);

						} else {

							entity.billboard = "";
							entity.point = {
								show : visible, // default
								color : Cesium.Color
								.fromCssColorString(entity.properties.styles.icon.options.fillColor), // default:
								// //
								// WHITE
								pixelSize : (parseInt(entity.properties.styles.icon.options.radius) * 1.5), // default:
								// // 1
								outlineColor : Cesium.Color
								.fromCssColorString(entity.properties.styles.icon.options.color), // default:
								// //
								// BLACK
								outlineWidth : 2
								// default: 0
							};

						}

					} else if (entity.properties.styles.icon.options.iconUrl) {

						//var url = Cesium.buildModuleUrl(entity.properties.styles.icon.options.iconUrl);
						var url = entity.properties.styles.icon.options.iconUrl;

						entity.billboard.image = url;
						//entity.billboard.image = pinBuilder.fromUrl(url,Cesium.Color.BLUE, 48);

					}

					//viewer.entities.add(entity);

				} else if (!entity.properties.styles.icon) {

					var _color="#FFCC00";
					entity.properties.styles.color?_color=entity.properties.styles.color:_color=_color;
					
					
					entity.billboard = "";
					entity.point = {
						show : visible, // default
						color : Cesium.Color
						.fromCssColorString(entity.properties.styles.fillColor), // default:
						// //
						// WHITE
						pixelSize : (parseInt(entity.properties.styles.radius) * 1.5), // default:
						// // 1
						outlineColor : Cesium.Color
						.fromCssColorString(_color), // default:
						// //
						// BLACK
						outlineWidth : 2
						// default: 0
					};

				} else {

					console.debug("No hauria entrar aqui");
				}

				viewer.entities.add(entity); //add billboard
			
			
			
			} else if (entity.polygon) {

				entity.ellipsoid = ellipsoid;
				entity.polygon.perPositionHeight = new Cesium.ConstantProperty(false);

				var borderColor = entity.properties.styles.borderColor ? entity.properties.styles.borderColor : "";
				var fillOpacity = entity.properties.styles.fillOpacity ? entity.properties.styles.fillOpacity : false;
				var fillColor = entity.properties.styles.fillColor ? entity.properties.styles.fillColor : "";
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
				} else if (entity.properties.z) {
					alcada = parseInt(entity.properties.z);
					_tenimAlcada = true;
				} else if (entity.properties.Z) {
					alcada = parseInt(entity.properties.Z);
					_tenimAlcada = true;

				} else if (entity.properties.volum) {
					alcada = parseInt(entity.properties.volum);
					_tenimAlcada = true;
				} else if (entity.properties.VOLUM) {
					alcada = parseInt(entity.properties.VOLUM);
					_tenimAlcada = true;
				} else if (entity.properties.text) {
					//alcada = parseInt(entity.properties.VOLUM);
					if(entity.properties.text.indexOf('volum#')!=-1){
						altT=entity.properties.text.replace('volum#','');
						alcada = parseInt(altT);	
						_tenimAlcada = true;	
					}else{
					
					_tenimAlcada = false;
				
					}
				
				
				} else {
					_tenimAlcada = false;

				}

				var entityMatriu = [];
				var _matriuAlcada = [];
				var _extrudeAlcada;

				
				
				if (msg == 'vector') {
					for (var j = 0; j < entity.polygon._hierarchy._value.positions.length; ++j) {
						z = z + 1;
						entityMatriu.push(matriu[z - 1]);

						if (_tenimAlcada) {

							_matriuAlcada.push(matriu[z - 1].height);
						}

					}

					var cartesianPositions = Cesium.Ellipsoid.WGS84.cartographicArrayToCartesianArray(entityMatriu);

		
				
				} else {

					var cartesianPositions = entity.polygon._hierarchy._value;
					//var cartesianPositions =Cesium.Ellipsoid.WGS84.cartographicArrayToCartesianArray(entityMatriu);

				}
				var _newEntity;

				if (_tenimAlcada) {

					var terra = 0;
					if (msg == 'vector') {
						terra = (Math.max.apply(Math, _matriuAlcada));
					}
					_extrudeAlcada = terra + parseInt(alcada);
					
					
					_newEntity = {

						properties : entity.properties,
						show : visible,
						polygon : {
							hierarchy : cartesianPositions,
							outline : true,
							extrudedHeight : _extrudeAlcada,
							fill : true,
							outlineColor : Cesium.Color.fromCssColorString(borderColor),
							material : Cesium.Color.fromCssColorString(fillColor).withAlpha(fillOpacity),
							// outlineWidth : 3.0,
							perPositionHeight : true

						}
					};
										
				} else {
								
					_newEntity = {
						properties : entity.properties,
						show : visible,
						polygon : {
							hierarchy : cartesianPositions,
							outline : true,
							// fill:true,
							outlineColor : Cesium.Color.fromCssColorString(borderColor),
							material : Cesium.Color.fromCssColorString(fillColor).withAlpha(fillOpacity),
							// outlineWidth : 3.0,
							//perPositionHeight : true,
							// extrudedHeight:3000
							heightReference : Cesium.HeightReference.CLAMP_TO_GROUND

						}
					};
					
					
					/*
					entity.show=visible;
					entity.polygon.outline = true;
					entity.polygon.perPositionHeight=true;
					entity.polygon.outlineColor = Cesium.Color.fromCssColorString(borderColor);
					entity.polygon.material =Cesium.Color.fromCssColorString(fillColor).withAlpha(fillOpacity);

					_newEntity=entity;
					*/
				}

				viewer.entities.add(_newEntity);

			}

		} // final for afegim el DataSource

		dataSource = "";

		map.spin(false);
		matriu = [];

	},

	this.getPosicioCamera3D = function () {
		var dfd = $.Deferred();

		try {
			var cameraPos = viewer.camera._position.x + ',' + viewer.camera._position.y + ',' + viewer.camera._position.z + ','
				+viewer.camera._directionWC.x + ',' + viewer.camera._directionWC.y + ',' + viewer.camera._directionWC.z + ','
				+viewer.camera._up.x + ',' + viewer.camera._up.y + ',' + viewer.camera._up.z;

			dfd.resolve(cameraPos);
		} catch (Err) {
			//console.warn(Err);
			dfd.reject(Err);
		}
		return dfd.promise();
	},

	this.setPosicioCamera3D = function (cameraPos) {

		var v = cameraPos.split(",");

		//_postion
		eye = new Cesium.Cartesian3(parseFloat(v[0]), parseFloat(v[1]), parseFloat(v[2]));
		target = Cesium.Cartesian3.add(eye, new Cesium.Cartesian3(parseFloat(v[3]), parseFloat(v[4]), parseFloat(v[5])),
				new Cesium.Cartesian3());
		up = new Cesium.Cartesian3(parseFloat(v[6]), parseFloat(v[7]), parseFloat(v[8]));

		viewer.camera.flyTo({
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

				factorTerreny = 14

					terreny = new Cesium.CesiumTerrainProvider({
						url : _urlTerrenys,
						credit : 'icgc'

					});

				dfd.resolve(terreny);

			} else if (!this._miraCentreDins(lat, lng) && credit != 'cesium') {

				factorTerreny = 11;

				terreny = new Cesium.CesiumTerrainProvider({
						url : 'http://assets.agi.com/stk-terrain/world',
						credit : 'cesium'

					});

				dfd.resolve(terreny);
			} else {

				dfd.resolve(null);
			}

		} catch (Err) {
			//console.warn(Err);
			dfd.reject(Err);
		}
		return dfd.promise();
	},

	this._ActivaDesactivaCapa = function (bi, visible) {

		for (var i = 0; i < viewer.dataSources.length; i++) {

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

	this.calculaPosicioInici = function (bounds, mapZoom) {

		var dfd = $.Deferred();

		try {

			var ns = parseFloat(bounds.getNorth() - bounds.getSouth());
			var we = parseFloat(bounds.getEast() - bounds.getWest());
			var ew = parseFloat(bounds.getWest() - bounds.getEast());

			var centerLng = parseFloat(bounds.getEast()) + parseFloat(ew / 2);
			var centerLat = parseFloat(bounds.getNorth()) - parseFloat(ns / 2);

			var inNS = parseFloat(ns / 2);
			var inWE = parseFloat(we / 2);
			var southLat = bounds.getSouth();
			var factor = 1;
			var rectangle2 = Cesium.Rectangle.fromDegrees((bounds
						.getWest() + inWE),
					((bounds.getSouth()) - ns), (bounds
						.getEast() - inWE),
					((bounds.getNorth()) - ns));

			var matriuAlt = [56623104, 28311552, 14155776, 7077888, 3538944, 1769472, 884736, 442368, 221184, 110592, 55296, 27648, 13824, 6912, 3456, 1728, 864, 432, 216, 108, 54, 27, 13, 5];
			var matriuGrauSud = [16, 16, 16, 13, 10, 7, 4, 2, 1, 0.8, 0.7, 0.2, 0.1, 0.055, 0.03, 0.015, 0.0095, 0.005, 0.002, 0.0015, 0.0005, 0.00035, 0.0002];
			var matriuPitch = [-73, -73, -73, -71, -69, -67, -65, -63, -61, -59, -57, -55, -53, -51, -49, -47, -45, -43, -41, -39, -37, -35, -33];

			var altMetres = matriuAlt[mapZoom];
			var grausSud = matriuGrauSud[mapZoom];
			var _picth = matriuPitch[mapZoom];

			var distMetres = altMetres * Math.sin(37.5);
			var factorLat = Cesium.Math.toDegrees(Math.tan(distMetres / 6370000));

			var newLat = parseFloat(centerLat) - parseFloat(grausSud);

			var positions = [
				Cesium.Cartographic.fromDegrees(centerLng, newLat)
			];
			var promise = Cesium.sampleTerrain(terreny, 15, positions);
			Cesium.when(promise, function (updatedPositions) {
				// positions[0].height and positions[1].height have been updated.
				// updatedPositions is just a reference to positions.
			});

			var rectangle3 = Cesium.Rectangle.fromDegrees(
					(bounds.getWest()),
					((bounds.getSouth()) - parseFloat(ns / 2)),
					(bounds.getEast()),
					((bounds.getNorth()) - parseFloat(ns / 2)));

			var rectangle4 = Cesium.Rectangle.fromDegrees(
					(bounds.getWest()),
					((bounds.getSouth()) + parseFloat(factorLat)),
					(bounds.getEast()),
					((bounds.getNorth()) + parseFloat(factorLat)));

			var rectangle = Cesium.Rectangle.fromDegrees((bounds
						.getWest()),
					((bounds.getSouth())), (bounds
						.getEast()),
					((bounds.getNorth())));

			var posicioMapa3D = {
				'rectangle' : rectangle,
				'rectangle2' : rectangle2,
				'rectangle3' : rectangle3,
				'rectangle4' : rectangle4,
				'centerLng' : centerLng,
				'centerLat' : centerLat,
				'altMetres' : altMetres,
				'newAlt' : positions,
				'grausSud' : grausSud,
				'_picth' : _picth,
				'newLat' : newLat,
				'southLat' : southLat,
				'x0' : bounds.getWest(),
				'y0' : bounds.getSouth(),
				'x1' : bounds.getEast(),
				'y1' : bounds.getNorth()

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
			/*
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
			 */
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
			var latDiff = parseFloat(bbox.lat1) - parseFloat(bbox.lat0);
			var lngDiff = parseFloat(bbox.lng1) - parseFloat(bbox.lng1);

			var centerLat = parseFloat(bbox.lat0) + (parseFloat(latDiff / 2));
			var centerLng = parseFloat(bbox.lng0) + (parseFloat(lngDiff / 2));

			var maxDiff = (lngDiff > latDiff) ? lngDiff : latDiff;
			if (maxDiff < 256 / Math.pow(2, 20)) {
				zoomLevel = 21;
			} else {
				zoomLevel = parseInt((-1 * ((Math.log(maxDiff) / Math.log(2)) - (Math.log(360) / Math.log(2)))));

				if (zoomLevel > 18) {
					zoomLevel = zoomLevel - 2;
				}

				if (zoomLevel < 1) {
					zoomLevel = 1;
				}

			}

			bbox.centerLat = centerLat;
			bbox.centerLng = centerLng;
			bbox.zoomLevel = zoomLevel;

			dfd.resolve(bbox);

		} catch (Err) {

			//console.debug(Err);
			var bbox = {};
			bbox.lng0 = map.getBounds().getWest();
			bbox.lat0 = map.getBounds().getSouth();
			bbox.lng1 = map.getBounds().getEast();
			bbox.lat1 = map.getBounds().getNorth();
			//console.debug(bbox);
			dfd.resolve(bbox);
			//dfd.reject(bbox);
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
	//alert("El seu Navegador no suporta el WebGL");
	jQuery("#dialgo_no_webgl").modal('show');
	_gaq.push(['_trackEvent', appl, 'noWebGL3D', 'label 3D', 1]);
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

function addHtmlModalNoWebGL() {
	jQuery('#mapa_modals').append(
		'	<!-- Modal Old Browser -->' +
		'		<div id="dialgo_no_webgl" class="modal">' +
		'		<div class="modal-dialog">' +
		'			<div class="modal-content">' +
		'				<div class="modal-header">' +
		'					<button id="old_icon_close" type="button" class="close" data-dismiss="modal"' +
		'						aria-hidden="true">&times;</button>' +
		'					<h4 lang="ca" class="modal-title">Ups! Ho sentim, no es pot inicialitzar el mapa en 3D.</h4>' +
		'				</div>' +
		'				<div class="modal-body">' +
		'					<div lang="ca">Aquest prototip utilitza Cesium JS, una llibreria per a la creació de mapes en 3D - basada amb WebGL - que per funcionar correctament necessita que tingueu la darrera versió del navegador web i que la tarja gràfica del vostre ordinador tingui carregats els drivers més actuals</div>' +
		'				</div>' +
		'				<div class="modal-footer">' +
		'					<button id="old_btn_close" lang="ca" type="button" class="btn btn-default" data-dismiss="modal">Continuar</button>' +
		'				</div>' +
		'			</div>' +
		'			<!-- /.modal-content -->' +
		'		</div>' +
		'		<!-- /.modal-dialog -->' +
		'	</div>' +
		'	<!-- fi Modal Old Browser -->');

	jQuery('#mapa_modals').append(
		'	<!-- Modal Old Browser -->' +
		'		<div id="dialgo_ad_3D" class="modal">' +
		'		<div class="modal-dialog">' +
		'			<div class="modal-content">' +
		'				<div class="modal-header">' +
		'					<button id="old_icon_close" type="button" class="close" data-dismiss="modal"' +
		'						aria-hidden="true">&times;</button>' +
		'					<h4 lang="ca" class="modal-title"><span lang="ca">La modalitat 3D està en fase beta.</span> <span style="color:#ffa500" class="fa fa-warning sign"></span> </h4>' +
		'				</div>' +
		'				<div class="modal-body">' +
		'					<div class="alert-warning"  style="padding:5px"  lang="ca">' +
		'							<div lang="ca">En el mode 3D podeu seguir utilitzant la majoria de les funcionalitat d\'Instamaps. Amb tot, notareu que algunes es troben de moment deshabilitades.</div><br>' +
		'							<div lang="ca">La tecnologia WebGL que s’utilitza per la renderització 3D consumeix recursos del vostre maquinari i navegador. En funció del vostre equip obtindreu una millor rendiment. Comproveu que el vostre navegador està actualitzat.</div><br>' +
		'							<div lang="ca">Us recomanem que per al treball en 3 dimensions utilitzeu preferiblement <b>Chrome</b>, ja que demostra un més alt rendiment.</div>' +
		'                </div><hr>' +
		'					<div>' +
		'						<div style="float:left;padding-left: 14px;"  lang="ca"><img width="70" src="img/nav3d.png"></div>' +
		'						<div style=" width: 80%;float:right;padding:5px" class="alert-info">' +
		'						<div lang="ca"><span>1-</span><span lang="ca">Arrossegueu per rotar i girar la vista. Consells: També podeu orbitar lliurement prement la tecla CTRL i arrossegant el mapa .Fent doble click podreu inicialitzar la vista</span></div><br>' +
		'							<div lang="ca"><span>2-</span><span lang="ca">Feu clic i arrossegueu per rotar la càmera</span></div>' +
		'						</div>' +
		'				</div>' +
		'				</div>' +
		'				<div class="modal-footer">' +
		'					<span style="float:left"><input id="chk_ad_3d" type="checkbox"><span lang="ca">No mostrar més aquest missatge</span></span>  <button id="old_btn_close" lang="ca" type="button" class="btn btn-info" data-dismiss="modal">Continuar</button>' +
		'				</div>' +
		'			</div>' +
		'			<!-- /.modal-content -->' +
		'		</div>' +
		'		<!-- /.modal-dialog -->' +
		'	</div>' +
		'	<!-- fi Modal Old Browser -->');
}

addHtmlModalNoWebGL();
