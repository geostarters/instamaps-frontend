var map;
var factorH = 50;
var controlCapes;var editableLayers;var sidebar;


jQuery(document).ready(function() {

	map = new L.IM_Map('map', {
		typeMap : 'topoMap',
		maxZoom : 19
	}).setView([ 41.431, 1.8580 ], 8);
	

	factorH = jQuery('.navbar').css('height').replace(/[^-\d\.]/g, '');
	jQuery('#map').height(jQuery(window).height() - factorH);

	tradueixMenusToolbar();
	addSideBarMapa();
	/*
	  var limits =
	  L.tileLayer.wms("http://172.70.1.11/maps/geocat.service?map=/opt/geocat/dades/mon/mon.map&", {
	  layers: 'cat1936', format: 'image/png', crs:
	  L.Proj.CRS.TMS("EPSG:3857"), maxZoom: 19, minZoom: 0, transparent: true
	  
	  }).addTo(map);
	 */

	editableLayers = new L.FeatureGroup();
	map.addLayer(editableLayers);

	var MyCustomMarker = L.Icon.extend({
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
				allowIntersection : true, // Restricts shapes to simple
											// polygons
				drawError : {
					color : '#e1e100', // Color the shape will turn when
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

	map.addControl(drawControl);

	map.on('draw:created', function(e) {
		var type = e.layerType, layer = e.layer;
console.info(type);
		if (type === 'marker') {
			layer.bindPopup('opcions ediciodddddd!');
		}

		console.info(e);
		
		editableLayers.addLayer(layer);
	});

	var puntUsuari;
	jQuery('.div_punt').on('mousedown', function() {

		var dd = new L.Draw.Marker(map, drawControl.options.marker);
		dd.enable();
		map.on('mouseup', function(e) {
			var latlng = e.latlng;
			puntUsuari = L.marker([ 0, 0 ], {
				draggable : true
			});
			puntUsuari.setLatLng(latlng);
			puntUsuari.bindPopup('opcions edicioddd!');
			console.info(editableLayers);
			console.info(editableLayers.toGeoJSON().features.length);
			console.info(puntUsuari);
			var pt=puntUsuari.toGeoJSON();
			pt.properties={'nom':puntUsuari._leaflet_id,'text':puntUsuari._popup._content;
			
			
		
			//puntUsuari.addTo(map);
			editableLayers.addLayer(puntUsuari);
			
			
			
			console.warn(puntUsuari);
			console.info(JSON.stringify(puntUsuari.toGeoJSON()));
			
			console.info(JSON.stringify(editableLayers.toGeoJSON()));
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

});// final ready

function activaPanelCapes() {
	jQuery('.leaflet-control-layers').toggle();
	if (jQuery('#div_menu').attr('class', 'glyphicon glyphicon-list grisfort')) {
		jQuery('#div_menu').removeClass('glyphicon glyphicon-list grisfort');
		jQuery('#div_menu').addClass('glyphicon glyphicon-list greenfort');
	} else {
		jQuery('#div_menu').removeClass('glyphicon glyphicon-list greenfort');
		jQuery('#div_menu').addClass('glyphicon glyphicon-list grisfort');
	}
}

function addSideBarMapa(){
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
																	// div with
																	// a class
																	// "info"
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
		url : "/share/gdal/",
		paramName : "file", // The name that will be used to transfer the file
		maxFilesize : 2, // MB
		accept : function(file, done) {
			if (file.name == "new2.kml") {

				done("Naha, you don't.");
			} else {
				done();
			}
		}
	};

	var myDropzone = new Dropzone("div#div_dragdrop", dropzoneOpcions);

}

function tradueixMenusToolbar() {

	// L.drawLocal.draw.toolbar.buttons.polygon = 'Dibuixa un polígon';
	// L.drawLocal.draw.handlers.rectangle.tooltip.start = 'Arrastra i marca una
	// area';

	L.drawLocal = {
		draw : {
			toolbar : {
				actions : {
					title : 'Cancel.lar dibuix',
					text : 'Cancel·lar'
				},
				buttons : {

					polyline : 'Dibuixa una línia',
					polygon : 'Dibuixa una àrea',
					rectangle : 'Dibuixa un rectangle',
					circle : 'Dibuixa un cercle',
					marker : 'Dibuixa un punt'
				}
			},
			handlers : {
				circle : {
					tooltip : {
						start : 'Clica i arrossega per dibuixar un cercle.'
					}
				},
				marker : {
					tooltip : {
						start : 'Fes clic al mapa per posar un punt.'
					}
				},
				polygon : {
					tooltip : {
						start : 'Clica per començar a dibuixar una àrea.',
						cont : 'Clica per continuar dibuixant una àrea.',
						end : 'Clica el primer punt per tancar aquesta àrea.'
					}
				},
				polyline : {
					error : '<strong>Error:</strong> àrees no es poden creuar!',
					tooltip : {
						start : 'Clica per començar a dibuixar una línia.',
						cont : 'Clica per continuar dibuixant una línia.',
						end : 'Clica el darrer punt per acabar la línia.'
					}
				},
				rectangle : {
					tooltip : {
						start : 'Clica i arrossega per dibuixar un rectangle.'
					}
				},
				simpleshape : {
					tooltip : {
						end : 'Amolla el mouse per acabar el dibuix.'
					}
				}
			}
		},
		edit : {
			toolbar : {
				actions : {
					save : {
						title : 'Desa els canvis.',
						text : 'Desa'
					},
					cancel : {
						title : 'Cancel·la l\'edició, descarta tots els canvis.',
						text : 'Cancel·la'
					}
				},
				buttons : {
					edit : 'Edita les capes.',
					editDisabled : 'Cap capa per editar.',
					remove : 'Esborra les capes.',
					removeDisabled : 'Cap capa per esborrar.'
				}
			},
			handlers : {
				edit : {
					tooltip : {
						text : 'Arrossega els controls o el punt per editar l\'objecte.',
						subtext : 'Fes clic a cancel·la per desfer els canvis.'
					}
				},
				remove : {
					tooltip : {
						text : 'Fes clic a una feature per eliminar-la'
					}
				}
			}
		}
	};

	return L.drawLocal;

}
