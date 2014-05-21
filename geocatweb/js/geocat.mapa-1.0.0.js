var map, controlCapes;
var factorH = 50;
var factorW = 0;
var _htmlDadesObertes = [];
var capaUsrPunt, capaUsrLine, capaUsrPol,capaUsrActiva;
var mapConfig = {};
var dades1;
var capaDadaOberta;
var initMevesDades = false;
var download_layer;
var lsublayers = [];
var tipus_user;
//Arrays control elements repetits a la llegenda
var controlLegendPoint = [];//Boles
var controlLegendMarker = [];//Pintxos
var controlLegendLine = [];
var controlLegendPol = [];
var mapLegend = {};


var estilP={
	iconFons:'awesome-marker-web awesome-marker-icon-orange',
	iconGlif:'fa fa-',
	colorGlif:'#333333',
	fontsize:'14px',
	size:'28'
};
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
    fillColor: hexToRgb('#FFC400'),
    borderColor: '#FFC400',
    borderWidth: '3',
    fillOpacity: 0.5
};
var default_marker_style = {
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
var default_circulo_style = {
	isCanvas:true,
	simbolSize: 6,
	borderWidth: 2,
	opacity: 90,
	borderColor : "#ffffff",
	color :"#FFC500",
	lineWidth: 3,
};
var default_circuloglyphon_style = {
	icon : '',
	markerColor: 'punt_r',
	prefix : 'fa',
	divColor:'transparent',
	iconAnchor : new L.Point(15, 15),
	iconSize : new L.Point(30, 30),
	iconColor : '#000000',
	isCanvas:false,
	radius:6,
	opacity:1,
	weight : 2,
	fillOpacity : 0.9,
	color : "#ffffff",
	fillColor :"#FFC500"	
};
var opt = {
	placement : 'right',
	container : 'body'
};
var optB = {
	placement : 'bottom',
	container : 'body'
};

jQuery(document).ready(function() {
	if(!$.cookie('uid') || $.cookie('uid').indexOf('random')!=-1){
		tipus_user = t_user_random;
	}else{
		tipus_user = t_user_loginat;
	}	
	
	if (!Modernizr.canvas ){
		//jQuery("#mapaFond").show();
		
	}else{
		$("body").on("change-lang", function(event, lang){
			addToolTipsInici();
		});
		
		loadApp();
	}
}); // Final document ready

function loadApp(){
	if(typeof url('?uid') == "string"){
		gestioCookie();
		$.removeCookie('uid', { path: '/' });
		$.cookie('uid', url('?uid'), {path:'/'});
	}
	
	if(typeof url('?businessid') == "string"){
		map = new L.IM_Map('map', {
			typeMap : 'topoMap',
			minZoom: 2,
			maxZoom : 19,
			//drawControl: true
		}).setView([ 41.431, 1.8580 ], 8);
		
		var _minTopo=new L.TileLayer(URL_MQ, {minZoom: 0, maxZoom: 19, subdomains:subDomains});
		var miniMap = new L.Control.MiniMap(_minTopo, { toggleDisplay: true, autoToggleDisplay: true}).addTo(map);	
		
		L.control.mousePosition({
			'emptystring':'',
			'numDigits': 6,
			'prefix': 'WGS84',
			'separator': ' '
		}).addTo(map);
		
		L.control.scale({'metric':true,'imperial':false}).addTo(map);
				
		
		//iniciamos los controles
		initControls();
	
		gestioCookie('loadApp');
				
		var data = {
			businessId: url('?businessid'),
			uid: $.cookie('uid')
		};
		
		getMapByBusinessId(data).then(function(results){
			if (results.status == "ERROR"){
				gestioCookie('getMapByBusinessId');
			}else{
				try{
					mapConfig = results.results;
					
					gestioCookie('diferentUser');
										
					mapConfig.options = $.parseJSON( mapConfig.options );
					mapLegend = (mapConfig.legend? $.parseJSON( mapConfig.legend):[]);
//					addLegend();
//					$("#mapLegend").mCustomScrollbar();
					mapConfig.newMap = false;
					$('#nomAplicacio').html(mapConfig.nomAplicacio);
					
					loadMapConfig(mapConfig).then(function(){
						//avisDesarMapa();
						if (isRandomUser($.cookie('uid'))){
							jQuery(window).on('beforeunload',function(event){
								return 'Are you sure you want to leave?';
							});
						}
						
//						//Per defecte que es mostri la primera capa a la llegenda
//						jQuery.each(controlCapes._layers, function(i, item){
//							addLayersToLegend(item);
//						});
						
						
						
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
									_gaq.push(['_trackEvent', 'mapa', 'editar nom aplicacio', 'label editar nom', tipus_user]);
									if(results.status=='OK') $('#dialgo_publicar #nomAplicacio').val(results.results);
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
			//avisDesarMapa();
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
		
		jQuery('.bt_publicar').on('click',function(){
			jQuery('.modal').modal('hide');
			_gaq.push(['_trackEvent', 'mapa', 'publicar', 'pre-publicar', tipus_user]);
			$('#dialgo_publicar_random').modal('show');
			
			jQuery('#dialgo_publicar_random .bt-sessio').on('click',function(){
				jQuery(window).off('beforeunload');
				jQuery(window).off('unload');
				window.location = paramUrl.loginPage+"?from=mapa";
			});
			
			jQuery('#dialgo_publicar_random .bt_orange').on('click',function(){
				jQuery(window).off('beforeunload');
				jQuery(window).off('unload');
				window.location = paramUrl.registrePage+"?from=mapa";
			});
			
			//$('#dialgo_messages').modal('show');
			//$('#dialgo_messages .modal-body').html(window.lang.convert(msg_noguarda));
		});
				
		jQuery(window).on('unload',function(event){
			_gaq.push(['_trackEvent', 'mapa', 'sortir', 'label sortir', tipus_user]);
			deleteRandomUser({uid: $.cookie('uid')});
			$.removeCookie('uid', { path: '/' });
		});
		
		
		
	}else{
		//publicar el mapa solo para registrados
		jQuery('.bt_publicar').on('click',function(){
			
			_gaq.push(['_trackEvent', 'mapa', 'publicar', 'pre-publicar', tipus_user]);
			
			$('#dialgo_publicar #nomAplicacio').removeClass("invalid");
			$( ".text_error" ).remove();
			jQuery('.modal').modal('hide');
			$('#dialgo_publicar').modal('show');
			
			//Si mapconfig legend, activat, es mostra
			if(mapConfig.options != null && mapConfig.options.llegenda){
				createModalConfigLegend();
				$('#dialgo_publicar .modal-body .modal-legend').show();
			}else{
				$('#dialgo_publicar .modal-body .modal-legend').hide();
			}
			var urlMap = url('protocol')+'://'+url('hostname')+url('path')+'?businessId='+jQuery('#businessId').val();
			urlMap = v_url.replace('mapa','visor');
			$('#urlMap').val(urlMap);
			$('#iframeMap').val('<iframe width="700" height="600" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="'+urlMap+'&embed=1" ></iframe>');
		});
		
		jQuery('#dialgo_publicar .btn-primary').on('click',function(){
			publicarMapa(false);
		});
		
		jQuery('#dialgo_leave .btn-primary').on('click',function(){
			leaveMapa();
		});
	}
	
	//carrega las capas del usuario si esta loginat
	if ($.cookie('uid')){
		var data = {uid: $.cookie('uid')};
		carregaDadesUsuari(data);
	}
		
	//botons tematic
	jQuery('#st_Color').on('click',function(){
		showTematicLayersModal(tem_simple,jQuery(this).attr('class'));
	});
	
	jQuery('#st_Tema').on('click',function(){
		showTematicLayersModal(tem_clasic,jQuery(this).attr('class'));
	});

//	jQuery('#st_Size').on('click',function(){
//		showTematicLayersModal(tem_size);
//	});
	
	jQuery('#st_Heat').on('click',function(e) {
		showTematicLayersModal(tem_heatmap,jQuery(this).attr('class'));
		
	});	

	jQuery('#st_Clust').on('click',function(e) {		
		showTematicLayersModal(tem_cluster,jQuery(this).attr('class'));
		
	});	
	
//	$('#nomAplicacio').editable({
//		type: 'text',
//		mode: 'inline',
//	    validate: function(value) {
//	        if($.trim(value) == '') {
////	        	return 'This field is required';
//	        	return {newValue: this.innerHTML};
//	        }
//        },		
//		success: function(response, newValue) {
//			var data = {
//			 	businessId: url('?businessid'), 
//			 	nom: newValue, 
//			 	uid: $.cookie('uid')
//			}
//
//			updateMapName(data).then(function(results){
//				_gaq.push(['_trackEvent', 'mapa', 'editar nom aplicacio', 'label editar nom', tipus_user]);
//				if(results.status!='OK') $('#nomAplicacio').html(results.results.nom);
//			},function(results){
//				$('#nomAplicacio').html(mapConfig.nomAplicacio);				
//			});	
//		}
//
//	});
	//$.fn.editable.defaults.mode = 'inline';
	$('.leaflet-remove').click(function() {
		alert( "Handler for .click() called." );
	});	
	
	
	//Compartir en xarxes socials
	var v_url = window.location.href;
	if(true){//if(v_url.contains('localhost')){
		v_url = v_url.replace('localhost',DOMINI);
	}
	v_url = v_url.replace('mapa','visor');
	
	if (isRandomUser($.cookie('uid'))){
		jQuery('#socialShare').share({
	        networks: ['email','facebook','googleplus','twitter','linkedin','pinterest'],
	        theme: 'square'
	    });
		
		jQuery('#socialShare .pop-social').off('click').on('click', function(event){
			event.preventDefault();
			jQuery('.modal').modal('hide');
			$('#dialgo_messages').modal('show');
			$('#dialgo_messages .modal-body').html(window.lang.convert(msg_noguarda));
		});
	}else{
		shortUrl(v_url).then(function(results){
			jQuery('#socialShare').share({
		        networks: ['email','facebook','googleplus','twitter','linkedin','pinterest'],
		        theme: 'square',
		        urlToShare: results.data.url
			});
			
			jQuery('#socialShare .pop-social').on('click', function(event){
				console.debug("social share click, publiquem!");
				publicarMapa(true);
			});				
			
		});
	}
				
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
		
		_gaq.push(['_trackEvent', 'mapa', 'descarregar capa', formatOUT+"-"+epsgOUT, tipus_user]);
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
	
	$('#dialog_delete_capa .btn-danger').on('click', function(event){
		var $this = $(this);
		var data = $this.data("data");
		var obj = $this.data("obj");
		
			removeServerToMap(data).then(function(results){
			if(results.status==='OK'){
				
//				this.myRemoveLayer(obj);
				console.debug('Arriba a myRemoveLayer');
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
		updateClasicTematicFromRangs();
	});
	
	//boton de comentaris
	jQuery('#feedback_btn').on('click',function(e){
		window.open(paramUrl.comentarisPage);
	});
	
}

function addClicksInici() {
	jQuery('.bt_llista').on('click', function() {
		activaPanelCapes();
	});
	
	// new vic
	jQuery('.bt_captura').on('click', function() {
		_gaq.push(['_trackEvent', 'mapa', 'captura pantalla', 'label captura', tipus_user]);
		capturaPantalla('captura');
	});
	
	jQuery('.bt_print').on('click', function() {
		_gaq.push(['_trackEvent', 'mapa', 'print', 'label print', tipus_user]);
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

	jQuery('.bt_hill').on('mousemove',function(e){
		
		if(jQuery(this).prop('disabled')){
			jQuery(this).css('cursor','not-allowed');
		}else{
			jQuery(this).css('cursor','pointer');
		}
		
		
	});
	
	
	jQuery('.bt_hill').on('click',function(e){
		
		if(!jQuery(this).prop('disabled')){
			
			if(jQuery(this).hasClass('div_hill_verd')){
				jQuery(this).removeClass('div_hill_verd');	
				jQuery(this).addClass('div_hill');	
				map.setTransActiveMap(1,false);
				
			}else{
				jQuery(this).removeClass('div_hill');	
				jQuery(this).addClass('div_hill_verd');	
				map.setTransActiveMap(0.6,true);
				
			}
			
			
					
		}	
		
	});
}

function addOpcionsFonsMapes() {
	jQuery('.div_gr3_fons div').on('click', function() {
		var fons = jQuery(this).attr('id');
		_gaq.push(['_trackEvent', 'mapa', 'fons', fons, tipus_user]);
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
	//console.debug("gestionaPopOver");
	jQuery('.popover').popover('hide');
	jQuery('.pop').not(pop).popover('hide');
	jQuery(pop).popover('toggle');
	jQuery(".popover").css('left', pLeft());
	jQuery('.popover-title').append('<span id="popovercloseid#'+jQuery(pop).attr('id')+'" class="glyphicon glyphicon-remove bt_tanca"></span>');
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
		
//		var btsave = L.DomUtil.create('div', 'leaflet-bar btn btn-default btn-sm bt_save');
//		this._div.appendChild(btsave);
//		btsave.innerHTML = '<span class="glyphicon glyphicon-floppy-disk grisfort"></span>';		

//		var btinfo = L.DomUtil.create('div', 'leaflet-bar btn btn-default btn-sm bt_info');
//		this._div.appendChild(btinfo);
//		btinfo.innerHTML = '<span class="glyphicon glyphicon-info-sign grisfort"></span>';
		
		return this._div;
	};
	ctr_llistaCapes.addTo(map);

	//Nou control hillshading
	ctr_hill = L.control({
		position : 'topleft'
	});
	
	ctr_hill.onAdd = function(map) {

		this._div = L.DomUtil.create('div', 'leaflet-bar div_hill_f');
	
		var btllista = L.DomUtil.create('div', 'div_hill bt_hill');
		this._div.appendChild(btllista);
		
		return this._div;
	
	};
	
	ctr_hill.addTo(map);
	jQuery('.bt_hill').prop( "disabled", true );
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
	
	$('.bt_hill').tooltip('destroy').tooltip({
		placement : 'right',
		container : 'body',
		title : window.lang.convert("Mostrar l'ombra del relleu")
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
	$('.bt_publicar').tooltip(opt);
	
	//cercador
	jQuery(".leaflet-control-search .search-button, .glyphicon-search").attr('title',window.lang.convert('Cercar llocs a Catalunya ...'));
	jQuery(".leaflet-control-search .search-input").attr('placeholder',window.lang.convert('Cercar llocs a Catalunya ...'));
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


function addDialegsEstils() {
	jQuery('#div_mes_punts').on("click", function(e) {	
		obrirMenuModal('#dialog_estils_punts','toggle',from_creaCapa);
	});

	jQuery('#div_mes_linies').on("click", function(e) {			
		obrirMenuModal('#dialog_estils_linies','toggle',from_creaCapa);
	});
	
	jQuery('#div_mes_arees').on("click", function(e) {	
		obrirMenuModal('#dialog_estils_arees','toggle',from_creaCapa);
	});
	
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
			changeTematicLayerStyle(objEdicio.obroModalFrom, cvStyle);
			
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
			changeTematicLayerStyle(objEdicio.obroModalFrom, changeDefaultLineStyle(canvas_linia));
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
			changeTematicLayerStyle(objEdicio.obroModalFrom, changeDefaultAreaStyle(canvas_pol));
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
		
//	jQuery(document).on('click', ".bs-punts li", function(e) {		
//		jQuery(".bs-punts li").removeClass("estil_selected");
//		jQuery("#div_puntZ").removeClass("estil_selected");
//		jQuery('#div_punt0').removeClass();
//		estilP.iconFons=jQuery('div', this).attr('class');
//		jQuery('#div_punt0').addClass(estilP.iconFons+" "+estilP.iconGlif);
//		jQuery(this).addClass("estil_selected");	
//		jQuery('#dv_cmb_punt').hide();
//		jQuery('#div_punt0').css('width','28px');
//		jQuery('#div_punt0').css('height','42px');	
//		jQuery('#div_punt0').css('font-size',"14px");
//		estilP.divColor='transparent';
//		jQuery('#div_punt0').css('background-color',estilP.divColor);
//		estilP.fontsize="14px";
//	});
	
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

function creaPopOverMesFons() {
	jQuery("#div_mesfons")
	.popover(
	{
		content : '<div id="div_menu_mesfons" class="div_gr3_fons">'
			+ '<div id="historicOrtoMap" lang="ca"  data-toggle="tooltip" title="Ortofoto històrica Catalunya 1956-57" class="div_fons_11"></div>'	
			+ '<div id="historicMap" lang="ca"  data-toggle="tooltip" title="Mapa històric Catalunya 1936" class="div_fons_10"></div>'
				
				+ '</div>',
		container : 'body',
		html : true,
		trigger : 'manual'
	});
	
	jQuery('#div_menu_mesfons div').tooltip(optB);

	jQuery(document).on('click', "#div_menu_mesfons div", function(e) {
		var fons = jQuery(this).attr('id');
		if (fons == 'historicMap') {
			_gaq.push(['_trackEvent', 'mapa', 'fons', fons, tipus_user]);
			map.historicMap();
		}
		if (fons == 'historicOrtoMap') {
			_gaq.push(['_trackEvent', 'mapa', 'fons', fons, tipus_user]);
			map.historicOrtoMap();
		}
		
	});
		
	jQuery("#div_mesfons").on('click',function(e){
		gestionaPopOver(this);
		
	});
}

function creaPopOverMesFonsColor() {
	jQuery("#colorMap")
	.popover(
	{
		content : '<div id="div_menufons" class="div_gr3_fons">'
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
		_gaq.push(['_trackEvent', 'mapa', 'fons', fons, tipus_user]);
		map.colorMap(fons);
	});
}

function creaPopOverMevasDades(){
	var warninMSG="<div class='alert alert-danger'><strong>"+window.lang.convert('Encara no has creat cap capa de dades')+"<strong>  <span class='fa fa-warning sign'></span></div>";
		
	jQuery(".div_dades_usr").on('click', function() {
		//console.debug("creaPopOverMevasDades");
		jQuery('.modal').modal('hide');
		$('#dialog_teves_dades').modal('show');
		
		//Per tenir actualitzar canvis: remove layers, add layers, etc
		jQuery("#id_sw").empty();
		
		refrescaPopOverMevasDades().then(function(results){
			initMevesDades = true;
			if(results.results.length == 0){
				jQuery('#id_sw').html(warninMSG);		
			}else{
				var source1 = jQuery("#meus-wms-template").html();
				var template1 = Handlebars.compile(source1);
				var html1 = template1(results);				
				jQuery("#id_sw").append(html1);
				
				jQuery("ul.bs-dadesO").on('click', '.usr_wms_layer', function(event) {
					event.preventDefault();
					var _this = jQuery(this);
				
					var data = {
							uid: $.cookie('uid'),
							businessId: mapConfig.businessId,
							servidorWMSbusinessId: _this.data("businessid"),
							layers: _this.data("layers"),
							calentas:false,
							activas:true,
							visibilitats:true,
							order: controlCapes._lastZIndex+ 1
					};						
					
					addServerToMap(data).then(function(results){
						if(results.status==='OK'){
							
							var value = results.results;
							_gaq.push(['_trackEvent', 'mapa', 'carregar meves dades', value.serverType, tipus_user]);
							
							if (value.epsg == "4326"){
								value.epsg = L.CRS.EPSG4326;
							}else if (value.epsg == "25831"){
								value.epsg = L.CRS.EPSG25831;
							}else if (value.epsg == "23031"){
								value.epsg = L.CRS.EPSG23031;
							}else{
								value.epsg = map.crs;
							}							
							
							if(_this.data("servertype") == t_wms){
								loadWmsLayer(value);
							}else if((_this.data("servertype") == t_dades_obertes)){
								loadDadesObertesLayer(value);
							}else if(_this.data("servertype") == t_xarxes_socials){
								
								var options = jQuery.parseJSON( value.options );
								if(options.xarxa_social == 'twitter') loadTwitterLayer(value, options.hashtag);
								else if(options.xarxa_social == 'panoramio') loadPanoramioLayer(value);
								else if(options.xarxa_social == 'wikipedia') loadWikipediaLayer(value);
								
							}else if(_this.data("servertype") == t_tematic){
								loadTematicLayer(value);
							}							
							
							activaPanelCapes(true);
						}		
					});							
				});					
						
				//Eliminem servidors
				jQuery("ul.bs-dadesO").on('click', 'span.glyphicon-remove', function(event) {
					event.preventDefault();
					event.stopPropagation();
					var _this = jQuery(this);
					var data = {
						uid: $.cookie('uid'),
						businessId: _this.data("businessid")
					};
					
					var parent = _this.parent();
					var parentul = parent.parent();
					_this.parent().remove();
					
					if (jQuery.trim(jQuery("#id_sw").text()) == ""){
						jQuery('#id_sw').html(warninMSG);
					}
					
					if(_this.data("servertype") == t_tematic){
						deleteTematicLayerAll(data).then(function(results){
							if (results.status == "ERROR"){
								parentul.append(parent);
								if (results.results == "DataIntegrityViolationException"){
									$('#dialgo_messages').modal('show');
									$('#dialgo_messages .modal-body').html(window.lang.convert("Aquesta capa actualment és en ús i no es pot esborrar"));
								}
							}					
						});
					}else{
						deleteServidorWMS(data).then(function(results){
							if (results.status == "ERROR"){
								parentul.append(parent);
								if (results.results == "DataIntegrityViolationException"){
									$('#dialgo_messages').modal('show');
									$('#dialgo_messages .modal-body').html(window.lang.convert("Aquesta capa actualment és en ús i no es pot esborrar"));
								}
							}
						});						
					}
				});
				
			}	
		});
	});	
}

/*
function loadPopOverMevasDades(){
	console.debug("loadPopOverMevasDades");
	jQuery(".div_dades_usr").on('click', function() {
		var data = {uid: $.cookie('uid')};
		
		gestionaPopOver(this);		
		
		var source1 = jQuery("#meus-wms-template").html();
		var template1 = Handlebars.compile(source1);
		var html1 = template1(dades1);
		jQuery("#id_mysrvw").append(html1);
		
		jQuery(".usr_wms_layer").on('click', '#id_sw', function(event) {
			event.preventDefault();
			var _this = jQuery(this);
			//TODO ficar extensio!!!
			_gaq.push(['_trackEvent', 'Meves dades', 'Meves dades', tipus_user]);			
			
			var data = {
				uid: $.cookie('uid'),
				businessId: mapConfig.businessId,
				servidorWMSbusinessId: _this.data("businessid"),
				layers: _this.data("layers"),
				calentas:false,
				activas:false,
				visibilitats:true,
				order: controlCapes._lastZIndex+1
			};
			
			addServerToMap(data).then(function(results){
//				console.debug(results);
//				mapConfig = results.results;
				if(results.status==='OK'){
					var index = results.results.servidorsWMS.length -1;
					var value = results.results.servidorsWMS[index];
					
					 var newWMS = L.tileLayer.wms(value.url, {
						 layers: value.layers,
						 format: value.imgFormat,
						 transparent: value.transparency,
						 version: value.version,
						 opacity: value.opacity,
						 crs: value.epsg,
						 businessId: value.businessId//Jess
						 });
						 if (value.capesActiva == true || value.capesActiva == "true"){
						 newWMS.addTo(map);
						 }
						 newWMS.options.zIndex = controlCapes._lastZIndex+1;
						 controlCapes.addOverlay(newWMS, value.serverName, true);
						 controlCapes._lastZIndex++;

					activaPanelCapes(true);						
				}			
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
*/

function refrescaPopOverMevasDades(){
	//console.debug("refrescaPopOverMevasDades");
	var dfd = jQuery.Deferred();
	var data = {uid: $.cookie('uid')};
	getAllServidorsWMSByUser(data).then(function(results){
		var serverOrigen = [];
		jQuery.each(results.results, function(i, item){
			if (item.serverType == t_tematic){
				//console.debug(item);
				if (item.options == null){
					serverOrigen.push(item);
				}else{
					var options = jQuery.parseJSON( item.options );
					if (options.tem == tem_origen){
						serverOrigen.push(item);
					}else{
						//no cargar
						//serverOrigen.push(item);
					}
				}
			}else{
				//no cargar
				//serverOrigen.push(item);
			}
		});
		dades1.results = serverOrigen;
		dfd.resolve(dades1);
	},function(results){
		gestioCookie('refrescaPopOverMevasDades');
	});
	return dfd.promise();
}

function carregarCapa(businessId){
	var data = {
		uid: $.cookie('uid'),
		businessId: businessId
	};
	
	loadTematicLayer(data);
}

function creaPopOverDadesExternes() {
	jQuery(".div_dades_ext").on('click', function() {
		//gestionaPopOver(this);
		jQuery('.modal').modal('hide');
		$('#dialog_dades_ex').modal('show');
		
		jQuery('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
			var tbA = e.target.attributes.href.value;

			if (tbA == "#id_do") {
				jQuery(tbA).empty();
				jQuery(tbA).html(_htmlDadesObertes.join(' ')+'<span class="label label-font">Font: <a target="_blank" href="http://www20.gencat.cat/portal/site/dadesobertes">Dades Obertes Gencat</a></span>');

				jQuery(tbA+" a.label-explora").on('click', function(e) {
					if(e.target.id !="id_do"){
						addCapaDadesObertes(e.target.id,jQuery(e.target).text());
					}
				});
			}else if(tbA == "#id_srvw"){
				jQuery(tbA).empty();
				jQuery(tbA).html(_htmlServeisWMS.join(' ')+'<span class="label label-font">Font: <a target="_blank" href="http://catalegidec.icc.cat">Cat&agrave;leg IDEC</a></span>');
				jQuery(tbA+" a.label-wms").on('click', function(e) {
					if(e.target.id !="id_srvw"){
						getCapabilitiesWMS(e.target.id,jQuery(e.target).text());
					}
				});	
			}else if(tbA == "#id_srvj"){
				jQuery(tbA).empty();
				jQuery(tbA).html(_htmlServeisJSON.join(' '));
				jQuery("#bt_connJSON").on('click', function(e) {
					if(e.target.id !="#id_srvj"){
						getServeiJSONP(jQuery("#txt_URLJSON").val());
					}
				});		
			}else if(tbA == "#id_xs"){//Jess
				var label_xarxes = "La informació es mostra en funció de l'àrea geogràfica visualitzada."
				jQuery(tbA).html(
						'<div class="panel-info">'+
						'<ul class="bs-dadesO_XS panel-heading">'+
						'<li><a id="add_twitter_layer" href="javascript:toggleCollapseTwitter()" class="label-xs">Twitter <i class="fa fa-twitter"></i></a></li>'+
						'<li><a id="add_panoramio_layer" href="javascript:addPanoramioLayer();" class="label-xs">Panoramio <i class="fa fa-picture-o"></i></a></li>'+
						'<li><a id="add_wikipedia_layer" href="javascript:addWikipediaLayer();" class="label-xs">Wikipedia <i class="fa fa-book"></i></a></li>'+
						'</ul>'+
						'<div class="panel-body"><span class="label-xarxes" lang="ca">'+window.lang.convert(label_xarxes)+'</span></div>'+
						'<div id="twitter-collapse">'+
							'<div class="input-group">'+
			      				'<span class="input-group-addon">Hashtag #</span>'+
			      				'<input id="hashtag_twitter_layer" type="text" class="form-control">'+
			      				'<span class="input-group-btn">'+
			      					'<button id="btn-add-twitter-layer" class="btn btn-primary editable-submit" type="button"><i class="glyphicon glyphicon-ok"></i></button>'+
			      				'</span>'+
				      		'</div>'+
				      		'</div>'+
			      		'</div>'						
				);
				$('#twitter-collapse').hide();
				$('#twitter-collapse .input-group .input-group-btn #btn-add-twitter-layer').click(function(){
					addTwitterLayer();
				});
			}		
		});
	})
}

function pLeft() {
	return jQuery(".leaflet-left").css('left');
}

function addCapaDadesObertes(dataset,nom_dataset) {

	_gaq.push(['_trackEvent', 'mapa', 'dades obertes', nom_dataset, tipus_user]);
	
	var param_url = paramUrl.dadesObertes + "dataset=" + dataset;

	var estil_do = retornaEstilaDO(dataset);
//	var lastZIndex = controlCapes._lastZIndex;//+1;
	capaDadaOberta = new L.GeoJSON.AJAX(param_url, {
		onEachFeature : popUp,
		nom : dataset,
		tipus : t_dades_obertes,
		dataset: dataset,
		estil_do: estil_do,
		businessId : '-1',
		dataType : "jsonp",
//		zIndex: lastZIndex,
		geometryType:t_marker,
		pointToLayer : function(feature, latlng) {
			if(dataset.indexOf('meteo')!=-1){
				return L.marker(latlng, {icon:L.icon({					
					    iconUrl: feature.style.iconUrl,
					    iconSize:     [44, 44], 
					    iconAnchor:   [22, 22], 				   
					    popupAnchor:  [-3, -3] 
				})});
			}else if(dataset.indexOf('incidencies')!=-1){
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
			}else if(dataset.indexOf('cameres')!=-1){
				return L.marker(latlng, {icon:L.icon({					
				    iconUrl: "/geocatweb/img/st_came.png",
				    iconSize:     [30, 26], 
				    iconAnchor:   [15, 13], 				   
				    popupAnchor:  [-3, -3] 
			})});
			}else{
			return L.circleMarker(latlng, estil_do);
			}
		}
	});
	
	capaDadaOberta.on('data:loaded', function(e){
		
//		var datasetLength = capaDadaOberta.getLayers().length;
		
		if(typeof url('?businessid') == "string"){
			var data = {
				uid:$.cookie('uid'),
				mapBusinessId: url('?businessid'),
				serverName: nom_dataset,// +" ("+datasetLength+")",
				serverType: t_dades_obertes,
				calentas: false,
	            activas: true,
	            visibilitats: true,
	            order: controlCapes._lastZIndex+1,
	            epsg: '4326',
	            transparency: true,
	            visibilitat: visibilitat_open,
				options: '{"dataset":"'+dataset+'","estil_do":{"radius":"'+estil_do.radius+'","fillColor":"'+estil_do.fillColor+'","color":"'+estil_do.color+'","weight":"'+estil_do.weight+'","opacity":"'+estil_do.opacity+'","fillOpacity":"'+estil_do.fillOpacity+'","isCanvas":"'+estil_do.isCanvas+'"}}'			
			};

			
			createServidorInMap(data).then(function(results){
				if (results.status == "OK"){
					capaDadaOberta.nom = nom_dataset;// +" ("+datasetLength+")";
					capaDadaOberta.options.businessId = results.results.businessId;
					capaDadaOberta.addTo(map)
					capaDadaOberta.options.zIndex = controlCapes._lastZIndex+1;
					controlCapes.addOverlay(capaDadaOberta, nom_dataset, true);
					controlCapes._lastZIndex++;
					activaPanelCapes(true);
				}
			});
			
		}else{
			capaDadaOberta.nom = nom_dataset;// +" ("+datasetLength+")";
			capaDadaOberta.addTo(map);
			capaDadaOberta.options.zIndex = controlCapes._lastZIndex+1;
			controlCapes.addOverlay(capaDadaOberta, nom_dataset, true);
			controlCapes._lastZIndex++;
			activaPanelCapes(true);
		}		
		
	});
}


function addCapaMunicipis() {
	var url = "/llibreries/dades/json/municipis.geojson";
	capaDadaOberta = new L.GeoJSON.AJAX(url, {
		onEachFeature : popUp,
		nom : "Minicipis",
		tipus : 'Poligon',
		businessId : '-1',
		style:{"color": "#ff7800","weight": 1,"opacity": 0.65}
	});
	capaDadaOberta.addTo(map)
	controlCapes.addOverlay(capaDadaOberta, "Municipis", true);
	activaPanelCapes(true);
}

function loadingMap(accio){	
	if(accio){		
		if(jQuery('.search-load').css('display')!='block'){
			jQuery('.search-load').show();
		}	
	}else{
		jQuery('.search-load').hide();
	}	
}

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

function generaLListaDadesObertes() {
	getLListaDadesObertes().then(function(results) {
		_htmlDadesObertes.push('<div class="panel-danger"><ul class="bs-dadesO llista-do panel-heading">');
		$.each(results.dadesObertes, function(key, dataset) {
			_htmlDadesObertes.push('<li><a class="label-explora" lang="ca" title="Afegir capa" href="#" id="'
				+ dataset.dataset
				+ '">'
				+ dataset.text
				+ '</a>'
				+ '<a target="_blank" lang="ca" title="Informació de les dades" href="'+dataset.urn+'"><span class="glyphicon glyphicon-info-sign info-explora"></span></a>'							
				+'</li>');
		});
		_htmlDadesObertes.push('</ul></div>');
	});
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
				var fons = mapConfig.options.fons;
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
	
	var source = $("#map-properties-template").html();
	var template = Handlebars.compile(source);
	var html = template(mapConfig);
	$('#frm_publicar').append(html);
	
	$('.make-switch').bootstrapSwitch();
	//Configurar Llegenda
	$('input[name="my-legend-checkbox"]').on('switchChange.bootstrapSwitch', function(event, state) {
//		alert("Llegenda");
		console.debug(state);
		console.debug(state.value);
		if(state.value == true) {
			createModalConfigLegend();
		}else{
			$('#dialgo_publicar .modal-body .modal-legend').hide();
		}
	});
	
	//$('.make-switch').bootstrapSwitch('setOnLabel', "<i class='glyphicon glyphicon-ok glyphicon-white'></i>");		
	//$('.make-switch').bootstrapSwitch('setOffLabel', "<i class='glyphicon glyphicon-remove'></i>");
		
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

function publicarMapa(fromCompartir){
	if(!fromCompartir){//Si no venim de compartir, fem validacions del dialeg de publicar
		if(isBlank($('#dialgo_publicar #nomAplicacio').val())){
			$('#dialgo_publicar #nomAplicacio').addClass("invalid");
			$('#dialgo_publicar #nomAplicacio').after("<span class=\"text_error\" lang=\"ca\">El camp no pot estar buit</span>");
			return false;
		}
	}

		
	var options = {};
	options.tags = jQuery('#dialgo_publicar #optTags').val();
	options.description = jQuery('#dialgo_publicar #optDescripcio').val();
	options.center = map.getCenter().lat+","+map.getCenter().lng;
	options.zoom = map.getZoom();
	options.bbox = map.getBounds().toBBoxString();
	var visibilitat = visibilitat_open;
	
	if (jQuery('#visibilitat_chk').bootstrapSwitch('state')){
		visibilitat = visibilitat_open;
	}else{
		visibilitat = visibilitat_privat;
	}
		
	/*//TODO de los botones ver nuevos botones
	options.llegenda = jQuery('#llegenda_chk').bootstrapSwitch('state');
	options.layers = jQuery('#layers_chk').bootstrapSwitch('state');
	options.social = jQuery('#social_chk').bootstrapSwitch('state');
	*/
	options.llegenda = jQuery('#llegenda_chk').bootstrapSwitch('state');
	
	if(options.llegenda)updateMapLegendData();
	else mapLegend = {};	
	
	options.layers = true;
	options.social = true;
	options.fons = map.getActiveMap();
	options.fonsColor = map.getMapColor();
	console.debug(options);
	options = JSON.stringify(options);
		
	var newMap = true;
	
	if (jQuery('#businessId').val() != ""){
		newMap = false;
	}
	
	var layers = jQuery(".leaflet-control-layers-selector").map(function(){
		return {businessId: this.id.replace('input-',''), activa: jQuery(this).is(':checked')};
	}).get();
	//console.debug(layers);
	
	var nomApp = jQuery('#nomAplicacio').html();
	if(!fromCompartir) nomApp = jQuery('#dialgo_publicar #nomAplicacio').val();
	
	var data = {
		nom: nomApp, //jQuery('#dialgo_publicar #nomAplicacio').val(),
		uid: $.cookie('uid'),
		visibilitat: visibilitat,
		tipusApp: 'vis',
		options: options,
		legend: JSON.stringify(mapLegend),
		layers: JSON.stringify(layers)
	}
	
	_gaq.push(['_trackEvent', 'mapa', 'publicar', visibilitat, tipus_user]);
	
	//crear los archivos en disco
	var layersId = getBusinessIdOrigenLayers();
	var laydata = {
		uid: $.cookie('uid'),
		servidorWMSbusinessId: layersId
	};
	console.debug(laydata);
	publicarCapesMapa(laydata);
	
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
				mapConfig.newMap = false;
				
				
				
				if(!fromCompartir){
					$('#dialgo_publicar').modal('hide');
					//update map name en el control de capas
					$('#nomAplicacio').text(mapConfig.nomAplicacio);
					$('#dialgo_url_iframe').modal('show');					
				}
			}
		});
	}
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

function initControls(){
	addControlsInici();
	addClicksInici();
	addOpcionsFonsMapes();
	addToolTipsInici();
	redimensioMapa();
	creaAreesDragDropFiles();
	tradueixMenusToolbar();
	addDrawToolbar();
	activaEdicioUsuari();
	addDialegsEstils();
	addControlCercaEdit();
//	addLegend();
	//dades
	generaLListaDadesObertes();
	creaPopOverMesFonsColor();
	creaPopOverDadesExternes();
	creaPopOverMesFons();
	generaLlistaServeisWMS();
}

function addTwitterLayer(hashtag){
	
	_gaq.push(['_trackEvent', 'mapa', 'twitter', hashtag, tipus_user]);	
	
	var hashtag = $('#twitter-collapse .input-group #hashtag_twitter_layer').val();
	//Control no afegit #
	if(hashtag.indexOf("#") == 0) hashtag = hashtag.substr(1);
	
	if(hashtag == null || hashtag == "") return;
	
	$('#twitter-collapse .input-group #hashtag_twitter_layer').val("");
//	var lastZIndex = controlCapes._lastZIndex;//+1;//Jess
	var twitter = new L.Twitter({
		hashtag: hashtag,
		nom: 'twitter #'+ hashtag,
//		zIndex: lastZIndex, 
		businessId: '-1',
		tipus: t_xarxes_socials
	});

	//Si el mapa existeix a BD
	if(typeof url('?businessid') == "string"){	
		var data = {
				uid:$.cookie('uid'),
				mapBusinessId: url('?businessid'),
				serverName: 'twitter #'+ hashtag,
				serverType: t_xarxes_socials,
				calentas: false,
	            activas: true,
	            visibilitats: true,
	            order: controlCapes._lastZIndex+1,
	            epsg: '4326',
	            transparency: true,
	            visibilitat: visibilitat_open,
				options: '{"xarxa_social": "twitter", "hashtag": "'+hashtag+'"}'
		};
		
		createServidorInMap(data).then(function(results){
			if (results.status == "OK"){
				twitter.options.businessId = results.results.businessId;
				twitter.addTo(map);
				twitter.options.zIndex = controlCapes._lastZIndex+1;
				controlCapes.addOverlay(twitter, 'twitter #'+ hashtag, true);
				controlCapes._lastZIndex++;
				activaPanelCapes(true);
			}else{
				console.debug('error create server in map');
			}
		});	
	}else{
		twitter.addTo(map);
		twitter.options.zIndex = controlCapes._lastZIndex+1;
		controlCapes.addOverlay(twitter, 'twitter #'+ hashtag, true);
		controlCapes._lastZIndex++;
		activaPanelCapes(true);
	}	
	
	//Tanquem input twitter
	$('#twitter-collapse').hide();
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

function addPanoramioLayer(){
	
	_gaq.push(['_trackEvent', 'mapa', 'panoramio', 'label panoramio', tipus_user]);
	
//	var lastZIndex = controlCapes._lastZIndex;//+1;//Jess
	var panoramio = new L.Panoramio({
		maxLoad: 10, 
		maxTotal: 250, 
//		zIndex: lastZIndex,
		nom : 'panoramio',
		businessId: '-1',
		tipus: t_xarxes_socials
	});
	
	if(typeof url('?businessid') == "string"){
		var data = {
			uid:$.cookie('uid'),
			mapBusinessId: url('?businessid'),
			serverName: 'panoramio',
			serverType: t_xarxes_socials,
			calentas: false,
            activas: true,
            visibilitats: true,
            order: controlCapes._lastZIndex+1,
            epsg: '4326',
            transparency: true,
            visibilitat: visibilitat_open,
			options: '{"xarxa_social": "panoramio"}'
		};
		
		createServidorInMap(data).then(function(results){
			if (results.status == "OK"){
				panoramio.options.businessId = results.results.businessId;
				panoramio.addTo(map);
				panoramio.options.zIndex = controlCapes._lastZIndex+1;
				controlCapes.addOverlay(panoramio, 'panoramio', true);
				controlCapes._lastZIndex++;
				activaPanelCapes(true);
			}else{
				console.debug('error create server in map');
			}
		});	
	}else{
		panoramio.addTo(map);
		panoramio.options.zIndex = controlCapes._lastZIndex+1;
		controlCapes.addOverlay(panoramio, 'panoramio', true);
		controlCapes._lastZIndex++;
		activaPanelCapes(true);
	}	
}

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

function addWikipediaLayer(){	
	console.debug('Add wikipedia layer');
	
	_gaq.push(['_trackEvent', 'mapa', 'wikipedia', 'label wikipedia', tipus_user]);	
	
//	var lastZIndex = controlCapes._lastZIndex;//+1;//Jess
	var wikipedia = new L.Wikipedia({
//		zIndex: lastZIndex,
		nom : 'wikipedia',
		businessId: '-1',
		tipus: t_xarxes_socials
	});
	
	if(typeof url('?businessid') == "string"){
		
		var data = {
			uid:$.cookie('uid'),
			mapBusinessId: url('?businessid'),
			serverName: 'wikipedia',
			serverType: t_xarxes_socials,
			calentas: false,
            activas: true,
            visibilitats: true,
            order: controlCapes._lastZIndex+1,
            epsg: '4326',
            transparency: true,
            visibilitat: visibilitat_open,
			options: '{"xarxa_social": "wikipedia"}'
		};
		
		createServidorInMap(data).then(function(results){
			if (results.status == "OK"){
				wikipedia.options.businessId = results.results.businessId;
				wikipedia.addTo(map);
				wikipedia.options.zIndex = controlCapes._lastZIndex+1;
				controlCapes.addOverlay(wikipedia, 'wikipedia', true);
				controlCapes._lastZIndex++;
				activaPanelCapes(true);
			}else{
				console.debug('error create server in map');
			}
		});
	}else{
		wikipedia.addTo(map);
		wikipedia.options.zIndex = controlCapes._lastZIndex+1;
		controlCapes.addOverlay(wikipedia, 'wikipedia', true);
		controlCapes._lastZIndex++;
		activaPanelCapes(true);
	}	
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

function updateEditableElements(){
	//console.debug('updateEditableElements');
	$('.leaflet-name .editable').editable({
		type: 'text',
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
						_gaq.push(['_trackEvent', 'mapa', 'editar nom capa', 'label editar nom', tipus_user]);
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
	//Hide les opcions de configuracio
	jQuery('.options-conf').hide();
}

function carregaDadesUsuari(data){
	//console.debug("carregaDadesUsuari");
	getAllServidorsWMSByUser(data).then(function(results){
		if (results.status == "ERROR"){
			//TODO mostrar mensaje de error y hacer alguna accion por ejemplo redirigir a la galeria				
			return false;
		}
		dades1=results;
		creaPopOverMevasDades();
	},function(results){
		//JESS DESCOMENTAR!!!!
		gestioCookie('carregaDadesUsuari');
	});
}

function loadDadesObertesLayer(layer){
	var options = jQuery.parseJSON( layer.options );
	if(options.tem == null || options.tem == tem_simple){
		var url_param = paramUrl.dadesObertes + "dataset=" + options.dataset;
		var estil_do = options.estil_do;	
//		var estil_do = retornaEstilaDO(options.dataset);
		if (options.tem == tem_simple){
			//estil_do = options.style;
			estil_do = createFeatureMarkerStyle(options.style);
		}
		var capaDadaOberta = new L.GeoJSON.AJAX(url_param, {
			onEachFeature : popUp,
			nom : layer.serverName,
			tipus : layer.serverType,
			dataset: options.dataset,
			businessId : layer.businessId,
			dataType : "jsonp",
			estil_do : estil_do, //per la llegenda
//			zIndex: parseInt(layer.capesOrdre),
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
						//console.debug(L.marker(latlng, {icon:L.AwesomeMarkers.icon(estil_do)}));
						return L.marker(latlng, {icon:estil_do,isCanvas:false, tipus: t_marker});
					}
				}
			}
		});	
		
		if (layer.capesActiva== null || layer.capesActiva == 'null' || layer.capesActiva == true || layer.capesActiva == "true"){
			capaDadaOberta.addTo(map);
		}
		
		capaDadaOberta.eachLayer(function(layer) {
			//console.debug("1"+layer);
		});		
		
		if (!layer.capesOrdre || layer.capesOrdre == null || layer.capesOrdre == 'null'){
			capaDadaOberta.options.zIndex = controlCapes._lastZIndex + 1;
		}else{
			capaDadaOberta.options.zIndex = parseInt(layer.capesOrdre);
		}		
		
//		controlCapes.addOverlay(capaDadaOberta, layer.serverName, true);	
//		controlCapes._lastZIndex++;
		
		if(!options.origen){
			controlCapes.addOverlay(capaDadaOberta, layer.serverName, true);
			controlCapes._lastZIndex++;
		}else{//Si te origen es una sublayer
			var origen = getLeafletIdFromBusinessId(options.origen);
			capaDadaOberta.options.zIndex = capesOrdre_sublayer;
			controlCapes.addOverlay(capaDadaOberta, layer.serverName, true, origen);
		}		
		
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

function toggleCollapseTwitter(){
	console.debug('toggleCollapseTwitter');
	$('#twitter-collapse').toggle();
}

function showConfOptions(businessId){
//	console.debug('showConfOptions');
//	if(jQuery("#conf-"+businessId+"").is(":visible")) jQuery("#conf-"+businessId+"").hide("slow");
//	else jQuery("#conf-"+businessId+"").show("2000");
	jQuery(".conf-"+businessId+"").toggle("fast");
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

function getColorFromClass(classe){
	switch (classe)
	{
		case 'orange':
		  return '#ffc500';
		case 'darkorangeb':
		  return '#ff7f0b';
		case 'red':
		  return '#ff4b3a';
		case 'purple':
		  return '#ae59b9';	
		case 'blue':
		  return '#00afb5';
		case 'green':
		  return '#7cbd00';
		case 'darkgray':
		  return '#90a6a9';
		case 'gray':
		  return '#ebf0f1';		  
		 default:
			 return '#ffc500';
	} 		
}

function getLeafletIdFromBusinessId(businessId){
	for(val in controlCapes._layers){
		if(controlCapes._layers[val].layer.options.businessId == businessId){
			return val;
		}
	}
}

function gestioCookie(from){
	var _cookie = $.cookie('uid');
	switch(from){
		case 'createMap':
			if (isRandomUser(_cookie)){
				$.removeCookie('uid', { path: '/' });
				window.location.href = paramUrl.mainPage;
			}else{
				window.location.href = paramUrl.galeriaPage;
			}
			break;
		case 'createMapError':
			window.location.href = paramUrl.mainPage;
			break;
		case 'getMapByBusinessId':
			if (!_cookie){
				window.location.href = paramUrl.mainPage;
			}else{
				if (isRandomUser(_cookie)){
					$.removeCookie('uid', { path: '/' });
					jQuery(window).off('beforeunload');
					//jQuery(window).off('unload');
					window.location.href = paramUrl.mainPage;
				}else{
					window.location.href = paramUrl.galeriaPage;
				}
			} 
			break;
		case 'loadApp':
			if (!_cookie){
				window.location.href = paramUrl.mainPage;
			}
			break;
		case 'diferentUser':
			if (mapConfig.entitatUid != _cookie){
				$.removeCookie('uid', { path: '/' });
				window.location.href = paramUrl.mainPage;
			}
			break;
		case 'loadMapConfig':
			if (isRandomUser(_cookie)){
				$.removeCookie('uid', { path: '/' });
				jQuery(window).off('beforeunload');
				window.location.href = paramUrl.mainPage;
			}else{
				window.location.href = paramUrl.galeriaPage;
			}
			break;
		case 'carregaDadesUsuari':
			window.location.href = paramUrl.loginPage;
			break;
		case 'refrescaPopOverMevasDades':
			window.location.href = paramUrl.loginPage;
			break;
		case 'getMapByBusinessIdError':
			window.location.href = paramUrl.loginPage;
			break;
	}
}

function addURLfitxerLayer(){
	
//	var url = jQuery("#txt_URLfitxer").val();
	var url = 'https://dl.dropboxusercontent.com/u/1599563/campings.json';
	
	xhr(url, function(err, response) {
        if (err) {//return layer.fire('error', { error: err });
        	console.debug("Error xhr");
        }else{
        	console.debug(response);
            addData(layer, JSON.parse(response.responseText));
            layer.fire('ready');
        }

    });
	
//	var runLayer = omnivore.geojson('https://dl.dropboxusercontent.com/u/1599563/campings.json', null, L.FeatureGroup())
//    .on('ready', function() {
//    	console.debug(runLayer);
//        // An example of customizing marker styles based on an attribute.
//        // In this case, the data, a CSV file, has a column called 'state'
//        // with values referring to states. Your data might have different
//        // values, so adjust to fit.
//        this.eachLayer(function(marker) {
//        	console.debug(marker);
////            if (marker.toGeoJSON().properties.state === 'CA') {
////                // The argument to L.mapbox.marker.icon is based on the
////                // simplestyle-spec: see that specification for a full
////                // description of options.
////                marker.setIcon(L.mapbox.marker.icon({
////                    'marker-color': '#55ff55',
////                    'marker-size': 'large'
////                }));
////            } else {
////                marker.setIcon(L.mapbox.marker.icon({}));
////            }
////            // Bind a popup to each icon based on the same properties
////            marker.bindPopup(marker.toGeoJSON().properties.city + ', ' +
////                marker.toGeoJSON().properties.state);
//        });
//        map.fitBounds(this.getBounds());
//    })
//    .on('error', function() {
//        // fired if the layer can't be loaded over AJAX
//        // or can't be parsed
//    	console.debug("Error omnivore");
//    })
//    .addTo(map);
}

/*
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


/*************** LLEGENDA ********************/

function addLegend(){
	var legend = L.control({position: 'bottomright'});

	legend.onAdd = function (map) {

	    var div = L.DomUtil.create('div', 'info legend visor-legend');
	    	div.id = "mapLegend";
	    
	    jQuery.each(mapLegend, function(i, row){
	    	console.debug(row);
	    	for (var i = 0; i < row.length; i++) {
	    		console.debug(row[i]);
	    		if(row[i].chck){
	    			div.innerHTML +='<div class="visor-legend-row">'+
						    			'<div class="visor-legend-symbol col-md-6">'+row[i].symbol+'</div>'+
						    			'<div class="visor-legend-name col-md-6">'+row[i].name+'</div>'+
	    							'</div>'+
	    							'<div class="visor-separate-legend-row"></div>';
	    		}
	    	}
	    });
	    return div;
	};
	legend.addTo(map);	
}

function createModalConfigLegend(){
//	//Obrim modal llegenda
	console.debug(controlCapes);
	console.debug(map._layers);
	var html = '<h4 lang="ca" class="modal-title">Llegenda</h4>';
	var count = 0;
	jQuery.each(controlCapes._layers, function(i, item){
		
		controlLegendPoint = [];
		controlLegendMarker = [];
		controlLegendLine = [];
		controlLegendPol = [];
		
		html += '<div class="legend-row" id="row-'+count+'">';
		html += addLayerToLegend(item.layer, count);
		count++;
		jQuery.each(item._layers, function(i, sublayer){
			html += addLayerToLegend(sublayer.layer, count);
		});
		
		html+='</div><div class="separate-legend-row"></div>';
		console.debug(html);
	});	
	$('#dialgo_publicar .modal-body .modal-legend').html(html);
	$('#dialgo_publicar .modal-body .modal-legend').show();
//	$('#dialog_llegenda').modal('show');
}

function addLayerToLegend(layer, count){
	var html = "";

	//checked="checked", layer.options.nom
	var layerName = layer.options.nom;
	var checked = "";
	if(mapLegend[layer.options.businessId]){
		layerName = mapLegend[layer.options.businessId][0].name;
		if(mapLegend[layer.options.businessId][0].chck) checked = 'checked="checked"';
	}
	
	//Cluster
	if(layer.options.tipusRang && layer.options.tipusRang == tem_cluster){
		html += '<div class="legend-subrow" data-businessid="'+layer.options.businessId+'">';
		html += '<input class="col-md-1 legend-chck" type="checkbox" '+checked+' >';
		
		html += '<div class="col-md-2 legend-symbol">'+
					'<img src="img/clustering.png" class="btn-paleta" style=""/>'+
				'</div>'+
				'<div class="col-md-9 legend-name">'+
					'<input type="text" class="form-control my-border" value="'+layerName+'">'+
				'</div>';
		html+='</div>';
		
	//Heatmap
	}else if(layer.options.tipusRang && layer.options.tipusRang == tem_heatmap){
		html += '<div class="legend-subrow" data-businessid="'+layer.options.businessId+'">';
		html += '<input class="col-md-1 legend-chck" type="checkbox" '+checked+' >';	
		html += '<div class="col-md-2 legend-symbol">'+
					'<img src="img/heatmap.png" class="btn-paleta" style=""/>'+
				'</div>'+
				'<div class="col-md-9 legend-name">'+
					'<input type="text" class="form-control my-border" value="'+layerName+'">'+
				'</div>';		
		html+='</div>';
//		html+='<div class="separate-legend-subrow" ></div>';
		
	//Dades Obertes y JSON
	}else if(layer.options.tipus == t_dades_obertes || layer.options.tipus == t_json ){//es un punt
		
		
		var estil_do = layer.options.estil_do;
		if(layer.options.options && layer.options.options.estil_do) estil_do = layer.options.options.estil_do;//Si es JSON
		else if(estil_do.options) estil_do = estil_do.options;
		
		if(estil_do.isCanvas || estil_do.markerColor.indexOf("punt_r")!=-1){
			var size="";
			if(estil_do.iconSize){
				size = 'width: '+estil_do.iconSize.x+'px; height: '+estil_do.iconSize.y+'px;';
			}else{
				var mida = getMidaFromRadius(estil_do.radius);
				size = 'width: '+mida+'px; height: '+mida+'px; font-size: 8px;';
			}
			
			var color = hexToRgb(estil_do.fillColor);
			var icon = "";
			var colorIcon=""; 
			if(estil_do.divColor){
				var auxColor = hexToRgb(estil_do.divColor);
				colorIcon = 'color: rgb('+auxColor.r+', '+auxColor.g+', '+auxColor.b+');';
			} 
			
			if(estil_do.icon){
				icon = "fa fa-"+estil_do.icon;
			}
			html += '<div class="legend-subrow" data-businessid="'+layer.options.businessId+'">';
			html += '<input class="col-md-1 legend-chck" type="checkbox" '+checked+' >';
			html +=	'<div class="col-md-2 legend-symbol">'+
						'<div class="awesome-marker-web awesome-marker-icon-punt_r '+icon+' legend-symbol" '+
							'style="background-color: rgb('+color.r+', '+color.g+', '+color.b+'); '+colorIcon+
							' '+size+'">'+
						'</div>'+
					'</div>'+
					'<div class="col-md-9 legend-name">'+
						'<input type="text" class="form-control my-border" value="'+layerName+'">'+
					'</div>';
			html+='</div>';
//			html+='<div class="separate-legend-subrow" ></div>';		
			
		}else{
			
			var color = hexToRgb(estil_do.iconColor);
			console.debug(estil_do);
			html += '<div class="legend-subrow" data-businessid="'+layer.options.businessId+'">';
			html += '<input class="col-md-1 legend-chck" type="checkbox" '+checked+' >';	
			html += '<div class="col-md-2 legend-symbol">'+
						'<div class="awesome-marker-web awesome-marker-icon-'+estil_do.markerColor+
							' fa fa-'+estil_do.icon+'" style="width: 28px; height: 42px; font-size: 14px;'+ 
							'background-color: transparent; color: rgb('+color.r+', '+color.g+', '+color.b+');">'+
						'</div>'+
					'</div>'+
					'<div class="col-md-9 legend-name">'+
						'<input type="text" class="form-control my-border" value="'+layerName+'">'+
					'</div>';
			html+='</div>';
//			html+='<div class="separate-legend-subrow" ></div>';			
		}
		
//	//WMS
//	}else if(layer.options.tipus == t_wms){	
//		
//		html += '<div class="legend-subrow" data-businessid="'+layer.options.businessId+'">';
//		html += '<input class="col-md-2 legend-chck" type="checkbox" '+checked+' >';
//		
//		html += '<div class="col-md-4 legend-symbol">'+
//					//'<img src="img/paleta1.png" class="btn-paleta" style=""/>'+
//					'<span>'+layer.options.layers+'</span>'+
//				'</div>'+
//				'<div class="col-md-6 legend-name">'+
//					'<input type="text" class="form-control my-border" value="'+layerName+'">'+
//				'</div>';
//		html+='</div>';		
		
		
	//XARXES SOCIALS
	}else if(layer.options.tipus == t_xarxes_socials){
		html += '<div class="legend-subrow" data-businessid="'+layer.options.businessId+'">';
		html += '<input class="col-md-1 legend-chck" type="checkbox" '+checked+' >';
		if(layer.options.hashtag){
			html += '<div class="col-md-2 legend-symbol">'+
						'<div class="awesome-marker-web awesome-marker-icon-blue fa fa-twitter" style="width: 28px; height: 42px; font-size: 14px; background-color: transparent;"></div>'+
					'</div>'+
					'<div class="col-md-9 legend-name">'+
						'<input type="text" class="form-control my-border" value="'+layerName+'">'+
					'</div>';			
		}else if(layer.options.maxLoad){
			
			html += '<div class="col-md-2 legend-symbol">'+
						'<img src="http://mw2.google.com/mw-panoramio/photos/small/43954089.jpg" class="leaflet-marker-icon photo-panoramio leaflet-zoom-animated leaflet-clickable" style="" tabindex="0"/>'+
					'</div>'+
					'<div class="col-md-9 legend-name">'+
						'<input type="text" class="form-control my-border" value="'+layerName+'">'+
					'</div>';				
		}else{
			html += '<div class="col-md-2 legend-symbol">'+
						'<div class="awesome-marker-web awesome-marker-icon-gray fa fa-book" style="width: 28px; height: 42px; font-size: 14px; background-color: transparent;"></div>'+
					'</div>'+
					'<div class="col-md-9 legend-name">'+
						'<input type="text" class="form-control my-border" value="'+layerName+'">'+
					'</div>';				
		}
		html+='</div>';
		
	//TEMATIC
	}else if(layer.options.tipus == t_tematic){
		
		var rangs = getRangsFromLayerLegend(layer);
		console.debug(rangs);
		var size = rangs.length;
		
		//Classic tematic
		if(layer.options.tipusRang && layer.options.tipusRang==tem_clasic){
			var geometryType = transformTipusGeometry(layer.options.geometrytype);
			var i = 0;
			var controlColorCategoria = [];//per controlar que aquell color no esta afegit ja a la llegenda
			for(i;i<size && controlColorCategoria.length<9;i++){

				var color = hexToRgb(rangs[i].color);
				
				var existeix = checkColorAdded(controlColorCategoria, color);
				if(!existeix){
					
					controlColorCategoria.push(color);
					
					if(geometryType == t_marker){
						var mida = getMidaFromRadius(rangs[i].simbolSize);
						var iconSize = 'width: '+mida+'px; height: '+mida+'px; font-size: 8px;';						
						var stringStyle ='<div class="awesome-marker-web awesome-marker-icon-punt_r legend-symbol" '+
											'style="background-color: rgb('+color.r+', '+color.g+', '+color.b+'); '+
											' '+iconSize+'">'+
										'</div>';						
					}else if(geometryType == t_polyline){
						var lineWidth = rangs[i].lineWidth;
						var stringStyle =	'<svg height="30" width="30">'+
												'<line x1="0" y1="0" x2="30" y2="30" '+
													'style="stroke:rgb('+color.r+', '+color.g+', '+color.b+'); stroke-width:'+lineWidth+';"></line>'+
											'</svg>';						
					}else{
						var borderColor = hexToRgb(rangs[i].borderColor);
						var opacity = rangs[i].opacity/100;
						var borderWidth = rangs[i].borderWidth;						
						var stringStyle =	'<svg height="40" width="40">'+
												'<polygon points="5.13 15.82, 25.49 5.13, 37.08 13.16, 20.66 38.01, 2.06 33.67,5.13 15.82" '+
													'style=" fill:rgb('+color.r+', '+color.g+', '+color.b+'); stroke:rgb('+borderColor.r+', '+borderColor.g+', '+borderColor.b+'); stroke-width:'+borderWidth+'; fill-rule:evenodd; fill-opacity:'+opacity+';"></polygon>'+
											'</svg>';						
					}

					
					//Reinicialitzem
					var labelNomCategoria = "";
					if(color.r == 153 && color.g==153 && color.b==153 ||
							color.r == 217 && color.g==217 && color.b==217 ||
							color.r == 218 && color.g==218 && color.b==218 ) labelNomCategoria = window.lang.convert("Altres");
					else labelNomCategoria = findLabelCategoria(layer.options.dataField, rangs[i].featureLeafletId);					
					checked = "";						
					
					var index = mapLegend[layer.options.businessId]?findStyleInLegend(mapLegend[layer.options.businessId],stringStyle):-1;
					if(index != -1){//Si l'ha trobat, fica el seu check i el seu name
						labelNomCategoria = mapLegend[layer.options.businessId][index].name;
						if(mapLegend[layer.options.businessId][index].chck == true) checked = 'checked="checked"';
					}				
					
					html += '<div class="legend-subrow" data-businessid="'+layer.options.businessId+'">';
					html += '<input class="col-md-1 legend-chck" type="checkbox" '+checked+' >';
					html +=	'<div class="col-md-2 legend-symbol">'+
								stringStyle+
							'</div>'+
							'<div class="col-md-9 legend-name">'+
								'<input type="text" class="form-control my-border" value="'+labelNomCategoria+'">'+
							'</div>';				
//					
					html+='</div>';						
				}
			}

		}else{
			
			//Si ve de fitxer (te source) o si es simpleTematic, 
			//amb el primer element de rang ja tenim prou, no ens cal recorrer tots el rangs 
			//pq seran tots iguals
			if(layer.options.source || (layer.options.tipusRang && layer.options.tipusRang==tem_simple) ){
				if(size > 0) size = 1;//Control rangs no buit
			}
			
			var geometryType = transformTipusGeometry(layer.options.geometrytype);
			
			if(geometryType == t_marker){
				for(var i=0;i<size;i++){
					
					
					//Si es un punt
					if(rangs[i].isCanvas || rangs[i].marker.indexOf("punt_r")!=-1){
						
						var iconSize="";
						if(rangs[i].iconSize){
							var mides = rangs[i].iconSize.split("#");
							iconSize = 'width: '+mides[0]+'px; height: '+mides[1]+'px;';
						}else{
							var mida = getMidaFromRadius(rangs[i].simbolSize);
							iconSize = 'width: '+mida+'px; height: '+mida+'px; font-size: 8px;';
						}
						
						var color = hexToRgb(rangs[i].color);
						var icon = "";
						var colorIcon=""; 
						if(rangs[i].simbolColor){
							var auxColor = hexToRgb(rangs[i].simbolColor);
							colorIcon = 'color: rgb('+auxColor.r+', '+auxColor.g+', '+auxColor.b+');';
						} 
						
						if(rangs[i].simbol){
							icon = "fa fa-"+rangs[i].simbol;
						}
						
						var obj = {iconSize: iconSize, color: color, icon:icon, colorIcon: colorIcon};
						var existeix = checkPointStyle(obj);
						
						if(!existeix){
							controlLegendPoint.push(obj);
							
							var stringStyle =	'<div class="awesome-marker-web awesome-marker-icon-punt_r '+icon+' legend-symbol" '+
													'style="background-color: rgb('+color.r+', '+color.g+', '+color.b+'); '+colorIcon+
													' '+iconSize+'">'+
												'</div>';

							//Reinicialitzem
							layerName = layer.options.nom;
							checked = "";						
							var index = mapLegend[layer.options.businessId]?findStyleInLegend(mapLegend[layer.options.businessId],stringStyle):-1;
							if(index != -1){//Si l'ha trobat, fica el seu check i el seu name
								layerName = mapLegend[layer.options.businessId][index].name;
								if(mapLegend[layer.options.businessId][index].chck == true) checked = 'checked="checked"';
							}							
							
							html += '<div class="legend-subrow" data-businessid="'+layer.options.businessId+'">';
							html += '<input class="col-md-1 legend-chck" type="checkbox" '+checked+' >';					
							html +=	'<div class="col-md-2 legend-symbol">'+
										stringStyle+
									'</div>'+
									'<div class="col-md-9 legend-name">'+
										'<input type="text" class="form-control my-border" value="'+layerName+'">'+
									'</div></div>';								
						}
					}else{//Si es un pintxo
						var color = hexToRgb(rangs[i].simbolColor);
						
						var obj = {color: color, marker: rangs[i].marker, simbol: rangs[i].simbol};
						var existeix = checkMarkerStyle(obj);
						
						if(!existeix){
							controlLegendMarker.push(obj);
							
							var stringStyle =	'<div class="awesome-marker-web awesome-marker-icon-'+rangs[i].marker+
													' fa fa-'+rangs[i].simbol+'" style="width: 28px; height: 42px; font-size: 14px;'+ 
													'background-color: transparent; color: rgb('+color.r+', '+color.g+', '+color.b+');">'+
												'</div>';
	
							//Reinicialitzem
							layerName = layer.options.nom;
							checked = "";						
							var index = mapLegend[layer.options.businessId]?findStyleInLegend(mapLegend[layer.options.businessId],stringStyle):-1;
							if(index != -1){//Si l'ha trobat, fica el seu check i el seu name
								layerName = mapLegend[layer.options.businessId][index].name;
								if(mapLegend[layer.options.businessId][index].chck == true) checked = 'checked="checked"';
							}							
							
							html += '<div class="legend-subrow" data-businessid="'+layer.options.businessId+'">';
							html += '<input class="col-md-1 legend-chck" type="checkbox" '+checked+' >';						
							html += '<div class="col-md-2 legend-symbol">'+
										stringStyle+
									'</div>'+
									'<div class="col-md-9 legend-name">'+
										'<input type="text" class="form-control my-border" value="'+layerName+'">'+
									'</div></div>';							
						}

					}
					
//					html+='<div class="separate-legend-subrow" ></div>';			
				}				
			}else if(geometryType == t_polyline){
				
				for(var i=0;i<size;i++){
					
					var color = hexToRgb(rangs[i].color);
					var lineWidth = rangs[i].lineWidth;
	
					var obj = {color: color, lineWidth: lineWidth};
					var existeix = checkLineStyle(obj);
					
					if(!existeix){
						controlLegendLine.push(obj);
						
						var stringStyle =	'<svg height="30" width="30">'+
												'<line x1="0" y1="30" x2="30" y2="0" '+
													'style="stroke:rgb('+color.r+', '+color.g+', '+color.b+'); stroke-width:'+lineWidth+';"></line>'+
											'</svg>';
						//Reinicialitzem
						layerName = layer.options.nom;
						checked = "";						
						var index = mapLegend[layer.options.businessId]?findStyleInLegend(mapLegend[layer.options.businessId],stringStyle):-1;
						if(index != -1){//Si l'ha trobat, fica el seu check i el seu name
							layerName = mapLegend[layer.options.businessId][index].name;
							if(mapLegend[layer.options.businessId][index].chck == true) checked = 'checked="checked"';
						}					
						
						html += '<div class="legend-subrow" data-businessid="'+layer.options.businessId+'">';
						html += '<input class="col-md-1 legend-chck" type="checkbox" '+checked+' >';	
						html += '<div class="col-md-2 legend-symbol">'+
											stringStyle +
								'</div>'+
								'<div class="col-md-9 legend-name">'+
									'<input type="text" class="form-control my-border" value="'+layerName+'">'+
								'</div>';					
						
						html+='</div>';						
					}
				}				
			}else if(geometryType == t_polygon){
				
				for(var i=0;i<size;i++){
				
					var color = hexToRgb(rangs[i].color);
					var borderColor = hexToRgb(rangs[i].borderColor);
					var opacity = rangs[i].opacity/100;
					var borderWidth = rangs[i].borderWidth;
					
					var obj = {color: color, borderColor: borderColor, opacity:opacity, borderWidth:borderWidth};
					var existeix = checkPolStyle(obj);					
					
					if(!existeix){
						controlLegendPol.push(obj);					
					
						var stringStyle =	'<svg height="40" width="40">'+
												'<polygon points="5.13 15.82, 25.49 5.13, 37.08 13.16, 20.66 38.01, 2.06 33.67,5.13 15.82" '+
													'style=" fill:rgb('+color.r+', '+color.g+', '+color.b+'); stroke:rgb('+borderColor.r+', '+borderColor.g+', '+borderColor.b+'); stroke-width:'+borderWidth+'; fill-rule:evenodd; fill-opacity:'+opacity+';"></polygon>'+
											'</svg>';
						
						//Reinicialitzem
						layerName = layer.options.nom;
						checked = "";						
						var index = mapLegend[layer.options.businessId]?findStyleInLegend(mapLegend[layer.options.businessId],stringStyle):-1;
						if(index != -1){//Si l'ha trobat, fica el seu check i el seu name
							layerName = mapLegend[layer.options.businessId][index].name;
							if(mapLegend[layer.options.businessId][index].chck == true) checked = 'checked="checked"';
						}						
						
						html += '<div class="legend-subrow" data-businessid="'+layer.options.businessId+'">';
						html += '<input class="col-md-1 legend-chck" type="checkbox" '+checked+' >';					
						html += '<div class="col-md-2 legend-symbol">'+
										stringStyle+
								'</div>'+
								'<div class="col-md-9 legend-name">'+
									'<input type="text" class="form-control my-border" value="'+layerName+'">'+
								'</div>';					
						
						html+='</div>';
					}
				}
			}
		}
	}
	return html;
}

function checkLineStyle(obj){
	var existeix = false;
	for(var i=0; i<controlLegendLine.length && !existeix;i++){
		var item = controlLegendLine[i];
		if(item.lineWidth == obj.lineWidth && 
				item.color.r == obj.color.r && 
				item.color.g == obj.color.g && 
				item.color.b == obj.color.b) existeix = true;
	}
	return existeix;
}

function checkPolStyle(obj){
	var existeix = false;
	for(var i=0; i<controlLegendPol.length && !existeix;i++){
		var item = controlLegendPol[i];
		if(item.opacity == obj.opacity && 
				item.borderWidth == obj.borderWidth &&
				item.borderColor.r == obj.borderColor.r && 
				item.borderColor.g == obj.borderColor.g && 
				item.borderColor.b == obj.borderColor.b	&&			
				item.color.r == obj.color.r && 
				item.color.g == obj.color.g && 
				item.color.b == obj.color.b) existeix = true;
	}
	return existeix;
}

function checkPointStyle(obj){
	var existeix = false;
	for(var i=0; i<controlLegendPoint.length && !existeix;i++){
		var item = controlLegendPoint[i];
		if(item.iconSize == obj.iconSize && 
				item.icon == obj.icon &&
				item.colorIcon.r == obj.colorIcon.r && 
				item.colorIcon.g == obj.colorIcon.g && 
				item.colorIcon.b == obj.colorIcon.b	&&			
				item.color.r == obj.color.r && 
				item.color.g == obj.color.g && 
				item.color.b == obj.color.b) existeix = true;
	}
	return existeix;
}

function checkMarkerStyle(obj){
	var existeix = false;
	for(var i=0; i<controlLegendMarker.length && !existeix;i++){
		var item = controlLegendMarker[i];
		if(item.marker == obj.marker && 
				item.simbol == obj.simbol &&
				item.color.r == obj.color.r && 
				item.color.g == obj.color.g && 
				item.color.b == obj.color.b) existeix = true;
	}
	return existeix;
}

function getRangsFromLayerLegend(layer){
	
	var styles = jQuery.map(layer.getLayers(), function(val, i){
		return {key: val.properties.businessId, style: val};
	});
	
	var tematic = layer.options;
	tematic.tipusRang = tematic.tipusRang ? tematic.tipusRang : tem_origen;
	tematic.businessid = tematic.businessId; 
	tematic.leafletid = layer._leaflet_id;
	tematic.geometrytype = tematic.geometryType;
	tematic.from = tematic.tipusRang;
	
	var rangs = getRangsFromStyles(tematic, styles);
    //rangs = JSON.stringify({rangs:rangs});	
	
    return rangs;
}

function findLabelCategoria(dataField, fid){
	
	var data = map._layers[''+fid+''].properties.data;
	if(!data){
		return map._layers[''+fid+''].properties[''+dataField+''];
	}else if(data.ValorMax && data.ValorMin){
		return data.ValorMax +" - "+ data.ValorMin
	}else{
		return data[''+dataField+''];
	}
}
function updateMapLegendData(){
	
	mapLegend = {};
	$(".legend-subrow").each(function(index,element){
		
		var businessId = $(element).attr('data-businessId');
		var obj = {
				chck : $(element).children( ".legend-chck").is(':checked'),
				symbol : $(element).children( ".legend-symbol").html(),
				name : $(element).children( ".legend-name").children("input").val()					
		};
		if(!mapLegend[businessId]){
			mapLegend[businessId] = [];			
		}
		mapLegend[businessId].push(obj);

	});	
	
	console.debug(mapLegend);
}

function findStyleInLegend(legend,stringStyle){
	var index = -1;
	for(var i=0; i<legend.length;i++){
		if(legend[i].symbol.trim() == stringStyle.trim()){
//		if(stringCompare(legend[i].symbol.trim(),stringStyle.trim())){			
			index = i;
			break;
		}		
	}
	return index;
}

function checkColorAdded(controlColorCategoria, color){
	var existeix = false;
	for(var i=0; i<controlColorCategoria.length && !existeix;i++){	
		if (controlColorCategoria[i].r == color.r &&
				controlColorCategoria[i].g == color.g &&
				controlColorCategoria[i].b == color.b) existeix = true;
	}
	return existeix;
}

/*************** FI:LLEGENDA ********************/
