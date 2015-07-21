jQuery(document).ready(function() {
		
	defineTipusUser();
	changeInitVisor();
	
	if (!Modernizr.canvas  || !Modernizr.sandbox){
		jQuery("#mapaFond").show();
		jQuery("#dialgo_old_browser").modal('show');
		jQuery('#dialgo_old_browser').on('hide.bs.modal', function (e) {
			window.location = paramUrl.mainPage;
		});
	}else{
		loadApp();
	}
	addFuncioEditDataTable();
		
}); // Final document ready

//Funcio per canviar comportament navbar al visor
function changeInitVisor(){
	jQuery('.container').css('width','95%');
	setTimeout('activaPanelCapes(false)',3000);
}


function loadApp(){
	var addDefaultZoomControl = true;//per poder definir si es embed la posicio que jo vull
    if(typeof url('?embed') == "string"){
//        jQuery('#navbar-visor').remove();
          jQuery('#navbar-visor').hide();
          jQuery('#searchBar').css('top', '0');
          addDefaultZoomControl = false;
          _gaq.push(['_trackEvent', 'visor', 'embed']);
    }else{
          _gaq.push(['_trackEvent', 'visor', 'no embed']);

    }
    
    if(typeof url('?businessid') == "string"){
          map = new L.IM_Map('map', {
        	  	zoomAnimation:false,
                typeMap : 'topoMapGeo',
                minZoom: 2,
                maxZoom : 19,
                zoomControl: addDefaultZoomControl,
          }).setView([ 41.431, 1.8580 ], 8);

          L.control.coordinates({
  			position : 'bottomright', 
  			'emptystring':' ',
  			'numDigits': 2,
  			'numDigits2': 6,
  			'prefix': 'ETRS89 UTM 31N',
  			'prefix2': 'WGS84',
  			'separator': ' ',
  			'showETRS89':true
  		}).addTo(map);
          
		L.control.scale({position : 'bottomright', 'metric':true,'imperial':false}).addTo(map);
				
		var _minTopo= new L.TileLayer(URL_MQ, {minZoom: 0, maxZoom: 19, subdomains:subDomains});
		var miniMap = new L.Control.MiniMap(_minTopo, { toggleDisplay: true, autoToggleDisplay: true}).addTo(map);	
			
		var data = {
			businessId: url('?businessid'),
			id: url('?id'),
			mapacolaboratiu: url('?mapacolaboratiu'),
			uid: url('?uid')			
		};
		
		getCacheMapByBusinessId(data).then(function(results){
			
			if (results.status == "ERROR"){
				window.location.href = paramUrl.galeriaPage;
			}
			mapConfig = $.parseJSON(results.results);
			
			
			$('meta[name="og:title"]').attr('content', "InstaMaps: "+mapConfig.nomAplicacio);
			
			var nomUser = mapConfig.entitatUid.split("@");
			var infoHtml = '<p>'+nomUser[0]+'</p>';
			
			if (mapConfig.options){
				mapConfig.options = $.parseJSON( mapConfig.options );

				$('meta[name="description"]').attr('content', mapConfig.options.description);	
				$('meta[name="og:description"]').attr('content', mapConfig.options.description);
				
				var urlThumbnail = GEOCAT02 + paramUrl.urlgetMapImage+ "&request=getGaleria&update=false&businessid=" + url('?businessid'); 
				$('meta[name="og:image"]').attr('content', urlThumbnail);
				
				infoHtml += '<p>'+mapConfig.options.description+'</p>';
				infoHtml += '<p>'+mapConfig.options.tags+'</p>';
			}
			jQuery("#mapTitle").html(mapConfig.nomAplicacio + '<span id="infoMap" lang="ca" class="glyphicon glyphicon-info-sign pop" data-toggle="popover" title="Informació" data-lang-title="Informació"></span>');
			
			$('#infoMap').popover({
				placement : 'bottom',
				html: true,
				content: infoHtml
			});
			
			$('#infoMap').on('show.bs.popover', function () {
				jQuery(this).attr('data-original-title', window.lang.convert(jQuery(this).data('lang-title')));
			});
			
			mapLegend = (mapConfig.legend? $.parseJSON( mapConfig.legend):"");
			checkEmptyMapLegend();
			
			downloadableData = (mapConfig.options && mapConfig.options.downloadable? 
									mapConfig.options.downloadable:[]);			
						
			//iniciamos los controles
			initControls().then(function(){
				if(typeof url('?embed') == "string"){
					activaLlegenda(false);
				}
			});		
			
			mapConfig.newMap = false;
			$('#nomAplicacio').html(mapConfig.nomAplicacio);
			
			loadMapConfig(mapConfig).then(function(){
				//avisDesarMapa();
				addFuncioDownloadLayer('visor');
				activaPanelCapes(true);
				//Actulitza idioma dels tooltips
				$("body").on("change-lang", function(event, lang){
					window.lang.change(lang);
					window.lang.run(lang);								
					updateLangTooltips();
					updateLangText();
				});	
				canviaIdioma(web_determinaIdioma());				
				document.title = "InstaMaps: "+mapConfig.nomAplicacio;
				
				var controlFons = new L.IM_controlFons().addTo(map);
				
			});
		},function(results){
			var uidUrl = url('?uid');
			if ( url('?mapacolaboratiu') && !$.cookie('uid')) {
				$.cookie('collaboratebid', url('?businessid'), {path:'/'});
				$.cookie('collaborateuid', uidUrl, {path:'/'});
				window.location.href = paramUrl.loginPage;
			}
			else if (url('?mapacolaboratiu') && uidUrl!=$.cookie('uid')) {
				$.removeCookie('uid', { path: '/' });
				$.cookie('collaboratebid', url('?businessid'), {path:'/'});
				$.cookie('collaborateuid', uidUrl, {path:'/'});
				window.location.href = paramUrl.loginPage;
			}
			else {
				window.location.href = paramUrl.galeriaPage+"?private=1";			
			}
		});
	}
	
		jQuery('#socialShare_visor').on('click', function(evt){
			console.debug('on click social');
		});
		
		_gaq.push(['_trackPageview']);
}

function initControls(){
	var dfd = $.Deferred();
	
	addControlsInici();
	addClicksInici();
	addToolTipsInici();
	
//	if(typeof url('?embed') != "string"){
		addControlCercaEdit();		
//	}
		
	redimensioMapa();
	
	//Funcionalitat compartir visor
	addCompartirVisor();
	
	dfd.resolve();
	
	return dfd.promise();
}

function addControlsInici() {
	var dfd = $.Deferred();
	controlCapes = L.control.orderlayers(null, null, {
		collapsed : false,
		id : 'div_capes'
	}).addTo(map);

	map.on('addItemFinish',function(){
//		console.debug('addItemFinish!');
		$(".layers-list").mCustomScrollbar("destroy");		
		$(".layers-list").mCustomScrollbar({
			   advanced:{
			     autoScrollOnFocus: false,
			     updateOnContentResize: true
			   }           
		});		
	});
	
	ctr_llistaCapes = L.control({
		position : 'topright'
	});
	ctr_llistaCapes.onAdd = function(map) {

		this._div = L.DomUtil.create('div', 'div_barrabotons btn-group-vertical');

		var btllista = jQuery("<div data-toggle=\"tooltip\" class=\"leaflet-bar btn btn-default btn-sm bt_llista\" title=\"Llista de capes\" data-lang-title=\"Llista de capes\"><span class='glyphicon glyphicon-th-list grisfort'></span></div>");
		this._div.appendChild(btllista[0]);
		
		var btcamera = jQuery("<div data-toggle=\"tooltip\" class=\"leaflet-bar btn btn-default btn-sm bt_captura\" title=\"Capturar la vista del mapa\" data-lang-title=\"Capturar la vista del mapa\"><span class='glyphicon glyphicon-camera grisfort'></span></div>");
		this._div.appendChild(btcamera[0]);
		
		var btprint = jQuery("<div data-toggle=\"tooltip\" class=\"leaflet-bar btn btn-default btn-sm bt_print\" title=\"Imprimir la vista del mapa\" data-lang-title=\"Imprimir la vista del mapa\"><span class='glyphicon glyphicon-print grisfort'></span></div>");
		this._div.appendChild(btprint[0]);
		
		var btgeopdf = jQuery("<div data-toggle=\"tooltip\" class=\"leaflet-bar btn btn-default btn-sm bt_geopdf\" title=\"Descarrega mapa en format GeoPDF\" data-lang-title=\"Descarrega mapa en format GeoPDF\"><span class='fa fa-file-pdf-o geopdf'></span></div>");
		this._div.appendChild(btgeopdf[0]);
		/*
		var btllista = L.DomUtil.create('div', 'leaflet-bar btn btn-default btn-sm bt_llista');
		this._div.appendChild(btllista);
		btllista.innerHTML = '<span class="glyphicon glyphicon-th-list grisfort"></span>';

		var btcamera = L.DomUtil.create('div', 'leaflet-bar btn btn-default btn-sm bt_captura');
		this._div.appendChild(btcamera);
		btcamera.innerHTML = '<span class="glyphicon glyphicon-camera grisfort"></span>';

		var btprint = L.DomUtil.create('div', 'leaflet-bar btn btn-default btn-sm bt_print');
		this._div.appendChild(btprint);
		btprint.innerHTML = '<span class="glyphicon glyphicon-print grisfort"></span>';
		
		var btgeopdf = L.DomUtil.create('div', 'leaflet-bar btn btn-default btn-sm bt_geopdf');
		this._div.appendChild(btgeopdf);
		btgeopdf.innerHTML = '<span class="fa fa-file-pdf-o geopdf"></span>';		
		*/
		return this._div;
	};
	ctr_llistaCapes.addTo(map);
	
	//link Veure Mapa
    if(typeof url('?embed') == "string"){
          var ctr_linkViewMap = L.control({
                position : 'topleft'
          });         
          
          ctr_linkViewMap.onAdd = function(map) {

                this._div = L.DomUtil.create('div', 'control-linkViewMap');
                this._div.id='div-linkViewMap';
                this._div.title=window.lang.convert('Veure a InstaMaps');
                this._div.innerHTML = '<span id="span-linkViewMap">'+
                                                   '<a href="http://instamaps.cat/geocatweb/visor.html?businessid='+url('?businessid')+'" target="_blank">'+
                                                   //window.lang.convert('Veure a InstaMaps')+
                                                   '&nbsp;<span class="glyphicon glyphicon-fullscreen grisfort bt-expand"></span>'+
                                                   '</a>'+
                                               '</span>';
                return this._div;
          };
          ctr_linkViewMap.addTo(map);  
          jQuery('#span-linkViewMap a').on('click', function(event) {
              _gaq.push(['_trackEvent', 'visor', 'veure a instamaps', 'label embed', 1]);
          });
          new L.Control.Zoom({ position: 'topleft' }).addTo(map);
    }

    
	ctr_shareBT = L.control({
		position : 'topleft'
	});
	
	ctr_findBT = L.control({
		position : 'topleft'
	});
	
	var titleGPS = window.lang.convert('Centrar mapa a la seva ubicació');
	var ctr_gps = new L.Control.Gps({
		autoCenter: true,		//move map when gps location change
		style: {
			radius: 6,		//marker circle style
			weight:3,
			color: '#e03',
			fill: true,
			fillColor: '#e03',
			opacity: 1,
			fillOpacity: 0.5},
		title: titleGPS,
		textErr: 'Error del GPS',			//error message on alert notification
		callErr: null,			//function that run on gps error activating
	});	
	map.addControl(ctr_gps);	
		
	ctr_shareBT.onAdd = function(map) {

		this._div = L.DomUtil.create('div', 'leaflet-bar  btn btn-default btn-sm');
		this._div.id='dv_bt_Share';
		this._div.title=window.lang.convert('Compartir');
		this._div.innerHTML = '<span id="span_bt_Share" class="fa fa-share-alt grisfort"></span>';
		return this._div;
	};
	ctr_shareBT.addTo(map);
	
	
	ctr_findBT.onAdd = function(map) {

		this._div = L.DomUtil.create('div', 'leaflet-bar  btn btn-default btn-sm');
		this._div.id='dv_bt_Find';
		this._div.title=window.lang.convert('Cercar');
		this._div.innerHTML = '<span id="span_bt_Find" class="fa fa-search grisfort"></span>';
		return this._div;
	};
	ctr_findBT.addTo(map);
	
	jQuery('.div_barrabotons .leaflet-bar').tooltip({
		placement : 'left',
		container : 'body'
	});
	
	dfd.resolve();
	return dfd.promise();
}


function addClicksInici() {
	jQuery('.bt_legend').on('click', function() {
		activaLlegenda();
	});
	
	jQuery('.bt_llista').on('click', function(event) {
		aturaClick(event);
		activaPanelCapes();
	});	
	
	jQuery('.bt_captura').on('click', function(event) {
		aturaClick(event);
		_gaq.push(['_trackEvent', 'visor', tipus_user+'captura pantalla', 'label captura', 1]);
		capturaPantalla(CAPTURA_MAPA);
	});
	
	jQuery('.bt_print').on('click', function(event) {
		aturaClick(event);
		_gaq.push(['_trackEvent', 'visor', tipus_user+'print', 'label print', 1]);
		capturaPantalla(CAPTURA_INFORME);
	});
	
	jQuery('.bt_geopdf').on('click', function(event) {
		aturaClick(event);
		_gaq.push(['_trackEvent', 'visor', tipus_user+'geopdf', 'label geopdf', 1]);
		capturaPantalla(CAPTURA_GEOPDF);
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
	if(typeof url('?embed') == "string"){
		if (obre){
			obre = false;
		}
	}
	if (obre) {
		jQuery('.leaflet-control-layers').animate({
			width : 'show'
		});
	}else if (obre == false){
		jQuery('.leaflet-control-layers').animate({
			width : 'hide'
		});
	}else {
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

function activaLlegenda(obre) {
	
	var cl = jQuery('.bt_legend span').attr('class');
	if (cl && cl.indexOf('grisfort') != -1) {
		jQuery('.bt_legend span').removeClass('grisfort');
		jQuery('.bt_legend span').addClass('greenfort');
		$(".bt_legend").transition({ x: '0px', y: '0px',easing: 'in', duration: 500 });
		$(".visor-legend").transition({ x: '0px', y: '0px',easing: 'in', opacity: 1,duration: 500 });
	} else {
		jQuery('.bt_legend span').removeClass('greenfort');
		jQuery('.bt_legend span').addClass('grisfort');
		var height = $(".visor-legend").height();
		var y1 = $(".visor-legend").height() - 20;
		var y2 = $(".visor-legend").height() +50;
		
		$(".bt_legend").transition({ x: '225px', y: y1+'px',duration: 500 });
		$(".visor-legend").transition({ x: '250px', y: y2+'px',  opacity: 0.1,duration: 500 });		
	}	
	
}


function addToolTipsInici() {
	/*
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
	
	$('.bt_geopdf').tooltip('destroy').tooltip({
		placement : 'left',
		container : 'body',
		title : window.lang.convert("Descarrega mapa en format GeoPDF")
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
	*/
}

function updateLangText(){
	jQuery('body').on('show.bs.tooltip','[data-toggle="tooltip"]',function(){
		jQuery(this).attr('data-original-title', window.lang.convert(jQuery(this).data('lang-title')));
	});
	
	//Add tooltip caixa cerca
	jQuery(".leaflet-control-search .search-button, .glyphicon-search").attr('title',window.lang.convert('Cercar llocs o coordenades ...'));
	jQuery(".leaflet-control-search .search-input").attr('placeholder',window.lang.convert('Cercar llocs o coordenades ...'));	
}

function updateLangTooltips(){
	jQuery('body').on('show.bs.tooltip','[data-toggle="tooltip"]',function(){
		jQuery(this).attr('data-original-title', window.lang.convert(jQuery(this).data('lang-title')));
	});
	
	/*
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
	$('.bt_geopdf').tooltip('destroy').tooltip({
		placement : 'left',
		container : 'body',
		title : window.lang.convert("Descarrega mapa en format GeoPDF")
	});


	jQuery.map(jQuery('[data-toggle="tooltip"]'), function (n, i){
		var title = $(n).attr('title');
		if (title == ""){
			title = $(n).attr('data-original-title');
		}
		$(n).attr('data-original-title', window.lang.convert(title));
	    var title = $(n).attr('title', $(n).attr('data-original-title'));
	});	
	*/

	jQuery("#dv_bt_Find").on('click',function(e){
		posaClassActiu('#span_bt_Find');
		jQuery('#searchBar').css('top', (e.clientY - 25) +'px');
		jQuery('#searchBar').css('left', (e.clientX + 20) +'px');
		jQuery('#searchBar').toggle();
		aturaClick(e);
	});
}

function loadMapConfig(mapConfig){
	var dfd = jQuery.Deferred();
	if (!jQuery.isEmptyObject( mapConfig )){
		jQuery('#businessId').val(mapConfig.businessId);
//TODO ver los errores de leaflet al cambiar el mapa de fondo 
		//cambiar el mapa de fondo a orto y gris
		if (mapConfig.options != null){
			if (mapConfig.options.fons != 'topoMap'){
				var fons = mapConfig.options.fons;
				if (fons == 'topoMap') {
					map.topoMap();
				} else if (fons == 'topoMapGeo') {
					map.topoMapGeo();
				} else if (fons == 'topoGrisMap') {
					map.topoGrisMap();
				} else if (fons == 'ortoMap') {
					map.ortoMap();
				} else if (fons == 'terrainMap') {
					map.terrainMap();
				} else if (fons == 'colorMap') {
					map.colorMap(mapConfig.options.fonsColor);
				} else if (fons == 'historicMap') {
					map.historicMap();
				}
				map.setActiveMap(mapConfig.options.fons);
				map.setMapColor(mapConfig.options.fonsColor);
				//map.gestionaFons();
			}
			
			var hash = location.hash;
			hashControl = new L.Hash(map);
			var parsed = hashControl.parseHash(hash);
			
			if (parsed){
				hashControl.update();
			}else{
				if (mapConfig.options.center){
					var opcenter = mapConfig.options.center.split(",");
					map.setView(L.latLng(opcenter[0], opcenter[1]), mapConfig.options.zoom);
				}else if (mapConfig.options.bbox){
					var bbox = mapConfig.options.bbox.split(",");
					var southWest = L.latLng(bbox[1], bbox[0]);
				    var northEast = L.latLng(bbox[3], bbox[2]);
				    var bounds = L.latLngBounds(southWest, northEast);
					map.fitBounds( bounds ); 
				}
			}
		}
		
		//carga las capas en el mapa
		loadOrigenWMS().then(function(results){
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
		jQuery(window).trigger('resize');
	}
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
		loadCapaFromJSON(value).then(function(){
			defer.resolve();
		});
	//Si la capa es de tipus url file
	}else if(value.serverType == t_url_file){
		loadURLfileLayer(value);
		defer.resolve();		
	//Si la capa es de tipus dades obertes
	}else if(value.serverType == t_geojsonvt){
		console.debug(loadGeojsonvtLayer);
		loadGeojsonvtLayer(value);
		defer.resolve();		
	//Si la capa es de tipus dades obertes
	}else if(value.serverType == t_dades_obertes){
		loadDadesObertesLayer(value).then(function(){
			defer.resolve();
		});
	//Si la capa es de tipus xarxes socials	
	}else if(value.serverType == t_xarxes_socials){
		var options = jQuery.parseJSON( value.options );
		if(options.xarxa_social == 'twitter') loadTwitterLayer(value, options.hashtag);
		else if(options.xarxa_social == 'panoramio') loadPanoramioLayer(value);
		else if(options.xarxa_social == 'wikipedia') loadWikipediaLayer(value);
		defer.resolve();
	}else if(value.serverType == t_tematic){
		
	}else if(value.serverType == t_visualitzacio){
		loadCacheVisualitzacioLayer(value).then(function(){
			defer.resolve();
		});		
	}else if(value.serverType == t_heatmap){
		loadHeatLayer(value);
		defer.resolve();
		
	}else if(value.serverType == t_cluster){
		loadClusterLayer(value);
		defer.resolve();
	//Si la capa es de tipus vis_wms
	}else if(value.serverType == t_vis_wms || value.serverType == t_vis_wms_noedit){
		loadVisualitzacioWmsLayer(value);
		defer.resolve();
	}
	
	return defer.promise();
}
