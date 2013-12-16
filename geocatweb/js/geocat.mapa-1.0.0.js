var map, controlCapes;
var factorH = 50;
var factorW = 0;
var _htmlDadesObertes=[];
var capaUsrPunt,capaUsrLine,capaUsrPol;
jQuery(document).ready(function () {

	map = new L.IM_Map('map', {
			typeMap : 'topoMap',
			maxZoom : 19,
			//drawControl: true
		}).setView([41.431, 1.8580], 8);

	addControlsInici();
	addClicksInici();
	addOpcionsFonsMapes();
	addToolTipsInici();
	redimensioMapa();
	creaPopOverDadesExternes();
	generaLListaDadesObertes();
	creaAreesDragDropFiles();
	creaPopOverMesFonsColor();
	tradueixMenusToolbar();
	addDrawToolbar();
	activaEdicioUsuari();
	
	
	
	
}); //Final document ready

function addClicksInici() {
	jQuery('#bt_llista').on('click', function () {
		activaPanelCapes();
	});
}



function addOpcionsFonsMapes(){
	
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


function gestionaPopOver(pop){

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
	setTimeout(function () {
		sidebar.show();
	}, 500);

	controlCapes = L.control.layers(null, null, {
			collapsed : false,
			id : 'div_capes'
		}).addTo(map);

	ctr_llistaCapes = L.control({position : 'topright'});
	ctr_llistaCapes.onAdd = function (map) {
				
		this._div = L.DomUtil.create('div', 'div_barrabotons');
		
		var btllista=L.DomUtil.create('div', 'leaflet-bar div_llista');		
		this._div.appendChild(btllista);
		btllista.innerHTML='<div id="bt_llista"  class="glyphicon glyphicon-th-list grisfort"></div>';	
		
		var btcamera=L.DomUtil.create('div', 'leaflet-bar div_captura');		
		this._div.appendChild(btcamera);
		btcamera.innerHTML='<div id="bt_captura"  class="glyphicon glyphicon-camera grisfort"></div>';	
						
		
		var btprint=L.DomUtil.create('div', 'leaflet-bar div_print');		
		this._div.appendChild(btprint);
		btprint.innerHTML='<div id="bt_print"  class="glyphicon glyphicon-print grisfort"></div>';	
		
		
		var btinfo=L.DomUtil.create('div', 'leaflet-bar div_info');		
		this._div.appendChild(btinfo);
		btinfo.innerHTML='<div id="bt_info"  class="glyphicon glyphicon-info-sign grisfort"></div>';	
		
		return this._div;
	};
	ctr_llistaCapes.addTo(map);

	
}

function redimensioMapa() {
	jQuery(window).resize(function () {
		factorH = jQuery('.navbar').css('height').replace(/[^-\d\.]/g, '');		
		jQuery('#map').css('top',factorH+'px');
		jQuery('#map').height(jQuery(window).height() - factorH);
		jQuery('#map').width(jQuery(window).width() - factorW);
	});
	jQuery(window).trigger('resize');
}

var opt={placement:'right',container:'body'};
var optB={placement:'bottom',container:'body'};
function addToolTipsInici(){
	
	$('.div_carrega_dades').tooltip(optB);
	$('.div_llista').tooltip({placement:'left',container:'body',title:'LLista de capes'});
	$('.div_captura').tooltip({placement:'left',container:'body',title:'Capturar la vista del mapa'});
	$('.div_print').tooltip({placement:'left',container:'body',title:'Imprimir la vista del mapa'});
	$('#bt_info').tooltip({placement:'left',container:'body',title:'Veure informació al fer clic sobre el mapa'});	
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
		jQuery('.leaflet-control-layers').animate({width: 'show'});
	
	} else {
		jQuery('.leaflet-control-layers').animate({width: 'toggle'});	
		
	}
	var cl=jQuery('#bt_llista').attr('class');
	if (cl.indexOf('grisfort') !=-1) {
		jQuery('#bt_llista').removeClass('grisfort');
		jQuery('#bt_llista').addClass('greenfort');
	} else {		
		jQuery('#bt_llista').removeClass('greenfort');
		jQuery('#bt_llista').addClass('grisfort');
	}
}

function creaPopOverMesFons(){

}

function creaPopOverMesFonsColor(){

jQuery("#colorMap").popover({ content:'<div id="div_menufons" class="div_gr3">'+				
					'<div id="nit" lang="ca"  data-toggle="tooltip" title="Nit" class="div_fons_6"></div>'+
					'<div id="sepia" lang="ca"  data-toggle="tooltip" title="Sèpia" class="div_fons_7"></div>'+
					'<div id="zombie" lang="ca"  data-toggle="tooltip" title="Zombie" class="div_fons_8"></div>'+
					'<div id="orquidea" lang="ca"  data-toggle="tooltip" title="Orquídea" class="div_fons_9"></div>'+					
				'</div>',
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



function creaPopOverDadesExternes(){
jQuery(".div_dades_ext").popover(
									{
										
										content : '<ul class="nav nav-tabs etiqueta">'+
 '<li><a href="#id_do" data-toggle="tab">Dades Obertes</a></li>'+
  '<li><a href="#id_xs" data-toggle="tab">Xarxes socials</a></li>'+
  '<li><a href="#id_srvj" data-toggle="tab">Serveis JSON</a></li>'+
  '<li><a href="#id_srvw" data-toggle="tab">Serveis WMS</a></li>'+
'</ul>'+
'<div class="tab-content">'+
  '<div class="tab-pane fade" id="id_do"></div>'+
  '<div class="tab-pane fade" id="id_xs"></div>'+
  '<div class="tab-pane fade" id="id_srvj"></div>'+
  '<div class="tab-pane fade" id="id_srvw">.</div>'+
'</div>',
										container : 'body',
										html : true,
										trigger : 'manual'
									});

					jQuery(".div_dades_ext").on('click', function() {					
						
						gestionaPopOver(this);
						
						
						jQuery('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
						var tbA=e.target.attributes.href.value;
						
						if(tbA=="#id_do"){
						
						jQuery(tbA).html(_htmlDadesObertes.join(' '));
						
							jQuery(document).on('click', tbA, function(e) {
						
						

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

	var url = paramUrl.dadesObertes+"dataset="+ dataset;
	
	capaDadaOberta = new L.GeoJSON.AJAX(url, {
		nom:dataset,
		id:'',
		bussinesID:'',
		tipus:'vector_do',
		onEachFeature : popUp,
		dataType : "jsonp",		
		pointToLayer : function(feature, latlng) {
			
			var estil_do=retornaEstilaDO(dataset);			
			return L.circleMarker(latlng, estil_do);
			
		}
	});
	
	capaDadaOberta.addTo(map);
	controlCapes.addOverlay(capaDadaOberta,dataset,true);
	activaPanelCapes(true);
	
}

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





function generaLListaDadesObertes(){

	getLListaDadesObertes().then(function(results) {															
	$.each( results.dadesObertes, function( key, dataset ) {
		var as;
		if(key%2!=0 ){as="</br>";}else{as=""}
		_htmlDadesObertes.push('<a class="label label-explora" href="#" id="'+dataset.dataset+'">'+dataset.dataset+'</a>'+as);
	});

});

}

var drawControl;
function addDrawToolbar(){
	capaUsrPunt = new L.FeatureGroup();	
	capaUsrPunt.options={businessId:'-1',nom:'capaPunts1',tipus:'Marker'};
	capaUsrLine = new L.FeatureGroup({businessId:'-1',nom:'capa1',tipus:'Linea'});
	capaUsrLine.options={businessId:'-1',nom:'capaLinea1',tipus:'Line'};
	capaUsrPol= new L.FeatureGroup({businessId:'-1',nom:'capa1',tipus:'Pol'});
	capaUsrPol.options={businessId:'-1',nom:'capaPol1',tipus:'Pol'};
	map.addLayer(capaUsrPunt);
	map.addLayer(capaUsrLine);
	map.addLayer(capaUsrPol);
	
	var MyCustomMarker = L.Icon.extend({
	    options: {
	        shadowUrl: null,
	        iconAnchor: new L.Point(12, 12),
	        iconSize: new L.Point(24, 40),
	        iconUrl: '/geocatweb/css/images/markeriombra_instamapes.png'
	    }
	});
	
	
	var options = {
			draw:false,
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
			//marker : {icon: new  MyCustomMarker()},
			edit : false
		};	
	
	drawControl = new L.Control.Draw(options);
	map.addControl(drawControl);
	
	
	
	
	
	
	
	
	
	
}


function activaEdicioUsuari(){
	
	
	
	jQuery('#div_punt').on('click',function() {
				var dd = new L.Draw.Marker(map,
						drawControl.options.marker);
				dd.enable();				
			});	
	
	jQuery('#div_linia').on('click',function() {
		
		
	
		var dd = new L.Draw.Polyline(map,
				drawControl.options.polyline);
		dd.enable();				
	});
	
	
	jQuery('#div_poligon').on('click',function() {
		var dd = new L.Draw.Polygon(map,
				drawControl.options.polygon);
		dd.enable();				
	});
	
	map.on('draw:created', function(e) {
		var type = e.layerType, layer = e.layer;
		//console.info(e);
		//if (type === 'marker') {
			layer.bindPopup('TODO: Esborra Editar ');
		//}
			if (type === 'marker') {
				
				var redMarker = L.AwesomeMarkers.icon({
					  icon: 'coffee',
					  markerColor: 'red',
					  iconColor: '#000000',
					  prefix: 'glyphicon'
					});
			//layer=L.marker([layer.getLatLng().lat,layer.getLatLng().lng], {icon: redMarker}).addTo(map);							
				capaUsrPunt.addLayer(layer).on('layeradd',objecteUserAdded);							
			}else if(type === 'polyline'){
				capaUsrLine.addLayer(layer).on('layeradd',objecteUserAdded);
			}else if(type === 'polygon'){
				capaUsrPol.addLayer(layer).on('layeradd',objecteUserAdded);
			}
		console.info(capaUsrPunt);
			if(capaUsrPunt.toGeoJSON().features.length==1){controlCapes.addOverlay(capaUsrPunt,capaUsrPunt.options.nom,true);activaPanelCapes(true);}	
			if(capaUsrLine.toGeoJSON().features.length==1){controlCapes.addOverlay(capaUsrLine,capaUsrLine.options.nom,true);activaPanelCapes(true);}
			if(capaUsrPol.toGeoJSON().features.length==1){controlCapes.addOverlay(capaUsrPol,capaUsrPol.options.nom,true);activaPanelCapes(true);}
	});
	
	
}


