var plan,route;
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
		//jQuery("#menu_login").show();
		//Si es visor senzill, cloudifier
		if(typeof url('?urlwms') == "string"){
			loadVisorSimple();
			loadWmsVisorSimple();
		}else{
			loadApp();
		}
	}
	loadRouteControl();
	addFuncioEditDataTable();

}); // Final document ready

$( window ).resize(function() {
	var widthW = $( window ).width();
	var width = $( '#map' ).width();
	var height = $( '#map' ).height();


	 if(typeof url('?embed') == "string" || width<500 || height<=350){
		 $('.leaflet-control-gps').attr("style","display:none");
			$('#dv_bt_Find').attr("style","display:none");
			$('#dv_bt_Routing').attr("style","display:none");
			$('.bt_captura').attr("style","display:none");
			$('.bt_print').attr("style","display:none");
			$('.bt_geopdf').attr("style","display:none");
			$('.leaflet-control-mouseposition').attr("style","display:none");
			$('.leaflet-control-scale').attr("style","display:none");
			$('.leaflet-control-minimap').attr("style","display:none");
			activaLlegenda(true);
			if (typeof url('?llegenda') != "string") setTimeout("activaLlegenda(false)", 500);
	 }
	 else if(width>500){
		 $('.leaflet-control-gps').attr("style","display:block");
			$('#dv_bt_Find').attr("style","display:block");
			$('#dv_bt_Routing').attr("style","display:block");
			$('.bt_captura').attr("style","display:block");
			$('.bt_print').attr("style","display:block");
			$('.bt_geopdf').attr("style","display:block");
			$('.leaflet-control-mouseposition').attr("style","display:block");
			$('.leaflet-control-scale').attr("style","display:block");			
			activaLlegenda(true);
			if (typeof url('?llegenda') != "string") setTimeout("activaLlegenda(false)", 500);
	 }
	 	if(typeof url('?embed') == "string" && widthW<=360) {
			$('.bt_llista').attr("style","display:none");
			$('.leaflet-control-layers').attr("style","display:none");
		}
		else if (typeof url('?embed') == "string") {
			$('.bt_llista').attr("style","display:block");
			$('.leaflet-control-layers').attr("style","display:block");
			$('.control-btn-fons').attr("style","display:none");
			activaPanelCapes(false);
		}

	


	var cl = jQuery('.bt_llista span').attr('class');
	if (cl){
		if (cl.indexOf('grisfort') == -1) {
			jQuery('.bt_llista span').removeClass('greenfort');
			jQuery('.bt_llista span').addClass('grisfort');
		}
	}
	
	
	if(estatMapa3D){ActDesOpcionsVista3D(true)};

});

//Funcio per canviar comportament navbar al visor
function changeInitVisor(){
	jQuery('.container').css('width','95%');
	//TODO ver como hacer para no depender del timeout
	if (!isIframeOrEmbed()) setTimeout('activaPanelCapes(false)',3000);
}

function loadWmsVisorSimple(){
	var layer = {
		"url" : url('?urlwms'),
		"servername": url('?layername'),
		"layers" : url('?layername'),
	    "imgFormat": "image/png",
	    "transparency": "true",
	    "version": "1.1.1",
	    "opacity": 1,
	    "epsg": undefined,
		"serverName" : url('?layername'),
		"serverType": t_wms,
		"capesActiva" : "true",
		"capesCalenta" : "false",
		"capesOrdre" :  "1",
		"capesVisibilitat" :  "true",
		"visibilitat": "O",
	    "businessId": "-1"
	};
	loadWmsLayer(layer);
	setMapWMSBoundingBox(layer.url);

}

function setMapWMSBoundingBox(url){

	getWMSLayers(url).then(function(results) {
		//Fem Layer.Layer perq des de el cloudifier sempre tindrem nomes una capa
		var bbox = results.Capability.Layer.Layer.LatLonBoundingBox;
		map.fitBounds([
	       [bbox["@miny"], bbox["@minx"]],
	       [bbox["@maxy"], bbox["@maxx"]]
		]);
	},function(){
		console.error("Error getCapabilities");
		//console.debug(results);
	});

}

function loadVisorSimple(){

	_gaq.push(['_trackPageview']);
	var addDefaultZoomControl = true;//per poder definir si es embed la posicio que jo vull
	if(typeof url('?embed') == "string"){
	      jQuery('#navbar-visor').hide();
	      jQuery('#searchBar').css('top', '0');
	      addDefaultZoomControl = false;
	      _gaq.push(['_trackEvent', 'visor', 'embed']);
	}else{
		_gaq.push(['_trackEvent', 'visor', 'no embed']);

	}

	jQuery("#menu_login").hide();

    //Init MAPA
	map = new L.IM_Map('map', {
	  	zoomAnimation:false,
	    typeMap : 'topoMapGeo',
	        minZoom: 2,
	        maxZoom : 19,
	        zoomControl: addDefaultZoomControl,
	        timeDimension: true,
		    timeDimensionControl: true,
		    timeDimensionControlOptions:{
		    	speedSlider:false
		    }


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

	//Init controls
	initControls();
	var controlFons = new L.IM_controlFons().addTo(map);
	map.topoMapGeo();
	map.setActiveMap(topoMapGeo);
	map.setMapColor("");

	$('meta[name="og:title"]').attr('content', "Mapa  "+ url('?layername')+" cloudifier");
	$('#nomAplicacio').html("Mapa "+ url('?layername')+" cloudifier");
	document.title = "Mapa "+ url('?layername')+" cloudifier";
	jQuery("#mapTitle").html("Mapa  "+ url('?layername')+" cloudifier");


	activaPanelCapes(true);

	//Actualitza idioma dels tooltips
	$("body").on("change-lang", function(event, lang){
		window.lang.change(lang);
		window.lang.run(lang);
		updateLangTooltips();
		updateLangText();
	});
	canviaIdioma(web_determinaIdioma());

	jQuery('#div_loading').hide();
	jQuery(window).trigger('resize');

}

function loadApp(){
	var addDefaultZoomControl = true;//per poder definir si es embed la posicio que jo vull

    if(typeof url('?embed') == "string"){
          jQuery('#navbar-visor').hide();
          jQuery('#searchBar').css('top', '0');
          addDefaultZoomControl = false;
    }

    if(typeof url('?businessid') == "string"){
          map = new L.IM_Map('map', {
        	  	zoomAnimation:false,
                typeMap : 'topoMapGeo',
                minZoom: 2,
                maxZoom : 19,
                zoomControl: addDefaultZoomControl,
                timeDimension: true,
    		    timeDimensionControl: true,
    		    timeDimensionControlOptions:{
    		    	speedSlider:false
    		    }
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
			}else if (results.status == "PRIVAT"){
				//ocultar las pelotas
				jQuery('#div_loading').hide();
				//mostar modal con contraseÃ±a
				loadPasswordModal();
			}else{
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
				else if (url('?mapacolaboratiu') && uidUrl==$.cookie('uid')) {
					//window.location.href = paramUrl.galeriaPage+"?private=1";
					window.location=paramUrl.mapaPage+"?businessid="+url('?businessid')+"&mapacolaboratiu=si";
					
				}
				loadPublicMap(results);
			}
		});
	}


		jQuery('#socialShare_visor').on('click', function(evt){
			//console.debug('on click social');
		});

}

function loadPublicMap(results){
	mapConfig = $.parseJSON(results.results);

	$('meta[name="og:title"]').attr('content', "Mapa "+mapConfig.nomAplicacio);

	var nomUser = mapConfig.entitatUid.split("@");
	var nomEntitat = mapConfig.nomEntitat;
	
	var infoHtml = '';
	
	if (mapConfig.tipusAplicacioId == TIPUS_APLIACIO_GEOLOCAL){
		$.cookie('perfil', 'geolocal', {path:'/'});
		checkUserLogin();
	}else{
		$.cookie('perfil', 'instamaps', {path:'/'});
		checkUserLogin();
	}
	
	if (mapConfig.tipusAplicacioId == TIPUS_APLIACIO_GEOLOCAL) {
		infoHtml += '<div style="color:#ffffff">';
		if (nomEntitat!=undefined) infoHtml +='<p>'+nomEntitat+'</p>';
	}
	else infoHtml += '<p>'+nomUser[0]+'</p>';
	
	
	
	if (mapConfig.options){
		mapConfig.options = $.parseJSON( mapConfig.options );

		var desc=mapConfig.options.description;

		desc==""?desc=mapConfig.nomAplicacio:desc=desc;

		$('meta[name="description"]').attr('content', desc+' - Fet amb InstaMaps.cat');
		$('meta[name="og:description"]').attr('content', desc+' - Fet amb InstaMaps.cat');

		var urlThumbnail = GEOCAT02 + paramUrl.urlgetMapImage+ "&request=getGaleria&update=false&businessid=" + url('?businessid');
		$('meta[name="og:image"]').attr('content', urlThumbnail);

		if (mapConfig.options.description!=undefined) infoHtml += '<p>'+mapConfig.options.description+'</p>';
		if (mapConfig.options.tags!=undefined) infoHtml += '<p>'+mapConfig.options.tags+'</p>';
		
		if (mapConfig.tipusAplicacioId == TIPUS_APLIACIO_GEOLOCAL)  infoHtml += '</div>';
		
		//TODO ver como sacar el mÃ³dulo
		if (mapConfig.tipusAplicacioId == TIPUS_APLIACIO_GEOLOCAL){
			VisorGeolocal.initUi();
			$('.brand-txt').hide();//#496: Traiem "Instamaps" dels visors de Geolocal
			$('.img-circle2-icon').hide();
			//console.debug(mapConfig.options);

			if (mapConfig.options.barColor){
				$('#navbar-visor').css('background-color', mapConfig.options.barColor);
			}

			if (mapConfig.options.textColor){
				$('#navbar-visor').css('color', mapConfig.options.textColor).css('border-color', '#ffffff');
				$('.navbar-brand').css('color', mapConfig.options.textColor);
				$('#mapTitle').css('color', mapConfig.options.textColor);
				$('#mapTitle h3').css('color', '#ffffff');
				$('.navbar-inverse .navbar-nav > li > a').css('color', mapConfig.options.textColor);
				$('#menu_user > a > span').removeClass('green').css('color', mapConfig.options.textColor);
				$('.navbar-form').css('border-color', 'transparent');
				$('.bt-sessio').css('border-color', '#ffffff');
			}

			if (mapConfig.options.fontType){
				$('#navbar-visor').css('font-family', mapConfig.options.fontType);
			}

			if (mapConfig.logo){
				
				$('.escut img').prop('src', '/logos/'+mapConfig.logo);
			}else{
			//	$('.logo_instamaps').hide();
			}
		}else{
			$('.escut').hide();
		}
		$.publish('loadConfig', mapConfig);
		$.subscribe('loadGaEvents', function(e, data){
			loadEventsGa();
		});
	}
	jQuery("#mapTitle").html(mapConfig.nomAplicacio + '<span id="infoMap" lang="ca" class="glyphicon glyphicon-info-sign pop" data-toggle="popover" title="InformaciÃ³" data-lang-title="InformaciÃ³" ></span>');

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
		if (isIframeOrEmbed()){
			activaLlegenda(true);
			if (typeof url('?llegenda') != "string") setTimeout("activaLlegenda(false)", 500);
		}
	});

	mapConfig.newMap = false;
	$('#nomAplicacio').html(mapConfig.nomAplicacio);

	loadMapConfig(mapConfig).then(function(){
		//avisDesarMapa();
		addFuncioDownloadLayer('visor');
		if (isIframeOrEmbed()){
			activaPanelCapes(false);
			var cl = jQuery('.bt_llista span').attr('class');
			if (cl){
				if (cl.indexOf('grisfort') == -1) {
					jQuery('.bt_llista span').removeClass('greenfort');
					jQuery('.bt_llista span').addClass('grisfort');
				}
			}
		}
		else activaPanelCapes(true);
		//Actulitza idioma dels tooltips
		$("body").on("change-lang", function(event, lang){
			window.lang.change(lang);
			window.lang.run(lang);
			updateLangTooltips();
			updateLangText();
		});
		canviaIdioma(web_determinaIdioma());
		document.title = mapConfig.nomAplicacio +" - Mapa";


		var controlFons = new L.IM_controlFons().addTo(map);

		$.publish('loadMap', map);
		
		map.on('moveend',function(e){
      		$.publish('mapMoveend', this);
      	});

		var widthW = $( window ).width();


		var width = $( '#map' ).width();
		var height = $( '#map' ).height();

		if ( typeof url('?embed') == "string"  || width<=400 || height<=350){
			$('.leaflet-control-gps').attr("style","display:none");
			$('#dv_bt_Find').attr("style","display:none");
			$('#dv_bt_Routing').attr("style","display:none");
			$('.bt_captura').attr("style","display:none");
			$('.bt_print').attr("style","display:none");
			$('.bt_geopdf').attr("style","display:none");
			//$('.control-btn-fons').attr("style","display:none");
			$('.leaflet-control-mouseposition').attr("style","display:none");
			$('.leaflet-control-scale').attr("style","display:none");
			$('.leaflet-control-minimap').attr("style","display:none");

			if (typeof url('?embed') == "string" && widthW<=360) {
				$('.bt_llista').attr("style","display:none");
				$('.leaflet-control-layers').attr("style","display:none");
			}
			else if (typeof url('?embed') == "string") {
				$('.bt_llista').attr("style","display:block");
				$('.leaflet-control-layers').attr("style","display:block");
			}
		}
		if(typeof url('?embed') == "string") {
			$('.control-btn-fons').attr("style","display:none");
		}

		//Afegir modul3D
		 addModul3D();
		
	});
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


	// console.info(mapConfig);

	//posem event per controlar visor

	if(mapConfig){

	
	//console.info(mapConfig);
		if(mapConfig.tipusAplicacioId==2){
			//_gaq.push (['_trackEvent', 'visor_entitat', mapConfig.entitatUid, mapConfig.nomAplicacio, 1]);
			_gaq.push (['_trackEvent', 'visor','visor_entitat', mapConfig.nomEntitat, 1]);
		}else{
			_gaq.push (['_trackEvent', 'visor', 'visor_instamaps', mapConfig.entitatUid, 1]);

		}
	}

	
	
	
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

		
		//nou Boto 3D
			var bt3D_2D = jQuery("<div data-toggle=\"tooltip\" class=\"leaflet-bar btn btn-default btn-sm bt_3D_2D\" title=\"Canviar vista\" data-lang-title=\"Canviar vista\"><span class='text3D'>3D</span></div>");
			this._div.appendChild(bt3D_2D[0]);
		
		
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


        	  var urlVisor = 'http://instamaps.cat/geocatweb/visor.html?businessid='+url('?businessid');
        	  if(typeof url('?urlwms') == "string"){
        		  urlVisor = 'http://instamaps.cat/geocatweb/visor.html?urlwms='+url('?urlwms')+'&layername='+url('?layername');
        	  }

            this._div = L.DomUtil.create('div', 'control-linkViewMap');
            this._div.id='div-linkViewMap';
            this._div.title=window.lang.convert('Veure a InstaMaps');
            this._div.innerHTML = '<span id="span-linkViewMap">'+
                                               '<a href="'+urlVisor+'" target="_blank">'+
                                               //window.lang.convert('Veure a InstaMaps')+
                                               '&nbsp;<span class="glyphicon glyphicon-fullscreen grisfort bt-expand"></span>'+
                                               '</a>'+
                                           '</span>';
            return this._div;

          };
          ctr_linkViewMap.addTo(map);
          jQuery('#span-linkViewMap a').on('click', function(event) {
        	  _gaq.push (['_trackEvent', 'visor', 'veure a instamaps', 'label embed', 1]);
          });
          new L.Control.Zoom({ position: 'topleft' }).addTo(map);
    }

    ctr_vistaInicial = L.control({
		position : 'topleft'
	});

	ctr_shareBT = L.control({
		position : 'topleft'
	});

	ctr_findBT = L.control({
		position : 'topleft'
	});

	ctr_routingBT = L.control({
		position : 'topleft'
	});
	
	ctr_vistaInicial.onAdd = function(map) {

		this._div = L.DomUtil.create('div', 'leaflet-bar  btn btn-default btn-sm');
		this._div.id='dv_bt_vistaInicial';
		this._div.title=window.lang.convert('Vista inicial');
		this._div.innerHTML = '<span id="span_bt_vistaInicial" class="fa fa-home grisfort"></span>';
		return this._div;
	};
	ctr_vistaInicial.addTo(map);
	
	var titleGPS = window.lang.convert('Centrar mapa a la seva ubicaciÃ³');
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

	ctr_routingBT.onAdd = function(map) {

		this._div = L.DomUtil.create('div', 'leaflet-bar  btn btn-default btn-sm');
		this._div.id='dv_bt_Routing';
		this._div.title=window.lang.convert('Routing');
		//this._div.innerHTML = '<span id="span_bt_Routing" class="fa fa-exchange fa-rotate-90 grisfort"></span>';
		var html ='<span id="span_bt_Routing" class="t" style="font-size:16px; margin-top:-2px;">'+
		'<i class="t-square-rounded grisfort" style="-webkit-transform:scale(1.25) scale(0.65) rotate(45deg);-moz-transform:scale(1.25) scale(0.65) rotate(45deg);transform:scale(1.25) scale(0.65) rotate(45deg)"></i>'+
		'<i class="t-turn-90-l t-c-white" style="-webkit-transform:scale(-1.3, 1.3);-moz-transform:scale(-1.3, 1.3);transform:scale(-1.3, 1.3)"></i>'+
		'</span>';
		this._div.innerHTML = html;
		return this._div;
	};
	ctr_routingBT.addTo(map);

	jQuery('.div_barrabotons .leaflet-bar').tooltip({
		placement : 'left',
		container : 'body'
	});

	dfd.resolve();
	return dfd.promise();
}


function addClicksInici() {


	//jQuery('.bt_legend').on('click', function(event) {

	jQuery(document).on('click','.bt_legend', function(event) {

		aturaClick(event);
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
	if (cl){
		if (cl.indexOf('grisfort') != -1) {
			jQuery('.bt_llista span').removeClass('grisfort');
			jQuery('.bt_llista span').addClass('greenfort');
		} else {
			jQuery('.bt_llista span').removeClass('greenfort');
			jQuery('.bt_llista span').addClass('grisfort');
		}
	}



}

//function activaLlegenda(obre) {
//
//	var cl = jQuery('.bt_legend span').attr('class');
//	if (cl && cl.indexOf('grisfort') != -1) {
//		jQuery('.bt_legend span').removeClass('grisfort');
//		jQuery('.bt_legend span').addClass('greenfort');
//		$(".bt_legend").transition({ x: '0px', y: '0px',easing: 'in', duration: 500 });
//		$(".visor-legend").transition({ x: '0px', y: '0px',easing: 'in', opacity: 1,duration: 500 });
//	} else {
//		jQuery('.bt_legend span').removeClass('greenfort');
//		jQuery('.bt_legend span').addClass('grisfort');
//		var height = $(".visor-legend").height();
//		var y1 = $(".visor-legend").height() - 20;
//		var y2 = $(".visor-legend").height() +50;
//
//		$(".bt_legend").transition({ x: '225px', y: y1+'px',duration: 500 });
//		$(".visor-legend").transition({ x: '250px', y: y2+'px',  opacity: 0.1,duration: 500 });
//	}
//
//}


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

function createButton(label, container) {
    var btn = L.DomUtil.create('button', '', container);
    btn.setAttribute('type', 'button');
    btn.setAttribute('title','Ruta inversa');
    btn.innerHTML = label;
    return btn;
}

function createSpan(label, container) {
    var span = L.DomUtil.create('span', '', container);
    span.innerHTML = label;
    return span;
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

	jQuery("#dv_bt_Routing").on('click',function(e){

		posaClassActiu('#span_bt_Routing');

		if ($('.leaflet-routing-container').is(':visible')) {
			map.off('click',routingPopup);
			route.removeFrom(map);
		}
		else {
			_gaq.push(['_trackEvent', 'visor', tipus_user+'routing', 'label routing', 1]);
			map.on('click', routingPopup);
			route.addTo(map);
			$('.leaflet-routing-geocoders').before( '<div class="div-routing-title"><span lang="ca" class="routing-title">CÃ lcul de rutes</span>&nbsp;<a href="http://www.liedman.net/leaflet-routing-machine/" target="_blank" class="div-routing-title" style="display:inline;"><span class="glyphicon glyphicon-info-sign white" style="font-size:14px;"></a></div>' );
			$('.leaflet-routing-add-waypoint').attr('title','Afegir punts');
		}

		jQuery('.leaflet-routing-container').css('top', '170px');
		jQuery('.leaflet-routing-container').css('left', '45px');
		jQuery('.leaflet-routing-container').css('position','absolute');
		jQuery('.leaflet-routing-container').css('z-index','100');

		aturaClick(e);

	});
	
	jQuery("#dv_bt_vistaInicial").on('click',function(e){
		if (mapConfig.options.bbox){
			var bbox = mapConfig.options.bbox.split(",");
			var southWest = L.latLng(bbox[1], bbox[0]);
		    var northEast = L.latLng(bbox[3], bbox[2]);
		    var bounds = L.latLngBounds(southWest, northEast);
			map.fitBounds( bounds );
		}
		else if (mapConfig.options.center){
			var opcenter = mapConfig.options.center.split(",");
			map.setView(L.latLng(opcenter[0], opcenter[1]), mapConfig.options.zoom);
		}
		aturaClick(e);
	});
}

function routingPopup(e) {

		var container ='<div id="contentRoutingPopup">';

	    container +='<h4 style="border-bottom:0px;">CÃ lcul de rutes</h4>';
	    container +='<button class="btn" title="Ruta inversa" type="button" id="startBtn">Defineix com a origen</button>'+
	    	'<span class="awesome-marker-icon-green awesome-marker leaflet-zoom-hide leaflet-clickable leaflet-marker-draggable" id="icona-origen" style="position:relative;float:right;margin-top:-5px;"></span>'+
	    	'<button class="btn" title="Ruta inversa" type="button" id="destBtn" style="margin-top:10px;width:152px">Defineix com a destÃ­</button>'+
	    	'<span class="awesome-marker-icon-red awesome-marker leaflet-zoom-hide leaflet-clickable leaflet-marker-draggable" id="icona-desti" style="position:relative;float:right;margin-top:-35px;"></span>';
	    container += "</div>";

	    L.popup()
	        .setContent(container)
	        .setLatLng(e.latlng)
	        .openOn(map);

		jQuery(".leaflet-popup-content").css('width','184px');
		jQuery(".leaflet-popup-content").css('margin','5px 15px');

	    jQuery('#startBtn').on('click', function() {
	    	route.spliceWaypoints(0, 1, e.latlng);
	    	map.closePopup();
	    });

	    jQuery('#destBtn').on('click', function() {
	        route.spliceWaypoints(route.getWaypoints().length - 1, 1, e.latlng);
	        map.closePopup();
	    });

	    jQuery('#icona-origen').on('click', function() {
	    	route.spliceWaypoints(0, 1, e.latlng);
	    	map.closePopup();
	    });

	    jQuery('#icona-desti').on('click', function() {
	        route.spliceWaypoints(route.getWaypoints().length - 1, 1, e.latlng);
	        map.closePopup();
	    });

}

function loadMapConfig(mapConfig){
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
				}else if (fons == 'colorMap') {
					map.colorMap(mapConfig.options.fonsColor);
				}else if (fons == 'naturalMap') {
					map.naturalMap();
				}else if (fons == 'divadminMap') {
					map.divadminMap();
				}
				map.setActiveMap(mapConfig.options.fons);
				map.setMapColor(mapConfig.options.fonsColor);
				//map.gestionaFons();
			//}

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
		//TODO parsear las options y el group y dejarlo en json.
		//TODO quitar el parse de cada tipo de capa.
		if(value.options && value.capesGroup){
			//var options = JSON.parse(value.options);
			var options;
			if(typeof (value.options)=="string"){
				try {
					options = JSON.parse(value.options);
				}
				catch (err) {
					options = value.options;
				}

			}else{

				options = value.options;
			}

			var group = JSON.parse(value.capesGroup);
			options.group = group;
			value.options = JSON.stringify(options);
		}
		if(value.capesOrdre == capesOrdre_sublayer){
			layer_map.sublayers.push(value);
			lsublayers.push(value);
		}else{
			layer_map.origen.push(value);
		}
	});


//NOu
	jQuery.each(layer_map.origen, function(index, value){

		var jsonOptions;
		if(typeof (value.options)=="string"){

			try {
				jsonOptions = JSON.parse(value.options);
			}
			catch (err) {
				jsonOptions = value.options;
			}
		}else{

			jsonOptions = value.options;
		}

		if(jsonOptions && jsonOptions.group){
			controlCapes._addGroupFromObject(jsonOptions.group);
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
		loadURLfileLayer(value).then(function(){
			defer.resolve();
		});
	//Si la capa es de tipus dades obertes
	}else if(value.serverType == t_geojsonvt){
		//console.debug(loadGeojsonvtLayer);
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
	else if(value.serverType == tem_heatmap_wms || value.serverType == tem_cluster_wms){
		loadVisualitzacioWmsLayerSenseUtfGrid(value);
		defer.resolve();
	}

	return defer.promise();
}

function loadPasswordModal(){
	jQuery('#dialog_password').modal('show');

	jQuery('#dialog_password .btn-primary').on('click',function(){
		var clau = jQuery.trim(jQuery('#inputPassword').val());
		if(clau == ""){
			jQuery('#password_msg').removeClass('hide');
		}else{
			jQuery('#password_msg').addClass('hide');
			var data = {
				clauVisor: clau,
				businessId: url('?businessid')
			};
			loadPrivateMapByBusinessId(data).then(function(results){
				if(results.status == "ERROR"){
					jQuery('#password_msg').removeClass('hide');
				}else{
					jQuery('#password_msg').addClass('hide');
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
					else if (url('?mapacolaboratiu') && uidUrl==$.cookie('uid')) {
						//window.location.href = paramUrl.galeriaPage+"?private=1";
						window.location=paramUrl.mapaPage+"?businessid="+url('?businessid')+"&mapacolaboratiu=si";
						
					}
					loadPublicMap(results);
					jQuery('#dialog_password').modal('hide');
				}
			});
		}
	});

}

function loadRouteControl(){
	var marker_style_origen = {
			icon : '',
			markerColor : 'green',
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
			fillColor :"transparent"
		};
	var puntOrigen= L.AwesomeMarkers.icon(marker_style_origen);

	var marker_style_desti = {
			icon : '',
			markerColor : 'red',
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
			fillColor :"transparent"
		};
	var puntDesti= L.AwesomeMarkers.icon(marker_style_desti);

	var marker_style_intermig = {
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
			fillColor :"transparent"
		};
	var puntIntermig= L.AwesomeMarkers.icon(marker_style_intermig);

	var lang=web_determinaIdioma();

	var ReversablePlan = L.Routing.Plan.extend({
	    createGeocoders: function() {
	        var container = L.Routing.Plan.prototype.createGeocoders.call(this),
	            reverseButton = createButton('<span class="glyphicon glyphicon-sort" style="font-size:14px;"></span>', container);
	        L.DomEvent.on(reverseButton, 'click', function() {
	            var waypoints = this.getWaypoints();
	            this.setWaypoints(waypoints.reverse());
	        }, this);
	        return container;
	    }
	});


	plan = new ReversablePlan([], {
        geocoder: L.Control.Geocoder.icgc(),
        routeWhileDragging: true,
        language: lang,
        createMarker: function(i, wp) {
        	if(i == 0){
        		return L.marker(wp.latLng, {
    				draggable: true,
    				icon: puntOrigen
    			});
        	}
        	else if (i==route.getWaypoints().length - 1){
        		return L.marker(wp.latLng, {
    				draggable: true,
    				icon: puntDesti
    			});
        	}
        	else {
        		return L.marker(wp.latLng, {
    				draggable: true,
    				icon: puntIntermig
    			});
        	}

    		}}),
	route = L.Routing.control({
	         routeWhileDragging: true,
	         plan: plan,
	         position: 'topleft',
			     language: lang,
			     showAlternatives: true,
			     lineOptions: {
		            styles: [
		              {color: '#00B3FD', opacity: 1, weight: 4},
		            ]
		           },
		         altLineOptions:{
		        	styles: [
		     	      {color: 'black', opacity: 1, weight: 2},
		     	    ]
		         }
	});

	//map.on('click', routingPopup);
}

function isIframeOrEmbed(){
	var width = $( '#map' ).width();
	var height = $( '#map' ).height();

	if ((width<=640 && height<=428) || typeof url('?embed') == "string"){
		return true;
	}
	else return false;

}

function loadEventsGa(){
	if(typeof url('?embed') == "string"){
        _gaq.push (['_trackEvent', 'visor', 'embed']);
    }else{
    	_gaq.push (['_trackEvent', 'visor', 'no embed']);
    }
}
