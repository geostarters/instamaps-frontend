function carregaDadesUsuari(){
	
	addHtmlInterficieDadesUsuari();
	addHtmlModalDadesUsuari();
	
	var data = {uid: $.cookie('uid')};
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

function addHtmlInterficieDadesUsuari(){
	
	jQuery("#carregar_dades .div_gr2").append(
		'<div lang="ca" data-toggle="tooltip" title="Accedeix a les teves dades" id="div_dades_usr" class="div_dades_usr">'+
		'	<script id="meus-wms-template" type="text/x-handlebars-template">'+
		'	<div class="panel-body">'+
		'		<ul id="listnav-teves-dades" class="llista-teves-dades panel-heading">'+
		'		{{#each results}}'+
		'			<li><a href="#" data-businessid="{{businessId}}" data-layers="{{layers}}" data-servertype="{{serverType}}" data-options="{{options}}" class="usr_wms_layer label-teves-dades">{{serverName}}</a><span data-businessid="{{businessId}}" data-servername="{{serverName}}" data-servertype="{{serverType}}" class="glyphicon glyphicon-remove info-teves-dades"></span></li>'+
		'		{{/each}}'+
		'		</ul>'+
		'	</div>'+
		'	</script>'+
		'</div>'		
	);
}

function addHtmlModalDadesUsuari(){
	
	jQuery('#mapa_modals').append(
	'	<!-- Modal les teves dades -->'+
	'		<div class="modal fade" id="dialog_teves_dades">'+
	'		<div class="modal-dialog">'+
	'			<div class="modal-content panel-primary">'+
	'				<div class="modal-header panel-heading">'+
	'					<button type="button" class="close" data-dismiss="modal"'+
	'						aria-hidden="true">&times;</button>'+
	'					<h4 id="modal-title-teves-dades" class="modal-title" lang="ca">Accedeix a les teves dades</h4>'+
	'				</div>'+
	'				<div id="id_sw" class="modal-body">'+
	'					<!-- <ul class="nav nav-tabs etiqueta">'+
	'						<li><a href="#id_sv" lang="ca" data-toggle="tab">Serveis Vector</a></li>'+
	'						<li><a href="#id_sw" lang="ca" data-toggle="tab">Serveis WMS</a></li>'+
	'					</ul>'+
	'					<div class="tab-content">'+
	'						<div class="tab-pane fade" id="id_sv"></div>'+
	'						<div class="tab-pane fade" id="id_sw"></div>'+
	'					</div> -->'+
	'				</div>'+
	'				<div class="modal-footer">'+
	'					<!-- <button type="button" class="btn btn-default" data-dismiss="modal">Tancar</button>'+
	'         <button type="button" class="btn btn-success">Canviar</button> -->'+
	'				</div>'+
	'			</div>'+
	'			<!-- /.modal-content -->'+
	'		</div>'+
	'		<!-- /.modal-dialog -->'+
	'	</div>'+
	'	<!-- /.modal -->'+
	'	<!-- fi Modal les teves dades -->'		
	);
}
