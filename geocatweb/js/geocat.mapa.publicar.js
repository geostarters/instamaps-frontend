/**
 * Funcionalitat de publicació del mapa
 */

function addControlPublicar(){
	
	if (isRandomUser($.cookie('uid'))){
		jQuery('.bt_publicar').on('click',function(){
			jQuery('.modal').modal('hide');
			_gaq.push(['_trackEvent', 'mapa', tipus_user+'publicar', 'pre-publicar', 1]);
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
	}else{
		//publicar el mapa solo para registrados
		jQuery('.bt_publicar').on('click',function(){
			
			_gaq.push(['_trackEvent', 'mapa', tipus_user+'publicar', 'pre-publicar', 1]);
			
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
			
//			var urlMap = url('protocol')+'://'+url('hostname')+url('path')+'?businessId='+jQuery('#businessId').val()+"&id="+jQuery('#userId').val();
//			urlMap = urlMap.replace('mapa','visor');
			
			var v_url = window.location.href;
			if (!url('?id')){
				v_url += "&id="+jQuery('#userId').val();
			}
			v_url = v_url.replace('localhost',DOMINI);			
			urlMap = v_url.replace('mapa','visor');		
			
			$('#urlMap').val(urlMap);
			$('#iframeMap').val('<iframe width="100%" height="100%" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="'+urlMap+'&embed=1" ></iframe>');
		});
		
		jQuery('#dialgo_publicar .btn-primary').on('click',function(){
			publicarMapa(false);
		});		
	}
	
	$('.bt_publicar').tooltip(opt);
	
}

function publicarMapa(fromCompartir){
	if(!fromCompartir){//Si no venim de compartir, fem validacions del dialeg de publicar
		if(isBlank($('#dialgo_publicar #nomAplicacioPub').val())){
			$('#dialgo_publicar #nomAplicacioPub').addClass("invalid");
			$('#dialgo_publicar #nomAplicacioPub').nextAll('.text_error').remove();
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
	
	//crear los archivos en disco
	var layersId = getBusinessIdOrigenLayers();
	var laydata = {
		uid: $.cookie('uid'),
		servidorWMSbusinessId: layersId
	};
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