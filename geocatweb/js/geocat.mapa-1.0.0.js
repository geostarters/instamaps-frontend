jQuery(document).ready(function() {
	
	if(typeof url('?uid') == "string"){
		gestioCookie();
		$.removeCookie('uid', { path: '/' });
		$.cookie('uid', url('?uid'), {path:'/'});
		checkUserLogin();
	}
	
	defineTipusUser();
	
	if (!Modernizr.canvas  || !Modernizr.sandbox){
		//jQuery("#mapaFond").show();
		
	}else{
		if (tipus_user == t_user_loginat){
			var data = {
					uid: $.cookie('uid'),
					businessId: url('?businessid'),
					mapacolaboratiu: url('?mapacolaboratiu')
				};
				getUserSimple(data).then(function(results){
					$('#userId').val(results.results.id);
					loadApp();
				});
		}else{
			loadApp();
		}
	}
	
}); // Final document ready


function loadApp(){

	var v_url = window.location.href;
	if (!url('?id')){
		v_url += "&id="+jQuery('#userId').val();
	}
	if(true){//if(v_url.contains('localhost')){
		v_url = v_url.replace('localhost',DOMINI);
	}
	v_url = v_url.replace('mapa','visor');

	if(typeof url('?businessid') == "string"){
		map = new L.IM_Map('map', {
			zoomAnimation:false,
			dragging: true,
			touchZoom: true,
			scrollWheelZoom: true,
			doubleClickZoom: true,
			boxzoom: true,
			typeMap : 'topoMapGeo',
			minZoom: 2,
			maxZoom : 19,
			//drawControl: true
		}).setView([ 41.431, 1.8580 ], 8);
		
		/*L.control.mousePosition({
			position : 'bottomright', 
			'emptystring':'',
			'numDigits': 6,
			'prefix': 'WGS84',
			'separator': ' '
		}).addTo(map);*/
		
		L.control.coordinates({
			position : 'bottomright', 
			'emptystring':' ',
			'numDigits': 2,
			'numDigits2': 6,
			'prefix': 'ETRS89 UTM 31N',
			'prefix2': 'WGS84',
			'separator': ' ',
			'showETRS89':true,
			'lngFirst':true
		}).addTo(map);
		
		
		L.control.scale({position : 'bottomright', 'metric':true,'imperial':false}).addTo(map);
		
		var _minTopo=new L.TileLayer(URL_MQ, {minZoom: 0, maxZoom: 19, subdomains:subDomains});
		var miniMap = new L.Control.MiniMap(_minTopo, { toggleDisplay: true, autoToggleDisplay: true}).addTo(map);	
		
		gestioCookie('loadApp');
				
		var data = {
			businessId: url('?businessid'),
			uid: $.cookie('uid'),
			mapacolaboratiu: url('?mapacolaboratiu')
		};
		
		getUserSimple(data).then(function(results){
			$('#userId').val(results.results.id);
		});
		
		getMapByBusinessId(data).then(function(results){
			if (results.status == "ERROR"){
				gestioCookie('getMapByBusinessId');
			}else{
				try{
					mapConfig = results.results;
					//var bloquejatJson=$.parseJSON(mapConfig.bloquejat);
					//jQuery.map( bloquejatJson, function( val, i ) {
					//		console.debug(val.uid);
					//		console.debug(val.bloquejat);
					//});
					//if (true) { //CANVIAR
					gestioCookie('diferentUser');
					$('meta[name="og:title"]').attr('content', "InstaMaps: "+mapConfig.nomAplicacio);
					
					if (mapConfig.options){
						mapConfig.options = $.parseJSON( mapConfig.options );
						$('meta[name="description"]').attr('content', mapConfig.options.description);
						
						$('meta[name="og:description"]').attr('content', mapConfig.options.description);
						
						var urlThumbnail = GEOCAT02 + paramUrl.urlgetMapImage+ "&request=getGaleria&update=false&businessid=" + url('?businessid'); 
						$('meta[name="og:image"]').attr('content', urlThumbnail);
					}
					
					mapLegend = (mapConfig.legend? $.parseJSON( mapConfig.legend):[]);
					
					downloadableData = (mapConfig.options && mapConfig.options.downloadable? 
											mapConfig.options.downloadable:[]);
					
					mapConfig.newMap = false;

					//Afegim barres d'eines i control de capes 
					addControlsInici();
					
					addLegendEdicio();
					
					loadMapConfig(mapConfig).then(function(){

						$('#nomAplicacio').html(mapConfig.nomAplicacio);
						//llegim configuracio de funcionalitats del mapa, si no te, per defecte
						
						var configuracio = "";
						loadConfiguracio(mapConfig.configuracio).then(function(results){
							//iniciem els controls basics
							initControls();
							//careguem funcionalitats:
							loadControls(results);
							//Actualitzar idiomes
							updateLangText();
							//Add tooltips
							addToolTipsInici();
							
							//Actulitza idioma dels tooltips
							$("body").on("change-lang", function(event, lang){
								addDrawTooltips();//Actualitzem tootltips funcionalitat draw
								window.lang.change(lang);
								window.lang.run(lang);								
								updateLangTooltips();
								updateLangText();
							});	
							canviaIdioma(web_determinaIdioma());
							document.title = "InstaMaps: "+mapConfig.nomAplicacio;
						});
						
						//carreguem WMS en cas que s'hagi passat parametre
						if(typeof url('?urlwms') == "string"){
							ActiuWMS.url = url('?urlwms');
							var layername = url('?layername');
							
							ActiuWMS.servidor = layername;
							ActiuWMS.layers = layername;
							ActiuWMS.epsg = undefined;
						
							addExternalWMS(true);
						}
					});
					//}
					//else {
					//	alert("Aquest mapa està bloquejat per un altre usuari");
					//	window.location.href = paramUrl.galeriaPage;
					//}												
				}catch(err){
					gestioCookie('loadMapConfig');
				}
			}
		},function(results){
			gestioCookie('getMapByBusinessIdError');
		});
		addLeaveModal();
	}else{
		if (!$.cookie('uid')){
			createRandomUser().then(function(results){
				if (results.status==='OK'){
					var user_login = results.results.uid;
					var pass_login = "user1234";
					var dataUrl = {user:user_login, password:pass_login};
					doLogin(dataUrl).then(function(results){
						if(results.status==='OK'){
							jQuery.cookie('uid', user_login, {path:'/'});
							createNewMap();
						}				
					});
				}
			});
		}else{	
			mapConfig.newMap = true;
			createNewMap();
		}
	}

	/********Events*************/
	
	$.subscribe('reloadMapConfig',function(e, namespace){
		if (namespace){
			$.publish(namespace+'loadMapConfig', mapConfig);
		}else{
			$.publish('loadMapConfig', mapConfig);
		}
	});
	
	$.subscribe('getMap',function(e, namespace){
		if (namespace){
			$.publish(namespace+'setMap', map);
		}else{
			$.publish('setMap', map);
		}
	});
}

function initControls(){
	
	addClicksInici();
//	tradueixMenusToolbar();
	redimensioMapa();	
	addHtmlModalOldBrowser();
	addHtmlModalExpire();
	addHtmlModalMessages();

	//carrega font de dades
	generaLListaDadesObertes();
	generaLlistaServeisWMS();
}

function addClicksInici() {
	
	jQuery('.bt_legend').on('click', function(event) {
		aturaClick(event);
		activaLlegenda();
	});	
	
	jQuery('.bt_llista').on('click', function(event) {
		aturaClick(event);
		activaPanelCapes();
	});
	
	jQuery('.bt_captura').on('click', function(event) {
		aturaClick(event);
		_gaq.push(['_trackEvent', 'mapa', tipus_user+'captura pantalla', 'label captura', 1]);
		//_kmq.push(['record', 'captura pantalla', {'from':'mapa', 'tipus user':tipus_user}]);
		capturaPantalla(CAPTURA_MAPA);
	});
	
	jQuery('.bt_print').on('click', function(event) {
		aturaClick(event);
		_gaq.push(['_trackEvent', 'mapa', tipus_user+'print', 'label print', 1]);
		//_kmq.push(['record', 'print', {'from':'mapa', 'tipus user':tipus_user}]);
		capturaPantalla(CAPTURA_INFORME);
	});
		
	jQuery('.bt_geopdf').on('click', function(event) {
		aturaClick(event);
		_gaq.push(['_trackEvent', 'visor', tipus_user+'geopdf', 'label geopdf', 1]);
		//_kmq.push(['record', 'geopdf', {'from':'visor', 'tipus user': tipus_user}]);
		capturaPantalla(CAPTURA_GEOPDF);
	});
	
	jQuery(document).on('click', function(e) {
        if(e.target.id!='undefined' && e.target.id.indexOf("popovercloseid" )!=-1)
        {
       	 var pop=e.target.id.split("#");
       	 var ddv="#"+pop[1];
       	 jQuery(ddv).popover('hide');
        }
    });
}

function addControlsInici(){
	
	var sidebar = L.control.sidebar('sidebar', {
		position : 'left',
		closeButton : false
	});

	map.addControl(sidebar);
	setTimeout(function() {
		sidebar.show();
	}, 500);

	controlCapes = L.control.orderlayers(null, null, {
		collapsed : false,
		id : 'div_capes'
	}).addTo(map);
	
	
	

	map.on('addItemFinish',function(){
		$(".layers-list").mCustomScrollbar("destroy");		
		$(".layers-list").mCustomScrollbar({
			   advanced:{
			     autoScrollOnFocus: false,
			     updateOnContentResize: true
			   }           
		});	
		
	});
	
	
	
	var ctr_llistaCapes = L.control({
		position : 'topright'
	});
	ctr_llistaCapes.onAdd = function(map) {

		this._div = L.DomUtil.create('div', 'div_barrabotons btn-group-vertical');

		//var btllista = L.DomUtil.create('div', 'leaflet-bar btn btn-default btn-sm bt_llista');
		var btllista = jQuery("<div data-toggle=\"tooltip\" class=\"leaflet-bar btn btn-default btn-sm bt_llista\" title=\"Llista de capes\" data-lang-title=\"Llista de capes\"><span class='glyphicon glyphicon-th-list grisfort'></span></div>");
		this._div.appendChild(btllista[0]);
		//btllista.innerHTML = '<span class="glyphicon glyphicon-th-list grisfort"></span>';

		//var btcamera = L.DomUtil.create('div', 'leaflet-bar btn btn-default btn-sm bt_captura');
		var btcamera = jQuery("<div data-toggle=\"tooltip\" class=\"leaflet-bar btn btn-default btn-sm bt_captura\" title=\"Capturar la vista del mapa\" data-lang-title=\"Capturar la vista del mapa\"><span class='glyphicon glyphicon-camera grisfort'></span></div>");
		this._div.appendChild(btcamera[0]);
		//btcamera.innerHTML = '<span class="glyphicon glyphicon-camera grisfort"></span>';

		//var btprint = L.DomUtil.create('div', 'leaflet-bar btn btn-default btn-sm bt_print');
		var btprint = jQuery("<div data-toggle=\"tooltip\" class=\"leaflet-bar btn btn-default btn-sm bt_print\" title=\"Imprimir la vista del mapa\" data-lang-title=\"Imprimir la vista del mapa\"><span class='glyphicon glyphicon-print grisfort'></span></div>");
		this._div.appendChild(btprint[0]);
		//btprint.innerHTML = '<span class="glyphicon glyphicon-print grisfort"></span>';
		
		//var btgeopdf = L.DomUtil.create('div', 'leaflet-bar btn btn-default btn-sm bt_geopdf');
		var btgeopdf = jQuery("<div data-toggle=\"tooltip\" class=\"leaflet-bar btn btn-default btn-sm bt_geopdf\" title=\"Descarrega mapa en format GeoPDF\" data-lang-title=\"Descarrega mapa en format GeoPDF\"><span class='fa fa-file-pdf-o geopdf'></span></div>");
		this._div.appendChild(btgeopdf[0]);
		//btgeopdf.innerHTML = '<span class="fa fa-file-pdf-o geopdf"></span>';		
		
		return this._div;
	};
	ctr_llistaCapes.addTo(map);
	
	jQuery('.div_barrabotons .leaflet-bar').tooltip({
		placement : 'left',
		container : 'body'
	});
}



function addToolTipsInici() {
	
}

function updateLangTooltips(){
	
	jQuery('body').on('show.bs.tooltip','[data-toggle="tooltip"]',function(){
		jQuery(this).attr('data-original-title', window.lang.convert(jQuery(this).data('lang-title')));
	});
	
}

function updateLangText(){

	//Add tooltip caixa cerca
	jQuery(".leaflet-control-search .search-button, .glyphicon-search").attr('title',window.lang.convert('Cercar llocs o coordenades ...'));
	jQuery(".leaflet-control-search .search-input").attr('placeholder',window.lang.convert('Cercar llocs o coordenades ...'));	
	
	$('#funcio_draw #funcio_draw_titol_1').html(window.lang.convert("Situar un punt"));
	$('#funcio_draw #funcio_draw_titol_2').html(window.lang.convert("Dibuixar una línia o un polígon"));
	$('#funcio_tematics>h5').html(window.lang.convert("Triar l'estil del mapa"));
	$('#funcio_fonsMapes>h5').html(window.lang.convert("Escollir el mapa de fons"));
	$('.bt_publicar>span').html(window.lang.convert("Publicar el mapa"));
	$('#socialShare>h5').html(window.lang.convert("Compartir"));	
	
}

function loadMapConfig(mapConfig){
//	console.debug(mapConfig);
	var dfd = jQuery.Deferred();
	if (!jQuery.isEmptyObject( mapConfig )){
		jQuery('#businessId').val(mapConfig.businessId);
		//TODO ver los errores de leaflet al cambiar el mapa de fondo 
		//cambiar el mapa de fondo a orto y gris
		if (mapConfig.options != null){
			//if (mapConfig.options.fons != 'topoMap'){
				var fons = mapConfig.options.fons;
				if (fons == 'topoMap'){
					map.topoMap();
				}else if (fons == 'topoMapGeo') {
					map.topoMapGeo();
				}else if (fons == 'ortoMap') {
					map.ortoMap();
				}else if (fons == 'terrainMap') {
					map.terrainMap();
				}else if (fons == 'topoGrisMap') {
					map.topoGrisMap();
				}else if (fons == 'historicOrtoMap') {
					map.historicOrtoMap();
				}else if (fons == 'historicMap') {
					map.historicMap();
				}else if (fons == 'hibridMap'){
					map.hibridMap();
				}else if (fons == 'historicOrtoMap46'){
					map.historicOrtoMap46();
				}else if (fons == 'alcadaMap'){
					map.alcadaMap();
				}else if (fons == 'naturalMap') {
					map.naturalMap();
				}else if (fons == 'divadminMap') {
					map.divadminMap();
				}else if (fons == 'colorMap') {
					map.colorMap(mapConfig.options.fonsColor);			
				}
				map.setActiveMap(mapConfig.options.fons);
				map.setMapColor(mapConfig.options.fonsColor);
				//map.gestionaFons();
			//}
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
	//Si la capa es de tipus json
	}else if(value.serverType == t_json){
		loadCapaFromJSON(value).then(function(){
			defer.resolve();
		});
		//Si la capa es de tipus url file
	}else if(value.serverType == t_url_file){
		loadURLfileLayer(value).then(function(){
			defer.resolve();
		});	
	//Si la capa es de tipus geojsonVT
	}else if(value.serverType == t_geojsonvt){
		loadGeojsonvtLayer(value);
		defer.resolve();		
	//Si la capa es de tipus geojsonVT
	}else if(value.serverType == t_geojsonvt){
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
		loadTematicLayer(value).then(function(){
			defer.resolve();
		});		
	}else if(value.serverType == t_visualitzacio){
		loadVisualitzacioLayer(value).then(function(){
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




function createNewMap(){
	//console.debug("createNewMap");
	var data = {
		nom: getTimeStamp(),
		uid: $.cookie('uid'),
		visibilitat: visibilitat_privat,
		tipusApp: 'vis',
	};
	
	createMap(data).then(function(results){
		if (results.status == "ERROR"){
			//TODO Mensaje de error
			gestioCookie('createMapError');
		}else{
			try{
				mapConfig = results.results;
				mapConfig.options = jQuery.parseJSON( mapConfig.options );
				jQuery('#businessId').val(mapConfig.businessId);
				mapConfig.newMap = false;
				
				//Si hi ha parametre enllac servei wms, etc
				var param = "";				
				if(typeof url('?urlwms') == "string"){
					param = "&urlwms="+url('?urlwms')+"&layername="+url('?layername');
				}
//				console.debug(param);
				
				window.location = paramUrl.mapaPage+"?businessid="+mapConfig.businessId+param;
			}catch(err){
				gestioCookie('createMap');
			}
		}
	});
}

/**
 * Obtener los businessId de las capas para crear los json
 */
function getBusinessIdOrigenLayers(){
    var lBusinessId = "";
    jQuery.each(controlCapes._layers, function(i, item){
          lBusinessId += item.layer.options.businessId +",";
          jQuery.each(item._layers, function(j, subitem){
        	  if( subitem.layer.options.tipusRang == tem_simple || subitem.layer.options.tipusRang == tem_clasic){
            	  lBusinessId += subitem.layer.options.businessId +",";
              }
          });
    });
    lBusinessId = lBusinessId.substring(0, lBusinessId.length - 1);
    return lBusinessId;
	
}

function loadControls(configuracio){
	//funcionalitats a carregar nomes si esta loginat
	if ($.cookie('uid')){
		jQuery.each(configuracio.funcionalitatsLoginat, function(i, funcionalitatLoginat){
			eval(funcionalitatLoginat);
		});			
	}
	jQuery.each(configuracio.funcionalitats, function(i, funcionalitat){
		eval(funcionalitat);
	});
}

function loadConfiguracio(configuracio){
	var dfd = new jQuery.Deferred();
	if(configuracio){
		configuracio = $.parseJSON(mapConfig.configuracio);
		dfd.resolve(configuracio);
	}else{
		jQuery.get('../../default_config_mapa_0.2.txt', function(data) {
			   configuracio = $.parseJSON(data);
			   dfd.resolve(configuracio);
		});							
	}
	return dfd.promise();
}

function addLeaveModal(){
	addHtmlModalLeave();

	if (isRandomUser($.cookie('uid'))){
		jQuery('#hl_sessio1').attr('href', paramUrl.loginPage+"?from=mapa");
		
		jQuery('.navbar-form .bt-sessio').on('click',function(){
			jQuery(window).off('beforeunload');
			jQuery(window).off('unload');
			window.location = paramUrl.loginPage+"?from=mapa";
		});
				
		jQuery('#dialgo_leave').modal('show');		
		jQuery('#dialgo_leave .bt-sessio').on('click',function(){
			jQuery(window).off('beforeunload');
			jQuery(window).off('unload');
			window.location = paramUrl.loginPage+"?from=mapa";
		});
		
		jQuery('#dialgo_leave .bt_orange').on('click',function(){
			jQuery(window).off('beforeunload');
			jQuery(window).off('unload');
			window.location = paramUrl.registrePage+"?from=mapa";
		});
		
		jQuery('#dialgo_leave').on('hide.bs.modal', function (e) {
			
		});
		
		jQuery(window).on('unload',function(event){
			_gaq.push(['_trackEvent', 'mapa', tipus_user+'sortir', 'label sortir', 1]);
			deleteRandomUser({uid: $.cookie('uid')});
			$.removeCookie('uid', { path: '/' });
		});
	}else{
		jQuery('#dialgo_leave .btn-primary').on('click',function(){
			leaveMapa();
		});
	}
	
	$('.leaflet-remove').click(function() {
		alert( "Handler for .click() called." );
	});			
	
	//boton de comentaris
	jQuery('#feedback_btn').on('click',function(e){
		window.open(paramUrl.comentarisPage);
	});
	//Missatge error de carrega de dades
	jQuery("#div_carrega_dades_message").hide();
	jQuery('#dialog_carrega_dades').on('hidden.bs.modal', function (e) {
		jQuery("#div_carrega_dades_message").hide();
	});	
	
}

function nobackbutton(){
	window.location.hash="no-back-button";
    window.location.hash="Again-No-back-button" //chrome
    window.onhashchange=function(){window.location.hash="no-back-button";}
}
/*TODO estas funciones estaban pensadas para prevenir al usaurio al abandonar 
la pagína sin publicar el mapa. La idea era que al entrar en un mapa nuevo
se creara el mapa en la BD y que el si el usuario abandona la página sin publicar se 
mostrara el mensaje de advertencia y se borrara el mapa.
*/
/*
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
*/

