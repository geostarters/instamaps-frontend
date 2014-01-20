var map, controlCapes;
var factorH = 50;
var factorW = 0;
var _htmlDadesObertes = [];
var capaUsrPunt, capaUsrLine, capaUsrPol;
var mapConfig = {};
var dades1,dades2;


jQuery(document).ready(function() {
	map = new L.IM_Map('map', {
		typeMap : 'topoMap',
		maxZoom : 19,
	// drawControl: true
	}).setView([ 41.431, 1.8580 ], 8);
	
	//iniciamos los controles
	initControls();
	
	if(typeof url('?businessid') == "string"){
		var data = {
			businessId: url('?businessid'),
			uid: $.cookie('uid')
		};
		getMapByBusinessId(data).then(function(results){
			if (results.status == "ERROR"){
				//TODO mostrar mensaje de error y hacer alguna accion por ejemplo redirigir a la galeria				
				return false;
			}
			mapConfig = results.results;
			mapConfig.options = $.parseJSON( mapConfig.options );
			mapConfig.newMap = false;
			
			loadMapConfig(mapConfig).then(function(){
				avisDesarMapa();
			});
		},function(results){
			window.location.href = paramUrl.loginPage;
		});
	}else{
		loadMapConfig(mapConfig).then(function(){
			mapConfig.newMap = true;
			avisDesarMapa();
		});
	}
	
	//carrega las capas del usuario
	var data = {uid: $.cookie('uid')};
	carregaDadesUsuari(data);
	
	jQuery('.bt_publicar').on('click',function(){
		$('#dialgo_publicar #nomAplicacio').removeClass("invalid");
		$( ".text_error" ).remove();
		$('#dialgo_publicar').modal('show');
	});
	
	jQuery('#dialgo_publicar .btn-primary').on('click',function(){
		publicarMapa();
	});
	
	jQuery('#dialgo_leave .btn-primary').on('click',function(){
		leaveMapa();
	});
	

}); // Final document ready


function carregaDadesUsuari(data){
	jQuery.when(getAllServidorsWMSByUser(data), getAllTematicLayerByUid(data)).then(function(results1, results2){
		if (results1[0].status == "ERROR"){
			//TODO mostrar mensaje de error y hacer alguna accion por ejemplo redirigir a la galeria				
			return false;
		}
		dades1=results1;
		dades2=results2;
		loadPopOverMevasDades();
	},function(results){
		window.location.href = paramUrl.loginPage;
	});
}

function addClicksInici() {
	jQuery('.bt_llista').on('click', function() {
		activaPanelCapes();
	});
}

function addOpcionsFonsMapes() {

	jQuery('.div_gr3 div').on('click', function() {

		var fons = jQuery(this).attr('id');
		if (fons == 'topoMap') {
			map.topoMap();
		} else if (fons == 'topoGrisMap') {
			map.topoGrisMap();
		} else if (fons == 'ortoMap') {
			map.ortoMap();
		} else if (fons == 'terrainMap') {
			map.terrainMap();
		} else if (fons == 'colorMap') {
			gestionaPopOver(this);
		} else if (fons == 'historicMap') {
		
		}

	});

}

function gestionaPopOver(pop) {
	jQuery('.popover').popover('hide');
	jQuery('.pop').not(pop).popover('hide');
	jQuery(pop).popover('toggle');
	jQuery(".popover").css('left', pLeft());
}

function addControlsInici() {

	sidebar = L.control.sidebar('sidebar', {
		position : 'left',
		closeButton : false
	});

	map.addControl(sidebar);
	setTimeout(function() {
		sidebar.show();
	}, 500);

	controlCapes = L.control.layers(null, null, {
		collapsed : false,
		id : 'div_capes'
	}).addTo(map);

	ctr_llistaCapes = L.control({
		position : 'topright'
	});
	ctr_llistaCapes.onAdd = function(map) {

		this._div = L.DomUtil.create('div', 'div_barrabotons btn-group-vertical');

		var btllista = L.DomUtil.create('div', 'leaflet-bar btn btn-default btn-sm bt_llista');
		this._div.appendChild(btllista);
		btllista.innerHTML = '<span class="glyphicon glyphicon-th-list grisfort"></span>';

		var btcamera = L.DomUtil.create('div', 'leaflet-bar btn btn-default btn-sm bt_captura');
		this._div.appendChild(btcamera);
		btcamera.innerHTML = '<span class="glyphicon glyphicon-camera grisfort"></span>';

		var btprint = L.DomUtil.create('div', 'leaflet-bar btn btn-default btn-sm bt_print');
		this._div.appendChild(btprint);
		btprint.innerHTML = '<span class="glyphicon glyphicon-print grisfort"></span>';

		var btinfo = L.DomUtil.create('div', 'leaflet-bar btn btn-default btn-sm bt_info');
		this._div.appendChild(btinfo);
		btinfo.innerHTML = '<span class="glyphicon glyphicon-info-sign grisfort"></span>';
		
		return this._div;
	};
	ctr_llistaCapes.addTo(map);

}

function redimensioMapa() {
	jQuery(window).resize(function() {
		factorH = jQuery('.navbar').css('height').replace(/[^-\d\.]/g, '');
		jQuery('#map').css('top', factorH + 'px');
		jQuery('#map').height(jQuery(window).height() - factorH);
		jQuery('#map').width(jQuery(window).width() - factorW);
	});
	jQuery(window).trigger('resize');
}

var opt = {
	placement : 'right',
	container : 'body'
};
var optB = {
	placement : 'bottom',
	container : 'body'
};

function addToolTipsInici() {
	//eines mapa
	$('.bt_llista').tooltip('destroy').tooltip({
		placement : 'left',
		container : 'body',
		title : window.lang.convert("LLista de capes")
	});
	$('.bt_captura').tooltip('destroy').tooltip({
		placement : 'left',
		container : 'body',
		title : window.lang.convert("Capturar la vista del mapa")
	});
	$('.bt_print').tooltip('destroy').tooltip({
		placement : 'left',
		container : 'body',
		title : window.lang.convert("Imprimir la vista del mapa")
	});
	$('.bt_info').tooltip('destroy').tooltip({
		placement : 'left',
		container : 'body',
		title : window.lang.convert("Veure informació al fer clic sobre el mapa")
	});
	
	jQuery.map(jQuery('[data-toggle="tooltip"]'), function (n, i){
		var title = $(n).attr('title');
		if (title == ""){
			title = $(n).attr('data-original-title');
		}
		$(n).attr('data-original-title', window.lang.convert(title));
	    var title = $(n).attr('title', $(n).attr('data-original-title'));
	});
		
	$('.div_carrega_dades').tooltip(optB);
	$('.div_gr3 div').tooltip(optB);
	$('.div_gr2 div').tooltip(optB);
	$('.add_costat_r').tooltip(opt);
	$('.taronja').tooltip(opt);
	$('.white').tooltip(opt);
	$('#div_punt').tooltip(optB);
	$('#div_linia').tooltip(optB);
	$('#div_poligon').tooltip(optB);
	$('.bt_publicar').tooltip(opt);
}

function activaPanelCapes(obre) {

	if (obre) {
		jQuery('.leaflet-control-layers').animate({
			width : 'show'
		});

	} else {
		jQuery('.leaflet-control-layers').animate({
			width : 'toggle'
		});

	}
	var cl = jQuery('.bt_llista span').attr('class');
	if (cl.indexOf('grisfort') != -1) {
		jQuery('.bt_llista span').removeClass('grisfort');
		jQuery('.bt_llista span').addClass('greenfort');
	} else {
		jQuery('.bt_llista span').removeClass('greenfort');
		jQuery('.bt_llista span').addClass('grisfort');
	}
}

/**
 * This tiny script just helps us demonstrate what the various example callbacks
 * are doing
 */
var Example = (function() {
	"use strict";

	var elem, hideHandler, that = {};

	that.init = function(options) {
		elem = $(options.selector);
	};

	that.show = function(text) {
		clearTimeout(hideHandler);

		elem.find("span").html(text);
		elem.delay(200).fadeIn().delay(4000).fadeOut();
	};

	return that;
}());

function addDialegsEstils() {

	$(function() {
		Example.init({
			"selector" : ".bb-alert"
		});
	});

	jQuery('#div_mes_punts').on("click", function(e) {
		console.info(e);
		bootbox.dialog({
			message : "<img src=\"/geocatweb/css/images/icones_3.png\">",
			title : "Punts",
			buttons : {
				success : {
					label : "ok",
					className : "btn-success",
					callback : function() {
						Example.show("Estil canviat");
					}
				},
				danger : {
					label : "cancel",
					className : "btn-danger",
					callback : function() {
						// Example.show("uh oh, look out!");
					}
				}

			}
		});

	});

}

function creaPopOverMesFons() {

}

function creaPopOverMesFonsColor() {

	jQuery("#colorMap")
			.popover(
					{
						content : '<div id="div_menufons" class="div_gr3">'
								+ '<div id="nit" lang="ca"  data-toggle="tooltip" title="Nit" class="div_fons_6"></div>'
								+ '<div id="sepia" lang="ca"  data-toggle="tooltip" title="Sèpia" class="div_fons_7"></div>'
								+ '<div id="zombie" lang="ca"  data-toggle="tooltip" title="Zombie" class="div_fons_8"></div>'
								+ '<div id="orquidea" lang="ca"  data-toggle="tooltip" title="Orquídea" class="div_fons_9"></div>'
								+ '</div>',
						container : 'body',
						html : true,
						trigger : 'manual'
					});

	jQuery('#div_menufons div').tooltip(optB);

	jQuery(document).on('click', "#div_menufons div", function(e) {

		var fons = jQuery(this).attr('id');

		map.colorMap(fons);

	});

}


function creaPopOverMevasDades(){
	jQuery(".div_dades_usr").popover(
		{
			content : '<ul class="nav nav-tabs etiqueta">'
					+ '<li><a href="#id_mysrvj" data-toggle="tab" id="#id_serveisv">Serveis vector</a></li>'
					+ '<li><a href="#id_mysrvw" data-toggle="tab">Serveis WMS</a></li>'
					+ '</ul>'
					+ '<div class="tab-content">'
					+ '<div class="tab-pane fade" id="id_mysrvj"></div>'
					+ '<div class="tab-pane fade" id="id_mysrvw"></div>'
					+ '</div>',
			container : 'body',
			html : true,
			trigger : 'manual'
	});
}

function loadPopOverMevasDades(){
	
	
	
	
	
	
	jQuery(".div_dades_usr").on('click', function() {
		var data = {uid: $.cookie('uid')};
		gestionaPopOver(this);		
				
		var source1 = jQuery("#meus-wms-template").html();
		var template1 = Handlebars.compile(source1);
		var html1 = template1(dades1[0]);
		
		var source2 = jQuery("#meus-tematic-template").html();
		var template2 = Handlebars.compile(source2);
		var html2 = template2(dades2[0]);
		
		jQuery("#id_mysrvw").append(html1);
		jQuery("#id_mysrvj").append(html2);
		
		jQuery(".usr_wms_layer").on('click', function(event) {
			event.preventDefault();
			var _this = jQuery(this);
			var data = {
				uid: $.cookie('uid'),
				businessId: mapConfig.businessId,
				servidorWMSbusinessId: _this.data("businessid"),
				layers: _this.data("layers"),
				calentas:false,
				activas:false,
				visibilitats:true
			};
			
			addServerToMap(data).then(function(results){
				console.debug(results);
				mapConfig = results.results;
			});
			
		});
	
		jQuery(".usr_tematic_layer").on('click', function(event) {
			event.preventDefault();
			var _this = jQuery(this);
			
			carregarCapa(_this.data("businessid"));
		
		});
		
		jQuery("span.glyphicon-remove").on('click', function(event) {
			event.preventDefault();
			event.stopPropagation();
			var _this = jQuery(this);

			//console.debug(_this.data("businessid"));
			
			var data = {
				uid: $.cookie('uid'),
				businessId: _this.data("businessid")
			};

			deleteTematicLayerAll(data).then(function(results){
				console.debug(results);
				if (results.status == "OK"){
					_this.parent().remove();
				}
			});
		});
		
	});
	
}

function refrescaPopOverMevasDades(){
	//carrega las capas del usuario
	var data = {uid: $.cookie('uid')};
	jQuery.when(getAllServidorsWMSByUser(data), getAllTematicLayerByUid(data)).then(function(results1, results2){
		dades1=results1;
		dades2=results2;
	
		
	},function(results){
		window.location.href = paramUrl.loginPage;
	});
	
}

function carregarCapa(businessId){
	var data = {
			uid: $.cookie('uid'),
			businessId: businessId
		};
		
		getTematicLayerByBusinessId(data).then(function(results){
			console.debug(results);
			//TODO
			//agregar la capa tematica al mapa. Leer los features y cargarlos
			var capaPunts=null;
			var capaLinies=null;
			var capaPoligons=null;
			if (results.status=="OK") {
			for (geometry in results.results.geometries.features.features){
				var geometria=results.results.geometries.features.features[geometry].geometry;
				var coordinates=""+geometria.coordinates;
				
				var tipus=geometria.type;
				alert("TIPUS: "+tipus);
				if (tipus=="Point") {
					alert("AKI");
					var coords=coordinates.split(",");
					alert(coords[0]+","+coords[1]);
					if (capaPunts==null) {
						capaPunts = new L.FeatureGroup();
						var latlng = L.latLng(coords[0],coords[1]);
						var circle=L.circleMarker(latlng,200);
						capaPunts.addLayer(circle);
					}
					else {
						var latlng = L.latLng(coords[0],coords[1]);
						var circle=L.circleMarker(latlng,200);
						capaPunts.addLayer(circle);
					}
					
					capaPunts.addTo(map);
				}
				if (tipus=="LineString"){
					var coords=coordinates.split(",");
					if (capaLinies==null){
						capaLinies = new L.FeatureGroup();
						var i=0;
						var j=0;
						var llistaPunts=[];
						while (i< coords.length){
							var c1=coords[i];
							var c2=coords[i+1];
							var punt=new L.LatLng(c1, c2);
							llistaPunts[j]=punt;
							i=i+2;
							j++;
						}
						 var polyline =  L.polyline(llistaPunts, {color: 'red'})
						
						capaLinies.addLayer(polyline);
					}
					else {
						var i=0;
						var j=0;
						var llistaPunts=[];
						while (i< coords.length){
							var c1=coords[i];
							var c2=coords[i+1];
							var punt=new L.LatLng(c1, c2);
							llistaPunts[j]=punt;
							i=i+2;
							j++;
						}
						 var polyline =  L.polyline(llistaPunts, {color: 'red'})
						
						capaLinies.addLayer(polyline);
					}
					
					capaLinies.addTo(map);
				}
				if (tipus=="Polygon") {
					var coords=coordinates.split(",");
					if (capaPoligons==null){
						capaPoligons = new L.FeatureGroup();
						var i=0;
						var j=0;
						var llistaPunts=[];
						while (i< coords.length){
							var c1=coords[i];
							var c2=coords[i+1];
							var punt=new L.LatLng(c1, c2);
							llistaPunts[j]=punt;
							i=i+2;
							j++;
						}
						var polygon = new L.Polygon(llistaPunts,{color: 'red'});
						capaPoligons.addLayer(polygon);
					}
					else {
						var i=0;
						var j=0;
						var llistaPunts=[];
						while (i< coords.length){
							var c1=coords[i];
							var c2=coords[i+1];
							var punt=new L.LatLng(c1, c2);
							llistaPunts[j]=punt;
							i=i+2;
							j++;
						}
						var polygon = new L.Polygon(llistaPunts,{color: 'red'});
						capaPoligons.addLayer(polygon);
						
					}
					capaPoligons.addTo(map);
				}
			}
			
				if (capaPunts!=null) controlCapes.addOverlay(capaPunts,results.results.title, true);
				if (capaLinies!=null) controlCapes.addOverlay(capaLinies,results.results.title, true);
				if (capaPoligons!=null) controlCapes.addOverlay(capaPoligons,results.results.title, true);
				activaPanelCapes(true);
				
			}
			else alert(results.status);
		});
}

function creaPopOverDadesExternes() {
	jQuery(".div_dades_ext")
			.popover(
					{

						content : '<ul class="nav nav-tabs etiqueta">'
								+ '<li><a href="#id_do" data-toggle="tab">Dades Obertes</a></li>'
								+ '<li><a href="#id_xs" data-toggle="tab">Xarxes socials</a></li>'
								+ '<li><a href="#id_srvj" data-toggle="tab">Serveis JSON</a></li>'
								+ '<li><a href="#id_srvw" data-toggle="tab">Serveis WMS</a></li>'
								+ '</ul>'
								+ '<div class="tab-content">'
								+ '<div class="tab-pane fade" id="id_do"></div>'
								+ '<div class="tab-pane fade" id="id_xs"></div>'
								+ '<div class="tab-pane fade" id="id_srvj"></div>'
								+ '<div class="tab-pane fade" id="id_srvw">.</div>'
								+ '</div>',
						container : 'body',
						html : true,
						trigger : 'manual'
					});

	jQuery(".div_dades_ext").on('click', function() {

		gestionaPopOver(this);

		jQuery('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
			var tbA = e.target.attributes.href.value;

			if (tbA == "#id_do") {

				jQuery(tbA).html(_htmlDadesObertes.join(' '));

				jQuery(document).on('click', tbA, function(e) {

					addCapaDadesObertes(e.target.id);

				});

			}
		});
	})
}

function pLeft() {
	return jQuery(".leaflet-left").css('left');
}

var capaDadaOberta;
function addCapaDadesObertes(dataset) {

	var url = paramUrl.dadesObertes + "dataset=" + dataset;

	var estil_do = retornaEstilaDO(dataset);
	capaDadaOberta = new L.GeoJSON.AJAX(url, {
		onEachFeature : popUp,
		nom : dataset,
		tipus : 'Marker',
		businessId : '-1',
		dataType : "jsonp",
		pointToLayer : function(feature, latlng) {

			return L.circleMarker(latlng, estil_do);

		}
	});

	capaDadaOberta.addTo(map)
	controlCapes.addOverlay(capaDadaOberta, dataset, true);
	activaPanelCapes(true);
	// capaDadaOberta.on('layeradd',objecteUserAdded)

}

function popUp(f, l) {

	var out = [];
	// data.push({lat:f.geometry.coordinates[1],lon:f.geometry.coordinates[0],value:1});
	if (f.properties) {
		for (key in f.properties) {
			out.push(key + ": " + f.properties[key]);
		}
		l.bindPopup(out.join("<br />"));

	}

}

function generaLListaDadesObertes() {

	getLListaDadesObertes()
			.then(
					function(results) {
						$
								.each(
										results.dadesObertes,
										function(key, dataset) {
											var as;
											if (key % 2 != 0) {
												as = "</br>";
											} else {
												as = ""
											}
											_htmlDadesObertes
													.push('<a class="label label-explora" href="#" id="'
															+ dataset.dataset
															+ '">'
															+ dataset.text
															+ '</a>' + as);
										});

					});

}

var drawControl;
function addDrawToolbar() {
	capaUsrPunt = new L.FeatureGroup();
	capaUsrPunt.options = {
		businessId : '-1',
		nom : 'capaPunts1',
		tipus : 'Marker'
	};
	capaUsrLine = new L.FeatureGroup({
		businessId : '-1',
		nom : 'capa1',
		tipus : 'Linea'
	});
	capaUsrLine.options = {
		businessId : '-1',
		nom : 'capaLinea1',
		tipus : 'Line'
	};
	capaUsrPol = new L.FeatureGroup({
		businessId : '-1',
		nom : 'capa1',
		tipus : 'Pol'
	});
	capaUsrPol.options = {
		businessId : '-1',
		nom : 'capaPol1',
		tipus : 'Pol'
	};
	map.addLayer(capaUsrPunt);
	map.addLayer(capaUsrLine);
	map.addLayer(capaUsrPol);

	var MyCustomMarker = L.Icon.extend({
		options : {
			shadowUrl : null,
			iconAnchor : new L.Point(12, 12),
			iconSize : new L.Point(24, 40),
			iconUrl : '/geocatweb/css/images/markeriombra_instamapes.png'
		}
	});

	var options = {
		draw : false,
		polyline : {
			guidelineDistance : 2,
			shapeOptions : {
				color : '#FFC400',
				weight : 5,
				opacity : 1
			}
		},
		polygon : {
			allowIntersection : true, // Restricts shapes
			guidelineDistance : 2,
			shapeOptions : {
				color : '#FFC400',
				weight : 5,
				opacity : 0.7
			}
		},
		// marker : {icon: new MyCustomMarker()},
		edit : false
	};

	drawControl = new L.Control.Draw(options);
	map.addControl(drawControl);

}

function activaEdicioUsuari() {

	jQuery('#div_punt').on('click', function() {
		var dd = new L.Draw.Marker(map, drawControl.options.marker);
		dd.enable();
	});

	jQuery('#div_linia').on('click', function() {

		var dd = new L.Draw.Polyline(map, drawControl.options.polyline);
		dd.enable();
	});

	jQuery('#div_poligon').on('click', function() {
		var dd = new L.Draw.Polygon(map, drawControl.options.polygon);
		dd.enable();
	});

	map.on('draw:created',
					function(e) {
						var type = e.layerType, layer = e.layer;
						// console.info(e);
						// if (type === 'marker') {
						layer.bindPopup('TODO: Esborra Editar ');
						// }
						if (type === 'marker') {

							var redMarker = L.AwesomeMarkers.icon({
								icon : 'coffee',
								markerColor : 'red',
								iconColor : '#000000',
								prefix : 'glyphicon'
							});
							// layer=L.marker([layer.getLatLng().lat,layer.getLatLng().lng],
							// {icon: redMarker}).addTo(map);
							capaUsrPunt.addLayer(layer).on('layeradd',
									objecteUserAdded);
						} else if (type === 'polyline') {
							capaUsrLine.addLayer(layer).on('layeradd',
									objecteUserAdded);
						} else if (type === 'polygon') {
							capaUsrPol.addLayer(layer).on('layeradd',
									objecteUserAdded);
						}

						if (capaUsrPunt.toGeoJSON().features.length == 1) {
							controlCapes.addOverlay(capaUsrPunt,
									capaUsrPunt.options.nom, true);
							activaPanelCapes(true);
						}
						if (capaUsrLine.toGeoJSON().features.length == 1) {
							controlCapes.addOverlay(capaUsrLine,
									capaUsrLine.options.nom, true);
							activaPanelCapes(true);
						}
						if (capaUsrPol.toGeoJSON().features.length == 1) {
							controlCapes.addOverlay(capaUsrPol,
									capaUsrPol.options.nom, true);
							activaPanelCapes(true);
						}
					});
}

function loadMapConfig(mapConfig){
	console.debug(mapConfig);
	var dfd = jQuery.Deferred();
	
	if (!jQuery.isEmptyObject( mapConfig )){
		jQuery('#businessId').val(mapConfig.businessId);
		
		//TODO ver los errores de leaflet al cambiar el mapa de fondo 
		//cambiar el mapa de fondo a orto y gris
		if (mapConfig.options.fons != 'topoMap'){
			map.setActiveMap(mapConfig.options.fons);
			map.setMapColor(mapConfig.options.fonsColor);
			//map.gestionaFons();
		}
		
				
		if (mapConfig.options.bbox){
			var bbox = mapConfig.options.bbox.split(",");
			var southWest = L.latLng(bbox[1], bbox[0]),
		    northEast = L.latLng(bbox[3], bbox[2]),
		    bounds = L.latLngBounds(southWest, northEast);
			map.fitBounds( bounds ); 
		}
							
		
		//carga las capas en el mapa
		jQuery.each(mapConfig.servidorsWMS, function(index, value){
			
			if (value.epsg == "4326"){
				value.epsg = L.CRS.EPSG4326;
			}else if (value.epsg == "25831"){
				value.epsg = L.CRS.EPSG25831;
			}else if (value.epsg == "23031"){
				value.epsg = L.CRS.EPSG23031;
			}else{
				value.epsg = map.crs;
			}
			
			var newWMS = L.tileLayer.wms(value.url, {
			    layers: value.layers,
			    format: value.imgFormat,
			    transparent: value.transparency,
			    version: value.version,
			    opacity: value.opacity,
			    crs: value.epsg,
			});
			
			if (value.capesActiva == true || value.capesActiva == "true"){
				newWMS.addTo(map);
			}
			
			controlCapes.addOverlay(newWMS, value.serverName, true);
			
		});
				
	}else{
		
	}
	
	var source = $("#map-properties-template").html();
	var template = Handlebars.compile(source);
	var html = template(mapConfig);
	$('#frm_publicar').append(html);
	
	$('.make-switch').bootstrapSwitch();
	//$('.make-switch').bootstrapSwitch('setOnLabel', "<i class='glyphicon glyphicon-ok glyphicon-white'></i>");		
	//$('.make-switch').bootstrapSwitch('setOffLabel', "<i class='glyphicon glyphicon-remove'></i>");
		
	dfd.resolve();
	
	return dfd.promise();
}

function publicarMapa(){
	if(isBlank($('#dialgo_publicar #nomAplicacio').val())){
		$('#dialgo_publicar #nomAplicacio').addClass("invalid");
		$('#dialgo_publicar #nomAplicacio').after("<span class=\"text_error\" lang=\"ca\">El camp no pot estar buit</span>");
		return false;
	}
		
	var options = {};
	options.tags = jQuery('#dialgo_publicar #optTags').val();
	options.description = jQuery('#dialgo_publicar #optDescripcio').val();
	options.bbox = map.getBounds().toBBoxString();
	options.llegenda = jQuery('#llegenda_chk').bootstrapSwitch('state');
	options.layers = jQuery('#layers_chk').bootstrapSwitch('state');
	options.social = jQuery('#social_chk').bootstrapSwitch('state');
	options.fons = map.getActiveMap();
	options.fonsColor = map.getMapColor();
		
	console.debug(options);
	
	options = JSON.stringify(options);
	
	var newMap = true;
	
	if (jQuery('#businessId').val() != ""){
		newMap = false;
	}
	
	var data = {
		nom: jQuery('#dialgo_publicar #nomAplicacio').val(),
		uid: $.cookie('uid'),
		visibilitat: 'O',
		tipusApp: 'vis',
		options: options
	}
	
	if (newMap){
		createMap(data).then(function(results){
			if (results.status == "ERROR"){
				//TODO Mensaje de error
			}else{
				mapConfig = results.results;
				mapConfig.options = $.parseJSON( mapConfig.options );
				jQuery('#businessId').val(mapConfig.businessId);
				mapConfig.newMap = false;
				
			}
		});
	}else{
		data.businessId = jQuery('#businessId').val();
		updateMap(data).then(function(results){
			if (results.status == "ERROR"){
				//TODO Mensaje de error
			}else{
				mapConfig = results.results;
				mapConfig.options = $.parseJSON( mapConfig.options );
				$('#dialgo_publicar').modal('hide');
				mapConfig.newMap = false;
			}	
		});
	}
}

/*TODO estas funciones estaban pensadas para prevenir al usaurio al abandonar 
la pagína sin publicar el mapa. La idea era que al entrar en un mapa nuevo
se creara el mapa en la BD y que el si el usuario abandona la página sin publicar se 
mostrara el mensaje de advertencia y se borrara el mapa.
*/
function avisDesarMapa(){
	//console.debug(mapConfig.newMap);
	if (mapConfig.newMap){
		jQuery(window).on('beforeunload',function(event){
			//$('#dialgo_leave').modal('show');
			//event.stopPropagation();
			//event.preventDefault();
			//console.debug("antes de ir e");
			//return "Mensaje de aviso que no se muestra en Firefox";
		});
	}else{
		jQuery(window).off('beforeunload',function(){
			return true;
		});
	}
}

function leaveMapa(){
	console.debug("borrar el mapa e ir a la galeria");
}

function initControls(){
	addControlsInici();
	addClicksInici();
	addOpcionsFonsMapes();
	addToolTipsInici();
	redimensioMapa();
	creaPopOverDadesExternes();
	creaPopOverMevasDades();
	generaLListaDadesObertes();
	creaAreesDragDropFiles();
	creaPopOverMesFonsColor();
	tradueixMenusToolbar();
	addDrawToolbar();
	activaEdicioUsuari();
	addDialegsEstils();
}
