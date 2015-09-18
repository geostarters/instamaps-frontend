function addHtmlInterficieFuncionsSIG(){
	
	jQuery("#funcio_SIG").append(
	'	<h5 lang="ca">Triar l\'operació</h5>'+
	'	<div class="div_gr3_sig">'+
	'		<div id="buffer" lang="ca" class="div_sig_1" data-toggle="tooltip" data-lang-title="Àrea d\'influència" title="Àrea d\'influència"></div>'+
	'		<div id="interseccio" lang="ca" class="div_sig_2" data-toggle="tooltip" data-lang-title="Intersecar" title="Intersecar"></div>'+
	'		<div id="tag" lang="ca" class="div_sig_3" data-toggle="tooltip" data-lang-title="Transmissió (tag)" title="Transmissió (tag)"></div>'+
	'		<div id="centroide" lang="ca" class="div_sig_4" data-toggle="tooltip" data-lang-title="Centre geomètric" title="Centre geomètric"></div>'+
	'		<div id="filter" lang="ca" class="div_sig_5" data-toggle="tooltip" data-lang-title="Filtre" title="Filtre"></div>'+
	'	</div>'		
	);
	
	$('.div_gr3_sig [data-toggle="tooltip"]').tooltip({placement : 'bottom',container : 'body'});
	
	/*
	$('#buffer').tooltip({placement : 'bottom',container : 'body',title :window.lang.convert('Àrea d\'influència')});
	$('#interseccio').tooltip({placement : 'bottom',container : 'body',title : window.lang.convert('Intersecar')});
	$('#tag').tooltip({placement : 'bottom',container : 'body',title : window.lang.convert('Transmissió (tag)')});
	$('#centroide').tooltip({placement : 'bottom',container : 'body',title : window.lang.convert('Centre geomètric')});
	$('#filter').tooltip({placement : 'bottom',container : 'body',title : window.lang.convert('Filtre')});
	$('#union').tooltip({placement : 'bottom',container : 'body',title : window.lang.convert('Unió')});
	*/
	
	jQuery("#buffer").on('click',function(e){
		_gaq.push(['_trackEvent', 'mapa', tipus_user+'gis', 'buffer', 1]);
		openBufferModal();
	});
	
	jQuery("#interseccio").on('click',function(e){
		_gaq.push(['_trackEvent', 'mapa', tipus_user+'gis', 'interseccio', 1]);
		openIntersectionModal();
	});
	
	jQuery("#tag").on('click',function(e){
		_gaq.push(['_trackEvent', 'mapa', tipus_user+'gis', 'tag', 1]);
		openTagModal();
	});
	
	jQuery("#centroide").on('click',function(e){
		_gaq.push(['_trackEvent', 'mapa', tipus_user+'gis', 'centroide', 1]);
		openCentroideModal();
	});
	
	jQuery("#filter").on('click',function(e){
		_gaq.push(['_trackEvent', 'mapa', tipus_user+'gis', 'filter', 1]);
		openFilterModal();
	});
	
	jQuery("#union").on('click',function(e){
		_gaq.push(['_trackEvent', 'mapa', tipus_user+'gis', 'union', 1]);
		openUnionModal();
	});
	
	addHtmlModalBuffer();
	addHtmlModalIntersection();
	addHtmlModalTag();
	addHtmlModalCentroid();
	addHtmlModalLayersFilter();
	addHtmlModalFieldsFilter();
	addHtmlModalFieldsFilterAvancat();
	
}

function openFilterModal(){
	showFilterLayersModal();
	jQuery('#list_filter_values').html("");
	$('#dialog_layers_filter').modal('show');
}


function openBufferModal(){
	 //addHtmlModalBuffer();
	 createModalConfigLayersBuffer();
	 $('#dialog_buffer').modal('show');
	 jQuery('#dialog_buffer .btn-primary').on('click',function(event){
		 if(busy){
			 	jQuery('#dialog_buffer').hide();
				$('#dialog_info_upload_txt').html(window.lang.convert("S'està executant una operació. Si us plau, espereu que aquesta acabi."));
				$('#dialog_info_upload').modal('show');
		}else{
		 busy=true;
		 event.stopImmediatePropagation();
		//Cridar funció buffer
		 if (!$("input[name='buffer-chck']:checked").val()) {
		       alert('Cal seleccionar una capa');
		        return false;
		   }
		 else {
			var businessId = $("input[name='buffer-chck']:checked").parent().attr('data-businessId');
			var data1 = {
					uid: $.cookie('uid'),
					businessId1: businessId
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
									jQuery('#dialog_buffer').hide();
									jQuery('#info_uploadFile').show();
									if(data.status.indexOf("ABANS BUFFER")!=-1 && busy){
										
										jQuery("#div_uploading_txt").html("");
										jQuery("#div_uploading_txt").html(
											'<div id="div_upload_step1" class="status_current" lang="ca">1. '+window.lang.convert('Calculant operació')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
											'<div id="div_upload_step2" class="status_uncheck" lang="ca">2. '+window.lang.convert('Creant geometries')+'</div>'+
											'<div id="div_upload_step3" class="status_uncheck" lang="ca">3. '+window.lang.convert('Processant la resposta')+'</div>'//+	
										);									
										
									}else if(data.status.indexOf("DESPRES")!=-1 && busy){
										jQuery("#div_uploading_txt").html("");
										jQuery("#div_uploading_txt").html(
												'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.convert('Operació calculada')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
												'<div id="div_upload_step2" class="status_current" lang="ca">2. '+window.lang.convert('Creant geometries')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
												'<div id="div_upload_step3" class="status_uncheck" lang="ca">3. '+window.lang.convert('Processant la resposta')+'</div>'//+	
													);									
									}else if(data.status.indexOf("OK")!=-1 && busy){
//										console.debug("Ha acabat:");
//										console.debug(data);
										clearInterval(pollInterval);
										
										jQuery("#div_uploading_txt").html("");
										jQuery("#div_uploading_txt").html(
												'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.convert('Operació calculada')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
												'<div id="div_upload_step2" class="status_check" lang="ca">2. '+window.lang.convert('Geometries creades')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
												'<div id="div_upload_step3" class="status_current" lang="ca">3. '+window.lang.convert('Processant la resposta')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'//+	
											);									
										
										
									}else if(data.status.indexOf("ERROR")!=-1 && busy){
										console.error("Error calculant l'operació");
										console.error(data);
										busy = false;
										
										clearInterval(pollInterval);
										jQuery('#info_uploadFile').hide();
										
										$('#dialog_error_upload_txt').html("");
										
										$('#dialog_error_upload_txt').html(window.lang.convert("Error calculant l'operació"));										
										
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
				}
				else {
					jQuery('#info_uploadFile').hide();		
					busy=false;
				}
			
				var data = {
					uid: $.cookie('uid'),
					businessId1: businessId,
					radi: $("#distancia").val(),
					nom:window.lang.convert("Àrea d'influència"),
					text:window.lang.convert("Àrea d'influència"),
					tmpFilePath: tmpFile
				};
				buffer(data).then(function(results){
					if (results.status == "ERROR"){
						jQuery('#info_uploadFile').hide();		
						busy=false;
						$('#dialog_error_upload_txt').html("");					
						$('#dialog_error_upload_txt').html(window.lang.convert("Error calculant l\'operació"));					
						$('#dialog_error_upload').modal('show');
					}else{
						if (results.midaFitxer==0){
							jQuery('#info_uploadFile').hide();		
							busy=false;
							$('#dialog_error_upload_txt').html("");					
							$('#dialog_error_upload_txt').html(window.lang.convert("Error calculant l\'operació"));					
							$('#dialog_error_upload').modal('show');
						}
						else {
						var data2 = {
							uid: $.cookie('uid'),
							mapBusinessId: url('?businessid'),
							serverName:results.nomCapaOrigen+" "+window.lang.convert("Àrea d'influència"),
							path:results.path,
							//tmpFilePath:'E://usuaris//m.ortega//temp//tmp.geojson',
							tmpFilePath:results.tmpFilePath,
							midaFitxer:results.midaFitxer,
							sourceExtension:'geojson',
							markerStyle:JSON.stringify(getMarkerRangFromStyle(defaultPunt)),
							lineStyle:JSON.stringify(getLineRangFromStyle(canvas_linia)),
							polygonStyle:JSON.stringify(getPolygonRangFromStyle(canvas_pol)),
							propertiesList: results.propertiesList,
							geomType: results.geomType
						}
						doUploadFile(data2).then(function(results){
							if (results.status="OK") {
								addDropFileToMap(results);
								 busy=false;
								 jQuery('#info_uploadFile').hide();
							}
							else{
								jQuery('#info_uploadFile').hide();		
								busy=false;
								$('#dialog_error_upload_txt').html("");					
								$('#dialog_error_upload_txt').html(window.lang.convert("Error calculant l\'operació"));					
								$('#dialog_error_upload').modal('show');
							}
						});
						}
					}
				});
			 });		
		 }}});
	 }

function openIntersectionModal(){
	 createModalConfigLayers2("intersection");
	 $('#dialog_intersection').modal('show');
	 jQuery('#dialog_intersection .btn-primary').on('click',function(event){
		 if(busy){
			 	jQuery('#dialog_intersection').hide();
				$('#dialog_info_upload_txt').html(window.lang.convert("S'està executant una operació. Si us plau, espereu que aquesta acabi."));
				$('#dialog_info_upload').modal('show');
		}else{
		 busy=true;
		 event.stopImmediatePropagation();
		 if (!$("input[name='intersect-chck']:checked").val() || !$("input[name='intersect-chck2']:checked").val()) {
		       alert('Cal seleccionar dues capes');
		       busy=false;
		       return false;
		   }
		 else {
			 //Cridar funció intersecció
			var businessId1 = $("input[name='intersect-chck']:checked").parent().attr('data-businessId');
			var businessId2 = $("input[name='intersect-chck2']:checked").parent().attr('data-businessId');
			var data1 = {
					uid: $.cookie('uid'),
					businessId1: businessId1,
					businessId2: businessId2
			}
			crearFitxerPolling(data1).then(function(results) {
				var tmpFile="";
				if (results.status=="OK"){
					tmpFile = results.tmpFilePath;
					//Definim interval de polling en funcio de la mida del fitxer
					var pollTime =3000;
					//Fem polling
					(function(){							
						pollIntersect = function(){
							$.ajax({
								url: paramUrl.polling +"pollingFileName="+ results.tmpFileName,
								dataType: 'json',
								type: 'get',
								success: function(data){
									//console.debug(data);
									jQuery('#dialog_intersection').hide();
									jQuery('#info_uploadFile').show();
									if(data.status.indexOf("ABANS INTERSECTION")!=-1 && busy){
										
										jQuery("#div_uploading_txt").html("");
										jQuery("#div_uploading_txt").html(
											'<div id="div_upload_step1" class="status_current" lang="ca">1. '+window.lang.convert('Calculant operació')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
											'<div id="div_upload_step2" class="status_uncheck" lang="ca">2. '+window.lang.convert('Creant geometries')+'</div>'+
											'<div id="div_upload_step3" class="status_uncheck" lang="ca">3. '+window.lang.convert('Processant la resposta')+'</div>'//+	
										);									
										
									}else if(data.status.indexOf("DESPRES")!=-1 && busy){
										jQuery("#div_uploading_txt").html("");
										jQuery("#div_uploading_txt").html(
												'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.convert('Operació calculada')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
												'<div id="div_upload_step2" class="status_current" lang="ca">2. '+window.lang.convert('Creant geometries')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
												'<div id="div_upload_step3" class="status_uncheck" lang="ca">3. '+window.lang.convert('Processant la resposta')+'</div>'//+	
													);									
									}else if(data.status.indexOf("OK")!=-1 && busy){
//										console.debug("Ha acabat:");
//										console.debug(data);
										clearInterval(pollInterval);
										
										jQuery("#div_uploading_txt").html("");
										jQuery("#div_uploading_txt").html(
												'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.convert('Operació calculada')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
												'<div id="div_upload_step2" class="status_check" lang="ca">2. '+window.lang.convert('Geometries creades')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
												'<div id="div_upload_step3" class="status_current" lang="ca">3. '+window.lang.convert('Processant la resposta')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'//+	
											);									
										
										
									}else if(data.status.indexOf("ERROR")!=-1 && busy){
										console.error("Error calculant l'operació");
										console.error(data);
										busy = false;
										
										clearInterval(pollInterval);
										jQuery('#info_uploadFile').hide();
										
										$('#dialog_error_upload_txt').html("");
										
										$('#dialog_error_upload_txt').html(window.lang.convert("Error calculant l'operació"));										
										
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
							pollIntersect();
						},pollTime);
						
					})();
				}
				else {
					jQuery('#info_uploadFile').hide();		
					busy=false;					
				}
			var name1 = $("input[name='intersect-chck']:checked").parent().attr('data-layername');
			var name2 = $("input[name='intersect-chck2']:checked").parent().attr('data-layername');
			 
			var data = {
				uid: $.cookie('uid'),
				businessId1: businessId1,
				businessId2: businessId2,
				nom:window.lang.convert("Intersecció"),
				text:window.lang.convert("Intersecció"),
				tmpFilePath: tmpFile
			};
			intersection(data).then(function(results){
				if (results.status == "ERROR"){
					jQuery('#info_uploadFile').hide();		
					busy=false;
					$('#dialog_error_upload_txt').html("");					
					$('#dialog_error_upload_txt').html(window.lang.convert("Error calculant l\'operació"));					
					$('#dialog_error_upload').modal('show');
				}else{
					if (results.midaFitxer==0){
						jQuery('#info_uploadFile').hide();		
						busy=false;
						$('#dialog_error_upload_txt').html("");					
						$('#dialog_error_upload_txt').html(window.lang.convert("Error calculant l\'operació"));					
						$('#dialog_error_upload').modal('show');
					}
					else {
						var data2 = {
							uid: $.cookie('uid'),
							mapBusinessId: url('?businessid'),
							serverName:window.lang.convert("Intersecció")+" "+name1 +" "+name2,
							path:results.path,
							tmpFilePath:results.tmpFilePath,
							midaFitxer:results.midaFitxer,
							sourceExtension:'geojson',
							markerStyle:JSON.stringify(getMarkerRangFromStyle(defaultPunt)),
							lineStyle:JSON.stringify(getLineRangFromStyle(canvas_linia)),
							polygonStyle:JSON.stringify(getPolygonRangFromStyle(canvas_pol)),
							propertiesList: results.propertiesList,
							geomType: results.geomType
						}
						doUploadFile(data2).then(function(results){
							if (results.status="OK") {
								addDropFileToMap(results);
								 $('#dialog_intersection').modal('hide');
								 busy=false;
								 jQuery('#info_uploadFile').hide();
							}
							else {
								jQuery('#info_uploadFile').hide();		
								busy=false;
								$('#dialog_error_upload_txt').html("");					
								$('#dialog_error_upload_txt').html(window.lang.convert("Error calculant l\'operació"));					
								$('#dialog_error_upload').modal('show');
							}
						});
					}
				}
			});
		 });		
		 }}});
 }

function openTagModal(){
	 createModalConfigLayers2("tag");
	 $('#dialog_tag').modal('show');
	 jQuery('#dialog_tag .btn-primary').on('click',function(event){
		 //event.preventDefault();
		 //event.stopPropagation();
		 event.stopImmediatePropagation();
		 if(busy){
			 	jQuery('#dialog_tag').hide();
				$('#dialog_info_upload_txt').html(window.lang.convert("S'està executant una operació. Si us plau, espereu que aquesta acabi."));
				$('#dialog_info_upload').modal('show');
		}else{
		 busy=true;
		 if (!$("input[name='tag-chck']:checked").val() || !$("input[name='tag-chck2']:checked").val()) {
		       alert('Cal seleccionar dues capes');
		       busy=false;
		        return false;
		   }
		 else {
			//Cridar funció tag
			var businessId1 = $("input[name='tag-chck']:checked").parent().attr('data-businessId');
			var businessId2 = $("input[name='tag-chck2']:checked").parent().attr('data-businessId');
			var data1 = {
					uid: $.cookie('uid'),
					businessId1: businessId1,
					businessId2: businessId2
			}
			crearFitxerPolling(data1).then(function(results) {
				var tmpFile="";
				if (results.status=="OK"){
					tmpFile = results.tmpFilePath;
					//Definim interval de polling en funcio de la mida del fitxer
					var pollTime =3000;
					//Fem polling
					(function(){							
						pollTag = function(){
							$.ajax({
								url: paramUrl.polling +"pollingFileName="+ results.tmpFileName,
								dataType: 'json',
								type: 'get',
								success: function(data){
									//console.debug(data);
									jQuery('#dialog_tag').hide();
									jQuery('#info_uploadFile').show();
									if(data.status.indexOf("ABANS TAG")!=-1 && busy){
										
										jQuery("#div_uploading_txt").html("");
										jQuery("#div_uploading_txt").html(
											'<div id="div_upload_step1" class="status_current" lang="ca">1. '+window.lang.convert('Calculant operació')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
											'<div id="div_upload_step2" class="status_uncheck" lang="ca">2. '+window.lang.convert('Creant geometries')+'</div>'+
											'<div id="div_upload_step3" class="status_uncheck" lang="ca">3. '+window.lang.convert('Processant la resposta')+'</div>'//+	
										);									
										
									}else if(data.status.indexOf("DESPRES")!=-1 && busy){
										jQuery("#div_uploading_txt").html("");
										jQuery("#div_uploading_txt").html(
												'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.convert('Operació calculada')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
												'<div id="div_upload_step2" class="status_current" lang="ca">2. '+window.lang.convert('Creant geometries')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
												'<div id="div_upload_step3" class="status_uncheck" lang="ca">3. '+window.lang.convert('Processant la resposta')+'</div>'//+	
													);									
									}else if(data.status.indexOf("OK")!=-1 && busy){
//										console.debug("Ha acabat:");
//										console.debug(data);
										clearInterval(pollInterval);
										
										jQuery("#div_uploading_txt").html("");
										jQuery("#div_uploading_txt").html(
												'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.convert('Operació calculada')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
												'<div id="div_upload_step2" class="status_check" lang="ca">2. '+window.lang.convert('Geometries creades')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
												'<div id="div_upload_step3" class="status_current" lang="ca">3. '+window.lang.convert('Processant la resposta')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'//+	
											);									
										
										
									}else if(data.status.indexOf("ERROR")!=-1 && busy){
										console.error("Error calculant l'operació");
										console.error(data);
										busy = false;
										
										clearInterval(pollInterval);
										jQuery('#info_uploadFile').hide();
										
										$('#dialog_error_upload_txt').html("");
										
										$('#dialog_error_upload_txt').html(window.lang.convert("Error calculant l'operació"));										
										
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
							pollTag();
						},pollTime);
						
					})();
				}
				else {
					jQuery('#info_uploadFile').hide();		
					busy=false;
				}

			var data = {
				uid: $.cookie('uid'),
				businessId1: businessId1,
				businessId2: businessId2,
				nom:window.lang.convert("Transmissió (tag)"),
				text:window.lang.convert("Transmissió (tag)"),
				tmpFilePath: tmpFile
			};
			tag(data).then(function(results){
				if (results.status == "ERROR"){
					jQuery('#info_uploadFile').hide();		
					busy=false;
					$('#dialog_error_upload_txt').html("");					
					$('#dialog_error_upload_txt').html(window.lang.convert("Error calculant l\'operació"));					
					$('#dialog_error_upload').modal('show');
				}else{
					if (results.midaFitxer==0){
						jQuery('#info_uploadFile').hide();		
						busy=false;
						$('#dialog_error_upload_txt').html("");					
						$('#dialog_error_upload_txt').html(window.lang.convert("Error calculant l\'operació"));					
						$('#dialog_error_upload').modal('show');
					}
					else {
						var data2 = {
							uid: $.cookie('uid'),
							mapBusinessId: url('?businessid'),
							serverName:window.lang.convert("Transmissió (tag)")+" "+results.nomCapaOrigen1+" "+results.nomCapaOrigen2,
							path:results.path,
							tmpFilePath:results.tmpFilePath,
							midaFitxer:results.midaFitxer,
							sourceExtension:'geojson',
							markerStyle:results.markerEstil,
							propertiesList: results.propertiesList,
							geomType: results.geomType
						}
						doUploadFile(data2).then(function(results){
							if (results.status="OK") {
								addDropFileToMap(results);
								 $('#dialog_tag').modal('hide');
								 jQuery('#info_uploadFile').hide();
								 busy=false;
							}
							else {
								jQuery('#info_uploadFile').hide();		
								busy=false;
								$('#dialog_error_upload_txt').html("");					
								$('#dialog_error_upload_txt').html(window.lang.convert("Error calculant l\'operació"));					
								$('#dialog_error_upload').modal('show');
							}
						});
					}
				}
			});
		 });		
	 }}});
 }

function openCentroideModal(){
	//addHtmlModalCentroid();
	createModalConfigLayersCentroide();
	 $('#dialog_centroid').modal('show');
	 jQuery('#dialog_centroid .btn-primary').on('click',function(event){
		 event.stopImmediatePropagation();
		 if(busy){
			 	jQuery('#dialog_centroid').hide();
				$('#dialog_info_upload_txt').html(window.lang.convert("S'està executant una operació. Si us plau, espereu que aquesta acabi."));
				$('#dialog_info_upload').modal('show');
		}else{
		 busy=true;
		 if (!$("input[name='centroide-chck']:checked").val()) {
		       alert('Cal seleccionar una capa');
		       busy=false;
		        return false;
		   }
		 else {
			var businessId1 = $("input[name='centroide-chck']:checked").parent().attr('data-businessId');
			var data1 = {
					uid: $.cookie('uid'),
					businessId1: businessId1
			}
			crearFitxerPolling(data1).then(function(results) {
				var tmpFile="";
				if (results.status=="OK"){
					tmpFile = results.tmpFilePath;
					//Definim interval de polling en funcio de la mida del fitxer
					var pollTime =3000;
					//Fem polling
					(function(){							
						pollCentroid = function(){
							$.ajax({
								url: paramUrl.polling +"pollingFileName="+ results.tmpFileName,
								dataType: 'json',
								type: 'get',
								success: function(data){
									//console.debug(data);
									jQuery('#dialog_centroid').hide();
									jQuery('#info_uploadFile').show();
									if(data.status.indexOf("ABANS CENTROIDE")!=-1 && busy){
										
										jQuery("#div_uploading_txt").html("");
										jQuery("#div_uploading_txt").html(
											'<div id="div_upload_step1" class="status_current" lang="ca">1. '+window.lang.convert('Calculant operació')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
											'<div id="div_upload_step2" class="status_uncheck" lang="ca">2. '+window.lang.convert('Creant geometries')+'</div>'+
											'<div id="div_upload_step3" class="status_uncheck" lang="ca">3. '+window.lang.convert('Processant la resposta')+'</div>'//+	
										);									
										
									}else if(data.status.indexOf("DESPRES")!=-1 && busy){
										jQuery("#div_uploading_txt").html("");
										jQuery("#div_uploading_txt").html(
												'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.convert('Calculant operació')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
												'<div id="div_upload_step2" class="status_current" lang="ca">2. '+window.lang.convert('Creant geometries')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
												'<div id="div_upload_step3" class="status_uncheck" lang="ca">3. '+window.lang.convert('Processant la resposta')+'</div>'//+	
													);									
									}else if(data.status.indexOf("OK")!=-1 && busy){
//										console.debug("Ha acabat:");
//										console.debug(data);
										clearInterval(pollInterval);
										
										jQuery("#div_uploading_txt").html("");
										jQuery("#div_uploading_txt").html(
												'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.convert('Calculant operació')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
												'<div id="div_upload_step2" class="status_check" lang="ca">2. '+window.lang.convert('Creant geometries')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
												'<div id="div_upload_step3" class="status_current" lang="ca">3. '+window.lang.convert('Processant la resposta')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'//+	
											);									
										
										
									}else if(data.status.indexOf("ERROR")!=-1 && busy){
										console.error("Error calculant l'operació");
										console.error(data);
										busy = false;
										
										clearInterval(pollInterval);
										jQuery('#info_uploadFile').hide();
										
										$('#dialog_error_upload_txt').html("");
										
										$('#dialog_error_upload_txt').html(window.lang.convert("Error calculant l'operació"));										
										
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
							pollCentroid();
						},pollTime);
						
					})();
				}	
				else {
					jQuery('#info_uploadFile').hide();		
					busy=false;
				}
			var data = {
				uid: $.cookie('uid'),
				businessId1: businessId1,
				nom:window.lang.convert("Centre geomètric"),
				text:window.lang.convert("Centre geomètric"),
				tmpFilePath: tmpFile
			};
			centroid(data).then(function(results){
				if (results.status == "ERROR"){
					jQuery('#info_uploadFile').hide();		
					busy=false;
					$('#dialog_error_upload_txt').html("");					
					$('#dialog_error_upload_txt').html(window.lang.convert("Error calculant l\'operació"));					
					$('#dialog_error_upload').modal('show');
				}else{
					if (results.midaFitxer==0){
						jQuery('#info_uploadFile').hide();		
						busy=false;
						$('#dialog_error_upload_txt').html("");					
						$('#dialog_error_upload_txt').html(window.lang.convert("Error calculant l\'operació"));					
						$('#dialog_error_upload').modal('show');
					}
					else {
						var data2 = {
							uid: $.cookie('uid'),
							mapBusinessId: url('?businessid'),
							serverName:results.nomCapaOrigen+" "+window.lang.convert("Centre geomètric"),
							path:results.path,
							//tmpFilePath:'E://usuaris//m.ortega//temp//tmp2.geojson',
							tmpFilePath:results.tmpFilePath,
							midaFitxer:results.midaFitxer,
							sourceExtension:'geojson',
							markerStyle:JSON.stringify(getMarkerRangFromStyle(defaultPunt)),
							lineStyle:JSON.stringify(getLineRangFromStyle(canvas_linia)),
							polygonStyle:JSON.stringify(getPolygonRangFromStyle(canvas_pol)),
							propertiesList: results.propertiesList,
							geomType: results.geomType
						}
						doUploadFile(data2).then(function(results){
							if (results.status="OK") {
								addDropFileToMap(results);
								$('#dialog_centroid').modal('hide');
								 jQuery('#info_uploadFile').hide();
								 busy=false;
							}
							else {
								jQuery('#info_uploadFile').hide();		
								busy=false;
								$('#dialog_error_upload_txt').html("");					
								$('#dialog_error_upload_txt').html(window.lang.convert("Error calculant l\'operació"));					
								$('#dialog_error_upload').modal('show');
							}
						});
					}
				}
			});
		 });		
	 }}});
 }

function addHtmlModalBuffer(){	
	jQuery('#mapa_modals').append('<!-- Modal Buffer -->'+
			'<div id="dialog_buffer" class="modal fade">'+
				'<div class="modal-dialog">'+
					'<div class="modal-content">'+
						'<div class="modal-header">'+
							'<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'+
							'<h4 lang="ca" class="modal-title">Àrea d\'influència</h4>'+
						'</div>'+
						'<div class="modal-body">'+
			'			<div class="alert alert-success">'+
			'<span lang="ca">Aquesta operació calcula una àrea definida per una distància fixa a l\'entorn d\'un element.</span>'+
			'			<br/>'+
			'<span lang="ca">Aplicable a punts, línies o polígons.</span>'+'<br/><br/>'+
			'			<div class="imagePeu"><img src="css/images/Buffer_1.jpg" class="img1">'+
			'			<span class="peu" lang="ca">Capa d\'origen</span>'+
			'			<img src="css/images/Buffer_2.jpg">'+
			'			<span class="peu2" lang="ca">Resultat de l\'operació</span></div>'+
			'			<div style="margin-top:30px;margin-bottom:-20px;">	'+
			'			<span class="glyphicon glyphicon-info-sign"></span>&nbsp;<span lang="ca">Aquesta operació està disponible per capes dibuixades o creades a partir de fitxers de menys de 50Mb.</span>'+
					'<br/><br/>'+
			'</div>'+
			'			</div>'+
			'			<div id="buffer_layers">'+
							'<form id="frm_buffer">'+
			'					<div class="modal-layers-sig">'+
			'					</div>'+
			'					<br>'+
			'					<section>'+
			'						<fieldset>'+
			'							<label class="control-label" lang="ca">Radi (metres)</label>:'+
			'							<input lang="ca" id="distancia" type="text" required'+
			'						class="form-control my-border" value="">'+
			'						</fieldset>'+
			'					</section>'+
			'				</form>		'+			
			'				</div> '+
			'			</div>'+
			'			<div class="modal-footer">'+				
			'				<button lang="ca" type="button" class="btn btn-default" data-dismiss="modal">Cancel·lar</button>'+
			'				<button lang="ca" type="button" class="btn btn-primary">Àrea d\'influència</button>'+
			'			</div>'+
			'		</div>'+
			'		<!-- /.modal-content -->'+
			'	</div>'+
			'	<!-- /.modal-dialog -->'+
			'</div>'+
			'<!-- /.modal -->'+
			'<!-- Fi Modal Buffer -->');
}


function createModalConfigLayersBuffer(){
	var warningMSG="<div class='alert alert-danger'><strong>"+window.lang.convert('Cap de les capes carregades permet aquesta operació')+
	"<strong>  <span class='fa fa-warning sign'></span></div>";
	var count = 0;
	var html = '<label class="control-label" lang="ca">'+
					window.lang.convert('Capes disponibles:')+
				'</label>';
	
	jQuery.each(controlCapes._layers, function(i, item){
		
		var layer = item.layer;
		var layerName = layer.options.nom;
		var checked = "";
		
		var tipusLayer = "";
		if(layer.options.tipus) tipusLayer = layer.options.tipus;
		//Si és visualització o visualització-wms
		if(tipusLayer == t_visualitzacio ||  tipusLayer == t_vis_wms ){
				
			html += '<div class="downloadable-subrow" data-businessid="'+layer.options.businessId+'">'+
							'<div class="col-md-9 downloadable-name">'+
								layerName+
							'</div>';
				if (count==0){
						html +=	'<input id="buffer-chck" name="buffer-chck" class="col-md-1 downloadable-chck" type="radio" checked >';
				}
				else {
					html +=	'<input id="buffer-chck" name="buffer-chck" class="col-md-1 downloadable-chck" type="radio"  >';
				}
			html += '</div>';		
			html += '<div class="separate-downloadable-row"></div>';			
			count++;
		}
		
	});	
	
	html+='';
	if (count==0){
		$('#dialog_buffer .modal-body #buffer_layers').html(warningMSG);
		$('#dialog_buffer .modal-footer').attr("style","display:none;");
	}
	else {

		$('#dialog_buffer .modal-body .modal-layers-sig').html(html);
		$('#dialog_buffer .modal-footer').attr("style","display:block;");
	}
}


function createModalConfigLayersCentroide(){
	var warningMSG="<div class='alert alert-danger'><strong>"+window.lang.convert('Cap de les capes carregades permet aquesta operació')+
	"<strong>  <span class='fa fa-warning sign'></span></div>";
	var count = 0;
	var html = '<label class="control-label" lang="ca">'+
					window.lang.convert('Capes disponibles:')+
				'</label>';
	
	jQuery.each(controlCapes._layers, function(i, item){
		
		var layer = item.layer;
		var layerName = layer.options.nom;
		var checked = "";
		var tipusLayer = "";
		if(layer.options.tipus) tipusLayer = layer.options.tipus;
		
		//Si és visualització o visualització-wms
		if(tipusLayer == t_visualitzacio ||  tipusLayer == t_vis_wms ){
			if (layer.options.geometryType=="polygon"){	
				html += '<div class="downloadable-subrow" data-businessid="'+layer.options.businessId+'">'+
								'<div class="col-md-9 downloadable-name">'+
									layerName+
								'</div>';
				if (count==0){
					html += '<input id="centroide-chck" name="centroide-chck" class="col-md-1 downloadable-chck" type="radio" checked >';
				}	
				else{
					html += '<input id="centroide-chck" name="centroide-chck" class="col-md-1 downloadable-chck" type="radio"  >';
				}
				html += '</div>';		
				html+='<div class="separate-downloadable-row"></div>';			
				count++;
			}
		}
		
	});	
	
	html+='';
	
	if (count==0){
		$('#dialog_centroid .modal-body .modal-layers-sig').html(warningMSG);
		$('#dialog_centroid .modal-footer').attr("style","display:none;");
	}
	else {
		$('#dialog_centroid .modal-body .modal-layers-sig').html(html);
		$('#dialog_centroid .modal-footer').attr("style","display:block;");
	}
	
}

function addHtmlModalIntersection(){	
	jQuery('#mapa_modals').append('<!-- Modal Intersection -->'+
			'<div id="dialog_intersection" class="modal fade">'+
				'<div class="modal-dialog">'+
					'<div class="modal-content">'+
						'<div class="modal-header">'+
							'<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'+
							'<h4 lang="ca" class="modal-title">Intersecar</h4>'+
						'</div>'+
						'<div class="modal-body">'+
						'<div class="alert alert-success">'+
						'<span lang="ca">Aquesta operació calcula els elements que són intersecció entre diverses geometries.</span>'+'&nbsp;'+
						'<span lang="ca">Aplicable a polígons.</span><br/><br/>'+
						'			<div class="imagePeu"><img src="css/images/Interseccio_1.jpg" class="img1">'+
						'			<span class="peu" lang="ca">Capa d\'origen</span>'+
						'			<img src="css/images/Interseccio_2.jpg">'+
						'			<span class="peu2" lang="ca">Resultat de l\'operació</span></div>'+
						'			<div style="margin-top:30px;margin-bottom:-20px;">	'+
						'			<span class="glyphicon glyphicon-info-sign"></span>&nbsp;<span lang="ca">Aquesta operació està disponible per capes dibuixades o creades a partir de fitxers de menys de 50Mb.</span><br/><br/>'+
						'</div>'+				
						'			</div>'+
							'<form id="frm_buffer">'+
			'					<div class="modal-layers-sig">'+
			'					</div>'+
			'				</form>		'+			
			'			</div>'+
			'			<div class="modal-footer">'+
			'				<button lang="ca" type="button" class="btn btn-default" data-dismiss="modal">Cancel·lar</button>'+
			'				<button lang="ca" type="button" class="btn btn-primary">Intersecar</button>'+
			'			</div>'+
			'		</div>'+
			'		<!-- /.modal-content -->'+
			'	</div>'+
			'	<!-- /.modal-dialog -->'+
			'</div>'+
			'<!-- /.modal -->'+
			'<!-- Fi Modal Intersection -->');
}

function createModalConfigLayers2(tipus){
	var warningMSG="<div class='alert alert-danger'><strong>"+window.lang.convert('Cap de les capes carregades permet aquesta operació')+
	"<strong>  <span class='fa fa-warning sign'></span></div>";
	var count = 0;
	var count2 = 0;
	var countI = 0;
	var countI2= 0;
	var html = '<label class="control-label" lang="ca">'+
					window.lang.convert('Capes disponibles')+":"+
				'</label>';
	if (tipus=="tag") {
		html = '<label class="control-label" lang="ca">'+
		window.lang.convert('Capes de polígons disponibles')+":"+
	'</label>';
	}
	else if (tipus=="intersection"){
		$('#dialog_intersection .modal-body .modal-layers-sig').html('');
	}
	jQuery.each(controlCapes._layers, function(i, item){		
		var layer = item.layer;
		var layerName = layer.options.nom;
		var checked = "";
		var tipusLayer = "";
		if(layer.options.tipus) tipusLayer = layer.options.tipus;
		//Si és visualització o visualització-wms
		if(tipusLayer == t_visualitzacio ||  tipusLayer == t_vis_wms  ){
			if (tipus=="tag") {
				if (layer.options.geometryType=="polygon"){
					html += '<div class="downloadable-subrow" data-businessid="'+layer.options.businessId+'">'+
					'<div class="col-md-9 downloadable-name">'+
						layerName+
					'</div>';
					if (count==0) {
						html += '<input id="tag-chck" name="tag-chck" class="col-md-1 downloadable-chck" type="radio" checked>';
					}
					else {
						html += '<input id="tag-chck" name="tag-chck" class="col-md-1 downloadable-chck" type="radio"  >';
					}
				   html+='</div>';		
				   html+='<div class="separate-downloadable-row"></div>';
				   count++;
				}
			}	
			else {
				if (layer.options.geometryType=="polygon"){
					html += '<div class="downloadable-subrow" data-businessid="'+layer.options.businessId+'" data-layername="'+layerName+'">'+
							'<div class="col-md-9 downloadable-name">'+
								layerName+
							'</div>';
					html+='<input id="intersect-chck" name="intersect-chck" class="col-md-1 downloadable-chck" type="radio"  >';
					html+='</div>';		
					html+='<div class="separate-downloadable-row"></div>';
					countI++;
				}
			}
			
		}
		
	});	
	
	html+='';
	
	if (tipus=="intersection") {
		html += '<label class="control-label" lang="ca">'+
					window.lang.convert('Capes per fer intersecció')+":"+
			    '</label>';
	}
	if (tipus=="union"){
		html += '<label class="control-label" lang="ca">'+
					window.lang.convert('Capes per fer unió')+":"+
				'</label>';
	}
	if (tipus=="tag"){
		html += '<label class="control-label" lang="ca">'+
					window.lang.convert('Capes de punts disponibles')+":"+
				'</label>';
	}
	
	jQuery.each(controlCapes._layers, function(i, item){	
		var layer = item.layer;
		var layerName = layer.options.nom;
		var checked = "";
		var tipusLayer = "";
		if(layer.options.tipus) tipusLayer = layer.options.tipus;
		
		//Si és visualització o visualització-wms
		if(tipusLayer == t_visualitzacio ||  tipusLayer == t_vis_wms ){
			if (tipus=="tag") {
				if (layer.options.geometryType=="marker"){
					html += '<div class="downloadable-subrow" data-businessid="'+layer.options.businessId+'">'+
					'<div class="col-md-9 downloadable-name">'+
						layerName+
					'</div>';
					if (count2==0){
						html += '<input id="tag-chck2" name="tag-chck2" class="col-md-1 downloadable-chck" type="radio" checked>';
					}
					else {
						html += '<input id="tag-chck2" name="tag-chck2" class="col-md-1 downloadable-chck" type="radio"  >';
					}
				html += '</div>';		
		html+='<div class="separate-downloadable-row"></div>';
					count2++;
				}
			}
			else {
				if (layer.options.geometryType=="polygon"){	
					html += '<div class="downloadable-subrow" data-businessid="'+layer.options.businessId+'" data-layername="'+layerName+'">'+
								'<div class="col-md-9 downloadable-name">'+
									layerName+
								'</div>'+
								'<input id="intersect-chck2" name="intersect-chck2" class="col-md-1 downloadable-chck" type="radio"  >'+
							'</div>';		
					html+='<div class="separate-downloadable-row"></div>';
					countI2++;
				}
			}
			
		}
	});	
	
	html+='';
	
	if (tipus=="intersection") {
		if (countI==0 || countI2==0){
			$('#dialog_intersection .modal-body .modal-layers-sig').html(warningMSG);
			$('#dialog_intersection .modal-footer').attr("style","display:none;");
		}
		else {
			$('#dialog_intersection .modal-body .modal-layers-sig').html(html);
			$('#dialog_intersection .modal-footer').attr("style","display:block;");
		}
	}
	if (tipus=="tag")  {
		if (count==0 || count2==0){
			$('#dialog_tag .modal-body .modal-layers-sig').html(warningMSG);
			$('#dialog_tag .modal-footer').attr("style","display:none;");
		}
		else {
			$('#dialog_tag .modal-body .modal-layers-sig').html(html);
			$('#dialog_tag .modal-footer').attr("style","display:block;");
		}
	}
}

function addHtmlModalTag(){	
	jQuery('#mapa_modals').append('<!-- Modal Tag -->'+
			'<div id="dialog_tag" class="modal fade">'+
				'<div class="modal-dialog">'+
					'<div class="modal-content">'+
						'<div class="modal-header">'+
							'<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'+
							'<h4 lang="ca" class="modal-title">Transmissió (tag)</h4>'+
						'</div>'+
						'<div class="modal-body">'+
						'<div class="alert alert-success">'+
						'<span lang="ca">Aquesta operació transmet la informació associada a polígons als punts continguts dins aquests (polígon a punt).</span>'+'&nbsp;'+
						'<span lang="ca">Aplicable a polígons i punts.</span><br/><br/>'+
						'<div class="imagePeu"><img src="css/images/Tag_1.jpg" >'+
						'			<span class="peu"><span lang="ca">Capa d\'origen</span> 1</span>'+
						'			<img src="css/images/Tag_2.jpg">'+
						'			<span class="peu2_2"><span lang="ca">Capa d\'origen</span> 2</span>'+
						'			<img src="css/images/Tag_3.jpg" >'+
						'			<span class="peu3" lang="ca">Resultat de l\'operació</span></div>'+
						'			<div style="margin-top:30px;margin-bottom:-20px;">	'+
						'			<span class="glyphicon glyphicon-info-sign"></span>&nbsp;<span lang="ca">Aquesta operació està disponible per capes dibuixades o creades a partir de fitxers de menys de 50Mb.</span><br/><br/>'+
						'</div>'+
				
						'</div>'+
						'<form id="frm_buffer">'+
			'					<div class="modal-layers-sig">'+
			'					</div>'+
			'				</form>		'+			
			'			</div>'+
			'			<div class="modal-footer">'+
			'				<button lang="ca" type="button" class="btn btn-default" data-dismiss="modal">Cancel·lar</button>'+
			'				<button lang="ca" type="button" class="btn btn-primary">Transmissió (tag)</button>'+
			'			</div>'+
			'		</div>'+
			'		<!-- /.modal-content -->'+
			'	</div>'+
			'	<!-- /.modal-dialog -->'+
			'</div>'+
			'<!-- /.modal -->'+
			'<!-- Fi Modal Tag -->');
}



function addHtmlModalUnion(){	
	jQuery('#mapa_modals').append('<!-- Modal Union -->'+
			'<div id="dialog_union" class="modal fade">'+
				'<div class="modal-dialog">'+
					'<div class="modal-content">'+
						'<div class="modal-header">'+
							'<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'+
							'<h4 lang="ca" class="modal-title">Union</h4>'+
						'</div>'+
						'<div class="modal-body">'+
						'<div class="alert alert-success">'+
						'Aquesta operació transmet la informació associada a polígons als punts continguts dins aquests.<br/>'+
						'<img src="css/images/Tag_1.jpg" style="width:25%;height:25%"> '+
						'<img src="css/images/Tag_2.jpg" style="width:25%;height:25%"> '+
						'<img src="css/images/Tag_3.jpg" style="width:25%;height:25%"><br/>'+	
						'</div>'+
							'<form id="frm_buffer">'+
			'					<div class="modal-layers-sig">'+
			'					</div>'+
			'				</form>		'+			
			'			</div>'+
			'			<div class="modal-footer">'+
			'				<button lang="ca" type="button" class="btn btn-default" data-dismiss="modal">Cancel·lar</button>'+
			'				<button lang="ca" type="button" class="btn btn-primary">Union</button>'+
			'			</div>'+
			'		</div>'+
			'		<!-- /.modal-content -->'+
			'	</div>'+
			'	<!-- /.modal-dialog -->'+
			'</div>'+
			'<!-- /.modal -->'+
			'<!-- Fi Modal Union -->');
}

function addHtmlModalCentroid(){
	jQuery('#mapa_modals').append('<!-- Modal Centroide -->'+
			'<div id="dialog_centroid" class="modal fade">'+
				'<div class="modal-dialog">'+
					'<div class="modal-content">'+
						'<div class="modal-header">'+
							'<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'+
							'<h4 lang="ca" class="modal-title">Centre geomètric</h4>'+
						'</div>'+
						'<div class="modal-body">'+
						'<div class="alert alert-success">'+
						'<span lang="ca">Aquesta operació calcula el centre geomètric o centroide d\'un polígon tancat.</span>'+'&nbsp;'+
						'<span lang="ca">Aplicable a polígons.</span><br/><br/>'+
						'			<div class="imagePeu"><img src="css/images/Centroid_1.jpg" class="img1">'+
						'			<span class="peu" lang="ca">Capa d\'origen</span>'+
						'			<img src="css/images/Centroid_2.jpg">'+
						'			<span class="peu2" lang="ca">Resultat de l\'operació</span></div>'+
						'			<div style="margin-top:30px;margin-bottom:-20px;">	'+
						'			<span class="glyphicon glyphicon-info-sign"></span>&nbsp;<span lang="ca">Aquesta operació està disponible per capes dibuixades o creades a partir de fitxers de menys de 50Mb.</span><br/><br/>'+
						'</div>'+				
						'</div>'+
							'<form id="frm_buffer">'+
			'					<div class="modal-layers-sig">'+
			'					</div>'+
			'					<br>'+
			'				</form>		'+			
			'			</div>'+
			'			<div class="modal-footer">'+
			'				<button lang="ca" type="button" class="btn btn-default" data-dismiss="modal">Cancel·lar</button>'+
			'				<button lang="ca" type="button" class="btn btn-primary">Centre geomètric</button>'+
			'			</div>'+
			'		</div>'+
			'		<!-- /.modal-content -->'+
			'	</div>'+
			'	<!-- /.modal-dialog -->'+
			'</div>'+
			'<!-- /.modal -->'+
			'<!-- Fi Modal Centroide -->');
}

function addHtmlModalLayersFilter(){
	
	jQuery('#mapa_modals').append(
	'	<!-- Modal Filter Layers -->'+
	'		<div class="modal fade" id="dialog_layers_filter">'+
	'		<div class="modal-dialog">'+
	'			<div class="modal-content">'+
	'				<div class="modal-header">'+
	'					<button type="button" class="close" data-dismiss="modal"'+
	'						aria-hidden="true">&times;</button>'+
	'					<h4 class="modal-title" lang="ca">Tria una capa per aplicar-hi el filtre</h4>'+
	'				</div>'+
	'				<div class="modal-body">'+
	'					<div class="alert alert-success">'+
						'<span lang="ca">Aquesta operació retorna aquells elements que acompleixen una condició relativa a la seva informació de texte.</span>'+'&nbsp;'+
						'<span lang="ca">Aplicable a punts, línies o polígons.</span><br/><br/>'+
	'							<div class="imagePeu"><img src="css/images/Filtre_1.jpg" class="img1">'+
	'							<span class="peu" lang="ca">Capa d\'origen</span>'+
	'							<img src="css/images/Filtre_2.jpg">'+
	'						<span class="peu2" lang="ca">Resultat de l\'operació</span></div>'+
	'			<div style="margin-top:30px;margin-bottom:-20px;">	'+
	'			<span class="glyphicon glyphicon-info-sign"></span>&nbsp;<span lang="ca">Aquesta operació està disponible per capes dibuixades o creades a partir de fitxers de menys de 50Mb.</span><br/><br/>'+
	'</div>'+
	'</div>'+
	'					<script id="filter-layers-template" type="text/x-handlebars-template">'+
	'					<div class="panel-warning">'+					
	'					<ul class="bs-dadesO_USR panel-heading">'+
	'						{{#each layers}}'+
	'						<li><a class="usr_filter_layer lable-usr" data-leafletid="{{layer._leaflet_id}}" data-businessId="{{layer.options.businessId}}" data-geometryType="{{layer.options.geometryType}}" data-tipus="{{layer.options.tipus}}">{{name}}</a></li>'+
	'						{{/each}}'+
	'					</ul>'+	
	'					</div>'+
	'					</script>'+
	'					<div id="list_filter_layers"></div>'+
	'			</div>'+
	'				<div class="modal-footer">'+
	'				</div>'+
	'			</div>'+
	'			<!-- /.modal-content -->'+
	'		</div>'+
	'		<!-- /.modal-dialog -->'+
	'	</div>'+
	'	<!-- /.modal -->'+
	'	<!-- fi Modal Tematics Layers -->'		
	);
	
}

function showFilterLayersModal(){
	//console.debug("showTematicLayersModal");
	var warninMSG="<div class='alert alert-danger'><strong>"+window.lang.convert('Cap de les capes carregades permet aquesta operació')+
	"<strong>  <span class='fa fa-warning sign'></span></div>";
	jQuery('.modal').modal('hide');
	
	jQuery('#dialog_layers_filter').modal('show');
	

		var layers = [];
		jQuery.each( controlCapes._layers, function( key, value ) {
			var layerOptions = this.layer.options;
			var tipusLayer = "";
			if(this.layer.options.tipus) tipusLayer = this.layer.options.tipus;
			if(tipusLayer == t_visualitzacio ||  tipusLayer == t_vis_wms ) layers.push(this);
		}
	
		);
		// fi each
		if(layers.length ==0){
			$('#list_filter_layers').html(warninMSG);		
			return;
		}
		layers = {layers: layers};
	
		var source = jQuery("#filter-layers-template").html();
		var template = Handlebars.compile(source);
		var html = template(layers);
		$('#list_filter_layers').html(html);
		
		$('.usr_filter_layer').on('click',function(e){
			var _this = jQuery(this);
			var data = _this.data();
				
			showModalFilterFieldsAvancat(data);
			
		});
	
}
function showModalFilterFieldsAvancat(data){
	jQuery('.modal').modal('hide');

	jQuery('#dialog_filter_rangs_avancat').modal('show');
	
	jQuery("#dialog_filter_rangs_avancat").data("capamare", data);
	
	jQuery("#filtre_avancat").val("");
	
	jQuery("#select_filter").val("");
	
	jQuery('#dataField_filter_avancat2').html('');
	
	var dataTem={
		businessId: data.businessid,
		uid: jQuery.cookie('uid')
	};
//	console.debug(data);
//	console.debug(data);
	$('#visFilter').val(data.businessid);
	
	visFilter = data.businessid;
	
	if(data.tipus == t_url_file){
		var urlFileLayer = controlCapes._layers[data.leafletid].layer;
		jQuery("#dialog_filter_rangs_avancat").data("visualitzacio", urlFileLayer.options);
		var fields = {};
		//Recollim propName de les geometries de la capa
		var dataNames = urlFileLayer.options.propName.split(',');
		jQuery.each(dataNames, function( index, value ) {
			fields[value] = value;
		});
		//console.debug(fields);
		//creamos el select con los campos
			
		var source2 = jQuery("#tematic-layers-fields-avancat").html();
		var template2 = Handlebars.compile(source2);
		var html2 = template2({fields:fields});
		
		
		jQuery('#dataField_filter_avancat').html(html2);
		jQuery('#valors_unics').on('click',function(e){
			e.stopImmediatePropagation();
			var this_ = jQuery('#dataField_filter_avancat');
			readDataUrlFileLayer(urlFileLayer, this_.val()).then(function(results){
				if (results.length == 0){
					var warninMSG="<div class='alert alert-danger'><strong>"+window.lang.convert('Aquest camp no te valors')+"<strong>  <span class='fa fa-warning sign'></span></div>";
				}else{
					var fields = {};	
					results.sort();
					jQuery.grep(results, function( n, i ) {
						fields[n] =n;
						var source2 = jQuery("#tematic-layers-fields-values-avancat").html();
						var template2 = Handlebars.compile(source2);
						var html2 = template2({fields:fields});
						jQuery('#dataField_filter_avancat2').html(html2);
					});
		
				}
			});
		});	
			
	}
	else{//Si es una visualitzacio
		getVisualitzacioByBusinessId(dataTem).then(function(results){
			if (results.status == "OK"){
				resultsVis = results;
				var visualitzacio = results.results;
				jQuery("#dialog_filter_rangs_avancat").data("visualitzacio", visualitzacio);
				var fields = {};
				if (visualitzacio.options){
					var options = JSON.parse(visualitzacio.options);
					var dataNames = options.propName.split(',');
					jQuery.each(dataNames, function( index, value ) {
						fields[value] = value;
					});
				}else{
					if (results.geometries && results.geometries.options){
						var dataNames = results.geometries.options.split(',');
						jQuery.each(dataNames, function( index, value ) {
							fields[value] = value;
						});
					}
				}
				//creamos el select con los campos
				var source1 = jQuery("#tematic-layers-fields-avancat").html();
				var template1 = Handlebars.compile(source1);
				var html1 = template1({fields:fields});
					
				jQuery('#dataField_filter_avancat').html(html1);
				
				
				jQuery('#valors_unics').on('click',function(e){
					e.stopImmediatePropagation();
					var this_ = jQuery('#dataField_filter_avancat');
					readDataVisualitzacio(resultsVis.results, this_.val()).then(function(results){
							if (results.length == 0){
								var warninMSG="<div class='alert alert-danger'><strong>"+window.lang.convert('Aquest camp no te valors')+"<strong>  <span class='fa fa-warning sign'></span></div>";
							}else{
								var fields = {};
								results.sort();
								jQuery.grep(results, function( n, i ) {
									fields[n] = n;									
									var source2 = jQuery("#tematic-layers-fields-values-avancat").html();
									var template2 = Handlebars.compile(source2);
									var html2 = template2({fields:fields});
									jQuery('#dataField_filter_avancat2').html(html2);
								});
							}
							
					});
					
					
				});		
				
				jQuery('#nomes_10_valors').on('click',function(e){
					e.stopImmediatePropagation();
					var this_ = jQuery('#dataField_filter_avancat');
					readDataVisualitzacio(resultsVis.results, this_.val()).then(function(results){
							if (results.length == 0){
								var warninMSG="<div class='alert alert-danger'><strong>"+window.lang.convert('Aquest camp no te valors')+"<strong>  <span class='fa fa-warning sign'></span></div>";
							}else{
								var fields = {};			
								var j=0;
								results.sort();
								jQuery.grep(results.slice(0,10), function( n, i ) {
											fields[n] = n;		
											var source2 = jQuery("#tematic-layers-fields-values-avancat").html();
											var template2 = Handlebars.compile(source2);
											var html2 = template2({fields:fields});
											jQuery('#dataField_filter_avancat2').html(html2);
											
								});
							}
							
					});
					
					
				});	
				
			}else{
				console.debug("getVisualitzacioByBusinessId ERROR");				
			}
		},function(results){
			console.debug("getVisualitzacioByBusinessId ERROR");
		});	
	}

	 $('#dataField_filter_avancat').on('dblclick', function(e) {
		e.stopImmediatePropagation();
		var this_ = jQuery(this);
		var html = jQuery("#select_filter").val() ;
		html += " "+this_.val();
		if (keys=="") keys+=this_.val();
		else keys+=","+this_.val();
		jQuery("#select_filter").val(html);	
		 
	   }); 
	 	
	 $('#dataField_filter_avancat').on('change', function(e) {
		 e.stopImmediatePropagation();
		 var source2 = jQuery("#tematic-layers-fields-values-avancat").html();
		 var template2 = Handlebars.compile(source2);
		 var html2 = template2({});
		 jQuery('#dataField_filter_avancat2').html(html2);
	 });
	 
	 
	 $('#dataField_filter_avancat2').on('dblclick', function(e) {
			e.stopImmediatePropagation();
			var this_ = jQuery(this);
			//console.debug(jQuery("#select_filter").val());
			var html = jQuery("#select_filter").val() ;
			html += " "+this_.val();
			if (valors=="") valors+=this_.val();
			else valors+=","+this_.val();
			jQuery("#select_filter").val(html);				 
	 }); 

	 var keys="";
	 var operands="";
	 var valors="";
	 jQuery('#edicio_filtre').on('click',function(event){
			event.stopImmediatePropagation();
			var this_ = jQuery(this);
			 if (!$("input[id='edicio_filtre']:checked").val()) {
				  $('#select_filter').attr('readonly', true);
			 }	
			 else {
				$('#select_filter').attr('readonly', false);
			 }
		});	
	
	jQuery('#equals').on('click',function(event){
		event.stopImmediatePropagation();
		var this_ = jQuery(this);
		var html = jQuery("#select_filter").val() ;
		html += " = ";
		if (operands=="") operands+="=";
		else operands+=",=";
		jQuery("#select_filter").val(html);				
	});	
	
	jQuery('#notequals').on('click',function(event){
		event.stopImmediatePropagation();
		var this_ = jQuery(this);
		var html = jQuery("#select_filter").val() ;
		html += " <> ";
		if (operands=="") operands+="<>";
		else operands+=",<>";
		jQuery("#select_filter").val(html);				
	});	
	jQuery('#like').on('click',function(event){
		event.stopImmediatePropagation();
		var this_ = jQuery(this);
		var html = jQuery("#select_filter").val() ;
		html += " like ";
		if (operands=="") operands+="like";
		else operands+=",like";
		jQuery("#select_filter").val(html);				
	});	
	jQuery('#major').on('click',function(event){
		event.stopImmediatePropagation();
		var this_ = jQuery(this);
		var html = jQuery("#select_filter").val() ;
		html += " > ";
		if (operands=="") operands+=">";
		else operands+=",>";
		jQuery("#select_filter").val(html);				
	});	
	jQuery('#majorequals').on('click',function(event){
		event.stopImmediatePropagation();
		var this_ = jQuery(this);
		var html = jQuery("#select_filter").val() ;
		html += " >= ";
		if (operands=="") operands+=">=";
		else operands+=",>=";
		jQuery("#select_filter").val(html);				
	});	
	jQuery('#and').on('click',function(event){
		event.stopImmediatePropagation();
		var this_ = jQuery(this);
		var html = jQuery("#select_filter").val() ;
		html += " and ";
		keys+=","+" ";
		valors+=","+" ";
		if (operands=="") operands+="and";
		else operands+=",and";
		jQuery("#select_filter").val(html);				
	});
	jQuery('#menor').on('click',function(event){
		event.stopImmediatePropagation();
		var this_ = jQuery(this);
		var html = jQuery("#select_filter").val() ;
		html += " < ";
		if (operands=="") operands+="<";
		else operands+=",<";
		jQuery("#select_filter").val(html);				
	});	
	jQuery('#menorequals').on('click',function(event){
		event.stopImmediatePropagation();
		var this_ = jQuery(this);
		var html = jQuery("#select_filter").val() ;
		html += " <= ";
		if (operands=="") operands+="<=";
		else operands+=",<=";
		jQuery("#select_filter").val(html);				
	});
	jQuery('#or').on('click',function(event){
		event.stopImmediatePropagation();
		var this_ = jQuery(this);
		var html = jQuery("#select_filter").val() ;
		html += " or ";
		if (keys=="")  keys+=" ";
		else keys+=","+" ";
		if (valors=="") valors+=" "; 
		else valors+=","+" ";
		if (operands=="") operands+="or";
		else operands+=",or";
		jQuery("#select_filter").val(html);				
	});	
	jQuery('#not').on('click',function(event){
		event.stopImmediatePropagation();
		var this_ = jQuery(this);
		var html = jQuery("#select_filter").val() ;
		html += " not like ";
		if (operands=="") operands+="not like";
		else operands+=",not like";
		jQuery("#select_filter").val(html);				
	});
	jQuery('#parentobrir').on('click',function(event){
		event.stopImmediatePropagation();
		var this_ = jQuery(this);
		var html = jQuery("#select_filter").val() ;
		html += " (";
		if (operands=="") operands+="(";
		else operands+=",(";
		jQuery("#select_filter").val(html);				
	});
	jQuery('#parenttancar').on('click',function(event){
		event.stopImmediatePropagation();
		var this_ = jQuery(this);
		var html = jQuery("#select_filter").val() ;
		html += " )";
		if (operands=="") operands+=")";
		else operands+=",)";
		jQuery("#select_filter").val(html);				
	});
	jQuery('#valorFiltre').on('click',function(event){
		event.stopImmediatePropagation();
		var this_ = jQuery(this);
		var html = jQuery("#select_filter").val() ;
		html += jQuery('#filtre_avancat').val();
		if (valors=="") valors+=jQuery('#filtre_avancat').val(); 
		else valors+=","+jQuery('#filtre_avancat').val();
		jQuery("#select_filter").val(html);				
	});	
	jQuery('#resetFiltre').on('click',function(event){
		event.stopImmediatePropagation();
		keys="";
		operands="";
		valors="";
		jQuery('#filtre_avancat').val('');
		jQuery("#select_filter").val('');				
	});	
	jQuery('#filtrarBtn').on('click',function(event){
		if(busy){
		 	jQuery('#dialog_filter_rangs_avancat').hide();
			$('#dialog_info_upload_txt').html(window.lang.convert("S'està executant una operació. Si us plau, espereu que aquesta acabi."));
			$('#dialog_info_upload').modal('show');
		}else{
			busy=true;
			event.stopImmediatePropagation();
			var data1 = {
					uid: $.cookie('uid'),
					businessId1: visFilter
			}
			crearFitxerPolling(data1).then(function(results) {
				var tmpFile="";
				if (results.status=="OK"){
					tmpFile = results.tmpFilePath;
					//Definim interval de polling en funcio de la mida del fitxer
					var pollTime =3000;
					//Fem polling
					(function(){							
						pollIntersect = function(){
							$.ajax({
								url: paramUrl.polling +"pollingFileName="+ results.tmpFileName,
								dataType: 'json',
								type: 'get',
								success: function(data){
									//console.debug(data);
									jQuery('#dialog_filter_rangs_avancat').hide();
									jQuery('#info_uploadFile').show();
									if(data.status.indexOf("ABANS FILTRE")!=-1 && busy){
										
										jQuery("#div_uploading_txt").html("");
										jQuery("#div_uploading_txt").html(
											'<div id="div_upload_step1" class="status_current" lang="ca">1. '+window.lang.convert('Calculant operació')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
											'<div id="div_upload_step2" class="status_uncheck" lang="ca">2. '+window.lang.convert('Creant geometries')+'</div>'+
											'<div id="div_upload_step3" class="status_uncheck" lang="ca">3. '+window.lang.convert('Processant la resposta')+'</div>'//+	
										);									
										
									}else if(data.status.indexOf("DESPRES")!=-1 && busy){
										jQuery("#div_uploading_txt").html("");
										jQuery("#div_uploading_txt").html(
												'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.convert('Operació calculada')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
												'<div id="div_upload_step2" class="status_current" lang="ca">2. '+window.lang.convert('Creant geometries')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
												'<div id="div_upload_step3" class="status_uncheck" lang="ca">3. '+window.lang.convert('Processant la resposta')+'</div>'//+	
													);									
									}else if(data.status.indexOf("OK")!=-1 && busy){
//										console.debug("Ha acabat:");
//										console.debug(data);
										clearInterval(pollInterval);
										
										jQuery("#div_uploading_txt").html("");
										jQuery("#div_uploading_txt").html(
												'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.convert('Operació calculada')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
												'<div id="div_upload_step2" class="status_check" lang="ca">2. '+window.lang.convert('Geometries creades')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
												'<div id="div_upload_step3" class="status_current" lang="ca">3. '+window.lang.convert('Processant la resposta')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'//+	
											);									
										
										
									}else if(data.status.indexOf("ERROR")!=-1 && busy){
										console.error("Error calculant l'operació");
										console.error(data);
										busy = false;
										
										clearInterval(pollInterval);
										jQuery('#info_uploadFile').hide();
										
										$('#dialog_error_upload_txt').html("");
										
										$('#dialog_error_upload_txt').html(window.lang.convert("Error calculant l'operació"));										
										
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
							pollIntersect();
						},pollTime);
						
					})();
				}
				else {
					jQuery('#info_uploadFile').hide();		
					busy=false;					
				}
			 var dataFiltre={
				businessId1: visFilter,
				uid: jQuery.cookie('uid'),
				mapBusinessId:url('?businessid'),
				key: keys,
				operand: operands,
				filter: valors,
				markerStyle : JSON.stringify(getMarkerRangFromStyle(defaultPunt)),
				lineStyle : JSON.stringify(getLineRangFromStyle(canvas_linia)),
				polygonStyle : JSON.stringify(getPolygonRangFromStyle(canvas_pol)),
				tmpFilePath: tmpFile
			};		
			 filter(dataFiltre).then(function(results){				 
					if (results.status=="OK"){							
						var defer = $.Deferred();
						jQuery('#dialog_filter_rangs_avancat').modal('hide');
						//readVisualitzacio(defer, results.visualitzacio, results.layerMarker );
						addDropFileToMap(results);
						jQuery('#info_uploadFile').hide();		
						busy=false;
						activaPanelCapes(true);
						keys="";
						operands="";
						valors="";
					}
					else if (results.status=="KO"){
						var defer = $.Deferred();
						jQuery('#dialog_filter_rangs_avancat').modal('hide');
						jQuery('#info_uploadFile').hide();	
						$('#dialog_error_upload_txt').html("");					
						$('#dialog_error_upload_txt').html(window.lang.convert("No hi ha resultats per el filtre"));					
						$('#dialog_error_upload').modal('show');
						busy=false;
						keys="";
						operands="";
						valors="";
					}
					else {
						jQuery('#info_uploadFile').hide();		
						busy=false;
						jQuery('#dialog_filter_rangs_avancat').modal('hide');
						$('#dialog_error_upload_txt').html("");					
						$('#dialog_error_upload_txt').html(window.lang.convert("Error calculant l\'operació"));					
						$('#dialog_error_upload').modal('show');
						keys="";
						operands="";
						valors="";
					}
			 });
			});
		
		}});

	
}






function addHtmlModalFieldsFilter(){
	
	jQuery('#mapa_modals').append(
	'	<!-- Modal Filter -->'+
	'		<div class="modal fade" id="dialog_filter_rangs">'+
	'		<div class="modal-dialog">'+
	'			<div class="modal-content">'+
	'				<div class="modal-header">'+
	'				<button class="close" aria-hidden="true" data-dismiss="modal" type="button">x</button>'+
	'				<h4 class="modal-title" lang="ca">Filtre simple</h4>'+
	'				</div>'+
	'				<div class="modal-body">'+
	'					<div class="labels_fields">'+
	'					    <input type="hidden" name="visFilter"  id="visFilter" value="">'+ 
	'						<span>1.</span><span lang="ca">Escull el camp per filtrar</span>:'+
	'						<select name="dataField_filter" id="dataField_filter">'+
	'						</select>'+
	'					</div>'+
	'					<script id="tematic-layers-fields" type="text/x-handlebars-template">'+
	'						{{#each fields}}'+
	'						<option value="{{this}}">{{@key}}</option>'+
	'						{{/each}}'+
	'					</script>'+
	'					<br/>'+				
	'					<div id="list_filter_values"></div>'+
	'					<button type="button" class="filtre-avancat" lang="ca">Filtre avançat</button>'+
	'				<div class="modal-footer">'+
	'					<button type="button" class="btn btn-default" data-dismiss="modal" lang="ca">Tancar</button>'+
	'         			<button type="button" class="btn btn-success" lang="ca">Filtrar</button>'+
	'				</div>'+
	'			</div>'+
	'			<!-- /.modal-content -->'+
	'		</div>'+
	'		<!-- /.modal-dialog -->'+
	'	</div>'+
	'	<!-- /.modal -->'+
	'	<!-- fi Modal Tematics Rangs -->'		
	);
}

function addHtmlModalFieldsFilterAvancat(){
	
	jQuery('#mapa_modals').append(
	'	<!-- Modal Filter -->'+
	'		<div class="modal fade" id="dialog_filter_rangs_avancat">'+
	'		<div class="modal-dialog">'+
	'			<div class="modal-content">'+
	'				<div class="modal-header">'+
	'				<button class="close" aria-hidden="true" data-dismiss="modal" type="button">x</button>'+
	'				<h4 class="modal-title" lang="ca">Filtre</h4>'+
	'				</div>'+
	'				<div class="modal-body">'+
	'				<span class="ca">Fes doble-clic sobre els elements per afegir-los al filtre.</span>'+
	'					<div class="labels_fields" >'+
	'					    <input type="hidden" name="visFilter"  id="visFilter" value="">'+ 
	'						<span lang="ca">Camps</span>:<span lang="ca" style="margin-left:31%">Valors</span>:<br/>'+
	'						<select name="dataField_filter_avancat" id="dataField_filter_avancat" style="width: 30%;" size="6">'+
	'						</select>'+
	'						<select name="dataField_filter_avancat2" id="dataField_filter_avancat2" style="margin-left:8%;width:30%;" size="6">'+
	'						</select>'+
	'					<script id="tematic-layers-fields-avancat" type="text/x-handlebars-template">'+
	'						{{#each fields}}'+
	'						<option value="{{this}}">{{@key}}</option>'+
	'						{{/each}}'+
	'					</script>'+	
	'					<script id="tematic-layers-fields-values-avancat" type="text/x-handlebars-template">'+
	'						{{#each fields}}'+
	'						<option value="{{this}}">{{@key}}</option>'+
	'						{{/each}}'+
	'					</script>'+
	'					<br/>'+
	'					<span  style="margin-left:38%">'+
	'					<button type="button" lang="ca" id="valors_unics">Valors únics</button>'+
	'					<button type="button" lang="ca" id="nomes_10_valors">10 primers</button>'+
	'					</span></div>'+
	'					<br/>'+
	'					<div>'+
	'					<span lang="ca" style="font-size: 13px;font-weight: bold;">Filtre avançat</span><br/>'+
	'					<span lang="ca">Operador</span>:<br/>'+
	'					<button type="button" lang="ca" id="equals">=</button>'+
	'					<button type="button" lang="ca" id="notequals"><></button>'+
	'					<button type="button" lang="ca" id="like">Like</button>'+
	'					<button type="button" lang="ca" id="not">Not Like</button>'+
	'					<button type="button" lang="ca" id="major">></button>'+
	'					<button type="button" lang="ca" id="majorequals">>=</button>'+	
	'					<button type="button" lang="ca" id="menor"><</button>'+
	'					<button type="button" lang="ca" id="menorequals"><=</button>'+
//	'					<button type="button" lang="ca" id="parentobrir">(</button>'+
//	'					<button type="button" lang="ca" id="parenttancar">)</button>'+	
	'					<button type="button" lang="ca" id="and">And</button>'+
	'					<button type="button" lang="ca" id="or">Or</button>'+
	'					</div>'+
	'					<div>'+
	'					<span class="ca">Valor filtre</span>:<br/>'+
	'					<input type="text" id="filtre_avancat"/>&nbsp;<button type="button" lang="ca" id="valorFiltre">Afegir valor</button>'+
	'					</div>'+
	'					<div>'+
	'					<span class="ca">Filtre resultant</span>:</br>'+
	'					<textarea rows="4" cols="50" id="select_filter" readonly></textarea>'+
	'					<br/><input type="checkbox" id="edicio_filtre"/>&nbsp;<span lang="ca">Editar filtre</span>'+
	'					</div>'+
	'				<div class="modal-footer">'+
	'					<button type="button" class="btn btn-default" data-dismiss="modal" lang="ca">Tancar</button>'+
	'         			<button type="button" class="btn btn-success" lang="ca" id="filtrarBtn">Filtrar</button>'+
	'				</div>'+
	'			</div>'+
	'			<!-- /.modal-content -->'+
	'		</div>'+
	'		<!-- /.modal-dialog -->'+
	'	</div>'+
	'	<!-- /.modal -->'+
	'	<!-- fi Modal Tematics Rangs -->'		
	);
}

function getTipusValuesVisualitzacioFilter(results){
	//console.debug("getTipusValuesVisualitzacio");
	if (results.length == 0){
		var warninMSG="<div class='alert alert-danger'><strong>"+window.lang.convert('Aquest camp no te valors')+"<strong>  <span class='fa fa-warning sign'></span></div>";
		jQuery('#list_filter_values').html(warninMSG);
		jQuery('#dialog_filter_rangs .btn-success').hide();
	}else{
		var arr = jQuery.grep(results, function( n, i ) {
			return !jQuery.isNumeric(n);
		});
		var checkboxes = "";
		jQuery.grep(results, function( n, i ) {
			var check =  "<input type='checkbox' name='filterValue' value='"+escape(n)+"' id='filter_"+i+"' class='col-md-1 download'/>"+n;
			checkboxes += check +"<br/>" ;
		});
		var html = "2. "+window.lang.convert('Escull els valors pels que vols filtrar')+":<br/>";
		html += checkboxes;
		var filtres="";
		var i=0;
		jQuery('#list_filter_values').html(html);
		jQuery('#dialog_filter_rangs .btn-success').show();
		jQuery('#dialog_filter_rangs .btn-success').on('click',function(e){
			e.stopImmediatePropagation();
			filtres="";
			$('input[name="filterValue"]:checked').each(function() {
				   filtres=filtres+this.value+",";
				   i++;
			});	
			if(busy){
				jQuery('#dialog_filter_rangs').hide();
				$('#dialog_info_upload_txt').html(window.lang.convert("S'està executant una operació. Si us plau, espereu que aquesta acabi."));
				$('#dialog_info_upload').modal('show');
			}else{
			busy=true; 
			//console.debug(filtres);
			var data1 = {
					uid: $.cookie('uid'),
					businessId1: $('#visFilter').val()
			}
			crearFitxerPolling(data1).then(function(results) {
				var tmpFile="";
				if (results.status=="OK"){
					tmpFile = results.tmpFilePath;
					//Definim interval de polling en funcio de la mida del fitxer
					var pollTime =3000;
					//Fem polling
					(function(){							
						pollFiltre = function(){
							$.ajax({
								url: paramUrl.polling +"pollingFileName="+ results.tmpFileName,
								dataType: 'json',
								type: 'get',
								success: function(data){
									jQuery('#dialog_filter_rangs').hide();
									jQuery('#info_uploadFile').show();
									if(data.status.indexOf("ABANS FILTRE")!=-1 && busy){
										
										jQuery("#div_uploading_txt").html("");
										jQuery("#div_uploading_txt").html(
											'<div id="div_upload_step1" class="status_current" lang="ca">1. '+window.lang.convert('Calculant operació')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
											'<div id="div_upload_step2" class="status_uncheck" lang="ca">2. '+window.lang.convert('Creant geometries')+'</div>'+
											'<div id="div_upload_step3" class="status_uncheck" lang="ca">3. '+window.lang.convert('Processant la resposta')+'</div>'
										);									
										
									}else if(data.status.indexOf("DESPRES")!=-1 && busy){
										
										jQuery("#div_uploading_txt").html("");
										jQuery("#div_uploading_txt").html(
												'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.convert('Calculant operació')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
												'<div id="div_upload_step2" class="status_current" lang="ca">2. '+window.lang.convert('Creant geometries')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
												'<div id="div_upload_step3" class="status_uncheck" lang="ca">3. '+window.lang.convert('Processant la resposta')+'</div>'	
											);									
										
										
									}else if(data.status.indexOf("OK")!=-1 && busy){
										clearInterval(pollInterval);
										
										jQuery("#div_uploading_txt").html("");
										jQuery("#div_uploading_txt").html(
												'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.convert('Calculant operació')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
												'<div id="div_upload_step2" class="status_check" lang="ca">2. '+window.lang.convert('Creant geometries')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
												'<div id="div_upload_step3" class="status_current" lang="ca">3. '+window.lang.convert('Processant la resposta')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'	
											);									
										
										
									}else if(data.status.indexOf("ERROR")!=-1 && busy){
										busy = false;
										
										clearInterval(pollInterval);
										jQuery('#info_uploadFile').hide();
										
										$('#dialog_error_upload_txt').html("");
										
										$('#dialog_error_upload_txt').html(window.lang.convert("Error generant filtre"));
										
										
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
							pollFiltre();
						},pollTime);
						
					})();
				}
				else {
					jQuery('#info_uploadFile').hide();		
					busy=false;
				}
				
			var data = {
				mapBusinessId: url('?businessid'),
				uid: $.cookie('uid'),
				businessId: $('#visFilter').val(),
				campFiltre: $('#dataField_filter option:selected' ).val(),
				valorsFiltre: filtres,
				tmpFilePath: tmpFile
			};
			filterVisualitzacio(data).then(function(results2){
				//console.debug(results2.status);
				if (results2.status=="OK"){					
							
					var defer = $.Deferred();
					readVisualitzacio(defer, results2.visualitzacio, results2.layer);
					jQuery('#info_uploadFile').hide();		
					busy=false;
					activaPanelCapes(true);
				}
				else {
					jQuery('#info_uploadFile').hide();		
					busy=false;
					$('#dialog_error_upload_txt').html("");					
					$('#dialog_error_upload_txt').html(window.lang.convert("Error calculant l\'operació"));					
					$('#dialog_error_upload').modal('show');
					
				}
			});
			});
		}});
	}
}

	