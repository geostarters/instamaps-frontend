/**
 * Funcionalitat de publicació del mapa
 */

function addControlPublicar(){
	
	if (!$.cookie('collaborateuid')) addHtmlInterficiePublicar();
	else  addHtmlInterficiePublicarDisable();
		
	addHtmlModalPublicar();
	addHtmlModalIframePublicar();
	
	if (isRandomUser($.cookie('uid'))){
		jQuery('.bt_publicar').on('click',function(){
			jQuery('.modal').modal('hide');
			_gaq.push(['_trackEvent', 'mapa', tipus_user+'publicar', 'pre-publicar', 1]);
//			_kmq.push(['record', 'publicar previ', {'from':'mapa', 'tipus user':tipus_user}]);
			
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
//			_kmq.push(['record', 'publicar previ', {'from':'mapa', 'tipus user':tipus_user}]);
			
			//actualizar los campos del dialogo publicar
			//console.debug(mapConfig.nomAplicacio);
			if (isDefaultMapTitle(mapConfig.nomAplicacio)) $('#nomAplicacioPub').val("");
			else $('#nomAplicacioPub').val(mapConfig.nomAplicacio);
			if (mapConfig.visibilitat == visibilitat_open){
				$('#visibilitat_chk').bootstrapSwitch('state', true, true);
				$('.protegit').hide();
			}else{
				$('#visibilitat_chk').bootstrapSwitch('state', false, false);
				if (mapConfig.clau){
					$('#is_map_protegit').iCheck('check');
					$('#map_clau').prop('disabled',true);
					$('#map_clau').val(randomString(10));
				}else{
					$('#is_map_protegit').iCheck('uncheck');
					$('#map_clau').prop('disabled',true);
					$('#map_clau').val('');
				}
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
			
			createModalConfigDownload();

			$('#dialgo_publicar #nomAplicacioPub').removeClass("invalid");
			$( ".text_error" ).remove();
			jQuery('.modal').modal('hide');
			$('#dialgo_publicar').modal('show');
			
			
			//Dialeg publicar
			$('#publish-private').tooltip({
				placement : 'bottom',
				container : 'body'
			});
			$('#publish-public').tooltip({
				placement : 'bottom',
				container : 'body'
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
			urlMap = urlMap.replace('#no-back-button','');
			//$('#urlVisorMap').html('<a href="'+urlMap+'" target="_blank" lang="ca">Anar a la visualització del mapa&nbsp;&nbsp;<span class="glyphicon glyphicon-share-alt"></span></a>');
			$("#urlVisorMap a").attr("href", urlMap);
			$('#urlMap').val(urlMap);
			$('#iframeMap').val('<iframe width="100%" height="100%" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="'+urlMap+'&embed=1" ></iframe>');
		});
		
		jQuery('#dialgo_publicar .btn-primary').on('click',function(){
			publicarMapa(false);
		});		
	}
		
	$('.bt_publicar').tooltip({
		placement : 'right',
		container : 'body'
	});
}

function publicarMapaRandom(){
	var visibilitat = visibilitat_privat;
		
}

function publicarMapa(fromCompartir){
	if(!fromCompartir){//Si no venim de compartir, fem validacions del dialeg de publicar
		if(isBlank($('#dialgo_publicar #nomAplicacioPub').val())){
			$('#dialgo_publicar #nomAplicacioPub').addClass("invalid");
			$('#dialgo_publicar #nomAplicacioPub').nextAll('.text_error').remove();
			$('#dialgo_publicar #nomAplicacioPub').after("<span class=\"text_error\" lang=\"ca\">"+window.lang.convert('El camp no pot estar buit')+"</span>");
			return false;
		}else if(isDefaultMapTitle($('#dialgo_publicar #nomAplicacioPub').val())){
			$('#dialgo_publicar #nomAplicacioPub').addClass("invalid");
			$('#dialgo_publicar #nomAplicacioPub').nextAll('.text_error').remove();
			$('#dialgo_publicar #nomAplicacioPub').after("<span class=\"text_error\" lang=\"ca\">"+window.lang.convert("Introdueix un nom vàlid per a la publicació del mapa")+"</span>");
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
	
	//Revisio de capes amb permis de descarrega
	updateDownloadableData();
//	console.debug('downloadableData');
//	console.debug(downloadableData);
	
	options.layers = true;
	options.social = true;
	options.fons = map.getActiveMap();
	options.fonsColor = map.getMapColor();
	options.idusr = jQuery('#userId').val();
	options.downloadable = downloadableData;
	
//	console.debug(options);
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
	
	//Captura Map per la Galeria
	capturaPantalla(CAPTURA_GALERIA);	
	
	if(!mapConfig.clau){
		if($('#is_map_protegit').is(':checked')){
			if($.trim($('#map_clau').val()) != ""){
				data.clauVisor = $.trim($('#map_clau').val());
			}
		}
		callPublicarMapa(data, newMap, fromCompartir);
	}else{
		if(!$('#is_map_protegit').is(':checked') || visibilitat == visibilitat_open){
			var mapData = {
				businessId: mapConfig.businessId,
				uid: $.cookie('uid')
			};
			resetClauMapa(mapData).then(function(results){
				mapConfig.clau = null;
				$('#map_clau').val('');
				callPublicarMapa(data, newMap, fromCompartir);
			});
		}else{
			callPublicarMapa(data, newMap, fromCompartir);
		}
	}
}

function callPublicarMapa(data, newMap, fromCompartir){
	if (newMap){
		createMap(data).then(function(results){
			if (results.status == "ERROR"){
				//TODO Mensaje de error
			}else{
				mapConfig = results.results;
				mapConfig.options = $.parseJSON( mapConfig.options );
				mapConfig.newMap = false;
				var mapData = {
					businessId: mapConfig.businessId,
					uid: $.cookie('uid')
				};
				publicarMapConfig(mapData);
				
				jQuery('#businessId').val(mapConfig.businessId);
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
				var mapData = {
					businessId: mapConfig.businessId,
					uid: $.cookie('uid')
				};
				publicarMapConfig(mapData);
				
				if(!fromCompartir){
					$('#dialgo_publicar').modal('hide');
					//update map name en el control de capas
					$('#nomAplicacio').text(mapConfig.nomAplicacio);
					$('#nomAplicacio').editable('setValue', mapConfig.nomAplicacio);
					$('#dialgo_url_iframe').modal('show');					
					addShareButtons(); 
				}
			}
		});
	}
}

function createModalConfigDownload(){
	
	var count = 0;
	var html = '<label class="control-label" lang="ca">'+
					window.lang.convert('Capes reutilitzables pels altres usuaris:')+
				'</label>&nbsp;<span class="glyphicon glyphicon-download-alt"></span>';
	
	html += '<div id="div_downloadable">'+
				'<div class="separate-downloadable-row-all"></div>'+
				'<div class="downloadable-subrow-all">'+
				'<div class="col-md-9 downloadable-name-all">'+
					window.lang.convert('Totes')+
				'</div>'+
				'<input id="downloadable-chck-all" class="col-md-1 download-chck" type="checkbox">'+
			'</div>';
	html += '<div class="separate-downloadable-row-all"></div>';	
	
	jQuery.each(controlCapes._layers, function(i, item){
		
		var layer = item.layer;
		var layerName = layer.options.nom;
		var checked = "";
		
		var tipusLayer = "";
		if(layer.options.tipus) tipusLayer = layer.options.tipus;
		
		//Si no es WMS
		if(tipusLayer.indexOf(t_wms)== -1){
			//Si té checkec definit
			if(downloadableData[layer.options.businessId]){
				if(downloadableData[layer.options.businessId][0].chck) checked = 'checked="checked"';
			}else{//Sino per defecte check
				checked = 'checked="checked"'
			}		
			
			html += '<div class="downloadable-subrow" data-businessid="'+layer.options.businessId+'">'+
							'<div class="col-md-9 downloadable-name">'+
								layerName+
							'</div>'+
							'<input id="downloadable-chck" class="col-md-1 downloadable-chck" type="checkbox" '+checked+' >'+
						'</div>';		
			html+='<div class="separate-downloadable-row"></div>';			
		}
	});	
	
	$('#dialgo_publicar .modal-body .modal-downloadable').html(html);	
	
	$('#div_downloadable input').iCheck({
	    checkboxClass: 'icheckbox_flat-blue',
	    radioClass: 'iradio_flat-blue'
	});
	
	$('.downloadable-subrow-all input').on({
		'ifChecked': function(event){
			$('.downloadable-subrow input').iCheck('check');
		},
		'ifUnchecked': function(event){
			$('.downloadable-subrow input').iCheck('uncheck');
		} 
	});

}

function updateDownloadableData(){
	
	downloadableData = {};
	$(".downloadable-subrow").each(function(index,element){
		var businessId = $(element).attr('data-businessId');
		var obj = {
				//chck : $(element).children( ".downloadable-chck").is(':checked'),
				chck : $(element).children( "div.icheckbox_flat-blue").hasClass('checked'),
				businessId : businessId,
		};
		if(!downloadableData[businessId]){
			downloadableData[businessId] = [];			
		}
		downloadableData[businessId].push(obj);
	});		
}

function addHtmlInterficiePublicar(){
	jQuery("#funcio_publicar").append(
		'<div class="bt_publicar" data-toggle="tooltip" data-lang-title="Desa\'l i decideix si fer-lo públic o privat" title="Desa\'l i decideix si fer-lo públic o privat">'+
		'<span lang="ca">Publicar el mapa</span>'+
		'</div>'
	);
}

function addHtmlInterficiePublicarDisable(){
	jQuery("#funcio_publicar").append(
		'<div class="bt_publicar_disabled">'+
		'<span lang="ca">Publicar el mapa</span>'+
		'</div>'
	);
	//$('.bt_publicar').tooltip({placement : 'right',container : 'body',title : window.lang.convert("Desa'l i decideix si fer-lo públic o privat")});
}

function addHtmlModalPublicar(){
	
	jQuery('#mapa_modals').append('<!-- Modal Publicar -->'+
		'<div id="dialgo_publicar" class="modal fade">'+
			'<div class="modal-dialog">'+
				'<div class="modal-content">'+
					'<div class="modal-header">'+
						'<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'+
						'<h4 lang="ca" class="modal-title">Publicar el mapa</h4>'+
					'</div>'+
					'<div class="modal-body">'+
						'<form id="frm_publicar">'+
							'<section>'+
							'<fieldset>'+
							'		<input lang="ca" id="nomAplicacioPub" type="text" required'+
							'			class="form-control my-border" placeholder="Nom" value="">'+
							'		<br> '+
							'		<input lang="ca" id="optDescripcio" type="text"'+ 
							'			class="form-control my-border" placeholder="Descripció" value="">'+ 
							'		<input lang="ca" id="optTags" type="text" '+
							'			class="form-control my-border" placeholder="Etiquetes" value="">'+
							'</fieldset>'+
		'					</section>'+
		'					<br>'+
		'					<div lang="ca" class="alert alert-info">'+
		'					<span class="glyphicon glyphicon-info-sign"></span>'+ 
		'					<span lang="ca" id="publish-warn-text">El mapa es publicarà amb la vista actual: àrea geogràfica, nivell de zoom i capes visibles</span>'+ 
		'					</div>'+
		'					<div class="control-group">'+
		'						<div class="control-switch">'+
		'						<label class="control-label" for="visibilitat_chk" lang="ca">Visibilitat</label>'+
		'						<div class="controls">'+
		'							<div tabindex="0">'+
		'								<input class="make-switch" id="visibilitat_chk" type="checkbox"'+ 
		'									data-label-text=\'<span class="glyphicon glyphicon-transfer"></span>\''+ 
		'									data-on-text=\'<span><span class="fa fa-unlock glyphicon-white"></span>&nbsp;<span id="publish-public" lang="ca" data-toggle="tooltip" data-lang-title="El mapa es mostrarà a la galeria pública" title="El mapa es mostrarà a la galeria pública">Públic</span></span>\''+ 
		'									data-off-text=\'<span><span class="fa fa-lock"></span>&nbsp;<span id="publish-private" lang="ca" data-toggle="tooltip" data-lang-title="El mapa només es mostrarà a la teva galeria privada" title="El mapa només es mostrarà a la teva galeria privada">Privat</span></span>\'>'+
		'                           <span class="protegit"><input type="checkbox" id="is_map_protegit"><label for="is_map_protegit" lang="ca">Protegit amb clau</label></span>'+
		'							</div>'+
		'						</div>'+
		'						</div>'+
		'					</div>'+
		
		
		
		'                   <div class="control-group protegit">'+
		'						<div><label class="control-label" lang="ca">Clau</label></div>'+
		'                       <span class="clau"><input type="password" id="map_clau" maxLength="20" disabled></span>'+
		'                       <button type="button" id="resetClau" class="btn btn-xs btn-info" lang="ca">Reiniciar clau</button>'+
		'					</div>'+
		
		
		'					<div class="modal-downloadable">'+
		'					</div>'+
		'					<br>'+
		'					<div class="control-group">'+
		'						<div class="control-switch">'+
		'							<label class="control-label" for="llegenda_chk" lang="ca">Llegenda</label>'+
		'							<div class="controls">'+
		'								<div tabindex="0">'+
		'									<input class="make-switch" name="my-legend-checkbox" id="llegenda_chk" type="checkbox"'+ 
		'										data-label-text=\'<span class="glyphicon glyphicon-transfer"></span>\' '+
		'										data-on-text=\'<span id="publish-legend-yes" lang="ca">Si</span>\' '+
		'										data-off-text=\'<span id="publish-legend-no" lang="ca">No</span>\'>'+
		'								</div>'+
		'							</div>'+
		'						</div>'+
		'					</div>	'+			
		'					<div class="modal-legend">'+
		'					</div>'+
		'				</form>		'+			
		'			</div>'+
		'			<div class="modal-footer">'+
		'				<button lang="ca" type="button" class="btn btn-default" data-dismiss="modal">Cancel·lar</button>'+
		'				<button lang="ca" type="button" class="btn btn-primary">Publicar</button>'+
		'			</div>'+
		'		</div>'+
		'		<!-- /.modal-content -->'+
		'	</div>'+
		'	<!-- /.modal-dialog -->'+
		'</div>'+
		'<!-- /.modal -->'+
		'<!-- Fi Modal Publicar -->'+
		'<!-- Modal Publicar random -->'+
		'<div id="dialgo_publicar_random" class="modal fade">'+
		'	<div class="modal-dialog">'+
		'		<div class="modal-content">'+
		'			<div class="modal-header">'+
		'				<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'+
		'				<h4 lang="ca" class="modal-title">Publicar el mapa</h4>'+
		'			</div>'+
		'			<div class="modal-body" lang="ca">'+
		'				Per publicar o compartir el mapa has d\'iniciar sessió'+
		'			</div>'+
		'			<div class="modal-footer">'+
		'				<button lang="ca" type="button" class="btn bt-sessio"'+ 
		'						onClick="_gaq.push(["_trackEvent", "mapa", "inici sessio", "modal pre-publicar"]);">Inicia la sessió</button>'+
		'				<button lang="ca" type="button" class="btn bt_orange"'+ 
		'						onClick="_gaq.push(["_trackEvent", "mapa", "registre", "modal pre-publicar"]);">Crea un compte</button>'+
		'				<button id="btn-guest" lang="ca" type="button" class="btn btn-default" data-dismiss="modal"'+ 
		'						onClick="_gaq.push(["_trackEvent", "mapa", "guest", "modal pre-publicar"]);">Més tard</button>'+					
		'			</div>'+
		'		</div>'+
		'		<!-- /.modal-content -->'+
		'	</div>'+
		'	<!-- /.modal-dialog -->'+
		'</div>'+
		'<!-- /.modal -->'+
		'<!-- Fi Modal Publicar random -->'
	);
	
	$('.make-switch').bootstrapSwitch();
	//Configurar Llegenda
	$('input[name="my-legend-checkbox"]').on('switchChange.bootstrapSwitch', function(event, state) {
		if(state.value == true) {
			createModalConfigLegend();
		}else{
			$('#dialgo_publicar .modal-body .modal-legend').hide();
		}
	});	

	$('#visibilitat_chk').on('switchChange.bootstrapSwitch', function(event, state) {
		if(state.value == true) { //public
			$('.protegit').hide();
		}else{ //privat
			$('.protegit').show();
		}
	});	
	
	$('#is_map_protegit').iCheck({
	    checkboxClass: 'icheckbox_flat-blue',
	    radioClass: 'iradio_flat-blue'
	});	
	
	$('#is_map_protegit').on({
		'ifChecked': function(event){
			if (mapConfig.clau){
				$('#map_clau').val(randomString(10));
				$('#map_clau').prop('disabled',true);
			}else{
				$('#map_clau').prop('disabled',false);
			}	
		},
		'ifUnchecked': function(event){
			if (mapConfig.clau){
				$('#map_clau').val('');
			}else{
				$('#map_clau').prop('disabled',true);
			}
		}
	});
	
	$('#resetClau').on('click',function(){
		var mapData = {
			businessId: mapConfig.businessId,
			uid: $.cookie('uid')
		};
		resetClauMapa(mapData).then(function(results){
			mapConfig.clau = null;
			$('#map_clau').val('');
		});
	});
			
}

function addHtmlModalIframePublicar(){
	
	jQuery('#mapa_modals').append(
	'	<!-- Modal Url/iframe -->'+
	'		<div id="dialgo_url_iframe" class="modal fade">'+
	'		<div class="modal-dialog">'+
	'			<div class="modal-content panel-primary">'+
	'				<div class="modal-header panel-heading">'+
	'					<button type="button" class="close" data-dismiss="modal"'+
	'						aria-hidden="true">&times;</button>'+
	'					<h4 lang="ca" id="modal-title-publicar" class="modal-title">Mapa publicat</h4>'+
	'				</div>'+
	'				<div class="modal-body">'+
	'					<div class="form-group">'+
	'				    	<label for="urlMap"><span lang="ca">Per enllaçar amb aquest mapa, copieu i enganxeu el següent text</span>:</label>'+
	'				    	<input type="text" class="form-control" id="urlMap">'+
	'				  	</div>'+
	'				  	<div class="form-group">'+
	'					  	<label for="iframeMap"><span lang="ca">Per inserir aquest mapa al vostre web, copieu i enganxeu el següent text</span>:</label>'+
	'					  	<textarea class="form-control" rows="3" id="iframeMap"></textarea>'+
	'				  	</div>'+
	'                   <div class="form-group">'+
	'                   <label><span lang="ca">Per compartir el teu mapa</span></label>'+
	'                   <div id="socialSharePublicar"></div>'+
	'                   </div>'+
	'					<div id="urlVisorMap"><a href="" target="_blank" lang="ca">'+window.lang.convert('Veure el mapa')+'&nbsp;&nbsp;<span class="glyphicon glyphicon-share-alt"></span></a></div>'+
	'				</div>'+
	'				<div class="modal-footer">'+
	'					<button lang="ca" type="button" class="btn btn-success btn-default"'+
	'						data-dismiss="modal">Acceptar</button>'+
	'				</div>'+
	'			</div>'+
	'			<!-- /.modal-content -->'+
	'		</div>'+
	'		<!-- /.modal-dialog -->'+
	'	</div>'+
	'	<!-- /.modal -->'+
	'	<!-- Fi Modal Url/iframe -->'		
	);
}

function addShareButtons(){
	jQuery('#socialSharePublicar').html('');
	var v_url = window.location.href;
	if (!url('?id')){
		v_url += "&id="+jQuery('#userId').val();
	}
	v_url = v_url.replace('localhost',DOMINI);
	v_url = v_url.replace('mapa','visor');
	
	shortUrl(v_url).then(function(results){
		
		jQuery('#socialSharePublicar').share({
			networks: ['email','facebook','googleplus','twitter','linkedin','pinterest'],
			theme: 'square',
			urlToShare: results.data.url
		});
		
		jQuery('#socialSharePublicar .pop-social').on('click', function(event){
			_gaq.push(['_trackEvent', $(this).attr('data-from'), tipus_user+'compartir-publicar', $(this).attr('data-type'), 1]);
			window.open($(this).attr('href'),'t','toolbar=0,resizable=1,status=0,width=640,height=528');
            return false;
		});				
	});
	
}
