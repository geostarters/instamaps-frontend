
jQuery(document).ready(function() {
	if(typeof url('?uid') == "string"){
		gestioCookie();
		$.removeCookie('uid', { path: '/' });
		$.cookie('uid', url('?uid'), {path:'/'});
		checkUserLogin();
	}
	
	if(!$.cookie('uid') || $.cookie('uid').indexOf('random')!=-1){
		tipus_user = t_user_random;
	}else{
		tipus_user = t_user_loginat;
	}	
	
	if (!Modernizr.canvas  || !Modernizr.sandbox){
		//jQuery("#mapaFond").show();
		
	}else{
		$("body").on("change-lang", function(event, lang){
			addToolTipsInici();
		});
		
		if (tipus_user == t_user_loginat){
			var data = {
					uid: $.cookie('uid')
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
			typeMap : 'topoMap',
			minZoom: 2,
			maxZoom : 19,
			//drawControl: true
		}).setView([ 41.431, 1.8580 ], 8);
		
		L.control.mousePosition({
			position : 'bottomright', 
			'emptystring':'',
			'numDigits': 6,
			'prefix': 'WGS84',
			'separator': ' '
		}).addTo(map);
		
		L.control.scale({position : 'bottomright', 'metric':true,'imperial':false}).addTo(map);
		
		var _minTopo=new L.TileLayer(URL_MQ, {minZoom: 0, maxZoom: 19, subdomains:subDomains});
		var miniMap = new L.Control.MiniMap(_minTopo, { toggleDisplay: true, autoToggleDisplay: true}).addTo(map);	
		
		//iniciamos los controles
		initControls();
	
		gestioCookie('loadApp');
				
		var data = {
			businessId: url('?businessid'),
			uid: $.cookie('uid')
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
					
					gestioCookie('diferentUser');
										
					document.title = "InstaMaps: "+mapConfig.nomAplicacio;
					
					if (mapConfig.options){
						mapConfig.options = $.parseJSON( mapConfig.options );
						$('meta[name=description]').attr('content', mapConfig.options.description);
					}
					
					mapLegend = (mapConfig.legend? $.parseJSON( mapConfig.legend):[]);
//					addLegend();
//					$("#mapLegend").mCustomScrollbar();
					mapConfig.newMap = false;
					$('#nomAplicacio').html(mapConfig.nomAplicacio);
					
					loadMapConfig(mapConfig).then(function(){
						
						$('#nomAplicacio').editable({
							type: 'text',
							mode: 'inline',
						    validate: function(value) {
						        if($.trim(value) == '') {
						        	return {newValue: this.innerHTML};
						        }
					        },		
							success: function(response, newValue) {
								var data = {
								 	businessId: url('?businessid'), 
								 	nom: newValue, 
								 	uid: $.cookie('uid')
								}
								updateMapName(data).then(function(results){
									_gaq.push(['_trackEvent', 'mapa', tipus_user+'editar nom aplicacio', 'label editar nom', 1]);
									if(results.status=='OK'){
										$('#dialgo_publicar #nomAplicacioPub').val(results.results);
										mapConfig.nomAplicacio = results.results;
									} 
								},function(results){
									$('#nomAplicacio').val(mapConfig.nomAplicacio);				
								});	
							}
						});	
					});
				}catch(err){
					gestioCookie('loadMapConfig');
				}
			}
		},function(results){
			gestioCookie('getMapByBusinessIdError');
		});
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
	
	//Si la capa conté polígons no es podrà descarregar en format GPX
	$('#modal_download_layer').on('show.bs.modal', function (e) {
		  if(download_layer.layer.options.geometryType 
				  && download_layer.layer.options.geometryType==t_polygon){
			  $("#select-download-format option[value='GPX#.gpx']").attr('disabled','disabled');	
		  }else{
			  $("#select-download-format option[value='GPX#.gpx']").removeAttr('disabled');
		  }
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
		var layer_GeoJSON = download_layer.layer.toGeoJSONcustom();
		for(var i=0;i<layer_GeoJSON.features.length;i++){
			layer_GeoJSON.features[i].properties.tipus = "downloaded";
		}

		var data = {
			cmb_formatOUT: formatOUT,
			cmb_epsgOUT: epsgOUT,
			layer_name: filename,
			fileIN: JSON.stringify(layer_GeoJSON)
		};
		
		_gaq.push(['_trackEvent', 'mapa', tipus_user+'descarregar capa', formatOUT+"-"+epsgOUT, 1]);
		getDownloadLayer(data).then(function(results){
			results = results.trim();
			if (results == "ERROR"){
				//alert("Error 1");
				$('#modal-body-download-error').show();
				$('#modal-body-download').hide();
				$('#modal_download_layer .modal-footer').hide();
				$('#modal_download_layer').modal('show');
			}else{
				window.open(GEOCAT02+results,'_blank');
			}
		},function(results){
			$('#modal-body-download-error').show();
			$('#modal-body-download').hide();
			$('#modal_download_layer .modal-footer').hide();
			$('#modal_download_layer').modal('show');
		});
		
	});
	
	$('#dialog_delete_capa .btn-danger').on('click', function(event){
		var $this = $(this);
		var data = $this.data("data");
		var obj = $this.data("obj");
		
			removeServerToMap(data).then(function(results){
			if(results.status==='OK'){
			
//				this.myRemoveLayer(obj);
				map.closePopup();
				map.removeLayer(obj.layer);
				//Eliminem la capa de controlCapes
				controlCapes.removeLayer(obj);
				
				//actualitzem valors zindex de la resta si no es sublayer
				if(!obj.sublayer){
					var removeZIndex = obj.layer.options.zIndex;
					controlCapes._lastZIndex--;
					var aux = controlCapes._layers;
					for (var i in aux) {
						if (aux[i].layer.options.zIndex > removeZIndex) aux[i].layer.options.zIndex--;
					}
					//Eliminem les seves sublayers en cas que tingui
					for(indexSublayer in obj._layers){
						map.removeLayer(map._layers[indexSublayer]);
					}
				}

				//Actualitzem capaUsrActiva
				if(capaUsrActiva!=null && capaUsrActiva.options.businessId == obj.layer.options.businessId){
					capaUsrActiva.removeEventListener('layeradd');
					capaUsrActiva = null;
				}				
				
				deleteServerRemoved(data).then(function(results){
					//se borran del listado de servidores
				});
			}else{
				return;//SI no ha anat be el canvi a BD. que no es faci tampoc a client, i es mostri un error
			}				
		},function(results){
			return;//SI no ha anat be el canvi a BD. que no es faci tampoc a client, i es mostri un error
		});	
	});
		
	jQuery('#dialog_tematic_rangs .btn-success').on('click',function(e){
		createTematicLayerCategories();
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

function initControls(){
	
	addControlsInici();
	addClicksInici();
	addToolTipsInici();
	tradueixMenusToolbar();
	redimensioMapa();	
	
	//Funcionalitat hill shading
	addControlHillShading();
	
	//Funcionalitat fons mapes
	addOpcionsFonsMapes();
	creaPopOverMesFonsColor();
	creaPopOverMesFons();
	
	//Funcionalitat de tematics
	initButtonsTematic();
	addDialegEstilsTematics();	

	//Funcionalitat dragdrop i carrega fitxers
	creaAreesDragDropFiles();
	addCarregaFitxers();
	
	//Funcionalitat de dibuixar feature
	addDrawToolbar();
	activaEdicioUsuari();
	addDialegEstilsDraw();
	
	//Funcionalitat cerca
	addControlCercaEdit();

	//carrega font de dades
	generaLListaDadesObertes();
	generaLlistaServeisWMS();
	
	//Funcionalitat afegir altres fonts de dades
	addControlAltresFontsDades();

	//Funcionalitat carrega capes del usuari, si esta loginat
	if ($.cookie('uid')){
		var data = {uid: $.cookie('uid')};
		carregaDadesUsuari(data);
	}
	
	//Funcionalitat publicar mapa
	addControlPublicar();
	
	//Funcionalitat compartir mapa
	addCompartirMapa();
}

function addClicksInici() {
	
	jQuery('.bt_llista').on('click', function() {
		activaPanelCapes();
	});
	
	// new vic
	jQuery('.bt_captura').on('click', function() {
		_gaq.push(['_trackEvent', 'mapa', tipus_user+'captura pantalla', 'label captura', 1]);
		capturaPantalla('captura');
	});
	
	jQuery('.bt_print').on('click', function() {
		_gaq.push(['_trackEvent', 'mapa', tipus_user+'print', 'label print', 1]);
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

function addControlsInici() {
	
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
	$('.div_gr3_fons div').tooltip(optB);
	$('.div_gr2 div').tooltip(optB);
	$('.add_costat_r').tooltip(opt);
	$('.taronja').tooltip(opt);
	$('.white').tooltip(opt);
	$('#div_punt').tooltip(optB);
	$('#div_linia').tooltip(optB);
	$('#div_area').tooltip(optB);
	
	//cercador
	jQuery(".leaflet-control-search .search-button, .glyphicon-search").attr('title',window.lang.convert('Cercar llocs a Catalunya ...'));
	jQuery(".leaflet-control-search .search-input").attr('placeholder',window.lang.convert('Cercar llocs a Catalunya ...'));
	
}

function addDialegEstilsTematics(){
	jQuery('#dialog_estils_punts .btn-success').on('click',function(e){
		e.stopImmediatePropagation();
		if(objEdicio.obroModalFrom==from_creaCapa){
			jQuery('#div_punt').removeClass();
			jQuery('#div_punt').addClass(jQuery('#div_punt0').attr('class'));
			jQuery('#div_punt').css('font-size',jQuery('#div_punt0').css('font-size'));
			jQuery('#div_punt').css('width',jQuery('#div_punt0').css('width'));
			jQuery('#div_punt').css('height',jQuery('#div_punt0').css('height'));
			jQuery('#div_punt').css('color',estilP.colorGlif);			
			jQuery('#div_punt').css('background-color',estilP.divColor);	
			changeDefaultPointStyle(estilP);
			
		}else if (objEdicio.obroModalFrom==from_creaPopup){
			var cvStyle=changeDefaultPointStyle(estilP);
			var feature=map._layers[objEdicio.featureID];
			var capaMare=map._layers[feature.properties.capaLeafletId];
			canviaStyleSinglePoint(cvStyle,feature,capaMare,true);
			getRangsFromLayer(capaMare);
			
		}else if (objEdicio.obroModalFrom.from==tem_simple){
			var cvStyle=changeDefaultPointStyle(estilP);
			createTematicLayerBasic(objEdicio.obroModalFrom, cvStyle);
			
		}else if (objEdicio.obroModalFrom.from==tem_clasic){
			//TODO
		}else{
			console.debug(objEdicio.obroModalFrom);
		}	
		jQuery('#dialog_estils_punts').modal('toggle');				
	});
	
	jQuery('#dialog_estils_linies .btn-success').on('click',function(){		
		if(objEdicio.obroModalFrom==from_creaCapa){
			addGeometryInitL(document.getElementById("cv_linia")); 		
			//changeDefaultVectorStyle(canvas_linia);
			changeDefaultLineStyle(canvas_linia);
		}else if (objEdicio.obroModalFrom==from_creaPopup){
			var feature=map._layers[objEdicio.featureID];
			var capaMare=map._layers[feature.properties.capaLeafletId];
			map._layers[objEdicio.featureID].setStyle(changeDefaultLineStyle(canvas_linia));
			getRangsFromLayer(capaMare);
		}else if (objEdicio.obroModalFrom.from==tem_simple){
			createTematicLayerBasic(objEdicio.obroModalFrom, changeDefaultLineStyle(canvas_linia));
		}else if (objEdicio.obroModalFrom.from==tem_clasic){
			//TODO
		}else{
			console.debug(objEdicio.obroModalFrom);
		}
		jQuery('#dialog_estils_linies').modal('toggle');			
	});
	
	jQuery('#dialog_estils_arees .btn-success').on('click',function(){		
		if(objEdicio.obroModalFrom==from_creaCapa){
			addGeometryInitP(document.getElementById("cv_pol"));  
			//changeDefaultVectorStyle(canvas_pol);
			changeDefaultAreaStyle(canvas_pol);
		}else if (objEdicio.obroModalFrom==from_creaPopup){
			var feature=map._layers[objEdicio.featureID];
			var capaMare=map._layers[feature.properties.capaLeafletId];
			map._layers[objEdicio.featureID].setStyle(changeDefaultAreaStyle(canvas_pol));
			getRangsFromLayer(capaMare);
		}else if (objEdicio.obroModalFrom.from==tem_simple){
			createTematicLayerBasic(objEdicio.obroModalFrom, changeDefaultAreaStyle(canvas_pol));
		}else if (objEdicio.obroModalFrom.from==tem_clasic){
			//TODO
			/*
			console.debug(objEdicio.obroModalFrom);
			jQuery('#dialog_tematic_rangs').modal('show');
			console.debug(canvas_pol);
			addGeometryInitPRang(objEdicio.obroModalFrom.element, changeDefaultAreaStyle(canvas_pol));
			*/
		}else{
			console.debug(objEdicio.obroModalFrom);
		}
		jQuery('#dialog_estils_arees').modal('toggle');				
	});
	
	jQuery('#dialog_estils_punts .btn-default').on('click',function(){			
		jQuery('#dialog_estils_punts').modal('toggle');
	})
	
	var hihaGlif=false;	
	
	jQuery(document).on('click', "#div_puntZ", function(e) {
		activaPuntZ();	
	});
	
	jQuery(document).on('click', "#div_puntM", function(e) {
		activaPuntM(rgb2hex($('#dv_fill_color_marker').css( "background-color")));	
	});	
		
	jQuery(document).on('change','#cmb_mida_Punt', function(e) { 
		if(!jQuery('#div_puntZ').hasClass("estil_selected")){
			activaPuntZ();
		}
		else{
			jQuery('#div_punt0').css('width',this.value+"px");
			jQuery('#div_punt0').css('height',this.value+"px");
			jQuery('#div_punt0').css('font-size',(this.value/2)+"px");
			estilP.fontsize=(this.value/2)+"px";
			estilP.size=this.value;
		}
	    jQuery('#div_punt9').css('width',this.value+"px");
		jQuery('#div_punt9').css('height',this.value+"px");
		jQuery('#div_punt9').css('font-size',(this.value/2)+"px");
	});
	
	jQuery(document).on('click', ".bs-glyphicons li", function(e) {
		jQuery(".bs-glyphicons li").removeClass("estil_selected");
		jQuery('#div_punt0').removeClass();
		estilP.iconGlif=jQuery('span', this).attr('class');
		jQuery('#div_punt0').addClass(estilP.iconFons+" "+estilP.iconGlif);
		jQuery(this).addClass("estil_selected");
	});
}

function loadMapConfig(mapConfig){
	//console.debug(mapConfig);
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
					gestionaPopOver(this);
					map.colorMap(mapConfig.options.fonsColor);
				} else if (fons == 'historicMap') {
					map.historicMap();
				}
				map.setActiveMap(mapConfig.options.fons);
				map.setMapColor(mapConfig.options.fonsColor);
				//map.gestionaFons();
			}
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
	
	$('.make-switch').bootstrapSwitch();
	
	//Configurar Llegenda
	$('input[name="my-legend-checkbox"]').on('switchChange.bootstrapSwitch', function(event, state) {
		if(state.value == true) {
			createModalConfigLegend();
		}else{
			$('#dialgo_publicar .modal-body .modal-legend').hide();
		}
	});
	
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
//		loadURLfileLayer(value).then(function(){
//			defer.resolve();
//		});	
		loadURLfileLayer(value);
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
				window.location = paramUrl.mapaPage+"?businessid="+mapConfig.businessId;
			}catch(err){
				gestioCookie('createMap');
			}
		}
	});
}

function activaPuntZ(){
//	jQuery(".bs-punts li").removeClass("estil_selected");
	jQuery('#div_puntM').removeClass("estil_selected");
	jQuery('#div_puntZ').addClass("estil_selected");
	estilP.iconFons=jQuery('#div_punt9').attr('class');
	jQuery('#div_punt0').removeClass();
	jQuery('#div_punt0').addClass(estilP.iconFons+" "+estilP.iconGlif);
	
	var vv=jQuery('#cmb_mida_Punt').val();
	jQuery('#div_punt0').css('width',vv+'px');
	jQuery('#div_punt0').css('height',vv+'px');
	jQuery('#div_punt0').css('font-size',(vv/2)+"px");
//	jQuery('#div_punt0').css('background-color',jQuery('fill_color_punt').css('background-color'));
	estilP.divColor=rgb2hex(jQuery('.fill_color_punt').css('background-color'));
	jQuery('#div_punt0').css('background-color',estilP.divColor);
	estilP.fontsize=(vv/2)+"px";
	estilP.size=vv;	
}

function activaPuntM(color){
	jQuery("#div_puntZ").removeClass("estil_selected");
	jQuery('#div_punt0').removeClass();
	jQuery('#div_puntM').addClass("estil_selected");
	
	jQuery('#div_punt_1').removeClass().addClass('awesome-marker-web awesome-marker-icon-'+getClassFromColor(color));
	
	estilP.iconFons='awesome-marker-web awesome-marker-icon-'+getClassFromColor(color);
	jQuery('#div_punt0').addClass(estilP.iconFons+" "+estilP.iconGlif);
	jQuery(this).addClass("estil_selected");	
	jQuery('#dv_cmb_punt').hide();
	jQuery('#div_punt0').css('width','28px');
	jQuery('#div_punt0').css('height','42px');	
	jQuery('#div_punt0').css('font-size',"14px");
	estilP.divColor='transparent';
	jQuery('#div_punt0').css('background-color',estilP.divColor);
	estilP.fontsize="14px";	
}

//Retorna la classe associada al marker, segons el color sel.leccionat a la paleta
function getClassFromColor(color){
	switch (color)
	{
		case '#ffc500':
		  return 'orange';
		case '#ff7f0b':
		  return 'darkorange';
		case '#ff4b3a':
		  return 'red';
		case '#ae59b9':
		  return 'purple';	
		case '#00afb5':
		  return 'blue';
		case '#7cbd00':
		  return 'green';
		case '#90a6a9':
		  return 'darkgray';
		case '#ebf0f1':
		  return 'gray';		  
		 default:
			 return 'orange';
	} 		
}

/**
 * Funcionalitat edicio noms
 * */

function updateEditableElements(){
	//console.debug('updateEditableElements');
	$('.leaflet-name .editable').editable({
		type: 'text',
		mode: 'inline',
	    validate: function(value) {
		        if($.trim(value) == '') {
		        	return {newValue: this.innerHTML};
		        }
	    },
		success: function(response, newValue) {
				map.closePopup();//Perque no queden desactualitzats
				var id = this.id;
				var idParent = this.idParent;
				//Controlem si es sublayer
				var editableLayer;
				if(idParent){
					editableLayer = controlCapes._layers[this.idParent]._layers[this.id];
				}else{
					editableLayer = controlCapes._layers[this.id];
				}
				
				if(typeof url('?businessid') == "string"){
					var data = {
					 	businessId: editableLayer.layer.options.businessId, //url('?businessid') 
					 	uid: $.cookie('uid'),
					 	serverName: newValue
					 }
					var oldName = this.innerHTML;
					
					updateServidorWMSName(data).then(function(results){
						if(results.status==='OK'){
						_gaq.push(['_trackEvent', 'mapa', tipus_user+'editar nom capa', 'label editar nom', 1]);
//						console.debug('udpate map name OK');
						editableLayer.name = newValue;
						editableLayer.layer.options.nom = newValue;
					}else{
						editableLayer.name = oldName;
						$('.leaflet-name label span#'+id).text(results.results.nom);
					}				
				},function(results){
					editableLayer.name = oldName;
					var obj = $('.leaflet-name label span#'+id).text();
					$('.leaflet-name label span#'+id).text(oldName);
				});	
			}else{
				editableLayer.name = newValue;
				editableLayer.layer.options.nom = newValue;
			}		
	 }
	});
	
    $('.leaflet-name .editable').on('shown', function(e, editable) {
        console.debug('shown editable:'+editable);
        jQuery('.opcio-conf').hide();
        jQuery('.subopcio-conf').hide();
    });
    $('.leaflet-name .editable').on('hidden', function(e, editable) {
    	console.debug('hidden editable:'+editable);
        jQuery('.opcio-conf').show();
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

