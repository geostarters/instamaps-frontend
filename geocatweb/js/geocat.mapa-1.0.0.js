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
var tipus_user_txt;
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
	if(typeof url('?uid') == "string"){
		gestioCookie();
		$.removeCookie('uid', { path: '/' });
		$.cookie('uid', url('?uid'), {path:'/'});
		checkUserLogin();
	}
	
	if(!$.cookie('uid') || $.cookie('uid').indexOf('random')!=-1){
		tipus_user = t_user_random;
		tipus_user_txt = t_user_random_txt;
	}else{
		tipus_user = t_user_loginat;
		tipus_user_txt = t_user_loginat_txt;
		_kmq.push(['identify', $.cookie('uid')]);
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
						$('#descripcio_user').html(mapConfig.options.description);
					}
					
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
									_gaq.push(['_trackEvent', 'mapa', tipus_user+'editar nom aplicacio', 'label editar nom', 1]);
									_kmq.push(['record', 'editar nom aplicacio', {'from':'mapa', 'tipus user':tipus_user_txt}]);
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
		
		jQuery('#dialgo_leave #btn-guest').on('click',function(){
			_gaq.push(['_trackEvent', 'mapa', 'guest']);
			_kmq.push(['record', 'guest', {'from':'mapa', 'tipus user':t_user_random_txt}]);
		});
		
		jQuery('#dialgo_leave').on('hide.bs.modal', function (e) {
			
		});
		
		jQuery('.bt_publicar').on('click',function(){
			jQuery('.modal').modal('hide');
			_gaq.push(['_trackEvent', 'mapa', tipus_user+'publicar', 'pre-publicar', 1]);
			_kmq.push(['record', 'pre-publicar', {'from':'mapa', 'tipus user':tipus_user_txt}]);
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
			_gaq.push(['_trackEvent', 'mapa', tipus_user+'sortir', 'label sortir', 1]);
			_kmq.push(['record', 'sortir', {'from':'mapa', 'tipus user':tipus_user_txt}]);
			deleteRandomUser({uid: $.cookie('uid')});
			$.removeCookie('uid', { path: '/' });
		});
	}else{
		//publicar el mapa solo para registrados
		jQuery('.bt_publicar').on('click',function(){
			
			_gaq.push(['_trackEvent', 'mapa', tipus_user+'publicar', 'pre-publicar', 1]);
			_kmq.push(['record', 'pre-publicar', {'from':'mapa', 'tipus user':tipus_user_txt}]);
			
			//actualizar los campos del dialogo publicar
			$('#nomAplicacioPub').val(mapConfig.nomAplicacio);
			if (mapConfig.visibilitat == visibilitat_open){
				$('#visibilitat_chk').bootstrapSwitch('state', true, true);
			}else{
				$('#visibilitat_chk').bootstrapSwitch('state', false, false);
			}
			if(mapConfig.options){
				$('#optDescripcio').val(mapConfig.options.description);
				$('#optTags').val(mapConfig.options.tags);	
				if (mapConfig.options.llegenda){
					$('#llegenda_chk').bootstrapSwitch('state', true, true);
				}else{
					$('#llegenda_chk').bootstrapSwitch('state', false, false);
				}				
			}

			$('#dialgo_publicar #nomAplicacioPub').removeClass("invalid");
			$( ".text_error" ).remove();
			jQuery('.modal').modal('hide');
			$('#dialgo_publicar').modal('show');
			
			//Dialeg publicar
			$('#publish-private').tooltip({
				placement : 'bottom',
				container : 'body',
				title : window.lang.convert("El mapa només es mostrarà a la teva galeria privada")
			});
			$('#publish-public').tooltip({
				placement : 'bottom',
				container : 'body',
				title : window.lang.convert("El mapa es mostrarà a la galeria pública")
			});				
			
			//Si mapconfig legend, activat, es mostra
			if(mapConfig.options != null && mapConfig.options.llegenda){
				createModalConfigLegend();
				$('#dialgo_publicar .modal-body .modal-legend').show();
			}else{
				$('#dialgo_publicar .modal-body .modal-legend').hide();
			}
			
			$('#llegenda-title-text').text(window.lang.convert('Llegenda'));
			$('#publish-public').text(window.lang.convert('Públic'));
			$('#publish-private').text(window.lang.convert('Privat'));
			$('#publish-legend-yes').text(window.lang.convert('Si'));
			$('#publish-legend-no').text(window.lang.convert('No'));
			$('#publish-warn-text').text(window.lang.convert('El mapa es publicarà amb la vista actual: àrea geogràfica, nivell de zoom i capes visibles'));
			
			var urlMap = url('protocol')+'://'+url('hostname')+url('path')+'?businessId='+jQuery('#businessId').val()+"&id="+jQuery('#userId').val();
			urlMap = v_url.replace('mapa','visor');
			$('#urlMap').val(urlMap);
			$('#iframeMap').val('<iframe width="100%" height="100%" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="'+urlMap+'&embed=1" ></iframe>');
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
	if (!url('?id')){
		v_url += "&id="+jQuery('#userId').val();
	}
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
//			$('#descripcio_user').html(mapConfig.options.description);
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
//		var layer_GeoJSON_custom = download_layer.layer.toGeoJSONcustom();
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
		_kmq.push(['record', 'descarregar capa', {'from':'mapa', 'tipus user':tipus_user_txt, 'formatOUT':formatOUT,'epsgOUT':epsgOUT}]);
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
		updateClasicTematicFromRangs();
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

function addClicksInici() {
	jQuery('.bt_llista').on('click', function(event) {
		aturaClick(event);
		activaPanelCapes();
	});
	
	// new vic
	jQuery('.bt_captura').on('click', function(event) {
		aturaClick(event);
		_gaq.push(['_trackEvent', 'mapa', tipus_user+'captura pantalla', 'label captura', 1]);
		_kmq.push(['record', 'captura pantalla', {'from':'mapa', 'tipus user':tipus_user_txt}]);
		capturaPantalla(CAPTURA_MAPA);
	});
	
	jQuery('.bt_print').on('click', function(event) {
		aturaClick(event);
		_gaq.push(['_trackEvent', 'mapa', tipus_user+'print', 'label print', 1]);
		_kmq.push(['record', 'print', {'from':'mapa', 'tipus user':tipus_user_txt}]);
		capturaPantalla(CAPTURA_INFORME);
	});
		
	jQuery('.bt_geopdf').on('click', function(event) {
		aturaClick(event);
		_gaq.push(['_trackEvent', 'visor', tipus_user+'geopdf', 'label geopdf', 1]);
		_kmq.push(['record', 'geopdf', {'from':'visor', 'tipus user': tipus_user}]);
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
		_gaq.push(['_trackEvent', 'mapa', tipus_user+'fons', fons, 1]);
		_kmq.push(['record', 'fons', {'from':'mapa', 'tipus user':tipus_user_txt, 'fons':fons}]);
		if (fons == 'topoMap') {
			map.topoMap();
		} else if (fons == 'topoMapGeo') {
			map.topoMapGeo();
		}else if (fons == 'topoGrisMap') {
			map.topoGrisMap();
		}else if (fons == 'ortoMap') {
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

	map.on('addItemFinish',function(){
		$(".layers-list").mCustomScrollbar("destroy");		
		$(".layers-list").mCustomScrollbar({
			   advanced:{
			     autoScrollOnFocus: false,
			     updateOnContentResize: true
			   }           
		});			
//		console.debug('addItemFinish!');
//		if($(".layers-list").hasClass('mCustomScrollbar')){
//			//$(".layers-list").mCustomScrollbar("update");			
//		}else{
//			$(".layers-list").mCustomScrollbar({
//				   advanced:{
//				     autoScrollOnFocus: false,
//				     updateOnContentResize: true
//				   }           
//			});				
//		}
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
		//<span class="geopdf">Geo</span>
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
	
	$('.leaflet-conf').tooltip({
		placement : 'left',
		container : 'body',
		title : window.lang.convert("Opcions")
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
			_gaq.push(['_trackEvent', 'mapa', tipus_user+'fons', fons, 1]);
			_kmq.push(['record', 'fons', {'from':'mapa', 'tipus user':tipus_user_txt, 'fons':fons}]);
			map.historicMap();
		}
		if (fons == 'historicOrtoMap') {
			_gaq.push(['_trackEvent', 'mapa', tipus_user+'fons', fons, 1]);
			_kmq.push(['record', 'fons', {'from':'mapa', 'tipus user':tipus_user_txt, 'fons':fons}]);
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
				+ '<div id="topoGrisMap" lang="ca" data-toggle="tooltip" title="Topogràfic gris" class="div_fons_2"></div>'
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
		_gaq.push(['_trackEvent', 'mapa', tipus_user+'fons', fons, 1]);
		_kmq.push(['record', 'fons', {'from':'mapa', 'tipus user':tipus_user_txt, 'fons':fons}]);
		if (fons == 'topoGrisMap') {
			map.topoGrisMap();
		}else{
			map.colorMap(fons);			
		}
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
//				jQuery.each(results.results, function(i,item){
//					if(item.options){
//						var options = jQuery.parseJSON( item.options );
//						console.debug(i+":"+item.serverName+"-"+options.geometryType);
//					}else{
//						console.debug(i+":"+item.serverName);
//					}
//				});
				var html1 = template1(results);				
				jQuery("#id_sw").append(html1);
				
				$("#listnav-teves-dades").listnav({
				    initLetter: '',
				    allText: window.lang.convert('Tots'),
				    noMatchText: window.lang.convert('No hi ha entrades coincidents')
				});
				
				jQuery("ul.llista-teves-dades").on('click', '.usr_wms_layer', function(event) {
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
							_gaq.push(['_trackEvent', 'mapa', tipus_user+'carregar meves dades', value.serverType, 1]);
							_kmq.push(['record', 'carregar meves dades', {'from':'mapa', 'tipus user':tipus_user_txt, 'serverType':value.serverType}]);
							
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
							$('#dialog_teves_dades').modal('hide');
							activaPanelCapes(true);
						}		
					});							
				});					
						
				//Eliminem servidors
				jQuery("ul.llista-teves-dades").on('click', 'span.glyphicon-remove', function(event) {
					event.preventDefault();
					event.stopPropagation();
					var _this = jQuery(this);
					var data = {
						uid: $.cookie('uid'),
						businessId: _this.data("businessid")
					};
					
					var firstLetter = _this.data("servername").charAt(0).toLowerCase();
					if($.isNumeric(firstLetter)) firstLetter = "_";
					
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
							}else{
								//jQuery("ln-letter-count").init();
//								console.debug(globalCounts);
								globalCounts[''+firstLetter +'']--;
//								console.debug(globalCounts[''+firstLetter +'']);
//								if(globalCounts[''+firstLetter +'']<=0){
//									jQuery(".ln-letters."+firstLetter).addClass('ln-disabled');
//									//jQuery(".ln-letters."+firstLetter).removeClass('ln-selected');
//								}
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
							}else{
//								console.debug(globalCounts);
								globalCounts[''+firstLetter +'']--;
//								console.debug(globalCounts[''+firstLetter +'']);
//								if(globalCounts[''+firstLetter +'']<=0){
//									jQuery(".ln-letters."+firstLetter).addClass('ln-disabled')
//								}
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
//			}else if(tbA == "#id_srvj"){
//				jQuery(tbA).empty();
//				jQuery(tbA).html(_htmlServeisJSON.join(' '));
//				jQuery("#bt_connJSON").on('click', function(e) {
//					if(e.target.id !="#id_srvj"){
//						getServeiJSONP(jQuery("#txt_URLJSON").val());
//					}
//				});		
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
			}else if(tbA == "#id_url_file"){
				jQuery(tbA).empty();

				//Carreguem exemples de dades externes 
				//_htmlServeisWMS.push('<div class="panel-success"><ul class="bs-dadesO panel-heading">');
				var lDadesExternes = '<ul class="bs-dadesO panel-heading llista-dadesExternes">';
				jQuery.each(llista_dadesExternes.dadesExternes, function(key, dadesExternes) {
						lDadesExternes += '<li><a class="label-dadesExternes" href="#" data-url="'
							+ dadesExternes.urlDadesExternes
							+ '" data-format="'
							+ dadesExternes.formatDadesExternes
							+ '" data-epsg="'
							+ dadesExternes.epsgDadesExternes
							+ '">'
							+ window.lang.convert(dadesExternes.titol)
							+ '</a>'
							+ '<a target="_blank" lang="ca" title="Informació" href="'
							+ dadesExternes.urlOrganitzacio
							+ '"><span class="glyphicon glyphicon-info-sign info-dadesExternes"></span></a>'
							+ '</li>';
				});				
				lDadesExternes += '</ul>';
				
				jQuery(tbA).html(
						'<div class="panel-dadesExternes">'+
							lDadesExternes +
							'<div class="input-group txt_ext">'+
								'<input type="text" lang="ca" class="form-control" value="" placeholder="'+window.lang.convert("Entrar URL de dades externes")+'" style="height:33px" id="txt_URLfile">'+ 
								'<span class="input-group-btn">'+
									'<button type="button" id="bt_URLfitxer" class="btn btn-success">'+
										'<span class="glyphicon glyphicon-play"></span>'+
									'</button>'+
								'</span>'+
							'</div>'+
						'</div>'+
						'<div id="div_url_file"  class="tbl_url_file"></div>'
//						+'<div id="div_emptyJSON" style="height: 35px;margin-top: 2px"></div>'
				);
				
				jQuery("#div_url_file").hide();
				
				jQuery(".label-dadesExternes").on('click', function(e) {
					//console.debug(e);
					//URL PRESIDENT JSON
					if(this.dataset.url.indexOf(paramUrl.presidentJSON)!= -1){
						jQuery("#div_url_file").show();
						jQuery("#div_url_file").html(
								'<div style="height:230px;overflow:auto" id="div_layersJSON"  class="tbl"></div>'+
								'<div id="div_emptyJSON" style="height: 35px;margin-top: 2px"></div>'
						);
						getServeiJSONP(this.dataset.url);
						
					}else{//LA RESTA
						createURLfileLayer(this.dataset.url, this.dataset.format, this.dataset.epsg, false, this.text);
					}
				});
				
				jQuery("#bt_URLfitxer").on('click', function(e) {
					jQuery("#div_url_file").show();
					var urlFile = jQuery("#txt_URLfile").val();
					if(ValidURL(urlFile)){
						
						//URL PRESIDENT JSON
						if(urlFile.indexOf(paramUrl.presidentJSON)!= -1){
							jQuery("#div_url_file").html(
									'<div style="height:230px;overflow:auto" id="div_layersJSON"  class="tbl"></div>'+
									'<div id="div_emptyJSON" style="height: 35px;margin-top: 2px"></div>'
							);
							getServeiJSONP(urlFile);
							
						}else{//LA RESTA
							jQuery("#div_url_file").html(
									'<br>'+
									'<div class="input-group input-group-sm">'+
										'<span lang="ca" class="input-group-addon">'+window.lang.convert("Nom capa")+'</span>'+
										'<input type="text" id="input-url-file-name" class="form-control">'+
									'</div>'+	
									'<br>'+
									'<div>'+
									window.lang.convert("Format")+
									':&nbsp;'+
										'<select id="select-url-file-format" class="form-download-format">'+
										  '<option value=".geojson">GeoJSON</option>'+
										  '<option value=".shp">ESRI Shapefile</option>'+
										  '<option value=".dxf">DXF</option>'+
										  '<option value=".kml">KML</option>'+
										  '<option value=".gpx">GPX</option>'+
										  '<option value=".kmz">KMZ</option>'+
										  '<option value=".zip">Zip File</option>'+
										  '<option value="-1">'+window.lang.convert("Selecciona el Format")+'</option>'+
										'</select>'+
										'<br><br>'+
									'EPSG:&nbsp;'+
										'<select id="select-url-file-epsg" class="form-download-epsg">'+
											'<option value="EPSG:4326">EPSG:4326 (WGS84 geogràfiques (lat, lon) - G.G)</option>'+
					              			'<option value="EPSG:23031"><b>EPSG:23031</b> (ED50-UTM 31N Easting,Northing o X,Y)</option>'+
					              			'<option value="EPSG:25831">EPSG:25831 (ETRS89-UTM 31N Easting,Northing o X,Y)</option>'+
					              			'<option value="EPSG:4258">EPSG:4258 INSPIRE(ETRS89 geogràfiques (lat, lon) - G.G)</option>'+
					              			'<option value="EPSG:4230">EPSG:4230 (ED50 geogràfiques (lat, lon) - G.G)</option>'+
					              			'<option value="EPSG:32631">EPSG:32631 (WGS84 31N Easting,Northing o X,Y)</option>'+
					              			'<option value="EPSG:3857">EPSG:3857 (WGS84 Pseudo-Mercator Easting,Northing o X,Y)</option>'+
					              			'<option value="-1">'+window.lang.convert("Selecciona el EPSG")+'</option>'+
										'</select>'+
										'<br><br>'+								
										'<input id="dinamic_chck" type="checkbox" checked="checked">'+
										'&nbsp;'+window.lang.convert("Dinàmica")+
										'<br><small lang="ca" class="label label-success" id="label-dinamic">'+
											window.lang.convert("Dinàmic: S'accedirà a la font de dades cada cop que es carregui la capa")+
										'</small>'+
									'</div>&nbsp;'+
									'<div>'+
										'<span class="input-group-btn">'+
										'<button type="button" id="bt_URLfitxer_go" class="btn btn-success">'+
											'<span class="glyphicon glyphicon-play"></span>'+
										'</button>'+
										'</span>'+
									'</div>'+
									'<div id="div_url_file_message" class="alert alert-danger"></div>'
							);
							
							jQuery("#div_url_file_message").hide();
							
							//Comprovem tipus del file
							var type = "-1";
							if(urlFile.indexOf(t_file_kml)!=-1) type = t_file_kml;
							else if(urlFile.indexOf(t_file_gpx)!=-1) type = t_file_gpx;
							else if(urlFile.indexOf(t_file_shp)!=-1) type = t_file_shp;
							else if(urlFile.indexOf(t_file_dxf)!=-1) type = t_file_dxf;
//							else if(urlFile.indexOf(t_file_csv)!=-1) type = t_file_csv;
//							else if(urlFile.indexOf(t_file_wkt)!=-1) type = t_file_wkt;
							else if(urlFile.indexOf(t_file_topojson)!=-1) type = t_file_geojson;
							else if(urlFile.indexOf(t_file_geojson)!=-1) type = t_file_geojson;
							else if(urlFile.indexOf(t_file_json)!=-1) type = t_file_geojson;
							
							$('#select-url-file-format option[value="'+type+'"]').prop("selected", "selected");
							
							if (type==".kml" ||type==".gpx"){
								$('#select-url-file-epsg option[value="EPSG:4326"]').prop("selected", "selected");
								jQuery("#select-url-file-epsg").attr('disabled',true);
							}else{
								$('#select-url-file-epsg option[value="-1"]').prop("selected", "selected");
								jQuery("#select-url-file-epsg").attr('disabled',false);
							}
							
							var nom_capa = window.lang.convert("Capa de fitxer");
							if(type!="-1") nom_capa+=type;
							jQuery("#input-url-file-name").val(nom_capa);
							
							jQuery("#bt_URLfitxer_go").on('click', function(e) {
								e.stopImmediatePropagation();
//								e.stopPropagation();
//								e.preventDefault();
								console.debug("bt_URLfitxer_go");
								jQuery("#div_url_file_message").empty();
								jQuery("#div_url_file_message").hide();
								var urlFile = jQuery("#txt_URLfile").val();
								var type = jQuery("#select-url-file-format").val();
								var epsg = jQuery("#select-url-file-epsg").val();
								
								if(type.indexOf("-1")!= -1 || epsg.indexOf("-1")!= -1){
									if(type.indexOf("-1")!= -1) jQuery("#select-url-file-format").addClass("class_error");
									if(epsg.indexOf("-1")!= -1) jQuery("#select-url-file-epsg").addClass("class_error");
								}else{
									console.debug("abans createURLfileLayer");
									createURLfileLayer(urlFile, type, epsg, $("#dinamic_chck").is(':checked'),jQuery("#input-url-file-name").val());
									console.debug("despres createURLfileLayer");
								}
							});
							
							jQuery("#select-url-file-epsg").change(function(){
								jQuery(this).removeClass("class_error");
								jQuery("#div_url_file_message").empty();
								jQuery("#div_url_file_message").hide();
							});						
							
							jQuery('#select-url-file-format').change(function() {
								jQuery(this).removeClass("class_error");
								jQuery("#div_url_file_message").empty();
								jQuery("#div_url_file_message").hide();
								var ext = jQuery(this).val();
								if ((ext==".kml")||(ext==".gpx")){
									$('#select-url-file-epsg option[value="EPSG:4326"]').prop("selected", "selected");
									jQuery("#select-url-file-epsg").attr('disabled',true);
								}else{
									jQuery("#select-url-file-epsg").attr('disabled',false);	
								}
							});								
						}
						
					}else{
						jQuery("#div_url_file").html(
								'<div id="txt_URLfile_error" class="alert alert-danger">'+
									'<span class="glyphicon glyphicon-warning-sign"> </span> '+
   									 window.lang.convert("Introdueix una URL vàlida")+
								'</div>'
						);
					}
				});
				
				$("#txt_URLfile").focus(function() {
					jQuery("#div_url_file").empty();
					jQuery("#div_url_file").hide();
				});				
			}		
		});
	})
}

function pLeft() {
	return jQuery(".leaflet-left").css('left');
}

function addCapaDadesObertes(dataset,nom_dataset) {

	_gaq.push(['_trackEvent', 'mapa', tipus_user+'dades obertes', nom_dataset, 1]);
	_kmq.push(['record', 'dades obertes', {'from':'mapa', 'tipus user':tipus_user_txt, 'dataset':nom_dataset}]);
	
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
//		dataType : "jsonp",
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
		},
		middleware:function(data){
            
            if(data.status && data.status.indexOf("ERROR")!=-1){
        		if(data.results.indexOf("CONVERT ERROR")!= -1){
    			var txt_error = window.lang.convert("Error en el tractament de les dades");
    			jQuery("#div_do_message").html('<div class="alert alert-danger">'+txt_error+'</div>');
	    		}
	    		else{
	    			var txt_error = window.lang.convert("Impossible accedir a la font de dades");
	    			jQuery("#div_do_message").html('<div class="alert alert-danger">'+txt_error+'</div>');
	    		}            	
            }else{
            	
            	capaDadaOberta.addData(data);
            	
            	if(typeof url('?businessid') == "string"){
    				var data = {
    					uid:$.cookie('uid'),
    					mapBusinessId: url('?businessid'),
    					serverName: nom_dataset,
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
            }
            
        }
	});
	
	
//	L.Util.jsonp(param_url).then(function(data){
//		
//		capaDadaOberta.on('data:loaded', function(e){
//			
//			if(typeof url('?businessid') == "string"){
//				var data = {
//					uid:$.cookie('uid'),
//					mapBusinessId: url('?businessid'),
//					serverName: nom_dataset,
//					serverType: t_dades_obertes,
//					calentas: false,
//		            activas: true,
//		            visibilitats: true,
//		            order: controlCapes._lastZIndex+1,
//		            epsg: '4326',
//		            transparency: true,
//		            visibilitat: visibilitat_open,
//					options: '{"dataset":"'+dataset+'","estil_do":{"radius":"'+estil_do.radius+'","fillColor":"'+estil_do.fillColor+'","color":"'+estil_do.color+'","weight":"'+estil_do.weight+'","opacity":"'+estil_do.opacity+'","fillOpacity":"'+estil_do.fillOpacity+'","isCanvas":"'+estil_do.isCanvas+'"}}'			
//				};
//				
//				createServidorInMap(data).then(function(results){
//					if (results.status == "OK"){
//						capaDadaOberta.nom = nom_dataset;// +" ("+datasetLength+")";
//						capaDadaOberta.options.businessId = results.results.businessId;
//						capaDadaOberta.addTo(map)
//						capaDadaOberta.options.zIndex = controlCapes._lastZIndex+1;
////						updateControlCapes(capaDadaOberta, nom_dataset, true);
//						controlCapes.addOverlay(capaDadaOberta, nom_dataset, true);
//						controlCapes._lastZIndex++;
//						activaPanelCapes(true);
////						$(".layers-list").mCustomScrollbar({
////							   advanced:{
////							     autoScrollOnFocus: false,
////							     updateOnContentResize: true
////							   }           
////						});							
//					}
//				});
//				
//			}else{
//				capaDadaOberta.nom = nom_dataset;// +" ("+datasetLength+")";
//				capaDadaOberta.addTo(map);
//				capaDadaOberta.options.zIndex = controlCapes._lastZIndex+1;
//				controlCapes.addOverlay(capaDadaOberta, nom_dataset, true);
//				controlCapes._lastZIndex++;
//				activaPanelCapes(true);
////				$(".layers-list").mCustomScrollbar({
////					   advanced:{
////					     autoScrollOnFocus: false,
////					     updateOnContentResize: true
////					   }           
////				});
//			}		
//			
//		});	
//		
//	},function(data){
//		if(data.results.indexOf("CONVERT ERROR")!= -1){
//			var txt_error = window.lang.convert("Error en el tractament de les dades");
//			jQuery("#div_do_message").html('<div class="alert alert-danger">'+txt_error+'</div>');
//		}
//		else{
//			var txt_error = window.lang.convert("Impossible accedir a la font de dades");
//			jQuery("#div_do_message").html('<div class="alert alert-danger">'+txt_error+'</div>');
//		}
//	});	
	

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
//	$(".layers-list").mCustomScrollbar({
//		   advanced:{
//		     autoScrollOnFocus: false,
//		     updateOnContentResize: true
//		   }           
//	});		
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
					//if(ll.indexOf('.gif')!=-1 || ll.indexOf('.jpg')!=-1){
					if(isImgURL(ll)){
						out.push('<img width="100" src="'+ll+'"/>');
					}else{
						out.push('<b>'+key +'</b>: <a target="_blank" href="http://'+ll+'"/>'+ll+'</a>');
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
		_htmlDadesObertes.push('</ul><div id="div_do_message"></div></div>');
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
		
//		//carga las capas en el mapa
//		loadOrigenWMS().then(function(results){
//			var num_origen = 0;
//			jQuery.each(results.origen, function(index, value){
//				loadLayer(value).then(function(){
//					num_origen++;
//					if (num_origen == results.origen.length){
//						if($.isEmptyObject(results.sublayers)){
//							$(".layers-list").mCustomScrollbar();
//						}else{
//							var num_sublayers = 0;
//							jQuery.each(results.sublayers, function(index, value){
//								loadLayer(value).then(function(){
//									num_sublayers++;
//									if (num_sublayers == results.sublayers.length){
////										$(".layers-list").mCustomScrollbar();
//										$(".layers-list").mCustomScrollbar({
//											   advanced:{
//											     autoScrollOnFocus: false,
//											     updateOnContentResize: true
//											   }           
//											});										
//									}
//								});
//							});							
//						}
//					}
//				});
//			});
//		});		
		
		jQuery('#div_loading').hide();
	}
	
	/*
	var source = $("#map-properties-template").html();
	var template = Handlebars.compile(source);
	var html = template(mapConfig);
	$('#frm_publicar').append(html);
	*/
	
	
	$('.make-switch').bootstrapSwitch();
	//Configurar Llegenda
	$('input[name="my-legend-checkbox"]').on('switchChange.bootstrapSwitch', function(event, state) {
//		alert("Llegenda");
		//console.debug(state);
		//console.debug(state.value);
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
		if(isBlank($('#dialgo_publicar #nomAplicacioPub').val())){
			$('#dialgo_publicar #nomAplicacioPub').addClass("invalid");
			$('#dialgo_publicar #nomAplicacioPub').after("<span class=\"text_error\" lang=\"ca\">El camp no pot estar buit</span>");
			return false;
		}else if(isDefaultMapTitle($('#dialgo_publicar #nomAplicacioPub').val())){
            $('#dialgo_publicar #nomAplicacioPub').addClass("invalid");
            $('#dialgo_publicar #nomAplicacioPub').nextAll('.text_error').remove();
            $('#dialgo_publicar #nomAplicacioPub').after("<span class=\"text_error\" lang=\"ca\">Introdueix un nom vàlid per a la publicació del mapa</span>");
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
	options.idusr = jQuery('#userId').val();
	//console.debug(options);
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
	if(!fromCompartir) nomApp = jQuery('#dialgo_publicar #nomAplicacioPub').val();
	
	var data = {
		nom: nomApp, //jQuery('#dialgo_publicar #nomAplicacio').val(),
		uid: $.cookie('uid'),
		visibilitat: visibilitat,
		tipusApp: 'vis',
		options: options,
		legend: JSON.stringify(mapLegend),
		layers: JSON.stringify(layers)
	};
	
	//Enregistrem tipus de fons i visibilitat
	_gaq.push(['_trackEvent', 'mapa', tipus_user+'publicar', visibilitat+"#"+map.options.typeMap, 1]);
	_kmq.push(['record', 'publicar', {'from':'mapa', 'tipus user':tipus_user_txt, 'visibilitat':visibilitat, 'fons':map.options.typeMap}]);
	
	//crear los archivos en disco
	var layersId = getBusinessIdOrigenLayers();
	var laydata = {
		uid: $.cookie('uid'),
		servidorWMSbusinessId: layersId
	};
	publicarCapesMapa(laydata);
	
	//Captura Map per la Galeria
	capturaPantalla(CAPTURA_GALERIA);
	
	if (newMap){
		createMap(data).then(function(results){
			if (results.status == "ERROR"){
				//TODO Mensaje de error
			}else{
				mapConfig = results.results;
				mapConfig.options = $.parseJSON( mapConfig.options );
				jQuery('#businessId').val(mapConfig.businessId);
				mapConfig.newMap = false;
				var mapData = {
					businessId: mapConfig.businessId,
					uid: $.cookie('uid')
				};
				publicarMapConfig(mapData);
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
					$('#nomAplicacio').editable('setValue', mapConfig.nomAplicacio);
					$('#dialgo_url_iframe').modal('show');					
				}
				var mapData = {
					businessId: mapConfig.businessId,
					uid: $.cookie('uid')
				};
				publicarMapConfig(mapData);
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
	
	_gaq.push(['_trackEvent', 'mapa', tipus_user+'twitter', hashtag, 1]);
	_kmq.push(['record', 'twitter', {'from':'mapa', 'tipus user':tipus_user_txt, 'hashtag':hashtag}]);
	
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
//				$(".layers-list").mCustomScrollbar({
//					   advanced:{
//					     autoScrollOnFocus: false,
//					     updateOnContentResize: true
//					   }           
//				});					
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
//		$(".layers-list").mCustomScrollbar({
//			   advanced:{
//			     autoScrollOnFocus: false,
//			     updateOnContentResize: true
//			   }           
//		});			
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
	
	_gaq.push(['_trackEvent', 'mapa', tipus_user+'panoramio', 'label panoramio', 1]);
	_kmq.push(['record', 'panoramio', {'from':'mapa', 'tipus user':tipus_user_txt}]);
	
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
//				$(".layers-list").mCustomScrollbar({
//					   advanced:{
//					     autoScrollOnFocus: false,
//					     updateOnContentResize: true
//					   }           
//				});					
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
	
	_gaq.push(['_trackEvent', 'mapa', tipus_user+'wikipedia', 'label wikipedia', 1]);
	_kmq.push(['record', 'wikipedia', {'from':'mapa', 'tipus user':tipus_user_txt}]);
	
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
//				$(".layers-list").mCustomScrollbar({
//					   advanced:{
//					     autoScrollOnFocus: false,
//					     updateOnContentResize: true
//					   }           
//				});					
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
						_kmq.push(['record', 'editar nom capa', {'from':'mapa', 'tipus user':tipus_user_txt}]);
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
	
	//Hide les opcions de configuracio
//	jQuery('.options-conf').hide();
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
		console.debug(results);
		//gestioCookie('carregaDadesUsuari');
	});
}

function loadDadesObertesLayer(layer){
	
	var defer = $.Deferred();
	
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
				
		if (!layer.capesOrdre || layer.capesOrdre == null || layer.capesOrdre == 'null'){
			capaDadaOberta.options.zIndex = controlCapes._lastZIndex + 1;
		}else{
			capaDadaOberta.options.zIndex = parseInt(layer.capesOrdre);
		}		
		
//		controlCapes.addOverlay(capaDadaOberta, layer.serverName, true);	
//		controlCapes._lastZIndex++;
		
		if(!options.origen){
			//Fins que no estigui carregada del tot no afegim al controlcapes (per tenir be el comptador de features)
			capaDadaOberta.on('data:loaded', function(e){
				controlCapes.addOverlay(capaDadaOberta, layer.serverName, true);
				controlCapes._lastZIndex++;
				defer.resolve();
			});
		}else{//Si te origen es una sublayer
			var origen = getLeafletIdFromBusinessId(options.origen);
			capaDadaOberta.options.zIndex = capesOrdre_sublayer;
			controlCapes.addOverlay(capaDadaOberta, layer.serverName, true, origen);
			defer.resolve();
		}		
		
	}else if(options.tem == tem_cluster){
		loadDadesObertesClusterLayer(layer);
		defer.resolve();
	}else if(options.tem == tem_heatmap){
		loadDOHeatmapLayer(layer);
		defer.resolve();
	}
	return defer.promise();
}

function loadWmsLayer(layer){
	
	var newWMS = L.tileLayer.betterWms(layer.url, {
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


function updateControlCapes(layer, layername, sublayer, groupLeafletId){
	
	controlCapes.addOverlay(layer, layername, sublayer, groupLeafletId);
	if(groupLeafletId==null)controlCapes._lastZIndex++;
	activaPanelCapes(true);
	$(".layers-list").mCustomScrollbar({
		   advanced:{
		     autoScrollOnFocus: false,
		     updateOnContentResize: true
		   }           
	});		
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
	//Obrim modal llegenda
	//console.debug(controlCapes);
	//console.debug(map._layers);
	var html = '<h4 lang="ca" id="llegenda-title-text" class="modal-title">Llegenda</h4>';
	html += '<div class="separate-legend-row"></div>';
	html += '<div class="legend-row">'+
				'<div class="legend-subrow-all">'+
				'<input id="legend-chck-all" class="col-md-1 legend-chck" type="checkbox">'+
				'<div class="col-md-9 legend-name-all">'+
					window.lang.convert('Tots')+
				'</div>'+
			'</div>';
	html += '<div class="separate-legend-row"></div>';
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
			html += addLayerToLegend(sublayer.layer, count, sublayer.layerIdParent);
		});
		
		html+='</div><div class="separate-legend-row"></div>';
		//console.debug(html);
	});	
	$('#dialgo_publicar .modal-body .modal-legend').html(html);
	$('#dialgo_publicar .modal-body .modal-legend').show();
//	$('#dialog_llegenda').modal('show');
	$('#legend-chck-all').on('click', function(e){
		 if($('#legend-chck-all').is(':checked')){
			 $('.legend-chck').prop('checked', true);
		 }else{
			 $('.legend-chck').prop('checked', false);
		 }
	});	
}

function addLayerToLegend(layer, count, layerIdParent){
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
		//console.debug(rangs);
		var size = rangs.length;
		
		//Classic tematic
		if(layer.options.tipusRang && layer.options.tipusRang==tem_clasic){
			var geometryType = transformTipusGeometry(layer.options.geometrytype);
			var i = 0;
			var controlColorCategoria = [];//per controlar que aquell color no esta afegit ja a la llegenda
			
			var listRangs = layer.options.rangs;
			listRangs.sort(sortByValorMax);
			
			for(i;i<listRangs.length && controlColorCategoria.length<10;i++){

				var color = hexToRgb(listRangs[i].color);
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
					else labelNomCategoria = findLabelCategoria(listRangs[i], layer.options.rangsField);
//					else labelNomCategoria = findLabelCategoria(layer.options.dataField, rangs[i].featureLeafletId, layer._leaflet_id, layerIdParent);
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

function findLabelCategoria(rang, rangsField){
	if(rang.valorMin){
		return rangsField +": "+rang.valorMin +" - "+ rang.valorMax;
	}else{
		return rang.valorMax;
	}
}

//This will sort your array
function sortByValorMax(a, b){
	var aName = a.valorMax.toLowerCase();
	var bName = b.valorMax.toLowerCase(); 
	return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
//	if (a.valorMax < b.valorMax) return -1;
//	if (a.valorMax > b.valorMax) return 1;
//	return 0;	
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

function aturaClick(event){try{event.stopImmediatePropagation();}catch(err){}}
