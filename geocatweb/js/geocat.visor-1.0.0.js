var map, controlCapes;
var factorH = 50;
var factorW = 0;
var mapConfig = {};
var capaUsrActiva;
var lsublayers = [];
var tipus_user;

//default geometries style
var estilP={iconFons:'awesome-marker-web awesome-marker-icon-orange',
		iconGlif:'fa fa-',
		colorGlif:'#333333',fontsize:'14px',size:'28'};

var default_line_style = {
    weight: 3,       
    color: '#FFC400',
    opacity:1,
    dashArray: '3'
};
var default_area_style = {
    weight: 3,
    opacity: 1,
    color: '#FFC400',
    dashArray: '3',
    fillColor: '#FFC400',
    fillOpacity: 0.5
};
var default_point_style = {
	icon : '',
	markerColor : 'orange',
	divColor:'transparent',
	iconAnchor : new L.Point(14, 42),
	iconSize : new L.Point(28, 42),
	iconColor : '#000000',
	prefix : 'fa',
	isCanvas:false,
	radius:6,
	opacity:1,
	weight : 2,
	fillOpacity : 0.9,
	color : "#ffffff",
	fillColor :"#FFC500"
};

jQuery(document).ready(function() {
	
	if(!$.cookie('uid') || $.cookie('uid').indexOf('random')!=-1){
		tipus_user = t_user_random;
	}else{
		tipus_user = t_user_loginat;
	}	
	
	if (!Modernizr.canvas ){
		jQuery("#mapaFond").show();
		jQuery("#dialgo_old_browser").modal('show');
		jQuery('#dialgo_old_browser').on('hide.bs.modal', function (e) {
			window.location = paramUrl.mainPage;
		});
	}else{
		jQuery.cookieCuttr({
			cookieAnalytics: false,
			cookieAcceptButtonText: window.lang.convert("Acceptar"),
			cookieMessage: window.lang.convert("Per tal de fer el seguiment de visites al nostre lloc web, utilitzem galetes. En cap cas emmagatzemem la vostra informació personal")
		});
		loadApp();
	}
}); // Final document ready

function loadApp(){
	
	if(typeof url('?embed') == "string"){
		jQuery('#navbar-visor').remove();
	}
	
	if(typeof url('?businessid') == "string"){
		map = new L.IM_Map('map', {
			typeMap : 'topoMap',
			maxZoom : 19,
			//drawControl: true
		}).setView([ 41.431, 1.8580 ], 8);
		
		var _minTopo=new L.TileLayer(URL_MQ, {minZoom: 0, maxZoom: 19, subdomains:subDomains});
		var miniMap = new L.Control.MiniMap(_minTopo, { toggleDisplay: true, autoToggleDisplay: true}).addTo(map);	
		
		L.control.scale({'metric':true,'imperial':false}).addTo(map);
		
		//iniciamos los controles
		initControls();

		var data = {
				businessId: url('?businessid')
			};
		
		getMapByBusinessId(data).then(function(results){
			if (results.status == "ERROR"){
				//TODO mostrar mensaje de error y hacer alguna accion por ejemplo redirigir a la galeria				
				return false;
			}
			mapConfig = results.results;
			mapConfig.options = $.parseJSON( mapConfig.options );
			mapConfig.newMap = false;
			$('#nomAplicacio').html(mapConfig.nomAplicacio);
			
			loadMapConfig(mapConfig).then(function(){
				//avisDesarMapa();
			});
		},function(results){
			window.location.href = paramUrl.galeriaPage;
		});
	}
	
	var v_url = window.location.href;
	if(v_url.indexOf('localhost')!=-1){
		v_url = v_url.replace('localhost',DOMINI);
	}
	shortUrl(v_url).then(function(results){
		console.debug(results);
		jQuery('#socialShare_visor').share({
	        networks: ['email','facebook','googleplus','twitter','linkedin','pinterest'],
	        theme: 'square',
	        urlToShare: results.data.url
		});
	});

		jQuery('#select-download-format').change(function() {	
			var ext = jQuery(this).val();
			if ((ext=="KML#.kml")||(ext=="GPX#.gpx")){
			jQuery("#select-download-epsg").val("EPSG:4326").attr('disabled',true);
			}else{
				jQuery("#select-download-epsg").attr('disabled',false);	
			}
		});		
		
		$('#bt_download_accept').on('click', function(evt){
			var formatOUT = $('#select-download-format').val();
			var epsgOUT = $('#select-download-epsg').val();
			var filename = $('#input-download-name').val();
			var layer_GeoJSON = download_layer.layer.toGeoJSON();
			for(var i=0;i<layer_GeoJSON.features.length;i++){
				layer_GeoJSON.features[i].properties.tipus = "downloaded";
			}

			var data = {
					cmb_formatOUT: formatOUT,
					cmb_epsgOUT: epsgOUT,
					layer_name: filename,
					fileIN: JSON.stringify(layer_GeoJSON)
			};
			
			_gaq.push(['_trackEvent', 'visor', 'descarregar capa', formatOUT+"-"+epsgOUT, tipus_user]);
			getDownloadLayer(data).then(function(results){
				results = results.trim();
				if (results == "ERROR"){
					//alert("Error 1");
					$('#modal-body-download-error').show();
					$('#modal-body-download').hide();
					$('#modal_download_layer .modal-footer').hide();
					$('#modal_download_layer').modal('show');
				}else{
					window.location.href = GEOCAT02+results;
				}
			},function(results){
				$('#modal-body-download-error').show();
				$('#modal-body-download').hide();
				$('#modal_download_layer .modal-footer').hide();
				$('#modal_download_layer').modal('show');
			});
			
		});
		
		jQuery('#socialShare_visor').on('click', function(evt){
			console.debug('on click social');
		});
}

function initControls(){
	addControlsInici();
	addClicksInici();
	addToolTipsInici();
	redimensioMapa();
	if(typeof url('?embed') != "string"){
		addControlCercaEdit();		
	}
}

function addControlsInici() {

	controlCapes = L.control.orderlayers(null, null, {
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
		
		return this._div;
	};
	ctr_llistaCapes.addTo(map);
}

function addClicksInici() {
	jQuery('.bt_llista').on('click', function() {
		activaPanelCapes();
	});
	
	// new vic
	jQuery('.bt_captura').on('click', function() {
		_gaq.push(['_trackEvent', 'visor', 'captura pantalla', 'label captura', tipus_user]);
		capturaPantalla('captura');
	});
	
	jQuery('.bt_print').on('click', function() {
		_gaq.push(['_trackEvent', 'visor', 'print', 'label print', tipus_user]);
		capturaPantalla('print');
	});
		
	jQuery(document).on('click', function(e) {
        if(e.target.id.indexOf("popovercloseid" )!=-1)
        {
       	 var pop=e.target.id.split("#");
       	 var ddv="#"+pop[1];
       	 jQuery(ddv).popover('hide');
       	 //addCapaMunicipis();	        
        }
    });
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

function addToolTipsInici() {
	//eines mapa
	$('.bt_llista').tooltip('destroy').tooltip({
		placement : 'left',
		container : 'body',
		title : window.lang.convert("Llista de capes")
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
	$('.bt_save').tooltip('destroy').tooltip({
		placement : 'left',
		container : 'body',
		title : window.lang.convert("Desar el mapa actual")
	});	
	
	jQuery.map(jQuery('[data-toggle="tooltip"]'), function (n, i){
		var title = $(n).attr('title');
		if (title == ""){
			title = $(n).attr('data-original-title');
		}
		$(n).attr('data-original-title', window.lang.convert(title));
	    var title = $(n).attr('title', $(n).attr('data-original-title'));
	});
		
	//cercador
//	jQuery(".leaflet-control-search .search-button, .glyphicon-search").attr('title',window.lang.convert('Cercar llocs a Catalunya ...'));
//	jQuery(".leaflet-control-search .search-input").attr('placeholder',window.lang.convert('Cercar llocs a Catalunya ...'));
}

function redimensioMapa() {
	jQuery(window).resize(function() {
		if(typeof url('?embed') == "string") factorH = 0; 
		else factorH = jQuery('.navbar').css('height').replace(/[^-\d\.]/g, '');
		jQuery('#map').css('top', factorH + 'px');
		jQuery('#map').height(jQuery(window).height() - factorH);
		jQuery('#map').width(jQuery(window).width() - factorW);
	});
	jQuery(window).trigger('resize');
}

function loadMapConfig(mapConfig){
	console.debug(mapConfig);
	var dfd = jQuery.Deferred();
	if (!jQuery.isEmptyObject( mapConfig )){
		jQuery('#businessId').val(mapConfig.businessId);
		//TODO ver los errores de leaflet al cambiar el mapa de fondo 
		//cambiar el mapa de fondo a orto y gris
		if (mapConfig.options != null){
			if (mapConfig.options.fons != 'topoMap'){
				map.setActiveMap(mapConfig.options.fons);
				map.setMapColor(mapConfig.options.fonsColor);
				//map.gestionaFons();
			}
				
			if (mapConfig.options.bbox){
				var bbox = mapConfig.options.bbox.split(",");
				var southWest = L.latLng(bbox[1], bbox[0]);
			    var northEast = L.latLng(bbox[3], bbox[2]);
			    var bounds = L.latLngBounds(southWest, northEast);
				map.fitBounds( bounds ); 
			}
		}
		
		//carga las capas en el mapa
		loadOrigenWMS().then(function(results){
			console.debug(results);
			var num_origen = 0;
			jQuery.each(results.origen, function(index, value){
				loadLayer(value).then(function(){
					num_origen++;
					if (num_origen == results.origen.length){
						jQuery.each(results.sublayers, function(index, value){
							loadLayer(value);
						});
					}
				});
			});
		});
		jQuery('#div_loading').hide();
	}
//	
//	var source = $("#map-properties-template").html();
//	var template = Handlebars.compile(source);
//	var html = template(mapConfig);
//	$('#frm_publicar').append(html);
//	
//	$('.make-switch').bootstrapSwitch();
//	//$('.make-switch').bootstrapSwitch('setOnLabel', "<i class='glyphicon glyphicon-ok glyphicon-white'></i>");		
//	//$('.make-switch').bootstrapSwitch('setOffLabel', "<i class='glyphicon glyphicon-remove'></i>");
//		
	dfd.resolve();
	
	return dfd.promise();
}


function loadOrigenWMS(){
	var dfd = $.Deferred();
	var layer_map = {origen:[],sublayers:[]};
	jQuery.each(mapConfig.servidorsWMS, function(index, value){
		if(value.capesOrdre == capesOrdre_sublayer){
			layer_map.sublayers.push(value);
			lsublayers.push(value);
		}else{
			layer_map.origen.push(value);
		}
	});
	dfd.resolve(layer_map);
	return dfd.promise();
}

function loadLayer(value){
	
	var defer = $.Deferred();
	
	if (value.epsg == "4326"){
		value.epsg = L.CRS.EPSG4326;
	}else if (value.epsg == "25831"){
		value.epsg = L.CRS.EPSG25831;
	}else if (value.epsg == "23031"){
		value.epsg = L.CRS.EPSG23031;
	}else{
		value.epsg = map.crs;
	}
	
	//Si la capa es de tipus wms
	if(value.serverType == t_wms){
		loadWmsLayer(value);
		defer.resolve();
		//Si la capa es de tipus dades obertes
	}else if(value.serverType == t_json){
		loadCapaFromJSON(value);				
		defer.resolve();
	//Si la capa es de tipus dades obertes
	}else if(value.serverType == t_dades_obertes){
		loadDadesObertesLayer(value);
		defer.resolve();
	//Si la capa es de tipus xarxes socials	
	}else if(value.serverType == t_xarxes_socials){
		var options = jQuery.parseJSON( value.options );
		
		if(options.xarxa_social == 'twitter') loadTwitterLayer(value, options.hashtag);
		else if(options.xarxa_social == 'panoramio') loadPanoramioLayer(value);
		else if(options.xarxa_social == 'wikipedia') loadWikipediaLayer(value);
		defer.resolve();
	}else if(value.serverType == t_tematic){
		loadTematicLayer(value).then(function(){
			defer.resolve();
		});
		
	}else if(value.serverType == t_heatmap){
		loadHeatLayer(value);
		defer.resolve();
		
	}else if(value.serverType == t_cluster){
		loadClusterLayer(value);
		defer.resolve();
	}
	return defer.promise();
}

/* funcions carrega capes */
function loadPanoramioLayer(layer){	
	var panoramio = new L.Panoramio({
		maxLoad: 10, 
		maxTotal: 250, 
		zIndex: parseInt(layer.capesOrdre),
		nom : layer.serverName,
		tipus : layer.serverType,
		businessId: layer.businessId
	});	
	
	if (layer.capesActiva == true || layer.capesActiva == "true"){
		panoramio.addTo(map);
	}
	controlCapes.addOverlay(panoramio, layer.serverName, true);
	controlCapes._lastZIndex++;
}

function loadTwitterLayer(layer, hashtag){
	var twitter = new L.Twitter({
		hashtag: hashtag,
		nom: layer.serverName,
		tipus : layer.serverType,
		zIndex: parseInt(layer.capesOrdre), 
		businessId: layer.businessId
	});	
	
	if (layer.capesActiva == true || layer.capesActiva == "true"){
		twitter.addTo(map);
	}
	
	controlCapes.addOverlay(twitter, layer.serverName, true);
	controlCapes._lastZIndex++;
}

function loadWikipediaLayer(layer){
	
	var wikipedia = new L.Wikipedia({
		zIndex: parseInt(layer.capesOrdre),
		nom : layer.serverName,
		tipus : layer.serverType,
		businessId: layer.businessId
	});	
	
	if (layer.capesActiva == true || layer.capesActiva == "true"){
		wikipedia.addTo(map);
	}
	controlCapes.addOverlay(wikipedia, layer.serverName, true);
	controlCapes._lastZIndex++;
}

function loadDadesObertesLayer(layer){
	var options = jQuery.parseJSON( layer.options );
	if(options.tem == null || options.tem == tem_simple){
		var url_param = paramUrl.dadesObertes + "dataset=" + options.dataset;
		var estil_do = retornaEstilaDO(options.dataset);	
		if (options.tem == tem_simple){
			estil_do = options.style;
		}
		var capaDadaOberta = new L.GeoJSON.AJAX(url_param, {
			onEachFeature : popUp,
			nom : layer.serverName,
			tipus : layer.serverType,
			dataset: options.dataset,
			businessId : layer.businessId,
			dataType : "jsonp",
			zIndex: parseInt(layer.capesOrdre),
			pointToLayer : function(feature, latlng) {
				if(options.dataset.indexOf('meteo')!=-1){
					return L.marker(latlng, {icon:L.icon({					
						    iconUrl: feature.style.iconUrl,
						    iconSize:     [44, 44], 
						    iconAnchor:   [22, 22], 				   
						    popupAnchor:  [-3, -3] 
					})});
				}else if(options.dataset.indexOf('incidencies')!=-1){
					var inci=feature.properties.descripcio_tipus;
					var arr = ["Obres", "Retenció", "Cons", "Meterologia" ];
					var arrIM = ["st_obre.png", "st_rete.png", "st_cons.png", "st_mete.png" ];
					var imgInci="/geocatweb/img/"+arrIM[jQuery.inArray( inci, arr )];
					return L.marker(latlng, {icon:L.icon({					
					    iconUrl: imgInci,
					    iconSize:     [30, 26], 
					    iconAnchor:   [15, 13], 				   
					    popupAnchor:  [-3, -3] 
					})});
				}else if(options.dataset.indexOf('cameres')!=-1){
					return L.marker(latlng, {icon:L.icon({					
					    iconUrl: "/geocatweb/img/st_came.png",
					    iconSize:     [30, 26], 
					    iconAnchor:   [15, 13], 				   
					    popupAnchor:  [-3, -3] 
					})});
				}else{
					if (estil_do.isCanvas){
						return L.circleMarker(latlng, estil_do);
					}else{
						return L.marker(latlng, {icon:L.icon(estil_do)});
					}
				}
			}
		});	
		
		if (layer.capesActiva == true || layer.capesActiva == "true"){
			capaDadaOberta.addTo(map);
		}
		
		capaDadaOberta.eachLayer(function(layer) {
			console.debug("1"+layer);
		});		
		
		controlCapes.addOverlay(capaDadaOberta, layer.serverName, true);	
		controlCapes._lastZIndex++;
		
	}else if(options.tem == tem_cluster){
		loadDadesObertesClusterLayer(layer);
	}else if(options.tem == tem_heatmap){
		loadDOHeatmapLayer(layer);
	}
}

function loadWmsLayer(layer){
	
	var newWMS = L.tileLayer.wms(layer.url, {
	    layers: layer.layers,
	    format: layer.imgFormat,
	    transparent: layer.transparency,
	    version: layer.version,
	    opacity: layer.opacity,
	    crs: layer.epsg,
		nom : layer.serverName,
		tipus: layer.serverType,
		zIndex :  parseInt(layer.capesOrdre),	    
	    businessId: layer.businessId
	});
	
	if (layer.capesActiva == true || layer.capesActiva == "true"){
		newWMS.addTo(map);
	}
	controlCapes.addOverlay(newWMS, layer.serverName, true);
	controlCapes._lastZIndex++;
}

/************************************************************/

function popUp(f, l) {
	var out = [];
	if (f.properties) {
		for (key in f.properties) {
			if(key!='gml_id'){
				if(key=='Name' || key=='Description'){
					out.push(f.properties[key]);
				}else if(key=='link' || key=='Web'){				
					ll=f.properties[key];
					if(ll.indexOf('.gif')!=-1){
						out.push('<img width="100" src="'+ll+'"/>');
					}else{
						out.push('<b>'+key +'</b>:<a target="_blank" href="'+ll+'"/>'+ll+'</a>');
					}
				}else{
					out.push("<b>"+key + "</b>: " + f.properties[key]);
				}
			}
		}
		l.bindPopup(out.join("<br />"));
	}
}

function createFeatureMarkerStyle(style){
	console.debug(style);
	if (style.marker){
		var puntTMP= new L.AwesomeMarkers.icon(default_point_style);
		puntTMP.options.iconColor = style.simbolColor;
		puntTMP.options.icon = style.simbol;
		puntTMP.options.markerColor = style.marker;
		puntTMP.options.isCanvas=false;
	}else{
		var puntTMP = { 
			radius: style.simbolSize, 
			isCanvas: true,
			fillColor: style.color,
			color:  style.borderColor,
			weight:  style.borderWidth,
			fillOpacity:  style.opacity/100,
			tipus: t_marker
		};
	}
	return puntTMP;
}

function createFeatureLineStyle(style){
	var estilTMP = default_line_style;
	estilTMP.color=style.color;
	estilTMP.weight=style.lineWidth;
	return estilTMP;
}

function createFeatureAreaStyle(style){
	var estilTMP= default_area_style;
	estilTMP.fillColor=style.color;
	estilTMP.fillOpacity=(style.opacity/100);
	estilTMP.weight=style.borderWidth;
	estilTMP.color=style.borderColor;
	return estilTMP;
}

function updateEditableElements(){}

function getLeafletIdFromBusinessId(businessId){
	for(val in controlCapes._layers){
		if(controlCapes._layers[val].layer.options.businessId == businessId){
			return val;
		}
	}
}
