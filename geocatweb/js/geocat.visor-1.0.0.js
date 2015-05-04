jQuery(document).ready(function() {
		
	//activaModul().then(function(){
		defineTipusUser();	
		
		if (!Modernizr.canvas  || !Modernizr.sandbox){
			jQuery("#mapaFond").show();
			jQuery("#dialgo_old_browser").modal('show');
			jQuery('#dialgo_old_browser').on('hide.bs.modal', function (e) {
				window.location = paramUrl.mainPage;
			});
		}else{
			loadApp();
		}
	//});
	
		addFuncioEditDataTable();
		
}); // Final document ready

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
                typeMap : 'topoMap',
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
			
//			console.debug("mapConfig:");
//			console.debug(mapConfig);
			
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
			jQuery("#mapTitle").html(mapConfig.nomAplicacio + '<span id="infoMap" class="glyphicon glyphicon-info-sign pop" data-original-title="Informació"></span>');
			
			$('#infoMap').popover({
				placement : 'bottom',
				html: true,
				content: infoHtml
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
                this._div.title=window.lang.convert('Compartir');
                this._div.innerHTML = '<span id="span-linkViewMap">'+
                                                   '<a href="http://instamaps.cat/geocatweb/visor.html?businessid='+url('?businessid')+'" target="_blank">'+
                                                   window.lang.convert('Veure a InstaMaps')+
                                                   '&nbsp;<span class="glyphicon glyphicon-share-alt"></span>'+
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
	
	
//	$(".leaflet-control-layers").mCustomScrollbar();
//	$(".leaflet-control-layers-overlays").mCustomScrollbar();
//	$('.leaflet-control-layers-overlays').perfectScrollbar();
	
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
	
	
	dfd.resolve();
	return dfd.promise();
}


function addClicksInici() {
	jQuery('.bt_legend').on('click', function() {
		activaLlegenda();
	});
	
	jQuery('.bt_llista').on('click', function(event) {
//		$(".layers-list").mCustomScrollbar('update');
		aturaClick(event);
		activaPanelCapes();
//		$(".leaflet-control-layers-overlays").mCustomScrollbar('update');
	});	
	
	jQuery('.bt_captura').on('click', function(event) {
		aturaClick(event);
		_gaq.push(['_trackEvent', 'visor', tipus_user+'captura pantalla', 'label captura', 1]);
		//_kmq.push(['record', 'captura pantalla', {'from':'visor', 'tipus user': tipus_user}]);
		capturaPantalla(CAPTURA_MAPA);
	});
	
	jQuery('.bt_print').on('click', function(event) {
		aturaClick(event);
		_gaq.push(['_trackEvent', 'visor', tipus_user+'print', 'label print', 1]);
		//_kmq.push(['record', 'print', {'from':'visor', 'tipus user': tipus_user}]);
		capturaPantalla(CAPTURA_INFORME);
	});
	
	jQuery('.bt_geopdf').on('click', function(event) {
		aturaClick(event);
		_gaq.push(['_trackEvent', 'visor', tipus_user+'geopdf', 'label geopdf', 1]);
		//_kmq.push(['record', 'geopdf', {'from':'visor', 'tipus user': tipus_user}]);
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
	
////	$(".visor-legend").transition({
////		  opacity: 0.1, scale: 0.3,
////		  duration: 500,
////		  easing: 'in',
////		  complete: function() { $(".visor-legend").toggle(); }
////		});	
	
	
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
		
//		$(".bt_legend").transition({ x: '225px', y: '230px',duration: 500 });
//		$(".visor-legend").transition({ x: '250px', y: '300px',  opacity: 0.1,duration: 500 });
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
		
	//cercador
//	jQuery(".leaflet-control-search .search-button, .glyphicon-search").attr('title',window.lang.convert('Cercar llocs a Catalunya ...'));
//	jQuery(".leaflet-control-search .search-input").attr('placeholder',window.lang.convert('Cercar llocs a Catalunya ...'));
}

function updateLangText(){

	//Add tooltip caixa cerca
	jQuery(".leaflet-control-search .search-button, .glyphicon-search").attr('title',window.lang.convert('Cercar llocs a Catalunya ...'));
	jQuery(".leaflet-control-search .search-input").attr('placeholder',window.lang.convert('Cercar llocs a Catalunya ...'));	
	
//	$('#funcio_draw #funcio_draw_titol_1').html(window.lang.convert("Situar un punt"));
//	$('#funcio_draw #funcio_draw_titol_2').html(window.lang.convert("Dibuixar una línia o un polígon"));
//	$('#funcio_tematics>h5').html(window.lang.convert("Triar l'estil del mapa"));
//	$('#funcio_fonsMapes>h5').html(window.lang.convert("Escollir el mapa de fons"));
//	$('.bt_publicar>span').html(window.lang.convert("Publicar el mapa"));
//	$('#socialShare>h5').html(window.lang.convert("Compartir"));	
	
}

function updateLangTooltips(){
	
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
		
//		//carga las capas en el mapa
//		loadOrigenWMS().then(function(results){
//			var num_origen = 0;
//			jQuery.each(results.origen, function(index, value){
//				loadLayer(value).then(function(){
//					num_origen++;
//					if (num_origen == results.origen.length){
//						if($.isEmptyObject(results.sublayers)){
////							$(".layers-list").mCustomScrollbar();
//						}else{
//							var num_sublayers = 0;
//							jQuery.each(results.sublayers, function(index, value){
//								loadLayer(value).then(function(){
//									num_sublayers++;
//									if (num_sublayers == results.sublayers.length){
////										$(".layers-list").mCustomScrollbar();
//									}
//								});
//							});							
//						}
//					}
//				});
//			});
//		});
		
		jQuery('#div_loading').hide();
		jQuery(window).trigger('resize');
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
		loadCapaFromJSON(value).then(function(){
			defer.resolve();
		});
		//Si la capa es de tipus url file
	}else if(value.serverType == t_url_file){
//		loadURLfileLayer(value).then(function(){
//			defer.resolve();
//		});	
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
		
		loadCacheTematicLayer(value).then(function(){
		//loadTematicLayer(value).then(function(){
			defer.resolve();
		});
		
	}else if(value.serverType == t_visualitzacio){
		//loadCacheVisualitzacioLayer(value).then(function(){
		loadVisualitzacioLayer(value).then(function(){
			defer.resolve();
		});		
	}else if(value.serverType == t_heatmap){
		loadHeatLayer(value);
		defer.resolve();
		
	}else if(value.serverType == t_cluster){
		loadClusterLayer(value);
		defer.resolve();
	}
	
	//$(".leaflet-control-layers").mCustomScrollbar("update");
	return defer.promise();
}

//function loadDadesObertesLayer(layer){
//	var options = jQuery.parseJSON( layer.options );
//	
//	var defer = $.Deferred();
//	
//	if(options.tem == null || options.tem == tem_simple){
//		var url_param = paramUrl.dadesObertes + "dataset=" + options.dataset;
//		var estil_do = options.estil_do;	
////		var estil_do = retornaEstilaDO(options.dataset);	
//		if (options.tem == tem_simple){
//			//estil_do = options.style;
//			estil_do = createFeatureMarkerStyle(options.style);
//		}
//		var capaDadaOberta = new L.GeoJSON.AJAX(url_param, {
//			onEachFeature : popUp,
//			nom : layer.serverName,
//			tipus : layer.serverType,
//			dataset: options.dataset,
//			businessId : layer.businessId,
//			dataType : "jsonp",
////			zIndex: parseInt(layer.capesOrdre),
//			pointToLayer : function(feature, latlng) {
//				if(options.dataset.indexOf('meteo')!=-1){
//					return L.marker(latlng, {icon:L.icon({					
//						    iconUrl: feature.style.iconUrl,
//						    iconSize:     [44, 44], 
//						    iconAnchor:   [22, 22], 				   
//						    popupAnchor:  [-3, -3] 
//					})});
//				}else if(options.dataset.indexOf('incidencies')!=-1){
//					var inci=feature.properties.descripcio_tipus;
//					var arr = ["Obres", "Retenció", "Cons", "Meterologia" ];
//					var arrIM = ["st_obre.png", "st_rete.png", "st_cons.png", "st_mete.png" ];
//					var imgInci="/geocatweb/img/"+arrIM[jQuery.inArray( inci, arr )];
//					return L.marker(latlng, {icon:L.icon({					
//					    iconUrl: imgInci,
//					    iconSize:     [30, 26], 
//					    iconAnchor:   [15, 13], 				   
//					    popupAnchor:  [-3, -3] 
//					})});
//				}else if(options.dataset.indexOf('cameres')!=-1){
//					return L.marker(latlng, {icon:L.icon({					
//					    iconUrl: "/geocatweb/img/st_came.png",
//					    iconSize:     [30, 26], 
//					    iconAnchor:   [15, 13], 				   
//					    popupAnchor:  [-3, -3] 
//					})});
//				}else{
//					if (estil_do.isCanvas){
//						return L.circleMarker(latlng, estil_do);
//					}else{
//						//console.debug(L.marker(latlng, {icon:L.AwesomeMarkers.icon(estil_do)}));
//						return L.marker(latlng, {icon:estil_do,isCanvas:false, tipus: t_marker});
//					}
//				}
//			}
//		});	
//		
//		if (layer.capesActiva== null || layer.capesActiva == 'null' || layer.capesActiva == true || layer.capesActiva == "true"){
//			capaDadaOberta.addTo(map);
//		}
//		
//		capaDadaOberta.eachLayer(function(layer) {
//			console.debug("1"+layer);
//		});		
//		
//		if (!layer.capesOrdre || layer.capesOrdre == null || layer.capesOrdre == 'null'){
//			capaDadaOberta.options.zIndex = controlCapes._lastZIndex + 1;
//		}else{
//			capaDadaOberta.options.zIndex = parseInt(layer.capesOrdre);
//		}		
//		
////		controlCapes.addOverlay(capaDadaOberta, layer.serverName, true);	
////		controlCapes._lastZIndex++;
//		
//		if(!options.origen){
//			//Fins que no estigui carregada del tot no afegim al controlcapes (per tenir be el comptador de features)
//			capaDadaOberta.on('data:loaded', function(e){
//				controlCapes.addOverlay(capaDadaOberta, layer.serverName, true);
//				controlCapes._lastZIndex++;
//				defer.resolve();
//			});
//		}else{//Si te origen es una sublayer
//			var origen = getLeafletIdFromBusinessId(options.origen);
//			controlCapes.addOverlay(capaDadaOberta, layer.serverName, true, origen);
//			defer.resolve();
//		}		
//		
//	}else if(options.tem == tem_cluster){
//		loadDadesObertesClusterLayer(layer);
//		defer.resolve();
//	}else if(options.tem == tem_heatmap){
//		loadDOHeatmapLayer(layer);
//		defer.resolve();
//	}
//	return defer.promise();
//}

//function loadWmsLayer(layer){
//	
//	var newWMS = L.tileLayer.betterWms(layer.url, {
//	    layers: layer.layers,
//	    format: layer.imgFormat,
//	    transparent: layer.transparency,
//	    version: layer.version,
//	    opacity: layer.opacity,
//	    crs: layer.epsg,
//		nom : layer.serverName,
//		tipus: layer.serverType,
//		zIndex :  parseInt(layer.capesOrdre),	    
//	    businessId: layer.businessId
//	});
//	
//	if (layer.capesActiva == true || layer.capesActiva == "true"){
//		newWMS.addTo(map);
//	}
//	
//	console.debug("geocat visor, newWMS");
//	console.debug(newWMS);	
//	
//	controlCapes.addOverlay(newWMS, layer.serverName, true);
//	controlCapes._lastZIndex++;
//}

/************************************************************/

//function popUp(f, l) {
//	var out = [];
//	if (f.properties) {
//		for (key in f.properties) {
//			if(key!='gml_id'){
//				if(key=='Name' || key=='Description'){
//					out.push(f.properties[key]);
//				}else if(key=='link' || key=='Web'){				
//					ll=f.properties[key];
//					if(ll.indexOf('.gif')!=-1){
//						out.push('<img width="100" src="'+ll+'"/>');
//					}else{
//						out.push('<b>'+key +'</b>: <a target="_blank" href="http://'+ll+'"/>'+ll+'</a>');
//					}
//				}else{
//					out.push("<b>"+key + "</b>: " + f.properties[key]);
//				}
//			}
//		}
//		l.bindPopup(out.join("<br/>"));
//	}
//}

//function createFeatureMarkerStyle(style, num_geometries){
//	//console.debug("createFeatureMarkerStyle");
//	if (!num_geometries){
//		num_geometries = num_max_pintxos - 1;
//	}
//	if (style.marker && num_geometries <= num_max_pintxos){
//		//Especifiques per cercle amb glyphon
//		if(style.marker == 'punt_r'){
//			var puntTMP = new L.AwesomeMarkers.icon(default_circuloglyphon_style);
//			puntTMP.options.iconColor = style.simbolColor;
//			puntTMP.options.icon = style.simbol;
//			puntTMP.options.markerColor = style.marker;
//			puntTMP.options.isCanvas=false;
//			puntTMP.options.divColor= style.color;
//			puntTMP.options.shadowSize = new L.Point(1, 1);
//			puntTMP.options.radius = style.radius;
//			var anchor = style.iconAnchor.split("#");
//			var size = style.iconSize.split("#");
//			puntTMP.options.iconAnchor.x = parseInt(anchor[0]);
//			puntTMP.options.iconAnchor.y = parseInt(anchor[1]);
//			puntTMP.options.iconSize.x = size[0];
//			puntTMP.options.iconSize.y = size[1];
//		}else{
//			var puntTMP = new L.AwesomeMarkers.icon(default_marker_style);
//			puntTMP.options.iconColor = style.simbolColor;
//			puntTMP.options.icon = style.simbol;
//			puntTMP.options.markerColor = style.marker;
//			puntTMP.options.isCanvas=false;
//			puntTMP.options.iconAnchor.x = 14;
//			puntTMP.options.iconAnchor.y = 42;
//			puntTMP.options.iconSize.x = 28;
//			puntTMP.options.iconSize.y = 42;
//		}
//	}else{ //solo circulo
//		var puntTMP = { 
//			radius: style.simbolSize, 
//			isCanvas: true,
//			fillColor: style.color,
//			color:  style.borderColor,
//			weight:  style.borderWidth,
//			fillOpacity:  style.opacity/100,
//			opacity: 1,
//			tipus: t_marker
//		};
//	}
//	return puntTMP;
//}

//function createFeatureLineStyle(style){
//	var estilTMP = default_line_style;
//	estilTMP.color=style.color;
//	estilTMP.weight=style.lineWidth;
//	return estilTMP;
//}
//
//function createFeatureAreaStyle(style){
//	var estilTMP= default_area_style;
//	estilTMP.fillColor=style.color;
//	estilTMP.fillOpacity=(style.opacity/100);
//	estilTMP.weight=style.borderWidth;
//	estilTMP.color=style.borderColor;
//	return estilTMP;
//}


//function getLeafletIdFromBusinessId(businessId){
//	for(val in controlCapes._layers){
//		if(controlCapes._layers[val].layer.options.businessId == businessId){
//			return val;
//		}
//	}
//}

