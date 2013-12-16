var map;
var factorH = 50;
var controlCapes;
var editableLayers;
var sidebar;
function addEventClickPopOvers(){

jQuery(document).on('shown.bs.tab','a[data-toggle="tab"]', function (e) {
						e.target // activated tab
						console.info(e);
						console.info(e.target.attributes.href.value);
						
						jQuery(e.target.attributes.href.value).html("hdhdhdhdhdhd");
						e.relatedTarget // previous tab



/*
$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
						e.target // activated tab
						console.info(e);
						console.info(e.target.attributes.href.value);
						
						jQuery(e.target.attributes.href.value).html("hdhdhdhdhdhd");
						e.relatedTarget // previous tab
})

*/
});


}
jQuery(document)
		.ready(
				function() {

					doLogin('wszczerban', 'piji23').then(function(results) {

						console.info(results);
						jQuery.cookie('uid', 'wszczerban');
					});

					map = new L.IM_Map('map', {
						typeMap : 'topoMap',
						maxZoom : 19
					}).setView([ 41.431, 1.8580 ], 8);

					factorH = jQuery('.navbar').css('height').replace(
							/[^-\d\.]/g, '');
					jQuery('#map').height(jQuery(window).height() - factorH);

					tradueixMenusToolbar();

					
					/* var limits =
					 L.tileLayer.wms("http://172.70.1.11/maps/geocat.service?map=/opt/geocat/dades/mon/mon.map&", {
					 layers: 'cat1936', format: 'image/png', crs:
					 L.Proj.CRS.TMS("EPSG:3857"), maxZoom: 19, minZoom: 0,
					 transparent: true,
					 nom:'limits',
					bussinesId:"dada"	 
					 
					 }).addTo(map);*/
					 
					/*
					 * 
					 * TOPO_ICC_L0_6= new
					 * L.TileLayer('http://172.70.1.11/mapcache/tms/1.0.0/cat1936_3857@GM14/{z}/{x}/{y}.png', {
					 * minZoom: 0, maxZoom: 14, tms:true, continuousWorld: true,
					 * worldCopyJump:false, }).addTo(map);
					 * 
					 */

					editableLayers = new L.FeatureGroup();

					map.addLayer(editableLayers);

					var MyCustomMarker = L.Icon
							.extend({
								options : {
									shadowUrl : null,
									iconAnchor : new L.Point(12, 12),
									iconSize : new L.Point(24, 48),
									iconUrl : '/llibreries/css/leaflet/images/marker-icon-2x.png'
								}
							});

					var options = {
						position : 'topright',
						draw : {
							polyline : {
								guidelineDistance : 2,
								shapeOptions : {
									color : '#64A01C',
									weight : 5
								}
							},
							polygon : {
								allowIntersection : true, // Restricts shapes
															// to simple
								// polygons
								drawError : {
									color : '#e1e100', // Color the shape will
														// turn when
									// intersects
									message : '<strong>Oh snap!<strong> no pots dibuixer això!' // Message
								// that
								// will
								// show
								// when
								// intersect
								},
								guidelineDistance : 2,
								shapeOptions : {
									color : '#64A01C',
									weight : 5,
									opacity : 0.7
								}
							},
							circle : {
								shapeOptions : {
									color : '#64A01C',
									weight : 5,
									opacity : 0.7
								}
							}, // Turns off this drawing tool
							rectangle : {
								shapeOptions : {
									// clickable: false
									color : '#64A01C',
									weight : 5,
									opacity : 0.7
								}
							},
							marker : {
							// icon: new MyCustomMarker()
							}
						},
						edit : {
							featureGroup : editableLayers, // REQUIRED!!
							color : '#FC07E3',
							remove : true
						}
					};

					var overlayMaps = {
						"Users" : editableLayers

					};

					controlCapes = L.control.layers(null, null, {
						collapsed : false,
						id : 'div_capes'
					}).addTo(map);

					
					
					var drawControl = new L.Control.Draw(options);

					//map.addControl(drawControl);

					map.on('draw:created', function(e) {
						var type = e.layerType, layer = e.layer;

						if (type === 'marker') {
							layer.bindPopup('opcions ediciodddddd!');
						}

						editableLayers.addLayer(layer);
					});

					var capaADD1;

					editableLayers
							.on(
									'layeradd',
									function(f) {

										var fId = this.toGeoJSON().features.length;

										var feature = f.layer.toGeoJSON();
										feature.properties = {
											nom : "feature" + fId,
											text : "<a href='http://www.google.com'>link</a>",
											slotf1 : 'data 1',
											slotf2 : 'data 2',
											slotf3 : 'data 3',
											slotf4 : 'data 4',
											slotf5 : 'data 5',
											slotf6 : 'data 6',
											slotf7 : 'data 7',
											slotf8 : 'data 8',
											slotf9 : 'data 9',
											slotf10 : 'data 10'
										};

										var features = JSON.stringify(feature);

										var dades = JSON.stringify({
											type : 'Dades',
											id : fId,
											fields : {
												slotd1 : "feature" + fId,
												slotd2 : 'data 2',
												slotd3 : 'data 3',
												slotd4 : 'data 4',
												slotd5 : 'data 5',
												slotd6 : 'data 6',
												slotd7 : 'data 7',
												slotd8 : 'data 8',
												slotd9 : 'data 9',
												slotd10 : 'data 10',
											}
										});

										var rangs = JSON
												.stringify({
													llegenda : 'hotel',
													valorMax : "feature" + fId,
													color : '#ff0000',
													simbolSize : f.layer._icon.height,
													simbol : f.layer._icon.src,
													lineWidth : 2,
													lineStyle : 'solid',
													borderWidth : 2,
													borderColor : '#000000',
													opacity : (f.layer.options.opacity * 100),
													label : false,
													labelSize : 10,
													labelFont : 'arial',
													labelColor : '#000000',
												});

										if (fId == 1) {
											// Add feature and Layer

											var data = {
												uid : jQuery.cookie('uid'),// getfrom
																			// cookie
																			// (uid)
												description : 'prova',
												nom : 'Capa1',
												publica : true,
												geomField : 'the_geom',
												idGeomField : 'nom',
												dataField : 'slotd1',
												idDataField : 'slotd1',
												features : features,
												dades : dades,
												rangs : rangs
											};
											// this.options={"hola":1};
											console.info(this);
											var _this = this;
											// console.info(this.toGeoJSON());
											addTematicLayerFeature(data)
													.then(
															function(results) {

																_this.options = results;
																// editableLayers=results;

																console
																		.info(editableLayers);
															});

										} else if (this.toGeoJSON().features.length > 1) {

											var dataFeature = {
												businessId : this.options.results.geometriesBusinessId,
												uid : jQuery.cookie('uid'),
												features : features
											};

											var dataCapes = {
												businessId : this.options.results.capesBusinessId,
												uid : jQuery.cookie('uid'),
												dades : dades
											};

											var dataRangs = {
												businessId : this.options.results.businessId,
												uid : jQuery.cookie('uid'),
												rangs : rangs
											};

											jQuery
													.when(
															createFeature(dataFeature),
															createData(dataCapes),
															createRang(dataRangs))
													.then(
															function(results1,
																	results2,
																	results3) {
																console
																		.info(results1[0].status);
																console
																		.info(results2[0].status);
																console
																		.info(results3[0].status);
															})

											// Add feature

										}

										// console.info(this.toGeoJSON());
										// console.info(f);

									});

					var puntUsuari;
					jQuery('.div_punt').on(
							'mousedown',
							function() {

								var dd = new L.Draw.Marker(map,
										drawControl.options.marker);
								dd.enable();
								map.on('mouseup', function(e) {
									var latlng = e.latlng;
									puntUsuari = L.marker([ 0, 0 ], {
										draggable : true
									});
									puntUsuari.setLatLng(latlng);
									puntUsuari.bindPopup('opcions edicioddd!');

									// console.info(editableLayers.toGeoJSON().features.length);

									var pt = puntUsuari.toGeoJSON();
									// pt.properties={'nom':puntUsuari._leaflet_id,'text':puntUsuari._popup._content;

									// puntUsuari.addTo(map);
									editableLayers.addLayer(puntUsuari);

									// console.info(JSON.stringify(puntUsuari.toGeoJSON()));

									// console.info(JSON.stringify(editableLayers.toGeoJSON()));
									dd.disable();
									map.off('mouseup', null);

									// controlCapes.addOverlay(puntUsuari);

								});

							});

					jQuery('#div_fons img').on('click', function() {

						var fons = jQuery(this).attr('id');

						if (fons == 'topoMap') {
							map.topoMap();
						} else if (fons == 'ortoMap') {
							map.ortoMap();
						} else if (fons == 'terrainMap') {
							map.terrainMap();
						} else if (fons == 'terrainGrisMap') {
							map.terrainGrisMap();
						} else if (fons == 'colorMap') {
						}

					});

					inicialitzaDropFiles();
					addBoto();

					jQuery('#div_menu').on('click', function() {
						activaPanelCapes();

					});
					
					jQuery('#generaHeatMap').on('click', function() {
						generaHeatMap();

					});

					
					
					// $('#pop').popover();​​​

					jQuery("#bt_dadesObertes")
							.popover(
									{
										title : 'Dades Obertes',
										content : '<div id="div_DO">'
											+'<a class="label label-explora" href="#" id="radars">Radars</a>'
											+'<a class="label label-explora" href="#" id="hotels">Hotels</a>'
											+'<a class="label label-explora" href="#" id="campings">Campings</a><br>'
											+'<a class="label label-explora" href="#" id="turisme_rural">Turisme rurals</a>'
											+'<a class="label label-explora" href="#" id="incidencies">Incidencies</a>'										
											+'</div>',
										container : 'body',
										html : true,
										trigger : 'manual'
									});

					jQuery("#bt_dadesObertes").on('click', function() {
						jQuery(this).attr("data-content", "he canviat");
						jQuery(this).popover('toggle');
						jQuery(".popover").css('left', pLeft());

					});

					jQuery(document).on('click', "#div_DO", function(e) {
						//console.info(e.target.id);
						//console.info(this);
						//console.info(jQuery(this))
						obteDadesObertes(e.target.id);

					});
					jQuery('#bt_dadesUsuari')
							.on(
									'click',
									function() {

										getTematicLayerByBusinessId(
												{
													businessId : 'f36b663d4f36499b0ee33835e903f661',
													uid : 'wszczerban'
												})
												.then(
														function(r) {

														

															jsonTest1 = new L.geoJson(
																	r.results.geometries.features);

															jsonTest1
																	.addTo(map);

														});

									});

					addSideBarMapa();
					
					
					
					
					
					obteDadesObertes('campings');
					
					
					
					
					
					
					
					
					
					
					
					
					
					
					
					
					
					
					
					

				});// final ready

function pLeft() {
	return jQuery(".leaflet-left").css('left');
}


var data=[];
function popUp(f, l) {
	
	var out = [];
	data.push({lat:f.geometry.coordinates[1],lon:f.geometry.coordinates[0],value:1});
	if (f.properties) {
		for (key in f.properties) {
			out.push(key + ": " + f.properties[key]);
		}
		l.bindPopup(out.join("<br />"));
		
	}
	
}

function myStyle1(feature) {

	return {
		weight : 2,
		opacity : 1,
		color : 'white',
		dashArray : '3',
		fillOpacity : 0.3,
		fillColor : '#ff0000'
	};

}


var jsonTest;
function obteDadesObertes(dataset) {

	var url = "http://172.70.1.12/share/jsp/dadesObertes.jsp?dataset="
			+ dataset;
	
	jsonTest = new L.GeoJSON.AJAX(url, {
		nom:dataset,
		id:'bussinesID',
		onEachFeature : popUp,
		dataType : "jsonp",
		
		pointToLayer : function(feature, latlng) {
			
			if(dataset=="radars"){
				return L.circleMarker(latlng, Marker_radars);	
			
			}else if(dataset=="turisme_rural"){
				return L.circleMarker(latlng, Marker_green);
			
			}else{
			return L.circleMarker(latlng, Marker_hotels);
			}
		}
	});
	
	jsonTest.addTo(map);
	controlCapes.addOverlay(jsonTest,dataset,true);
	activaPanelCapes(true);
	
}

var ll=0;

function generaHeatMap(){
var aa;



var heatmapLayer = L.TileLayer.heatMap({
					// radius could be absolute or relative
					// absolute: radius in meters, relative: radius in pixels
					//radius: { value: 1500, absolute: true },
			        radius: { value: 10, absolute: false },
			        nom:"campings_hetmap",
					id:'bussinesIDw',
					opacity: 0.8,
					gradient: {
						0.45: "rgb(0,0,255)",
						0.55: "rgb(0,255,255)",
						0.65: "rgb(0,255,0)",
						0.95: "yellow",
						1.0: "rgb(255,0,0)"
					}
				});
ll=ll+1;
				//heatmapLayer.setData([{lat:41.84740770476395,lon:1.638687614382383,value: 1}, {lat:42.03067598352691,lon:2.465032315929955,value: 1}, {lat:41.47419380695586,lon:1.552796985664061,value: 1}, {lat:42.26533038974976,lon:3.101375915623241,value: 1}, {lat:42.25490858769949,lon:3.13729241801335,value: 1}, {lat:42.25318310537378,lon:3.134160946077441,value: 1}, {lat:41.817438754735555,lon:3.067069238679724,value: 1}, {lat:41.803302425800496,lon:3.058700158038928,value: 1}, {lat:41.80531926043032,lon:3.060098441297228,value: 1}, {lat:41.80861184361761,lon:3.04968804484853,value: 1}, {lat:41.824288112092894,lon:3.074987834474227,value: 1}, {lat:41.814396713556555,lon:3.043901420948348,value: 1}, {lat:42.39242218828834,lon:1.915997690340261,value: 1}, {lat:42.443247225714465,lon:1.907024287235357,value: 1}, {lat:42.24606290539016,lon:2.599524954319683,value: 1}, {lat:42.243428567316776,lon:2.583069121811727,value: 1}, {lat:42.2714029595848,lon:2.523138452490689,value: 1}, {lat:42.26881932760268,lon:2.519095732881154,value: 1}, {lat:41.899042310406024,lon:3.187459246663089,value: 1}, {lat:41.920615823436655,lon:3.202054603870242,value: 1}, {lat:42.32661409509472,lon:3.204809321128535,value: 1}, {lat:42.338592773150054,lon:3.204532689263968,value: 1}, {lat:42.23606901071106,lon:2.650114724397095,value: 1}, {lat:42.59124394630267,lon:1.326285531289851,value: 1}, {lat:42.700045897167826,lon:0.869158132459307,value: 1}, {lat:42.37868070788729,lon:1.635218494951848,value: 1}, {lat:42.503481329634255,lon:0.801047597165239,value: 1}, {lat:42.52298448678786,lon:0.83497480164847,value: 1}, {lat:42.024057849364546,lon:1.343114052461476,value: 1}, {lat:41.86061708350951,lon:0.831877113821114,value: 1}, {lat:42.67040956499846,lon:1.23621472421695,value: 1}, {lat:42.39352658354826,lon:1.342385710343887,value: 1}, {lat:42.13932598803278,lon:1.387244958321733,value: 1}, {lat:42.38057074544227,lon:0.867022569730722,value: 1}, {lat:42.35888821003397,lon:1.080687044780605,value: 1}, {lat:42.428391536719346,lon:1.462895686079675,value: 1}, {lat:42.705986313292016,lon:0.78499951553274,value: 1}, {lat:42.7383252646976,lon:0.753210294291993,value: 1}, {lat:42.58885969750602,lon:1.238125569187247,value: 1}, {lat:42.559506447520796,lon:1.229644879690105,value: 1}, {lat:42.56913282678208,lon:1.230201168243763,value: 1}, {lat:42.24229713667809,lon:1.526919093297816,value: 1}, {lat:41.261214821166384,lon:0.941514875565677,value: 1}, {lat:41.04059471252746,lon:0.983452250085768,value: 1}, {lat:41.02591843329254,lon:0.95921997199786,value: 1}, {lat:41.13114120528169,lon:1.362596074974425,value: 1}, {lat:41.138895798914895,lon:1.357470540263005,value: 1}, {lat:41.13243237623914,lon:1.358382295716748,value: 1}, {lat:41.187039846022856,lon:1.558599671208517,value: 1}, {lat:41.18301973395591,lon:1.536236917303835,value: 1}, {lat:42.34750050715216,lon:1.430886008932992,value: 1}, {lat:40.55657614223126,lon:0.532111925602779,value: 1}, {lat:40.5945397617505,lon:0.569746387765598,value: 1}, {lat:40.53992714084716,lon:0.519782790728496,value: 1}, {lat:40.97685962869863,lon:0.898323896515769,value: 1}, {lat:40.985525082655116,lon:0.91271693499361,value: 1}, {lat:40.93987324859544,lon:0.85663940213705,value: 1}, {lat:42.74937715289826,lon:0.700284256977816,value: 1}, {lat:42.750033790405546,lon:0.698903723022872,value: 1}, {lat:42.75134376764067,lon:0.698219876592321,value: 1}, {lat:42.2287311083922,lon:1.784146231842294,value: 1}, {lat:42.75643046300006,lon:0.694585607717,value: 1}, {lat:41.88894896109354,lon:3.17977546839563,value: 1}, {lat:41.89405365372487,lon:3.181164077156991,value: 1}, {lat:42.59349818825118,lon:1.131860664181951,value: 1}, {lat:42.591727383676826,lon:1.132059802563247,value: 1}, {lat:40.885468803853314,lon:0.801651923732865,value: 1}, {lat:40.8636864882136,lon:0.779437990184009,value: 1}, {lat:42.05305111587767,lon:3.191091292703066,value: 1}, {lat:42.04895599177925,lon:3.183840658841318,value: 1}, {lat:42.05666163792655,lon:3.19706028678019,value: 1}, {lat:42.05305111587767,lon:3.191091292703066,value: 1}, {lat:42.03941163534327,lon:3.193164668222414,value: 1}, {lat:42.04085032155805,lon:3.123308199699442,value: 1}, {lat:42.05305111587767,lon:3.191091292703066,value: 1}, {lat:42.043424560937076,lon:3.1846946287033,value: 1}, {lat:42.259726123832166,lon:0.986139648651376,value: 1}, {lat:42.408808249596234,lon:0.742236962272036,value: 1}, {lat:42.4492317886289,lon:0.709936113788707,value: 1}, {lat:42.408808249596234,lon:0.742236962272036,value: 1}, {lat:42.38116035183285,lon:1.114408810242868,value: 1}, {lat:42.37239024164639,lon:1.110116716957575,value: 1}, {lat:42.426167964971555,lon:0.98255864076423,value: 1}, {lat:41.089075258813715,lon:1.181733464584769,value: 1}, {lat:40.804597911523594,lon:0.700848536107863,value: 1}, {lat:40.79464184823094,lon:0.676432739051855,value: 1}, {lat:41.61786810199905,lon:2.604737303397837,value: 1}, {lat:41.748317811113715,lon:2.419691515209813,value: 1}, {lat:41.637131259698485,lon:2.163278105548464,value: 1}, {lat:42.11349951603874,lon:3.144400380711965,value: 1}, {lat:42.11995966027432,lon:3.135003267183893,value: 1}, {lat:42.10834174125743,lon:3.168554987124596,value: 1}, {lat:42.107880129450805,lon:3.143867476754968,value: 1}, {lat:42.1102276352929,lon:3.166140875277994,value: 1}, {lat:41.07871638369199,lon:1.066088842341424,value: 1}, {lat:41.10950095622614,lon:1.044582884908539,value: 1}, {lat:42.32627954717184,lon:0.939587447528225,value: 1}, {lat:42.50281513002128,lon:1.204628204547715,value: 1}, {lat:42.49611149956123,lon:1.2165145663436,value: 1}, {lat:42.359217875581656,lon:1.555702687278671,value: 1}, {lat:42.56913701372414,lon:1.109792751899257,value: 1}, {lat:42.57782255533555,lon:1.08564779573177,value: 1}, {lat:42.57782255533555,lon:1.08564779573177,value: 1}, {lat:42.57508437194502,lon:1.090471313520686,value: 1}, {lat:42.5741819350015,lon:1.086039388091216,value: 1}, {lat:41.959469570328665,lon:1.604365290965478,value: 1}, {lat:41.14933218408239,lon:1.419701339787229,value: 1}, {lat:41.14274731467189,lon:1.404643265276479,value: 1}, {lat:41.14993558548166,lon:1.421665048892705,value: 1}, {lat:41.1730333401372,lon:1.474672161905945,value: 1}, {lat:41.1730333401372,lon:1.474672161905945,value: 1}, {lat:41.1730333401372,lon:1.474672161905945,value: 1}, {lat:41.24751106720092,lon:0.420864735777412,value: 1}, {lat:42.06326657906747,lon:2.550248206289128,value: 1}, {lat:42.05591059739005,lon:2.550855959666763,value: 1}, {lat:42.306915981728395,lon:2.211364406655127,value: 1}, {lat:41.872660014768336,lon:3.151832183707388,value: 1}, {lat:41.8586266617505,lon:3.138112190982934,value: 1}, {lat:41.857005321532164,lon:3.138193020762098,value: 1}, {lat:41.86298526609928,lon:3.145953416928536,value: 1}, {lat:41.849852802139225,lon:3.139044898508903,value: 1}, {lat:42.20923712895118,lon:2.737208286126491,value: 1}, {lat:42.22270281791432,lon:2.166004496181996,value: 1}, {lat:42.227448523284586,lon:2.13908889651246,value: 1}, {lat:41.662373734657955,lon:2.780649479576126,value: 1}, {lat:41.66435014410657,lon:2.782672788910944,value: 1}, {lat:41.65939984160291,lon:2.779854811108851,value: 1}, {lat:41.65342492101727,lon:2.778217745386146,value: 1}, {lat:41.66080479638072,lon:2.779765962314956,value: 1}, {lat:41.65900251657802,lon:2.779327684024996,value: 1}, {lat:41.656426539711475,lon:2.779372482096025,value: 1}, {lat:41.66164333219396,lon:2.780219543614484,value: 1}, {lat:41.666663641662495,lon:2.781956309869501,value: 1}, {lat:41.688993015970595,lon:2.797069882867223,value: 1}, {lat:41.663581901735434,lon:2.781282010243461,value: 1}, {lat:41.66163454010616,lon:2.775655275105644,value: 1}, {lat:41.94286530967588,lon:1.78200217851795,value: 1}, {lat:41.88242938483154,lon:3.140140301751467,value: 1}, {lat:42.31426172919276,lon:2.776792860207091,value: 1}, {lat:41.783700733041506,lon:3.04424118692842,value: 1}, {lat:42.79582557870778,lon:0.698552443437424,value: 1}, {lat:41.80474943649671,lon:2.217969377382853,value: 1}, {lat:42.21574168390774,lon:1.835122899492606,value: 1}, {lat:41.20328366160359,lon:1.65648324298948,value: 1}, {lat:41.758930009974954,lon:2.388764745062074,value: 1}, {lat:41.77007339220966,lon:2.390788650731055,value: 1}, {lat:41.21465681236501,lon:1.70735349486299,value: 1}, {lat:41.21465681236501,lon:1.70735349486299,value: 1}, {lat:41.23225840699104,lon:1.690672074356118,value: 1}, {lat:41.522644676914695,lon:2.292842024097625,value: 1}, {lat:41.99830298404118,lon:1.987221269573336,value: 1}, {lat:42.090941672829125,lon:1.856585616807288,value: 1}, {lat:41.72945023776765,lon:2.919515078412624,value: 1}, {lat:41.72690628594784,lon:2.927165155042359,value: 1}, {lat:41.73081562604477,lon:2.914367030659183,value: 1}, {lat:41.73627466079104,lon:2.945372872153761,value: 1}, {lat:41.7184270218129,lon:2.909346181209672,value: 1}, {lat:42.44134350506405,lon:1.94121178995364,value: 1}, {lat:42.15790717008253,lon:2.05390750501158,value: 1}, {lat:41.07765817992815,lon:1.13689798318042,value: 1}, {lat:41.077109992810094,lon:1.11647530617372,value: 1}, {lat:41.07364416936629,lon:1.152770620686682,value: 1}, {lat:40.719876008986006,lon:0.849600483943336,value: 1}, {lat:40.72958621332322,lon:0.830342480398415,value: 1}, {lat:41.34818425065711,lon:0.958069087219618,value: 1}, {lat:41.19445395782629,lon:1.637881737216638,value: 1}, {lat:41.16449978342583,lon:1.457503286504964,value: 1}, {lat:41.15693757447867,lon:1.441746007129041,value: 1}, {lat:41.16410935152919,lon:1.447214050641991,value: 1}, {lat:41.16410935152919,lon:1.447214050641991,value: 1}, {lat:41.16410935152919,lon:1.447214050641991,value: 1}, {lat:41.075209955935634,lon:1.090783253720623,value: 1}, {lat:41.065676553579884,lon:1.045441376606868,value: 1}, {lat:41.07861180834062,lon:1.104243080424006,value: 1}, {lat:41.06610113145591,lon:1.083049010659392,value: 1}, {lat:41.057086886636654,lon:1.027667613706213,value: 1}, {lat:40.91864559840668,lon:0.26770880422063,value: 1}, {lat:40.64580819801123,lon:0.717447790182116,value: 1}, {lat:41.13861335903895,lon:1.382713019628511,value: 1}, {lat:41.137841171240616,lon:1.383530263642116,value: 1}, {lat:41.17938205091806,lon:1.498548198039059,value: 1}, {lat:41.3153204900545,lon:0.880499087117696,value: 1}, {lat:41.04174610069268,lon:0.739248042513236,value: 1}, {lat:41.13022321888992,lon:1.311475525095833,value: 1}, {lat:41.12974184038273,lon:1.307520806195052,value: 1}, {lat:41.130179399706584,lon:1.317099666305122,value: 1}, {lat:41.12809517948339,lon:1.343587439728261,value: 1}, {lat:41.30949932737973,lon:0.984135245396906,value: 1}, {lat:1.499933155867716,lon:2.20318269753537,value: 1}, {lat:41.22910083898324,lon:0.338936516327971,value: 1}, {lat:41.04457789861092,lon:0.994918725057455,value: 1}, {lat:41.04702579563284,lon:1.004136640424007,value: 1}, {lat:41.03800042278148,lon:0.976762491174241,value: 1}, {lat:41.039578875414314,lon:0.981508438782426,value: 1}, {lat:41.031820648936396,lon:0.96955295992969,value: 1}, {lat:41.37603140178648,lon:1.155266463775516,value: 1}, {lat:41.679460234522956,lon:0.71409758313264,value: 1}, {lat:42.18788635125195,lon:0.920982915363783,value: 1}, {lat:42.41882275574404,lon:1.133177190691009,value: 1}, {lat:42.012212921623544,lon:1.518253979693373,value: 1}, {lat:42.00442297175183,lon:0.866786787712384,value: 1}, {lat:42.37252706499489,lon:1.760305086858369,value: 1}, {lat:42.55066479304216,lon:1.318247303093706,value: 1}, {lat:42.140069798026865,lon:1.58714485856472,value: 1}, {lat:42.372153012308004,lon:1.735936425380604,value: 1}, {lat:42.21417950579026,lon:1.327784025507144,value: 1}, {lat:42.07761703828114,lon:1.304826383872874,value: 1}, {lat:42.08073162168011,lon:1.647277873918604,value: 1}, {lat:42.416393762397256,lon:1.673306210358987,value: 1}, {lat:42.61261794711961,lon:1.248245928287024,value: 1}, {lat:42.806298902768425,lon:0.706663698102417,value: 1}, {lat:42.22987519765775,lon:1.661973238422641,value: 1}, {lat:42.61562541902601,lon:1.123115854238001,value: 1}, {lat:42.00449375099115,lon:0.767748051678895,value: 1}, {lat:42.332980778742275,lon:2.307864997650853,value: 1}, {lat:42.12346954296802,lon:2.31862864340482,value: 1}, {lat:42.239613959105334,lon:2.423639859278512,value: 1}, {lat:42.10499822587503,lon:3.157394836703991,value: 1}, {lat:42.01332614472649,lon:3.189136191391598,value: 1}, {lat:42.15055238717795,lon:2.584803837088292,value: 1}, {lat:42.18888324866141,lon:2.584710918426964,value: 1}, {lat:42.15954727791696,lon:2.513047272043794,value: 1}, {lat:41.80369555831928,lon:3.009995514997146,value: 1}, {lat:41.8104854425458,lon:3.020109473180526,value: 1}, {lat:42.176431622138296,lon:3.108195147909255,value: 1}, {lat:42.18789309377595,lon:3.102413909113,value: 1}, {lat:42.18199986185011,lon:3.105758616810886,value: 1}, {lat:42.18627901878151,lon:3.082611231668195,value: 1}, {lat:42.1877876676465,lon:3.088498872492318,value: 1}, {lat:42.189338379855904,lon:3.107563308236338,value: 1}, {lat:42.15365915422055,lon:3.112574047069028,value: 1}, {lat:42.26283202322924,lon:2.368831147312055,value: 1}, {lat:42.13668254408976,lon:2.680658834788331,value: 1}, {lat:42.18418147275349,lon:2.317105831179535,value: 1}, {lat:42.249348850035915,lon:2.333617384347017,value: 1}, {lat:42.08162355925679,lon:2.515214473281631,value: 1}, {lat:41.73455281887728,lon:2.603831516044853,value: 1}, {lat:42.268885232410106,lon:3.152346904091297,value: 1}, {lat:42.24064124800244,lon:3.209438986334178,value: 1}, {lat:42.26623127964983,lon:3.163289734995443,value: 1}, {lat:42.26629563426983,lon:3.155905517616078,value: 1}, {lat:41.808374498515064,lon:2.685577784231877,value: 1}, {lat:42.18217268867373,lon:2.196035022284662,value: 1}, {lat:42.311739413756385,lon:2.17495067908673,value: 1}, {lat:42.34246330577782,lon:3.184611314086145,value: 1}, {lat:42.141907862267836,lon:2.463432520925501,value: 1}, {lat:42.12029344399134,lon:2.746866121048543,value: 1}, {lat:42.32273849290708,lon:2.10327673962252,value: 1}, {lat:41.980632968629564,lon:3.19911843016398,value: 1}, {lat:41.986363404476826,lon:3.181571351333401,value: 1}, {lat:0.028754947746562,lon:-1.450949709370069,value: 1}, {lat:41.956944213047315,lon:3.159586628882811,value: 1}, {lat:42.00062151499308,lon:3.192274121841332,value: 1}, {lat:41.94558522205144,lon:2.557071086034973,value: 1}, {lat:42.15779787330027,lon:2.516801003907165,value: 1}, {lat:42.19036562793243,lon:2.508475420473921,value: 1}, {lat:41.89286221255596,lon:3.145045299213717,value: 1}, {lat:41.89007240161873,lon:3.156936272776501,value: 1}, {lat:42.34543592087342,lon:2.740066836638664,value: 1}, {lat:41.70930506501566,lon:2.881916813861171,value: 1}, {lat:41.69612807206526,lon:2.825433405967445,value: 1}, {lat:41.69715778329146,lon:2.821440681678251,value: 1}, {lat:41.70721526396223,lon:2.843865936298069,value: 1}, {lat:42.370724919813135,lon:3.15394195864291,value: 1}, {lat:41.827773252973465,lon:2.958000739560708,value: 1}, {lat:42.37113828689173,lon:1.807699127254179,value: 1}, {lat:42.33861163036147,lon:3.068111181663582,value: 1}, {lat:41.922758521136615,lon:2.829378090614994,value: 1}, {lat:42.17925716894795,lon:2.796023393014435,value: 1}, {lat:41.860900405104495,lon:2.426049516327549,value: 1}, {lat:42.402648460666654,lon:3.149402676892592,value: 1}, {lat:42.23710321117787,lon:3.121340288989032,value: 1}, {lat:42.205823743794284,lon:3.103557521887988,value: 1}, {lat:42.289401014132544,lon:2.364066080755723,value: 1}, {lat:42.32387070796744,lon:2.389533543219873,value: 1}, {lat:41.85029029525733,lon:3.088703335444793,value: 1}, {lat:41.84890191664921,lon:3.090375837226948,value: 1}, {lat:41.83343381384682,lon:3.082730455098563,value: 1}, {lat:41.83193735485694,lon:3.084510892608647,value: 1}, {lat:41.834772211786834,lon:3.087597821383095,value: 1}, {lat:41.84638206988337,lon:3.098720014082266,value: 1}, {lat:42.29230598951834,lon:3.278887353075583,value: 1}, {lat:42.19887703725321,lon:2.699314706196486,value: 1}, {lat:41.93628844969174,lon:3.211573452388394,value: 1}, {lat:41.970908768413096,lon:3.212448692268674,value: 1}, {lat:41.81780572937664,lon:2.479748909228401,value: 1}, {lat:42.306923076644026,lon:2.708957659758204,value: 1}, {lat:41.93428086658475,lon:2.408698642896091,value: 1}, {lat:41.86512566324246,lon:2.29654259508469,value: 1}, {lat:41.7367419928406,lon:1.932848902494777,value: 1}, {lat:41.23306295905736,lon:1.779526687715457,value: 1}, {lat:41.2317483038733,lon:1.784681862546153,value: 1}, {lat:41.631439390184795,lon:2.720725557917147,value: 1}, {lat:41.62994589607456,lon:2.7177306334561,value: 1}, {lat:41.63052859326403,lon:2.71296190266059,value: 1}, {lat:41.651638181442685,lon:2.233873499947861,value: 1}, {lat:41.90093324430772,lon:2.287216604786048,value: 1}, {lat:41.91115373728871,lon:2.385085470335051,value: 1}, {lat:41.722752571451295,lon:2.169502822958253,value: 1}, {lat:41.60443413583309,lon:2.608803389020206,value: 1}, {lat:41.59347093075219,lon:2.600542421753666,value: 1}, {lat:42.22167899470102,lon:1.753893023922044,value: 1}, {lat:42.22788964291668,lon:1.759381468879865,value: 1}, {lat:42.228969542629386,lon:1.757639574710906,value: 1}, {lat:41.957902587640206,lon:1.890073375658795,value: 1}, {lat:42.24180243491474,lon:1.916639100522597,value: 1}, {lat:41.622876373117116,lon:2.686814806362192,value: 1}, {lat:41.61747621408714,lon:2.675317899394383,value: 1}, {lat:41.61747621408714,lon:2.675317899394383,value: 1}, {lat:41.62170788328777,lon:2.681142609322984,value: 1}, {lat:41.978776013505176,lon:2.101911118911636,value: 1}, {lat:41.53672125312592,lon:2.454767882213297,value: 1}, {lat:19.7253963442762,lon:2.168166294458502,value: 1}, {lat:41.73011170919667,lon:1.846014442225051,value: 1}, {lat:41.64776470254429,lon:2.76721308305081,value: 1}, {lat:41.65195896148816,lon:2.774715980953986,value: 1}, {lat:41.65233890196951,lon:2.775555331880543,value: 1}, {lat:41.63638217563592,lon:2.727331923503451,value: 1}, {lat:41.64957018232494,lon:2.773763553700424,value: 1}, {lat:41.65090638919336,lon:2.775368140757972,value: 1}, {lat:41.64802364425958,lon:2.77057461251895,value: 1}, {lat:41.64828678379312,lon:2.771546396937966,value: 1}, {lat:42.01362407677283,lon:1.878755510906432,value: 1}, {lat:41.27255643755135,lon:2.041913117262427,value: 1}, {lat:41.269525805105616,lon:1.993891208937595,value: 1}, {lat:42.11181612266632,lon:1.799034396026866,value: 1}, {lat:42.1263203588151,lon:1.709776806758424,value: 1}, {lat:41.584540102162634,lon:2.571696642827535,value: 1}, {lat:41.585892476429784,lon:2.574471077170253,value: 1}, {lat:41.59046007001212,lon:2.589606703069621,value: 1}, {lat:41.61020313977638,lon:2.646358065390077,value: 1}, {lat:41.60869267303762,lon:2.638541341589075,value: 1}, {lat:41.60768703501851,lon:2.639555052251561,value: 1}, {lat:42.14641056546969,lon:2.000235251246716,value: 1}, {lat:42.09270177714083,lon:2.008092116558723,value: 1}, {lat:42.13360844087695,lon:1.994604352038596,value: 1}, {lat:42.25821391424893,lon:1.847544500514147,value: 1}, {lat:42.07006449631967,lon:1.842164783483403,value: 1}, {lat:41.58239445107236,lon:2.56637231953424,value: 1}, {lat:41.58352303262174,lon:2.569483946733877,value: 1}, {lat:41.58471102524938,lon:2.569224130081122,value: 1}]);

				heatmapLayer.setData(data);
				heatmapLayer.addTo(map);
controlCapes.addOverlay(heatmapLayer,'heatmap_'+ll,true);
console.info(controlCapes);
map.eachLayer(function (layer) {
	
	if(typeof(layer.options)!=="undefined"){
		if(typeof(layer.options.nom)!=="undefined"){
   console.info(layer);
   var nom=layer.options.nom;
   
   if(nom=="campings"){
	   alert(1);
	   map.removeLayer(layer);
	   
	   
   }
		}
	}
});
//var layers = {};layers[current.id] = currlayer;
}

function activaPanelCapes(obre) {
	
	if(obre){
		jQuery('.leaflet-control-layers').show();	
	}else{
		jQuery('.leaflet-control-layers').toggle();	
	}
	
	
	if (jQuery('#div_menu').attr('class', 'glyphicon glyphicon-list grisfort')) {
		jQuery('#div_menu').removeClass('glyphicon glyphicon-list grisfort');
		jQuery('#div_menu').addClass('glyphicon glyphicon-list greenfort');
	} else {
		jQuery('#div_menu').removeClass('glyphicon glyphicon-list greenfort');
		jQuery('#div_menu').addClass('glyphicon glyphicon-list grisfort');
	}
}

function addSideBarMapa() {
	sidebar = L.control.sidebar('sidebar', {
		position : 'left',
		closeButton : false
	});

	map.addControl(sidebar);
	setTimeout(function() {
		sidebar.show();
	}, 500);

}

function addBoto() {

	var info = L.control({
		position : 'topright'
	});

	info.onAdd = function(map) {
		this._div = L.DomUtil.create('div', 'leaflet-bar info'); // create a
		this._div.innerHTML = '<span id="div_menu" class="glyphicon glyphicon-list grisfort"></span>';
		return this._div;
	};

	info.addTo(map);

}

function inicialitzaDropFiles() {

	// dropzone

	var dropzoneOpcions = {

		/*
		 * init: function() { this.on("addedfile", function(file) { alert("Added
		 * file."); }); this.on("dragend", function(file) { alert("fitxer
		 * arrastrat"); }); },
		 * 
		 */
		url : paramUrl.dragFile,
		paramName : "file", // The name that will be used to transfer the file
		maxFilesize : 2, // MB
		accept : function(file, done) {
			if (file.name == "newsssss.kml") {

				done("Naha, you don't.");
			} else {
				done();
			}
		}
	};

	var myDropzone = new Dropzone("div#div_dragdrop", dropzoneOpcions);

}


