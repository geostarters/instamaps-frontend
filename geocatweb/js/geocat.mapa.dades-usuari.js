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
