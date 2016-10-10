/**
 * Gestio del temàtic de tipus Basic 
 */

function createTematicLayerBasic(tematic, styles){
	var defer = $.Deferred();
	_gaq.push(['_trackEvent', 'mapa', tipus_user+'estils', 'basic', 1]);
	//_kmq.push(['record', 'estils', {'from':'mapa', 'tipus user':tipus_user, 'tipus tematic':'basic'}]);
	
	var rangs = getRangsFromStyles(tematic, styles);
	var capaMare = controlCapes._layers[tematic.leafletid].layer;
	
//	if (jQuery.isArray(styles)){
//		
//	}else{
////		var layer = controlCapes._layers[tematic.leafletid];
////		if (tematic.geometrytype == t_marker){
////			jQuery.each(capaMare._layers, function( key, value ) {	
////				canviaStyleSinglePoint(styles,this,capaMare,false)
////			});
////		}else if (tematic.geometrytype == t_polyline){
////			jQuery.each(layer.layer._layers, function( key, value ) {
////				this.setStyle(styles);
////			});
////		}else if (tematic.geometrytype == t_polygon){
////			jQuery.each(layer.layer._layers, function( key, value ) {
////				this.setStyle(styles);
////			});
////		}
//	}
	
	if(capaMare.options.tipus == t_dades_obertes){
		var data1 = {
				uid: Cookies.get('uid'),
				businessId1: capaMare.options.businessId
		}
		crearFitxerPolling(data1).then(function(results) {
			var tmpFile="";
			if (results.status=="OK"){
				tmpFile = results.tmpFilePath;
				//Definim interval de polling en funcio de la mida del fitxer
				var pollTime =3000;
				//Fem polling
				(function(){							
					pollBuffer = function(){
						$.ajax({
							url: paramUrl.polling +"pollingFileName="+ results.tmpFileName,
							dataType: 'json',
							type: 'get',
							success: function(data){
								//console.debug(data);
								jQuery('#dialog_tematic_rangs').hide();
								jQuery('#info_uploadFile').show();
								if(data.status.indexOf("PAS 1")!=-1 && busy){
									
									jQuery("#div_uploading_txt").html("");
									jQuery("#div_uploading_txt").html(
											'<div id="div_upload_step1" class="status_current" lang="ca">1. '+window.lang.translate('Creant temàtic bàsic')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
											'<div id="div_upload_step2" class="status_uncheck" lang="ca">2. '+window.lang.translate('Processant la resposta')+'</div>'	
									);									
									
								}else if((data.status.indexOf("PAS 2") || data.status.indexOf("PAS 3"))!=-1 && busy){
									jQuery("#div_uploading_txt").html(
											'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.translate('Temàtic bàsic creat')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
											'<div id="div_upload_step2" class="status_current" lang="ca">2. '+window.lang.translate('Processant la resposta')+'</div>'	
									);										
								}else if(data.status.indexOf("OK")!=-1 && busy){
									clearInterval(pollInterval);
									
									jQuery("#div_uploading_txt").html("");
									jQuery("#div_uploading_txt").html(
											'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.translate('Temàtic bàsic creat')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
											'<div id="div_upload_step2" class="status_current" lang="ca">2. '+window.lang.translate('Processant la resposta')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'
									);									
									loadDadesObertesLayer(data.results);
									//Desactivem la capa mare
									if ($( "#input-"+capaMare.options.businessId).attr("checked")!=undefined) $( "#input-"+capaMare.options.businessId).click();
									busy=false;
									jQuery('#info_uploadFile').hide();
								}else if(data.status.indexOf("ERROR")!=-1 && busy){
									console.error("Error creant el temàtic bàsic");
									console.error(data);
									busy = false;
									
									clearInterval(pollInterval);
									jQuery('#info_uploadFile').hide();
									
									$('#dialog_error_upload_txt').html("");
									
									$('#dialog_error_upload_txt').html(window.lang.translate("Error creant el temàtic bàsic"));										
									
									$('#dialog_error_upload').modal('show');
								}
								else if (!busy){
									clearInterval(pollInterval);
									jQuery('#info_uploadFile').hide();
								}
							}
						});
					};
					
					pollInterval = setInterval(function(){
						pollBuffer();
					},pollTime);
					
				})();
				
				var options = {
						dataset: capaMare.options.dataset,
						tem: tem_simple,
						style: rangs[0],
						origen: capaMare.options.businessId
					};
				
					var data = {
						uid:Cookies.get('uid'),
						mapBusinessId: url('?businessid'),
						serverName: capaMare.options.nom+" "+window.lang.translate("Bàsic"),
						serverType: capaMare.options.tipus,
						calentas: false,
				        activas: true,
				        visibilitats: true,
				        order: capesOrdre_sublayer,				
				        epsg: '4326',
				        imgFormat: 'image/png',
				        infFormat: 'text/html',
				        tiles: true,	            
				        transparency: true,
				        opacity: 1,
				        visibilitat: 'O',
						options: JSON.stringify(options),
						tmpFilePath: tmpFile,
						tipusTematic:"t_dades_obertes",
						urlTematic:paramUrl.createServidorInMap
					};
			
				callActions(data);
				//createServidorInMap(data);
			}
			else {
				jQuery('#info_uploadFile').hide();		
				busy=false;
			}
		
			/*.then(function(results){
				busy=false;
				jQuery('#info_uploadFile').hide();
				if (results.status="OK") {
					loadDadesObertesLayer(results.results);
				}		
			
			});*/
		 });
		
	}else if(capaMare.options.tipus == t_url_file){
		var data1 = {
				uid: Cookies.get('uid'),
				businessId1: capaMare.options.businessId
		}
		crearFitxerPolling(data1).then(function(results) {
			var tmpFile="";
			if (results.status=="OK"){
				tmpFile = results.tmpFilePath;
				//Definim interval de polling en funcio de la mida del fitxer
				var pollTime =1000;
				//Fem polling
				(function(){							
					pollBuffer = function(){
						$.ajax({
							url: paramUrl.polling +"pollingFileName="+ results.tmpFileName,
							dataType: 'json',
							type: 'get',
							success: function(data){
								//console.debug(data);
								jQuery('#dialog_tematic_rangs').hide();
								jQuery('#info_uploadFile').show();
								if(data.status.indexOf("PAS 1")!=-1 && busy){
									
									jQuery("#div_uploading_txt").html("");
									jQuery("#div_uploading_txt").html(
											'<div id="div_upload_step1" class="status_current" lang="ca">1. '+window.lang.translate('Creant temàtic bàsic')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
											'<div id="div_upload_step2" class="status_uncheck" lang="ca">2. '+window.lang.translate('Processant la resposta')+'</div>'	
									);									
									
								}else if((data.status.indexOf("PAS 2") || data.status.indexOf("PAS 3"))!=-1 && busy){
									jQuery("#div_uploading_txt").html(
											'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.translate('Temàtic bàsic creat')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
											'<div id="div_upload_step2" class="status_current" lang="ca">2. '+window.lang.translate('Processant la resposta')+'</div>'	
									);										
								}else if(data.status.indexOf("OK")!=-1 && busy){
									clearInterval(pollInterval);
																
									jQuery("#div_uploading_txt").html("");
									jQuery("#div_uploading_txt").html(
											'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.translate('Temàtic bàsic creat')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
											'<div id="div_upload_step2" class="status_check" lang="ca">2. '+window.lang.translate('Processant la resposta')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'
									);									
									loadURLfileLayer(data.results).then(function(results){				
											activaPanelCapes(true);
											//Desactivem la capa mare
											if ($( "#input-"+capaMare.options.businessId).attr("checked")!=undefined) $( "#input-"+capaMare.options.businessId).click();
									});
									busy=false;
									jQuery('#info_uploadFile').hide();		
									
								}else if(data.status.indexOf("ERROR")!=-1 && busy){
									console.error("Error calculant l'operació");
									console.error(data);
									busy = false;
									
									clearInterval(pollInterval);
									jQuery('#info_uploadFile').hide();
									
									$('#dialog_error_upload_txt').html("");
									
									$('#dialog_error_upload_txt').html(window.lang.translate("Error calculant l'operació"));										
									
									$('#dialog_error_upload').modal('show');
								}
								else if (!busy){
									clearInterval(pollInterval);
									jQuery('#info_uploadFile').hide();
								}
							}
						});
					};
					
					pollInterval = setInterval(function(){
						pollBuffer();
					},pollTime);
					
				})();
				
				var estil_do = capaMare.options.estil_do;
				
				if(capaMare.options.geometryType.indexOf("line")!=-1){
					rangs[0].weight = rangs[0].lineWidth;
					
				}else if(capaMare.options.geometryType.indexOf("polygon")!=-1){
					
					 var polygonStyle = rangs[0];//getPolygonRangFromStyle(canvas_pol);
					 rangs[0].weight = polygonStyle.borderWidth;//lineWidth;
					 rangs[0].fillColor = polygonStyle.color;
					 rangs[0].color = polygonStyle.borderColor;
					 rangs[0].fillOpacity = polygonStyle.opacity/100; 
					 rangs[0].opacity = 1;			
					
				}else{
					var markerStyle2 = rangs[0];
					rangs[0].fillColor = markerStyle2.color;
					rangs[0].color = markerStyle2.borderColor;
					rangs[0].fillOpacity = 1;
					rangs[0].opacity = 1;
					rangs[0].radius = markerStyle2.simbolSize;
					rangs[0].weight = markerStyle2.borderWidth;
				}
				
				var options = {
					url: capaMare.options.url,
					tem: tem_simple,
					style: rangs[0],
					origen: capaMare.options.businessId,
					tipus : t_url_file,
			//		businessId : '-1',
					tipusFile: capaMare.options.tipusFile,
					estil_do: rangs[0],
					epsgIN: capaMare.options.epsgIN,
					geometryType: capaMare.options.geometryType,
					colX: capaMare.options.colX,
					colY: capaMare.options.colY,
					dinamic: capaMare.options.dinamic
				};
			
			//	console.debug(options);
				
				var data = {
					uid:Cookies.get('uid'),
					mapBusinessId: url('?businessid'),
					serverName: capaMare.options.nom+" "+window.lang.translate("Bàsic"),
					serverType: capaMare.options.tipus,
					calentas: false,
			        activas: true,
			        visibilitats: true,
			        order: capesOrdre_sublayer,				
			        epsg: capaMare.options.epsgIN,
			//        imgFormat: 'image/png',
			//        infFormat: 'text/html',
			//        tiles: true,	            
			        transparency: true,
			        opacity: 1,
			        visibilitat: 'O',
			        url: capaMare.options.url,
					options: JSON.stringify(options),
					tmpFilePath: tmpFile,
					tipusTematic:"t_url_file",
					urlTematic:paramUrl.createServidorInMap
				};
				
				callActions(data);
				/*createServidorInMap(data);.then(function(results){
					busy=false;
					jQuery('#info_uploadFile').hide();
					if (results.status="OK") {
						loadURLfileLayer(results.results).then(function(results){				
							activaPanelCapes(true);
						});
					}
				});*/
			}
			else {
				jQuery('#info_uploadFile').hide();		
				busy=false;
			}
			

			
		 });
		
		
	}else if(capaMare.options.tipus == t_json){

		var data1 = {
				uid: Cookies.get('uid'),
				businessId1: capaMare.options.businessId
		}
		crearFitxerPolling(data1).then(function(results) {
			var tmpFile="";
			if (results.status=="OK"){
				tmpFile = results.tmpFilePath;
				//Definim interval de polling en funcio de la mida del fitxer
				var pollTime =3000;
				//Fem polling
				(function(){							
					pollBuffer = function(){
						$.ajax({
							url: paramUrl.polling +"pollingFileName="+ results.tmpFileName,
							dataType: 'json',
							type: 'get',
							success: function(data){
								//console.debug(data);
								jQuery('#dialog_tematic_rangs').hide();
								jQuery('#info_uploadFile').show();
								if(data.status.indexOf("PAS 1")!=-1 && busy){
									
									jQuery("#div_uploading_txt").html("");
									jQuery("#div_uploading_txt").html(
											'<div id="div_upload_step1" class="status_current" lang="ca">1. '+window.lang.translate('Creant temàtic bàsic')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
											'<div id="div_upload_step2" class="status_uncheck" lang="ca">2. '+window.lang.translate('Processant la resposta')+'</div>'	
									);									
									
								}else if((data.status.indexOf("PAS 2") || data.status.indexOf("PAS 3"))!=-1 && busy){
									jQuery("#div_uploading_txt").html(
											'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.translate('Temàtic bàsic creat')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
											'<div id="div_upload_step2" class="status_current" lang="ca">2. '+window.lang.translate('Processant la resposta')+'</div>'	
									);										
								}else if(data.status.indexOf("OK")!=-1 && busy){
									clearInterval(pollInterval);	
								
									jQuery("#div_uploading_txt").html("");
									jQuery("#div_uploading_txt").html(
											'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.translate('Temàtic bàsic creat')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
											'<div id="div_upload_step2" class="status_current" lang="ca">2. '+window.lang.translate('Processant la resposta')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'
									);									
								
									loadCapaFromJSON(data.results).then(function(results){				
											activaPanelCapes(true);
											//Desactivem la capa mare
											if ($( "#input-"+capaMare.options.businessId).attr("checked")!=undefined) $( "#input-"+capaMare.options.businessId).click();
									});
									

									busy=false;
									jQuery('#info_uploadFile').hide();
									
								}else if(data.status.indexOf("ERROR")!=-1 && busy){
									console.error("Error calculant l'operació");
									console.error(data);
									busy = false;
									
									clearInterval(pollInterval);
									jQuery('#info_uploadFile').hide();
									
									$('#dialog_error_upload_txt').html("");
									
									$('#dialog_error_upload_txt').html(window.lang.translate("Error calculant l'operació"));										
									
									$('#dialog_error_upload').modal('show');
								}
								else if (!busy){
									clearInterval(pollInterval);
									jQuery('#info_uploadFile').hide();
								}
							}
						});
					};
					
					pollInterval = setInterval(function(){
						pollBuffer();
					},pollTime);
					
				})();
				
				var capaMareOptions = capaMare.options.options;
				var data = {
					uid:Cookies.get('uid'),
					mapBusinessId: url('?businessid'),
					serverName: capaMare.options.nom+" "+window.lang.translate("Bàsic"),
					serverType: t_json,
					calentas: false,
			        activas: true,
			        visibilitats: true,
			        order: capesOrdre_sublayer,
			        epsg: '4326',
			        imgFormat: 'image/png',
			        infFormat: 'text/html',
			        tiles: true,	            
			        transparency: true,
			        opacity: 1,
			        visibilitat: 'O',
			        url: capaMare.options.url,//Provar jQuery("#txt_URLJSON")
			        calentas: false,
			        activas: true,
			        visibilitats: true,
			        options: '{"origen":"'+capaMare.options.businessId+'","tem":"'+tem_simple+'","x":"'+capaMareOptions.x+'", "y":"'+capaMareOptions.y+'","titol":"'+capaMareOptions.titol+'","descripcio":"'+capaMareOptions.descripcio+'", "imatge":"'+capaMareOptions.imatge+'","vincle":"'+capaMareOptions.vincle+'","estil_do":{"radius":"'+styles.options.radius+'","fillColor":"'+styles.options.fillColor+'","color":"'+styles.options.color+'","weight":"'+styles.options.weight+'","opacity":"'+styles.options.opacity+'","fillOpacity":"'+styles.options.fillOpacity+'","isCanvas":"'+styles.options.isCanvas+'"}}',
			        tmpFilePath: tmpFile,
					tipusTematic:"t_json",
					urlTematic:paramUrl.createServidorInMap
				};		
				
				callActions(data);
				/*createServidorInMap(data);.then(function(results){
					busy=false;
					jQuery('#info_uploadFile').hide();
					if (results.status="OK") {
						loadCapaFromJSON(results.results).then(function(results){				
							activaPanelCapes(true);
						});
					}
				});*/
			}
			else {
				jQuery('#info_uploadFile').hide();		
				busy=false;
			}
			
		 });
		
	}else if (tematic.tipus == t_tematic){
		var data1 = {
				uid: Cookies.get('uid'),
				businessId1: capaMare.options.businessId
		}
		crearFitxerPolling(data1).then(function(results) {
			var tmpFile="";
			if (results.status=="OK"){
				tmpFile = results.tmpFilePath;
				//Definim interval de polling en funcio de la mida del fitxer
				var pollTime =3000;
				//Fem polling
				(function(){							
					pollBuffer = function(){
						$.ajax({
							url: paramUrl.polling +"pollingFileName="+ results.tmpFileName,
							dataType: 'json',
							type: 'get',
							success: function(data){
								//console.debug(data);
								jQuery('#dialog_tematic_rangs').hide();
								jQuery('#info_uploadFile').show();
								if(data.status.indexOf("PAS 1")!=-1 && busy){
									
									jQuery("#div_uploading_txt").html("");
									jQuery("#div_uploading_txt").html(
											'<div id="div_upload_step1" class="status_current" lang="ca">1. '+window.lang.translate('Creant temàtic bàsic')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
											'<div id="div_upload_step2" class="status_uncheck" lang="ca">2. '+window.lang.translate('Processant la resposta')+'</div>'	
									);									
									
								}else if((data.status.indexOf("PAS 2") || data.status.indexOf("PAS 3"))!=-1 && busy){
									jQuery("#div_uploading_txt").html(
											'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.translate('Temàtic bàsic creat')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
											'<div id="div_upload_step2" class="status_current" lang="ca">2. '+window.lang.translate('Processant la resposta')+'</div>'	
									);										
								}else if(data.status.indexOf("OK")!=-1 && busy){
									clearInterval(pollInterval);
									busy=false;
									jQuery('#info_uploadFile').hide();
									
									jQuery("#div_uploading_txt").html("");
									jQuery("#div_uploading_txt").html(
											'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.translate('Temàtic bàsic creat')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
											'<div id="div_upload_step2" class="status_check" lang="ca">2. '+window.lang.translate('Processant la resposta')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'
									);									
									loadTematicLayer(data.results);
									//Desactivem la capa mare
									if ($( "#input-"+capaMare.options.businessId).attr("checked")!=undefined) $( "#input-"+capaMare.options.businessId).click();
									activaPanelCapes(true);
									
									
								}else if(data.status.indexOf("ERROR")!=-1 && busy){
									console.error("Error calculant l'operació");
									console.error(data);
									busy = false;
									
									clearInterval(pollInterval);
									jQuery('#info_uploadFile').hide();
									
									$('#dialog_error_upload_txt').html("");
									
									$('#dialog_error_upload_txt').html(window.lang.translate("Error calculant l'operació"));										
									
									$('#dialog_error_upload').modal('show');
								}
								else if (!busy){
									clearInterval(pollInterval);
									jQuery('#info_uploadFile').hide();
								}
							}
						});
					};
					
					pollInterval = setInterval(function(){
						pollBuffer();
					},pollTime);
					
				})();
				
				 rangs = JSON.stringify({rangs:rangs});
					
					var data = {
						businessId: tematic.businessid,
						uid: Cookies.get('uid'),
				        mapBusinessId: url('?businessid'),	           
				        nom: capaMare.options.nom+" "+window.lang.translate("Bàsic"),
						calentas: false,
				        activas: true,
				        visibilitats: true,    
				        order: capesOrdre_sublayer,
						tipusRang: tematic.from,
						rangs: rangs,
						tmpFilePath: tmpFile,
						tipusTematic:"t_tematic",
						urlTematic:paramUrl.duplicateTematicLayer
					};
					
					callActions(data);
					/*
					duplicateTematicLayer(data);/*.then(function(results){
						busy=false;
						jQuery('#info_uploadFile').hide();
						if(results.status == 'OK'){
							loadTematicLayer(results.results);
							activaPanelCapes(true);
						}
					});*/
			}
			else {
				jQuery('#info_uploadFile').hide();		
				busy=false;
			}
			
		 });
	//NOU MODEL	
	}else if (tematic.tipus == t_visualitzacio){
		var data1 = {
				uid: Cookies.get('uid'),
				businessId1: capaMare.options.businessId
		}
		crearFitxerPolling(data1).then(function(results) {
			var tmpFile="";
			if (results.status=="OK"){
				tmpFile = results.tmpFilePath;
				//Definim interval de polling en funcio de la mida del fitxer
				var pollTime =3000;
				//Fem polling
				(function(){							
					pollBuffer = function(){
						$.ajax({
							url: paramUrl.polling +"pollingFileName="+ results.tmpFileName,
							dataType: 'json',
							type: 'get',
							success: function(data){
								//console.debug(data);
								jQuery('#dialog_tematic_rangs').hide();
								jQuery('#info_uploadFile').show();
								if(data.status.indexOf("PAS 1")!=-1 && busy){
									
									jQuery("#div_uploading_txt").html("");
									jQuery("#div_uploading_txt").html(
											'<div id="div_upload_step1" class="status_current" lang="ca">1. '+window.lang.translate('Creant temàtic bàsic')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
											'<div id="div_upload_step2" class="status_uncheck" lang="ca">2. '+window.lang.translate('Processant la resposta')+'</div>'	
									);									
									
								}else if((data.status.indexOf("PAS 2") || data.status.indexOf("PAS 3"))!=-1 && busy){
									jQuery("#div_uploading_txt").html(
											'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.translate('Temàtic bàsic creat')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
											'<div id="div_upload_step2" class="status_current" lang="ca">2. '+window.lang.translate('Processant la resposta')+'</div>'	
									);										
								}else if(data.status.indexOf("OK")!=-1 && busy){
									clearInterval(pollInterval);
									
									
									jQuery("#div_uploading_txt").html("");
									jQuery("#div_uploading_txt").html(
											'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.translate('Temàtic bàsic creat')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
											'<div id="div_upload_step2" class="status_check" lang="ca">2. '+window.lang.translate('Processant la resposta')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'
									);									
									var defer = $.Deferred();				
									readVisualitzacio(defer, data.visualitzacio, data.layer).then(function(results){
										activaPanelCapes(true);
										//Desactivem la capa mare
										if ($( "#input-"+capaMare.options.businessId).attr("checked")!=undefined) $( "#input-"+capaMare.options.businessId).click();
									});
									busy=false;					
									jQuery('#info_uploadFile').hide();
									
								}else if(data.status.indexOf("ERROR")!=-1 && busy){
									console.error("Error calculant l'operació");
									console.error(data);
									busy = false;
									
									clearInterval(pollInterval);
									jQuery('#info_uploadFile').hide();
									
									$('#dialog_error_upload_txt').html("");
									
									$('#dialog_error_upload_txt').html(window.lang.translate("Error calculant l'operació"));										
									
									$('#dialog_error_upload').modal('show');
								}
								else if (!busy){
									clearInterval(pollInterval);
									jQuery('#info_uploadFile').hide();
								}
							}
						});
					};
					
					pollInterval = setInterval(function(){
						pollBuffer();
					},pollTime);
					
				})();
				
				var data = {
						businessId: tematic.businessid,//businessId id de la visualización de origen
						uid: Cookies.get('uid'),//uid id de usuario
				        mapBusinessId: url('?businessid'),//mapBusinessId id del mapa donde se agrega la visualización	           
				        nom: capaMare.options.nom+" "+window.lang.translate("Bàsic"),//nom nombre de la nueva visualizacion
				        activas: true,
				        order: capesOrdre_sublayer,//order (optional) orden de la capa en el mapa
						tem: tematic.from,//tem_simple
				        estils: JSON.stringify(rangs[0]),
				        tmpFilePath: tmpFile,
						tipusTematic:"t_visualitzacio",
						urlTematic:paramUrl.createVisualitzacioSimple  
				        
					};	
					
				callActions(data);
					/*createVisualitzacioSimple(data);/*.then(function(results){
						busy=false;					
						jQuery('#info_uploadFile').hide();
						if(results.status == 'OK'){
							var defer = $.Deferred();				
							readVisualitzacio(defer, results.visualitzacio, results.layer).then(function(results){
							activaPanelCapes(true);
						});
						}
					});		
					 });	*/
			}
			else {
				jQuery('#info_uploadFile').hide();		
				busy=false;
			}
		rangs = JSON.stringify({rangs:rangs});
	
		
		
	});
	
}
	return defer.promise();	
}