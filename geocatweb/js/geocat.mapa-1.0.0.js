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

		if (type === 'marker') {
			layer.bindPopup('opcions ediciodddddd!');
		}

		console.info(e);
		
		editableLayers.addLayer(layer);
	});

	
	//editableLayers.on('layeradd')
	
	
	
	
	
	
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
			
			//console.info(editableLayers.toGeoJSON().features.length);
			
			var pt=puntUsuari.toGeoJSON();
			//pt.properties={'nom':puntUsuari._leaflet_id,'text':puntUsuari._popup._content;
			
			
		
			//puntUsuari.addTo(map);
			editableLayers.addLayer(puntUsuari);
			
			
			
			
			//console.info(JSON.stringify(puntUsuari.toGeoJSON()));
			
			//console.info(JSON.stringify(editableLayers.toGeoJSON()));
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

	
	
//$('#pop').popover();​​​
	
	jQuery("#bt_dadesObertes").popover({ title: 'Dades Obertes', content: '<div id="div_DO"><a href="#" id="radars">Radars</a>|<a href="#" id="hotels">Hotels</a></div>',container:'body', html:true,trigger:'manual' });

jQuery("#bt_dadesObertes").on('click', function (){
	jQuery(this).attr("data-content","he canviat");
	jQuery(this).popover('toggle');
	jQuery(".popover").css('left',pLeft());
	
	
});

jQuery(document).on('click', "#div_DO", function (){
	
	console.info(jQuery('#div_DO a').attr('id'));
	
	obteDadesObertes('campings');
	
});

	
addSideBarMapa();	
	
	
	


	
	
	
	
	
	
	
	
	
	
});// final ready


function pLeft(){	
	return jQuery(".leaflet-left").css('left');
}

function popUp(f,l){
    var out = [];
    if (f.properties){
        for(key in f.properties){
            out.push(key+": "+f.properties[key]);
        }
        l.bindPopup(out.join("<br />"));
    }
}


 function myStyle1(feature) {
       
            return {
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.3,
                fillColor: '#ff0000'
            };
       
    }

var geojsonMarkerOptions = {
    radius: 6,
    fillColor: "#FC5D5F",
    color: "#ffffff",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.8
};
var jsonTest;
function obteDadesObertes(dataset){
	
	
	
var url="http://172.70.1.12/share/jsp/dadesObertes.jsp?dataset="+dataset;	
	console.info(url);
jsonTest = new L.GeoJSON.AJAX(url,{onEachFeature:popUp,dataType:"jsonp",pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }});

	
	jsonTest.addTo(map);
	/*
	
	jQuery.ajax({

        url: 'http://172.70.1.12/share/jsp/dadesObertes.jsp?',

        data: {'dataset':dataset},

        method: 'get',

        dataType: 'jsonp',

    }).done(function(data, textStatus){
    	console.info(11);
//codi OK
    	console.info(data);

    }).fail(function(data, textStatus){
    	console.info(data);
    	console.info(textStatus);
//codi Error

    	//.succes data, textStatus, jqXHR 
    	
    });
	
}
*/

/*


	$.getJSON("./cupcakes.json", function(data) {
		var geojson = L.geoJson(data, {
			onEachFeature: function (feature, layer) {
				layer.bindPopup(feature.properties.name);
			}
		});
		var map = L.map('cupcake-map').fitBounds(geojson.getBounds());
		cupcakeTiles.addTo(map);
		geojson.addTo(map);
*/
}
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
		url :paramUrl.dragFile,
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
