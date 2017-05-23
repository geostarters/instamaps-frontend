/**
 * 
 */
function createURLfileLayer(urlFile, tipusFile, epsgIN, dinamic, nomCapa, colX, colY, tipusAcc, tipusFont, tipusCodi, nomCampCodi, colXY, separador){
	//Estil defecte
	var estil_do = retornaEstilaDO(t_url_file);
	var estil_lin_pol = estil_do;

	//Recuperem estils de la barra d'eines
	var lineStyle = getLineRangFromStyle(canvas_linia);
	lineStyle.weight = lineStyle.lineWidth;

	var polygonStyle = getPolygonRangFromStyle(canvas_pol);
	polygonStyle.weight = polygonStyle.borderWidth;//lineWidth;
	polygonStyle.fillColor = polygonStyle.color;
	polygonStyle.color = polygonStyle.borderColor;
	polygonStyle.fillOpacity = polygonStyle.opacity/100; 
	polygonStyle.opacity = 1;

	var markerStyle = getMarkerRangFromStyle(defaultPunt);

	if(markerStyle.isCanvas){
		estil_do.color = markerStyle.borderColor;
		estil_do.fillColor = markerStyle.color;
		estil_do.fillOpacity = 1;
		estil_do.opacity = 1;
		estil_do.radius = markerStyle.simbolSize;
		estil_do.weight = markerStyle.borderWidth;
	}else{
		estil_do.fillColor = getColorAwesomeMarker(markerStyle.marker, markerStyle.color);
	}

	/***Parseig url en cas google drive****/
	//https://drive.google.com/file/d/FILE_ID/edit?usp=sharing
	//https://drive.google.com/uc?export=download&id=FILE_ID

	if(urlFile.indexOf("https://drive.google.com/file/d/")!=-1){
		urlFile = urlFile.replace("https://drive.google.com/file/d/", "");
		var res = urlFile.split("/");
		var fileId = res[0];
		urlFile = "https://drive.google.com/uc?export=download&id="+fileId;
	}
	else if(urlFile.indexOf("https://www.dropbox.com")!=-1){
		urlFile = urlFile.replace("https://www.dropbox.com", "https://dl.dropboxusercontent.com");		
	}

	/*** DINAMIC ***/
	if(dinamic){
		busy = false;
		var propName = "";
		var param_url = paramUrl.urlFileDin	+"tipusFile=" + tipusFile+
		"&tipusAcc="+tipusAcc+
		"&tipusCodi="+tipusCodi+
		"&tipusFont="+tipusFont+
		"&nomCampCodi="+nomCampCodi+
		"&urlFile="+encodeURIComponent(urlFile)+
		"&epsgIN="+epsgIN+
		"&dinamic="+dinamic+
		"&uploadFile="+paramUrl.uploadFile+
		"&colX="+colX+
		"&colY="+colY+
		"&uid="+Cookies.get('uid');		
		
		if ((urlFile.indexOf("socrata")>-1 || urlFile.indexOf("https")>-1) && (urlFile.indexOf("drive")==-1)
				&& (urlFile.indexOf("dropbox")==-1)) 	{
			param_url = urlFile;
		}

		if (tipusFile==".json"){
			 L.toGeoJSON.empty();
			 L.toGeoJSON.convert(urlFile,"Point",colX,colY, colXY, separador).then(function(){
				 
				  
				  var dataSocrata={
							serverName: nomCapa,
							jsonSocrata: JSON.stringify(L.toGeoJSON.geoJsonData)
					};
					
				//console.debug(dataSocrata);
				crearFitxerSocrata(dataSocrata).then(function(results){
					if (results.status="OK"){
						param_url =results.filePath;
						$('#dialog_dades_ex').modal('hide');
						jQuery("#div_uploading_txt").html("");
						jQuery("#div_uploading_txt").html('<div id="div_upload_step1" class="status_current" lang="ca"> '+
								window.lang.translate('Carregant dades')+
						'<span class="one">.</span><span class="two">.</span><span class="three">.</span></div>');		
						jQuery('#info_uploadFile').show();


					   if (param_url.indexOf("/opt/")>-1 || param_url.indexOf("\\temp\\")>-1 ){
						    if (param_url.indexOf("\\temp\\")>-1)  urlFile=HOST_APP3+"/jsonfiles/"+param_url.substring(param_url.lastIndexOf("\\")+1,param_url.length);
						    else  urlFile=HOST_APP3+"/jsonfiles/"+param_url.substring(param_url.lastIndexOf("/")+1,param_url.length);
							param_url = paramUrl.urlFileDin	+"tipusFile=" + ".geojson"+
							"&tipusAcc="+tipusAcc+
							"&tipusCodi="+tipusCodi+
							"&tipusFont="+tipusFont+
							"&nomCampCodi="+nomCampCodi+
							"&urlFile="+encodeURIComponent(urlFile)+
							"&epsgIN="+epsgIN+
							"&dinamic="+dinamic+
							"&uploadFile="+paramUrl.uploadFile+
							"&colX="+colX+
							"&colY="+colY+
							//"&colXY="+colXY+
							"&uid="+Cookies.get('uid');		
						}
						
						var capaURLfile = new L.GeoJSON.AJAX(param_url, {
							nom : nomCapa,
							tipus : t_url_file,
							estil_do: estil_do,
							style: estil_lin_pol,//Estil de poligons i linies
							pointToLayer : function(feature, latlng) {
								var geom = L.circleMarker(latlng, estil_do);
								var pp = feature.properties;
								var html ='<div class="div_popup_visor"><div class="popup_pres">';
								propName = "";
								$.each( pp, function( key, value ) {
									propName = propName+key+",";
									if(isValidValue(value) && !validateWkt(value)){
										if ( key != 'businessId' && key != 'slotd50'){
											var txt = value;
												html+='<div class="popup_data_row">';
												if (!$.isNumeric(txt)) {		    				
													txt = parseUrlTextPopUp(value,key);
													if (typeof txt == 'string' || txt instanceof String) {
														if(txt.indexOf("iframe")==-1 && txt.indexOf("img")==-1){
															html+='<div class="popup_data_key">'+key+'</div>';
															html+='<div class="popup_data_value">'+txt+'</div>';
														}else{
															html+='<div class="popup_data_img_iframe">'+txt+'</div>';
														}
													}
													else{
														var txtVal=txt;
														try{
															txtVal = JSON.stringify(txt);
														}catch(e){
															
														}																	
														html+='<div class="popup_data_key">'+key+'</div>';
														html+='<div class="popup_data_value">'+txtVal+'</div>';
													}
												}
												else if (!(txt instanceof Object)){
													html+='<div class="popup_data_key">'+key+'</div>';
													html+='<div class="popup_data_value">'+txt+'</div>';
												}
												html+= '</div>';
											
										}
									}
								});	
								propName = propName.substr(0, propName.length-1);
								html+='</div></div>'; 
								feature.properties.capaNom=nomCapa;
								feature.properties.popupData=html;
								geom.on('click', function(e) {
									PopupManager().createMergedDataPopup(feature, e, controlCapes);
								});
								

								return geom;
							},
							onEachFeature : function(feature, latlng) {
								var pp = feature.properties;
								var html ='<div class="div_popup_visor"><div class="popup_pres">';
								propName = "";
								$.each( pp, function( key, value ) {
									propName = propName+key+",";
									if(isValidValue(value) && !validateWkt(value)){
										if ( key != 'businessId' && key != 'slotd50'){
											
											var txt = value;
												html+='<div class="popup_data_row">';
												if (!$.isNumeric(txt)) {		    				
													txt = parseUrlTextPopUp(value,key);
													if (typeof txt == 'string' || txt instanceof String) {
														if(txt.indexOf("iframe")==-1 && txt.indexOf("img")==-1){
															html+='<div class="popup_data_key">'+key+'</div>';
															html+='<div class="popup_data_value">'+txt+'</div>';
														}else{
															html+='<div class="popup_data_img_iframe">'+txt+'</div>';
														}
													}
													else{
														var txtVal=txt;
														try{
															txtVal = JSON.stringify(txt);
														}catch(e){
															
														}																	
														html+='<div class="popup_data_key">'+key+'</div>';
														html+='<div class="popup_data_value">'+txtVal+'</div>';
													}
												}
												else if (!(txt instanceof Object)){
													html+='<div class="popup_data_key">'+key+'</div>';
													html+='<div class="popup_data_value">'+txt+'</div>';
												}
												html+= '</div>';
											
										}
									}
								});	
								propName = propName.substr(0, propName.length-1);
								html+='</div></div>'; 
								//latlng.feature.properties.capaNom = nomCapa;
								//latlng.feature.properties.popupData=html;
								latlng.properties={
									capaNom: nomCapa,
									popupData:html,
									feature: latlng.feature,
									data: latlng.feature.properties
								};
								var tipus = feature.geometry.type; 
								if (tipus != 'Point'){
										latlng.on('click', function(e) {
										PopupManager().createMergedDataPopup(latlng, e, controlCapes);
									});
								}
								return latlng;
							},			  
							middleware:function(data){
								if(data.status && data.status.indexOf("ERROR")!=-1){
									processFileError(data, urlFile);
									jQuery('#info_uploadFile').hide();
								}else{
									var stringData = JSON.stringify(data);
									var geometryType = defineGeometryType(stringData);

									if(geometryType.indexOf("point")!=-1){
										capaURLfile.options.style = estil_do;
									}else if(geometryType.indexOf("line")!=-1){
										capaURLfile.options.style = lineStyle;
									}else if(geometryType.indexOf("polygon")!=-1){
										capaURLfile.options.style = polygonStyle;
									}
									try{
										capaURLfile.addData(data);
									}catch(err){
										console.debug(err);
									}
									
									var llista_options = '{"tipusFile":"'+tipusFile+
									'","nom":"'+nomCapa+
									'","propName":"'+propName+
									'","url":"'+urlFile+
									'","tipus":"'+t_url_file+
									'","epsgIN":"'+epsgIN+
									'", "geometryType":"'+geometryType+
									'","colX":"'+colX+
									'","colY":"'+colY+
									'", "dinamic":"'+dinamic+
									'", "tipusAcc":"'+tipusAcc+
									'", "tipusCodi":"'+tipusCodi+
									'", "tipusFont":"'+tipusFont+
									'", "nomCampCodi":"'+nomCampCodi+
									'", "style":'+JSON.stringify(capaURLfile.options.style)+
									',"estil_do":{"radius":"'+estil_do.radius+'","fillColor":"'+estil_do.fillColor+'","color":"'+estil_do.color+'","weight":"'+estil_do.weight+'","opacity":"'+estil_do.opacity+'","fillOpacity":"'+estil_do.fillOpacity+'","isCanvas":"'+estil_do.isCanvas+'"}}';

									//Un cop tinc la capa a client, la creo a servidor
									var data = {
										uid:Cookies.get('uid'),
										mapBusinessId: url('?businessid'),
										serverName: nomCapa,//+' '+ (parseInt(controlCapes._lastZIndex) + 1),
										serverType: t_url_file,
										calentas: false,
										activas: true,
										visibilitats: true,
										order: controlCapes._lastZIndex+1,
										epsg: '4326',
										imgFormat: 'image/png',
										infFormat: 'text/html',
										tiles: true,	            
										transparency: true,
										opacity: 1,
										visibilitat: 'O',
										url: urlFile,//Provar jQuery("#txt_URLJSON")
										calentas: false,
										activas: true,
										visibilitats: true,
										options: llista_options
									};
									
									createServidorInMap(data).then(function(results){
										jQuery('#info_uploadFile').hide();
										if (results.status == "OK"){
											$.publish('analyticsEvent',{event:['mapa', tipus_user+'dades externes dinamiques', urlFile, 1]});

											jQuery('#dialog_dades_ex').modal('hide');					

											capaURLfile.options.businessId = results.results.businessId;
											capaURLfile.options.nom = nomCapa;
											capaURLfile.options.tipus = t_url_file;
											capaURLfile.options.url = urlFile;
											capaURLfile.options.epsgIN = epsgIN;
											capaURLfile.options.tipusFile = tipusFile;
											capaURLfile.options.options = jQuery.parseJSON('{"tipusFile":"'+tipusFile+'"}');
											capaURLfile.options.options.estil_do = estil_do;
											capaURLfile.options.geometryType = geometryType;
											capaURLfile.options.colX = colX;
											capaURLfile.options.colY = colY;
											capaURLfile.options.dinamic = dinamic;
											capaURLfile.options.propName = propName;
											capaURLfile.options.tipusAcc = tipusAcc;
											capaURLfile.options.tipusCodi = tipusCodi;
											capaURLfile.options.tipusFont = tipusFont;
											capaURLfile.options.nomCampCodi = nomCampCodi;

											capaURLfile.addTo(map);
											capaURLfile.options.zIndex = controlCapes._lastZIndex+1; 
											controlCapes.addOverlay(capaURLfile, nomCapa, true);
											controlCapes._lastZIndex++;
											var bounds = capaURLfile.getBounds();
											map.fitBounds(bounds);
											activaPanelCapes(true);	

										}else{
											console.debug("1.Error a createServidorInMap:"+results.status);
											$.publish('analyticsEvent',{event:['mapa', tipus_user+'dades externes dinamiques error createServidorInMap1', urlFile, 1]});
											var txt_error = window.lang.translate("Error durant la càrrega de dades. Torni a intentar-ho");
											jQuery("#div_url_file_message").html(txt_error);							
										}
									},function(results){
										console.debug("2.Error a createServidorInMap:"+results.status);
										$.publish('analyticsEvent',{event:['mapa', tipus_user+'dades externes dinamiques error createServidorInMap2', urlFile, 1]});
										var txt_error = window.lang.translate("Error durant la càrrega de dades. Torni a intentar-ho");
										jQuery("#div_url_file_message").html(txt_error);
										jQuery('#info_uploadFile').hide();

									});
								}
							}
						});	
					}
					
				});
			 });
			
			//console.debug(L.toGeoJSON.geoJsonData);
		}
		else{
		
		$('#dialog_dades_ex').modal('hide');
		jQuery("#div_uploading_txt").html("");
		jQuery("#div_uploading_txt").html('<div id="div_upload_step1" class="status_current" lang="ca"> '+
				window.lang.translate('Carregant dades')+
		'<span class="one">.</span><span class="two">.</span><span class="three">.</span></div>');		
		jQuery('#info_uploadFile').show();


	   if (param_url.indexOf("/opt/")>-1 || param_url.indexOf("\\temp\\")>-1 ){
		    if (param_url.indexOf("\\temp\\")>-1)  urlFile=HOST_APP3+"/jsonfiles/"+param_url.substring(param_url.lastIndexOf("\\")+1,param_url.length);
		    else  urlFile=HOST_APP3+"/jsonfiles/"+param_url.substring(param_url.lastIndexOf("/")+1,param_url.length);
			param_url = paramUrl.urlFileDin	+"tipusFile=" + ".geojson"+
			"&tipusAcc="+tipusAcc+
			"&tipusCodi="+tipusCodi+
			"&tipusFont="+tipusFont+
			"&nomCampCodi="+nomCampCodi+
			"&urlFile="+encodeURIComponent(urlFile)+
			"&epsgIN="+epsgIN+
			"&dinamic="+dinamic+
			"&uploadFile="+paramUrl.uploadFile+
			"&colX="+colX+
			"&colY="+colY+
			//"&colXY="+colXY+
			"&uid="+Cookies.get('uid');		
		}
		
		var capaURLfile = new L.GeoJSON.AJAX(param_url, {
			nom : nomCapa,
			tipus : t_url_file,
			estil_do: estil_do,
			style: estil_lin_pol,//Estil de poligons i linies
			pointToLayer : function(feature, latlng) {
				var geom = L.circleMarker(latlng, estil_do);
				var pp = feature.properties;
				var html ='<div class="div_popup_visor"><div class="popup_pres">';
				propName = "";
				$.each( pp, function( key, value ) {
					propName = propName+key+",";
					if(isValidValue(value) && !validateWkt(value)){
						if ( key != 'businessId' && key != 'slotd50'){
							html+='<div class="popup_data_row">';
							var txt = value;
							if (!$.isNumeric(txt)) {		    				
								txt = parseUrlTextPopUp(value,key);
								if (typeof txt == 'string' || txt instanceof String) {
									if(txt.indexOf("iframe")==-1 && txt.indexOf("img")==-1){
										html+='<div class="popup_data_key">'+key+'</div>';
										html+='<div class="popup_data_value">'+txt+'</div>';
									}else{
										html+='<div class="popup_data_img_iframe">'+txt+'</div>';
									}
								}
								else{
									var txtVal=txt;
									try{
										txtVal = JSON.stringify(txt);
									}catch(e){
										
									}																	
									html+='<div class="popup_data_key">'+key+'</div>';
									html+='<div class="popup_data_value">'+txtVal+'</div>';
								}
							}
							else {
								html+='<div class="popup_data_key">'+key+'</div>';
								html+='<div class="popup_data_value">'+txt+'</div>';
							}
							html+= '</div>';
						}
					}
				});	
				propName = propName.substr(0, propName.length-1);
				html+='</div></div>'; 
				feature.properties.capaNom=nomCapa;
				feature.properties.popupData=html;
				geom.on('click', function(e) {
					PopupManager().createMergedDataPopup(feature, e, controlCapes);
				});
				

				return geom;
			},
			onEachFeature : function(feature, latlng) {
				var pp = feature.properties;
				var html ='<div class="div_popup_visor"><div class="popup_pres">';
				propName = "";
				$.each( pp, function( key, value ) {
					propName = propName+key+",";
					if(isValidValue(value) && !validateWkt(value)){
						if ( key != 'businessId' && key != 'slotd50'){
							html+='<div class="popup_data_row">';
							var txt = value;
							if (!$.isNumeric(txt)) {		    				
								txt = parseUrlTextPopUp(value,key);
								if(txt.indexOf("iframe")==-1 && txt.indexOf("img")==-1){
									html+='<div class="popup_data_key">'+key+'</div>';
									html+='<div class="popup_data_value">'+txt+'</div>';
								}else{
									html+='<div class="popup_data_img_iframe">'+txt+'</div>';
								}
							}
							else {
								html+='<div class="popup_data_key">'+key+'</div>';
								html+='<div class="popup_data_value">'+txt+'</div>';
							}
							html+= '</div>';
						}
					}
				});	
				propName = propName.substr(0, propName.length-1);
				html+='</div></div>'; 
				//latlng.feature.properties.capaNom = nomCapa;
				//latlng.feature.properties.popupData=html;
				latlng.properties={
					capaNom: nomCapa,
					popupData:html,
					feature: latlng.feature,
					data: latlng.feature.properties
				};
				var tipus=feature.geometry.type;
				if (tipus != 'Point'){
					latlng.on('click', function(e) {
					PopupManager().createMergedDataPopup(latlng, e, controlCapes);
					});
				}
				return latlng;
			},			  
			middleware:function(data){
				if(data.status && data.status.indexOf("ERROR")!=-1){
					processFileError(data, urlFile);
					jQuery('#info_uploadFile').hide();
				}else{
					var stringData = JSON.stringify(data);
					var geometryType = defineGeometryType(stringData);

					if(geometryType.indexOf("point")!=-1){
						capaURLfile.options.style = estil_do;
					}else if(geometryType.indexOf("line")!=-1){
						capaURLfile.options.style = lineStyle;
					}else if(geometryType.indexOf("polygon")!=-1){
						capaURLfile.options.style = polygonStyle;
					}
					try{
						capaURLfile.addData(data);
					}catch(err){
						console.debug(err);
					}
					
					var llista_options = '{"tipusFile":"'+tipusFile+
					'","nom":"'+nomCapa+
					'","propName":"'+propName+
					'","url":"'+urlFile+
					'","tipus":"'+t_url_file+
					'","epsgIN":"'+epsgIN+
					'", "geometryType":"'+geometryType+
					'","colX":"'+colX+
					'","colY":"'+colY+
					'", "dinamic":"'+dinamic+
					'", "tipusAcc":"'+tipusAcc+
					'", "tipusCodi":"'+tipusCodi+
					'", "tipusFont":"'+tipusFont+
					'", "nomCampCodi":"'+nomCampCodi+
					'", "style":'+JSON.stringify(capaURLfile.options.style)+
					',"estil_do":{"radius":"'+estil_do.radius+'","fillColor":"'+estil_do.fillColor+'","color":"'+estil_do.color+'","weight":"'+estil_do.weight+'","opacity":"'+estil_do.opacity+'","fillOpacity":"'+estil_do.fillOpacity+'","isCanvas":"'+estil_do.isCanvas+'"}}';

					//Un cop tinc la capa a client, la creo a servidor
					var data = {
						uid:Cookies.get('uid'),
						mapBusinessId: url('?businessid'),
						serverName: nomCapa,//+' '+ (parseInt(controlCapes._lastZIndex) + 1),
						serverType: t_url_file,
						calentas: false,
						activas: true,
						visibilitats: true,
						order: controlCapes._lastZIndex+1,
						epsg: '4326',
						imgFormat: 'image/png',
						infFormat: 'text/html',
						tiles: true,	            
						transparency: true,
						opacity: 1,
						visibilitat: 'O',
						url: urlFile,//Provar jQuery("#txt_URLJSON")
						calentas: false,
						activas: true,
						visibilitats: true,
						options: llista_options
					};
					
					createServidorInMap(data).then(function(results){
						jQuery('#info_uploadFile').hide();
						if (results.status == "OK"){
							$.publish('analyticsEvent',{event:['mapa', tipus_user+'dades externes dinamiques', urlFile, 1]});

							jQuery('#dialog_dades_ex').modal('hide');					

							capaURLfile.options.businessId = results.results.businessId;
							capaURLfile.options.nom = nomCapa;
							capaURLfile.options.tipus = t_url_file;
							capaURLfile.options.url = urlFile;
							capaURLfile.options.epsgIN = epsgIN;
							capaURLfile.options.tipusFile = tipusFile;
							capaURLfile.options.options = jQuery.parseJSON('{"tipusFile":"'+tipusFile+'"}');
							capaURLfile.options.options.estil_do = estil_do;
							capaURLfile.options.geometryType = geometryType;
							capaURLfile.options.colX = colX;
							capaURLfile.options.colY = colY;
							capaURLfile.options.dinamic = dinamic;
							capaURLfile.options.propName = propName;
							capaURLfile.options.tipusAcc = tipusAcc;
							capaURLfile.options.tipusCodi = tipusCodi;
							capaURLfile.options.tipusFont = tipusFont;
							capaURLfile.options.nomCampCodi = nomCampCodi;

							capaURLfile.addTo(map);
							capaURLfile.options.zIndex = controlCapes._lastZIndex+1; 
							controlCapes.addOverlay(capaURLfile, nomCapa, true);
							controlCapes._lastZIndex++;
							var bounds = capaURLfile.getBounds();
							map.fitBounds(bounds);
							activaPanelCapes(true);	

						}else{
							console.debug("1.Error a createServidorInMap:"+results.status);
							$.publish('analyticsEvent',{event:['mapa', tipus_user+'dades externes dinamiques error createServidorInMap1', urlFile, 1]});
							var txt_error = window.lang.translate("Error durant la càrrega de dades. Torni a intentar-ho");
							jQuery("#div_url_file_message").html(txt_error);							
						}
					},function(results){
						console.debug("2.Error a createServidorInMap:"+results.status);
						$.publish('analyticsEvent',{event:['mapa', tipus_user+'dades externes dinamiques error createServidorInMap2', urlFile, 1]});
						var txt_error = window.lang.translate("Error durant la càrrega de dades. Torni a intentar-ho");
						jQuery("#div_url_file_message").html(txt_error);
						jQuery('#info_uploadFile').hide();

					});
				}
			}
		});		
		}
	/*** NO DINAMICA ***/		
	}else{
		var dataSocrata;
		var isJson=false;
		if (tipusFile==".json"){
			isJson=true;
			L.toGeoJSON.empty();
			L.toGeoJSON.convert(urlFile,"Point",colX,colY, colXY, separador).then(function(){
				 dataSocrata={
							serverName: nomCapa,
							jsonSocrata: JSON.stringify(L.toGeoJSON.geoJsonData)
					};
				 
				 crearFitxerSocrata(dataSocrata).then(function(results){
						if (results.status="OK"){
							urlFile =results.filePath;
							var midaFitxer = results.midaFitxer;
							var tmpFilePath = results.tmpFilePath;
							var tmpFileName = results.tmpFileName;
							
							var data2 = {
									uid: Cookies.get('uid'),
									mapBusinessId: url('?businessid'),
									serverName:nomCapa,
									path:urlFile,
									tmpFilePath:tmpFilePath,
									midaFitxer:midaFitxer,
									sourceExtension:'geojson',
									markerStyle: JSON.stringify(getMarkerRangFromStyle(defaultPunt)),
									lineStyle: JSON.stringify(getLineRangFromStyle(canvas_linia)),
									polygonStyle: JSON.stringify(getPolygonRangFromStyle(canvas_pol))
								};
															
							
							
								$('#dialog_dades_ex').modal('hide');

								jQuery("#div_uploading_txt").html("");
								jQuery("#div_uploading_txt").html(
									'<div id="div_upload_step1" class="status_current" lang="ca">1. '+window.lang.translate('Descarregant fitxer')+'<span class="one">.</span><span class="two">.</span><span class="three">.</span></div>'+
									'<div id="div_upload_step2" class="status_uncheck" lang="ca">2. '+window.lang.translate('Analitzant fitxer')+'</div>'+
									'<div id="div_upload_step3" class="status_uncheck" lang="ca">3. '+window.lang.translate('Creant geometries')+'</div>'+
									'<div id="div_upload_step4" class="status_uncheck" lang="ca">4. '+window.lang.translate('Processant la resposta')+'</div>'//+	
								);				
								jQuery('#info_uploadFile').show();			
								jQuery('#info_uploadFile').show();		

								var pollTime = 2000;

								//Fem polling
								(function(){							
									poll = function(){
										$.ajax({
											url: paramUrl.polling +"pollingFileName="+ tmpFileName,
											dataType: 'json',
											type: 'get',
											success: function(data){
												if(data.status.indexOf("PAS2")!=-1){
													jQuery("#div_uploading_txt").html("");
													jQuery("#div_uploading_txt").html(
														'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.translate('Fitxer descarregat')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></span></div>'+
														'<div id="div_upload_step2" class="status_current" lang="ca">2. '+window.lang.translate('Analitzant fitxer')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
														'<div id="div_upload_step3" class="status_uncheck" lang="ca">3. '+window.lang.translate('Creant geometries')+'</div>'+
														'<div id="div_upload_step4" class="status_uncheck" lang="ca">4. '+window.lang.translate('Processant la resposta')+'</div>'//+	
													);									
												}else if(data.status.indexOf("PAS3")!=-1){
													jQuery("#div_uploading_txt").html("");
													jQuery("#div_uploading_txt").html(
														'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.translate('Fitxer descarregat')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></span></div>'+
														'<div id="div_upload_step2" class="status_check" lang="ca">2. '+window.lang.translate('Fitxer analitzat')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
														'<div id="div_upload_step3" class="status_current" lang="ca">3. '+window.lang.translate('Creant geometries')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
														'<div id="div_upload_step4" class="status_uncheck" lang="ca">4. '+window.lang.translate('Processant la resposta')+'</div>'//+	
													);									
												}else if(data.status.indexOf("OK")!=-1){
													clearInterval(pollInterval);
													jQuery("#div_uploading_txt").html("");
													jQuery("#div_uploading_txt").html(
														'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.translate('Fitxer descarregat')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></span></div>'+
														'<div id="div_upload_step2" class="status_check" lang="ca">2. '+window.lang.translate('Fitxer analitzat')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
														'<div id="div_upload_step3" class="status_check" lang="ca">3. '+window.lang.translate('Geometries creades')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
														'<div id="div_upload_step4" class="status_current" lang="ca">4. '+window.lang.translate('Processant la resposta')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'//+	
													);									
													//$.get(HOST_APP+tmpdirPolling +codiUnic + url('?businessid')+"_response.json", function(data) { 
													//if(data.status.indexOf("OK")!=-1){											
													//addDropFileToMap(data);
														//		}								
													//});
													$.publish('analyticsEvent',{event:['mapa', tipus_user+'dades externes', urlFile, 1]});
												}else if(data.status.indexOf("ERROR")!=-1){
													console.error("Error al carregar fitxer:");
													console.error(data);
													busy = false;

													clearInterval(pollInterval);
													jQuery('#info_uploadFile').hide();

													$('#dialog_error_upload_txt').html("");

													if(data.codi){

														$.publish('analyticsEvent',{event:['mapa', tipus_user+'dades externes error '+data.codi, urlFile, 1]});

														if(data.codi.indexOf("01")!=-1){//cas 01: Exception durant el tractament del fitxer
															var msg = "[01]: " + window.lang.translate("Ha ocorregut un error inesperat durant la càrrega del fitxer.");
															$('#dialog_error_upload_txt').html(msg);

														}else if(data.codi.indexOf("02")!=-1){//cas 02: Error durant les conversions de format del fitxer
															var msg = "[02]: " + window.lang.translate("Error durant el procés de conversió de format del fitxer. Comprovi que el fitxer és correcte.");
															$('#dialog_error_upload_txt').html(msg);

														}else if(data.codi.indexOf("03")!=-1){//cas 03: OGRInfo ha donat resposta fallida
															var msg = "[03]: " + window.lang.translate("Error durant l'anàlisi de la informació del fitxer. Comprovi que el fitxer és correcte.");
															$('#dialog_error_upload_txt').html(msg);

														}else if(data.codi.indexOf("04")!=-1){//cas 04: OGRInfo ha donat una excepció
															var msg = "[04]: " + window.lang.translate("Ha ocorregut un error inesperat durant l'anàlisi de la informació del fitxer.");
															$('#dialog_error_upload_txt').html(msg);

														}else if(data.codi.indexOf("05")!=-1){//cas 05: OGRInfo ha tornat resposta buida
															var msg = "[05]: " + window.lang.translate("L'anàlisi de la informació del fitxer no ha tornat resultats. Comprovi el fitxer i torni a intentar-ho.");
															$('#dialog_error_upload_txt').html(msg);

														}else if(data.codi.indexOf("06")!=-1){//cas 06: Accedeix a fileDefault_Error, no li ha arribat be el nom del fitxer
															var msg = "[06]: " + window.lang.translate("Problema de comunicació amb el servidor. Si us plau, torni a intentar-ho.");
															$('#dialog_error_upload_txt').html(msg);

														}else if(data.codi.indexOf("07")!=-1){//cas 07: EnviaFileReady a myUtils.jsp ha donat una excepcio
															var msg = "[07]: " + window.lang.translate("Ha ocorregut un error inesperat durant la comunicació amb el servidor. Si us plau, torni a intentar-ho.");
															$('#dialog_error_upload_txt').html(msg);

														}else if(data.codi.indexOf("08")!=-1){//cas 08: Mida de fitxer supera els 50MB permesos per dades externes dinamiques
															var msg = "[08]: " + window.lang.translate("La mida del fitxer supera el límit preestablert per a dades externes no dinàmiques (50MB).");
															$('#dialog_error_upload_txt').html(msg);
														}

													}else{
														$.publish('analyticsEvent',{event:['mapa', tipus_user+'dades externes error sense codi', urlFile, 1]});
														$('#dialog_error_upload_txt').html(window.lang.translate("Error en la càrrega de l'arxiu"));
													}

													$('#dialog_error_upload').modal('show');
												}
											}
										});
									};

									pollInterval = setInterval(function(){
										poll();
									},pollTime);

								})();		

								doUploadFile(data2).then(function(results){
									addDropFileToMap(results);
								});
						}
						
					});
			});
		}
		else{
		//console.debug("getUrlFile PROVES NO DINAMICA");
		var codiUnic = getCodiUnic();
		if (((urlFile.indexOf("socrata")>-1 && (urlFile.indexOf("method=export&format=GeoJSON")>-1 || 
			  urlFile.indexOf("https")>-1))  && urlFile.indexOf("drive")==-1  && urlFile.indexOf("dropbox")==-1) || isJson) 	{
			
			if (isJson==false){
				var response = $.ajax({ type: "GET",   
		            url: urlFile,   
		            async: false
		          }).responseText;
				
				
				 dataSocrata={
						serverName: nomCapa,
						jsonSocrata: response
				};
			}
			
			crearFitxerSocrata(dataSocrata).then(function(results){
				if (results.status="OK"){
					urlFile =results.filePath;
					var midaFitxer = results.midaFitxer;
					var tmpFilePath = results.tmpFilePath;
					var tmpFileName = results.tmpFileName;
					
					var data2 = {
							uid: Cookies.get('uid'),
							mapBusinessId: url('?businessid'),
							serverName:nomCapa,
							path:urlFile,
							tmpFilePath:tmpFilePath,
							midaFitxer:midaFitxer,
							sourceExtension:'geojson',
							markerStyle: JSON.stringify(getMarkerRangFromStyle(defaultPunt)),
							lineStyle: JSON.stringify(getLineRangFromStyle(canvas_linia)),
							polygonStyle: JSON.stringify(getPolygonRangFromStyle(canvas_pol))
						};
													
					
					
						$('#dialog_dades_ex').modal('hide');

						jQuery("#div_uploading_txt").html("");
						jQuery("#div_uploading_txt").html(
							'<div id="div_upload_step1" class="status_current" lang="ca">1. '+window.lang.translate('Descarregant fitxer')+'<span class="one">.</span><span class="two">.</span><span class="three">.</span></div>'+
							'<div id="div_upload_step2" class="status_uncheck" lang="ca">2. '+window.lang.translate('Analitzant fitxer')+'</div>'+
							'<div id="div_upload_step3" class="status_uncheck" lang="ca">3. '+window.lang.translate('Creant geometries')+'</div>'+
							'<div id="div_upload_step4" class="status_uncheck" lang="ca">4. '+window.lang.translate('Processant la resposta')+'</div>'//+	
						);				
						jQuery('#info_uploadFile').show();			
						jQuery('#info_uploadFile').show();		

						var pollTime = 2000;

						//Fem polling
						(function(){							
							poll = function(){
								$.ajax({
									url: paramUrl.polling +"pollingFileName="+ tmpFileName,
									dataType: 'json',
									type: 'get',
									success: function(data){
										if(data.status.indexOf("PAS2")!=-1){
											jQuery("#div_uploading_txt").html("");
											jQuery("#div_uploading_txt").html(
												'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.translate('Fitxer descarregat')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></span></div>'+
												'<div id="div_upload_step2" class="status_current" lang="ca">2. '+window.lang.translate('Analitzant fitxer')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
												'<div id="div_upload_step3" class="status_uncheck" lang="ca">3. '+window.lang.translate('Creant geometries')+'</div>'+
												'<div id="div_upload_step4" class="status_uncheck" lang="ca">4. '+window.lang.translate('Processant la resposta')+'</div>'//+	
											);									
										}else if(data.status.indexOf("PAS3")!=-1){
											jQuery("#div_uploading_txt").html("");
											jQuery("#div_uploading_txt").html(
												'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.translate('Fitxer descarregat')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></span></div>'+
												'<div id="div_upload_step2" class="status_check" lang="ca">2. '+window.lang.translate('Fitxer analitzat')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
												'<div id="div_upload_step3" class="status_current" lang="ca">3. '+window.lang.translate('Creant geometries')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
												'<div id="div_upload_step4" class="status_uncheck" lang="ca">4. '+window.lang.translate('Processant la resposta')+'</div>'//+	
											);									
										}else if(data.status.indexOf("OK")!=-1){
											clearInterval(pollInterval);
											jQuery("#div_uploading_txt").html("");
											jQuery("#div_uploading_txt").html(
												'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.translate('Fitxer descarregat')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></span></div>'+
												'<div id="div_upload_step2" class="status_check" lang="ca">2. '+window.lang.translate('Fitxer analitzat')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
												'<div id="div_upload_step3" class="status_check" lang="ca">3. '+window.lang.translate('Geometries creades')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
												'<div id="div_upload_step4" class="status_current" lang="ca">4. '+window.lang.translate('Processant la resposta')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'//+	
											);									
											//$.get(HOST_APP+tmpdirPolling +codiUnic + url('?businessid')+"_response.json", function(data) { 
											//if(data.status.indexOf("OK")!=-1){											
											//addDropFileToMap(data);
												//		}								
											//});
											$.publish('analyticsEvent',{event:['mapa', tipus_user+'dades externes', urlFile, 1]});
										}else if(data.status.indexOf("ERROR")!=-1){
											console.error("Error al carregar fitxer:");
											console.error(data);
											busy = false;

											clearInterval(pollInterval);
											jQuery('#info_uploadFile').hide();

											$('#dialog_error_upload_txt').html("");

											if(data.codi){

												$.publish('analyticsEvent',{event:['mapa', tipus_user+'dades externes error '+data.codi, urlFile, 1]});

												if(data.codi.indexOf("01")!=-1){//cas 01: Exception durant el tractament del fitxer
													var msg = "[01]: " + window.lang.translate("Ha ocorregut un error inesperat durant la càrrega del fitxer.");
													$('#dialog_error_upload_txt').html(msg);

												}else if(data.codi.indexOf("02")!=-1){//cas 02: Error durant les conversions de format del fitxer
													var msg = "[02]: " + window.lang.translate("Error durant el procés de conversió de format del fitxer. Comprovi que el fitxer és correcte.");
													$('#dialog_error_upload_txt').html(msg);

												}else if(data.codi.indexOf("03")!=-1){//cas 03: OGRInfo ha donat resposta fallida
													var msg = "[03]: " + window.lang.translate("Error durant l'anàlisi de la informació del fitxer. Comprovi que el fitxer és correcte.");
													$('#dialog_error_upload_txt').html(msg);

												}else if(data.codi.indexOf("04")!=-1){//cas 04: OGRInfo ha donat una excepció
													var msg = "[04]: " + window.lang.translate("Ha ocorregut un error inesperat durant l'anàlisi de la informació del fitxer.");
													$('#dialog_error_upload_txt').html(msg);

												}else if(data.codi.indexOf("05")!=-1){//cas 05: OGRInfo ha tornat resposta buida
													var msg = "[05]: " + window.lang.translate("L'anàlisi de la informació del fitxer no ha tornat resultats. Comprovi el fitxer i torni a intentar-ho.");
													$('#dialog_error_upload_txt').html(msg);

												}else if(data.codi.indexOf("06")!=-1){//cas 06: Accedeix a fileDefault_Error, no li ha arribat be el nom del fitxer
													var msg = "[06]: " + window.lang.translate("Problema de comunicació amb el servidor. Si us plau, torni a intentar-ho.");
													$('#dialog_error_upload_txt').html(msg);

												}else if(data.codi.indexOf("07")!=-1){//cas 07: EnviaFileReady a myUtils.jsp ha donat una excepcio
													var msg = "[07]: " + window.lang.translate("Ha ocorregut un error inesperat durant la comunicació amb el servidor. Si us plau, torni a intentar-ho.");
													$('#dialog_error_upload_txt').html(msg);

												}else if(data.codi.indexOf("08")!=-1){//cas 08: Mida de fitxer supera els 50MB permesos per dades externes dinamiques
													var msg = "[08]: " + window.lang.translate("La mida del fitxer supera el límit preestablert per a dades externes no dinàmiques (50MB).");
													$('#dialog_error_upload_txt').html(msg);
												}

											}else{
												$.publish('analyticsEvent',{event:['mapa', tipus_user+'dades externes error sense codi', urlFile, 1]});
												$('#dialog_error_upload_txt').html(window.lang.translate("Error en la càrrega de l'arxiu"));
											}

											$('#dialog_error_upload').modal('show');
										}
									}
								});
							};

							pollInterval = setInterval(function(){
								poll();
							},pollTime);

						})();		

						doUploadFile(data2).then(function(results){
							addDropFileToMap(results);
						});
				}
				
			});
		}
		else {
			var data = {
					mapBusinessId: url('?businessid'),
					serverName: nomCapa,
					tipusFile: tipusFile,
					urlFile: urlFile,
					epsgIN: epsgIN,
					dinamic: dinamic,
					uploadFile: paramUrl.uploadFile,
					uid: Cookies.get('uid'),
					colX: colX,
					colY: colY,
					tipusAcc: tipusAcc,
					tipusFont: tipusFont,
					tipusCodi: tipusCodi,
					nomCampCodi: nomCampCodi,
					codiUnic: codiUnic,
					markerStyle: JSON.stringify(getMarkerRangFromStyle(defaultPunt)),
					lineStyle: JSON.stringify(getLineRangFromStyle(canvas_linia)),
					polygonStyle: JSON.stringify(getPolygonRangFromStyle(canvas_pol))
				};

						
				
				$('#dialog_dades_ex').modal('hide');

				jQuery("#div_uploading_txt").html("");
				jQuery("#div_uploading_txt").html(
					'<div id="div_upload_step1" class="status_current" lang="ca">1. '+window.lang.translate('Descarregant fitxer')+'<span class="one">.</span><span class="two">.</span><span class="three">.</span></div>'+
					'<div id="div_upload_step2" class="status_uncheck" lang="ca">2. '+window.lang.translate('Analitzant fitxer')+'</div>'+
					'<div id="div_upload_step3" class="status_uncheck" lang="ca">3. '+window.lang.translate('Creant geometries')+'</div>'+
					'<div id="div_upload_step4" class="status_uncheck" lang="ca">4. '+window.lang.translate('Processant la resposta')+'</div>'//+	
				);				
				jQuery('#info_uploadFile').show();			
				jQuery('#info_uploadFile').show();		

				var pollTime = 2000;

				//Fem polling
				(function(){							
					poll = function(){
						$.ajax({
							url: paramUrl.polling +"pollingFileName="+ codiUnic + url('?businessid')+".json",
							dataType: 'json',
							type: 'get',
							success: function(data){
								if(data.status.indexOf("PAS2")!=-1){
									jQuery("#div_uploading_txt").html("");
									jQuery("#div_uploading_txt").html(
										'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.translate('Fitxer descarregat')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></span></div>'+
										'<div id="div_upload_step2" class="status_current" lang="ca">2. '+window.lang.translate('Analitzant fitxer')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
										'<div id="div_upload_step3" class="status_uncheck" lang="ca">3. '+window.lang.translate('Creant geometries')+'</div>'+
										'<div id="div_upload_step4" class="status_uncheck" lang="ca">4. '+window.lang.translate('Processant la resposta')+'</div>'//+	
									);									
								}else if(data.status.indexOf("PAS3")!=-1){
									jQuery("#div_uploading_txt").html("");
									jQuery("#div_uploading_txt").html(
										'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.translate('Fitxer descarregat')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></span></div>'+
										'<div id="div_upload_step2" class="status_check" lang="ca">2. '+window.lang.translate('Fitxer analitzat')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
										'<div id="div_upload_step3" class="status_current" lang="ca">3. '+window.lang.translate('Creant geometries')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
										'<div id="div_upload_step4" class="status_uncheck" lang="ca">4. '+window.lang.translate('Processant la resposta')+'</div>'//+	
									);									
								}else if(data.status.indexOf("OK")!=-1){
									clearInterval(pollInterval);
									jQuery("#div_uploading_txt").html("");
									jQuery("#div_uploading_txt").html(
										'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.translate('Fitxer descarregat')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></span></div>'+
										'<div id="div_upload_step2" class="status_check" lang="ca">2. '+window.lang.translate('Fitxer analitzat')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
										'<div id="div_upload_step3" class="status_check" lang="ca">3. '+window.lang.translate('Geometries creades')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
										'<div id="div_upload_step4" class="status_current" lang="ca">4. '+window.lang.translate('Processant la resposta')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'//+	
									);									
									$.get(HOST_APP+tmpdirPolling +codiUnic + url('?businessid')+"_response.json", function(data) { 
										if(data.status.indexOf("OK")!=-1){											
											addDropFileToMap(data);
										}								
									});
									$.publish('analyticsEvent',{event:['mapa', tipus_user+'dades externes', urlFile, 1]});
								}else if(data.status.indexOf("ERROR")!=-1){
									console.error("Error al carregar fitxer:");
									console.error(data);
									busy = false;

									clearInterval(pollInterval);
									jQuery('#info_uploadFile').hide();

									$('#dialog_error_upload_txt').html("");

									if(data.codi){

										$.publish('analyticsEvent',{event:['mapa', tipus_user+'dades externes error '+data.codi, urlFile, 1]});

										if(data.codi.indexOf("01")!=-1){//cas 01: Exception durant el tractament del fitxer
											var msg = "[01]: " + window.lang.translate("Ha ocorregut un error inesperat durant la càrrega del fitxer.");
											$('#dialog_error_upload_txt').html(msg);

										}else if(data.codi.indexOf("02")!=-1){//cas 02: Error durant les conversions de format del fitxer
											var msg = "[02]: " + window.lang.translate("Error durant el procés de conversió de format del fitxer. Comprovi que el fitxer és correcte.");
											$('#dialog_error_upload_txt').html(msg);

										}else if(data.codi.indexOf("03")!=-1){//cas 03: OGRInfo ha donat resposta fallida
											var msg = "[03]: " + window.lang.translate("Error durant l'anàlisi de la informació del fitxer. Comprovi que el fitxer és correcte.");
											$('#dialog_error_upload_txt').html(msg);

										}else if(data.codi.indexOf("04")!=-1){//cas 04: OGRInfo ha donat una excepció
											var msg = "[04]: " + window.lang.translate("Ha ocorregut un error inesperat durant l'anàlisi de la informació del fitxer.");
											$('#dialog_error_upload_txt').html(msg);

										}else if(data.codi.indexOf("05")!=-1){//cas 05: OGRInfo ha tornat resposta buida
											var msg = "[05]: " + window.lang.translate("L'anàlisi de la informació del fitxer no ha tornat resultats. Comprovi el fitxer i torni a intentar-ho.");
											$('#dialog_error_upload_txt').html(msg);

										}else if(data.codi.indexOf("06")!=-1){//cas 06: Accedeix a fileDefault_Error, no li ha arribat be el nom del fitxer
											var msg = "[06]: " + window.lang.translate("Problema de comunicació amb el servidor. Si us plau, torni a intentar-ho.");
											$('#dialog_error_upload_txt').html(msg);

										}else if(data.codi.indexOf("07")!=-1){//cas 07: EnviaFileReady a myUtils.jsp ha donat una excepcio
											var msg = "[07]: " + window.lang.translate("Ha ocorregut un error inesperat durant la comunicació amb el servidor. Si us plau, torni a intentar-ho.");
											$('#dialog_error_upload_txt').html(msg);

										}else if(data.codi.indexOf("08")!=-1){//cas 08: Mida de fitxer supera els 50MB permesos per dades externes dinamiques
											var msg = "[08]: " + window.lang.translate("La mida del fitxer supera el límit preestablert per a dades externes no dinàmiques (50MB).");
											$('#dialog_error_upload_txt').html(msg);
										}

									}else{
										$.publish('analyticsEvent',{event:['mapa', tipus_user+'dades externes error sense codi', urlFile, 1]});
										$('#dialog_error_upload_txt').html(window.lang.translate("Error en la càrrega de l'arxiu"));
									}

									$('#dialog_error_upload').modal('show');
								}
							}
						});
					};

					pollInterval = setInterval(function(){
						poll();
					},pollTime);

				})();		

				getUrlFileNoDin(data);
			}
		}
		
	}
}

function processFileError(data, urlFile){

	if(data.codi){

		$.publish('analyticsEvent',{event:['mapa', tipus_user+'dades externes dinamiques error '+data.codi, urlFile, 1]});
		var txt_error="";
		if(data.codi.indexOf("01")!=-1){//cas 01: Erro al descarregar el fitxer zip (download_zip_file)
			txt_error = "[01]: " + window.lang.translate("Ha ocorregut un error inesperat durant la descàrrega del fitxer.");

		}else if(data.codi.indexOf("02")!=-1){//cas 02: EnviaFileReadyCodiDin a myUtils.jsp ha donat una excepcio
			txt_error = "[02]: " + window.lang.translate("Ha ocorregut un error inesperat durant la comunicació amb el servidor. Si us plau, torni a intentar-ho.");

		}else if(data.codi.indexOf("03")!=-1){//cas 03: Error de conversio del fitxer
			txt_error = "[03]: " + window.lang.translate("Error durant el procés de conversió de format del fitxer. Comprovi que el fitxer és correcte.");
//			$('#dialog_error_upload_txt').html(msg);

		}else if(data.codi.indexOf("04")!=-1){//cas 04: OGRInfo ha donat una excepció
			txt_error = "[04]: " + window.lang.translate("Ha ocorregut un error inesperat durant l'anàlisi de la informació del fitxer.");
//			$('#dialog_error_upload_txt').html(msg);

		}else if(data.codi.indexOf("05")!=-1){//cas 05: OGRInfo ha tornat resposta buida
			txt_error = "[05]: " + window.lang.translate("L'anàlisi de la informació del fitxer no ha tornat resultats. Comprovi el fitxer i torni a intentar-ho.");
//			$('#dialog_error_upload_txt').html(msg);

		}else if(data.codi.indexOf("06")!=-1){//cas 06: OGRInfo ha donat resposta fallida
			txt_error = "[06]: " + window.lang.translate("Error durant l'anàlisi de la informació del fitxer. Comprovi que el fitxer és correcte.");
//			$('#dialog_error_upload_txt').html(msg);

		}else if(data.codi.indexOf("07")!=-1){//cas 07: Num maxim de punts excedit
			txt_error = "[07]: " + window.lang.translate("El número de punts supera el màxim permès. Redueixi a 10000 o menys i torni a intentar-ho");
//			$('#dialog_error_upload_txt').html(msg);

		}else if(data.codi.indexOf("08")!=-1){//cas 08: Num maxim de linies/poligons exedit
			txt_error = "[08]: " + window.lang.translate("El número total de geometries supera el màxim permès. Redueixi a 6000 o menys i torni a intentar-ho.");
//			$('#dialog_error_upload_txt').html(msg);

		}else if(data.codi.indexOf("09")!=-1){//cas 09: Mida de fitxer supera els 25MB permesos per dades externes dinamiques
			txt_error = "[09]: " + window.lang.translate("La mida del fitxer supera el límit preestablert per a dades externes dinàmiques (25MB).");
//			$('#dialog_error_upload_txt').html(msg);
		}			

	}else{
		if(data.results && (data.results.indexOf("EXCEPTION1")  != -1))
			txt_error = window.lang.translate("No s'ha trobat el fitxer: ") + "<a href=\"" + urlFile + "\" target=_blank>" + urlFile + "</a>";
		else
			txt_error = window.lang.translate("Error durant el tractament de les dades");
	}

	/*
	if(data.results.indexOf("CONVERT ERROR")!= -1){
		var txt_error = window.lang.translate("Error de conversió: format o EPSG incorrectes");
	}else if(data.results.indexOf("501")!= -1){//+ de 5000 punts
		txt_error += ": "+window.lang.translate("El número de punts supera el màxim permès. Redueixi a 10000 o menys i torni a intentar-ho");
	}else if(data.results.indexOf("502")!= -1){//+ de 1000 features
		txt_error += ": "+window.lang.translate("El número de línies/polígons supera el màxim permès. Redueixi a 2000 o menys i torni a intentar-ho");
	}else if(data.results.indexOf("503")!= -1){//+ de 6000 geometries
		txt_error += ": "+window.lang.translate("El número total de geometries supera el màxim permès. Redueixi a 6000 o menys i torni a intentar-ho");
	}*/

	//$.publish('analyticsEvent',{event:['mapa', tipus_user+'dades externes error', data.results, 1]});
	$('#dialog_error_upload_txt').html(txt_error);
	$('#dialog_error_upload').modal('show');
}

function loadURLfileLayer(layer){

	var defer = $.Deferred();

	var options;
	if(typeof (layer.options)=="string"){
		try {
			options = JSON.parse(layer.options);
		}
		catch (err) {
			options = layer.options;	
		}
	}else{
		options = layer.options;	
	}
	
	//Variables comunes para todos los casos
	var style = options.style;
	var tipusFile = options.tipusFile;
	var geometryType = options.geometryType;
	var epsgIN = options.epsgIN;
	var colX = options.colX;
	var colY = options.colY;
	var urlFile = layer.url;
	var dinamic = options.dinamic;
	
	var estil_do = options.estil_do;
	if(options.tem == tem_heatmap){
		estil_do = retornaEstilaDO(t_url_file); //TODO revisar si se puede quitar esto
	}
	
	if (tipusFile==".json") tipusFile=".geojson";
	
	var param_url = paramUrl.urlFileDin +  "tipusFile=" + tipusFile+
		"&colX="+colX+
		"&colY="+colY+
		"&epsgIN="+epsgIN+
		"&dinamic="+dinamic+
		"&urlFile="+encodeURIComponent(urlFile)+
		"&uploadFile="+paramUrl.uploadFile;
		if ($(location).attr('href').indexOf('/visor.html') != -1) { 
			param_url +="&uid="+_UsrID;
		}
		else {
			param_url +="&uid="+Cookies.get('uid');	
		}
	
	var capaURLfileLoad;
	/**
	 * ORIGEN O TEMATIC SIMPLE
	 */	
	if(options.tem == null || options.tem == tem_simple){
		var tipusAcc = options.tipusAcc;
		var tipusCodi = options.tipusCodi;
		var tipusFont = options.tipusFont;
		var nomCampCodi = options.nomCampCodi;

		options.nom = layer.serverName;
		options.businessId = layer.businessId;

		param_url += "&tipusAcc="+tipusAcc+
			"&tipusCodi="+tipusCodi+
			"&tipusFont="+tipusFont+
			"&nomCampCodi="+nomCampCodi;

		//SOCRATA		
		if ((urlFile.indexOf("socrata")>-1 || urlFile.indexOf("https")>-1) && (urlFile.indexOf("drive")==-1)
				&& (urlFile.indexOf("dropbox")==-1)) 	{
			param_url = urlFile;
		}
		
		var optionsVis =  options;
		if (optionsVis!=undefined && optionsVis.opcionsVis!=undefined && optionsVis.opcionsVis=="nomesetiqueta"){
			style.opacity=0;
			style.fillOpacity=0;
		}
		capaURLfileLoad = new L.GeoJSON.AJAX(param_url, {
			nom : layer.serverName,
			tipus : layer.serverType,
			geometryType: geometryType,
			businessId : layer.businessId,
			style: style,
			pointToLayer : function(feature, latlng) {
				var pp = feature.properties;
				var geom = L.circleMarker(latlng, estil_do);
				var html ='<div class="div_popup_visor"><div class="popup_pres">';
				$.each( pp, function( key, value ) {
					if(isValidValue(value) && !validateWkt(value)){
						if ( key != 'businessId' && key != 'slotd50'){							
							html+='<div class="popup_data_row">';
							var txt = value;
							if (!$.isNumeric(txt)) {		    				
								txt = parseUrlTextPopUp(value,key);
								if (typeof txt == 'string' || txt instanceof String) {
									if(txt.indexOf("iframe")==-1 && txt.indexOf("img")==-1){
										html+='<div class="popup_data_key">'+key+'</div>';
										html+='<div class="popup_data_value">'+txt+'</div>';
									}else{
										html+='<div class="popup_data_img_iframe">'+txt+'</div>';
									}
								}
								else{
									var txtVal=txt;
									try{
										txtVal = JSON.stringify(txt);
									}catch(e){
										
									}																	
									html+='<div class="popup_data_key">'+key+'</div>';
									html+='<div class="popup_data_value">'+txtVal+'</div>';
								}
							}
							else {
								html+='<div class="popup_data_key">'+key+'</div>';
								html+='<div class="popup_data_value">'+txt+'</div>';
							}
							html+= '</div>';
						}
					}
					
				});	
				html+='</div></div>';    	
				var popup = L.popup().setContent(html);
				if (optionsVis!=undefined && optionsVis.campEtiqueta!=undefined){
					var style = "font-family:"+optionsVis.fontFamily+";font-size:"+optionsVis.fontSize+";color:"+optionsVis.fontColor;
					if (optionsVis.contorn!=undefined && optionsVis.contorn=="si") {
						style+=";text-shadow:1px 1px #ffffff";
					}
					else 	style+=";text-shadow:0px 0px #ffffff";
					if (optionsVis.fontStyle!=undefined){
						if (optionsVis.fontStyle=="normal" || optionsVis.fontStyle=="bold") style+= ";font-weight:"+optionsVis.fontStyle;
						else if (optionsVis.fontStyle=="italic") style+= ";font-style:"+optionsVis.fontStyle;
					}
					if (optionsVis.caixa!=undefined && optionsVis.caixa=="si"){
						style += ";background-color:"+optionsVis.caixaColor;
					}
					else style += ";background-color:transparent";
					createClass('.etiqueta_style_'+layer.businessId,style);
				}
				var zoomInicialEtiqueta = "2";
				if (optionsVis!=undefined && optionsVis.zoomInicial!=undefined) zoomInicialEtiqueta=optionsVis.zoomInicial;
				var zoomFinalEtiqueta = "19";
				if (optionsVis!=undefined && optionsVis.zoomFinal!=undefined)  zoomFinalEtiqueta=optionsVis.zoomFinal;
				if (optionsVis!=undefined && optionsVis.campEtiqueta!=undefined) {
					if (optionsVis!=undefined && optionsVis.opcionsVis!=undefined && 
							(optionsVis.opcionsVis=="nomesetiqueta" || optionsVis.opcionsVis=="etiquetageom") ){
						geom.bindLabel(pp[optionsVis.campEtiqueta],
							{opacity:1, noHide: true,clickable:true,  direction: 'altre',className: "etiqueta_style_"+layer.businessId,offset: [0, 0]});						
					}
					if ((zoomInicialEtiqueta!=undefined && map.getZoom()<zoomInicialEtiqueta) ||
							(zoomFinalEtiqueta!=undefined && map.getZoom() > zoomFinalEtiqueta)) {//ocultem labels
							try{
								if (geom.label!=undefined) geom.label.setOpacity(0);
								else geom.hideLabel();
							}catch(err){
								
							}
					}
				}
				
				feature.properties.capaNom=layer.serverName;
				feature.properties.popupData=html;
				geom.on('click', function(e) {
					PopupManager().createMergedDataPopup(feature, e, controlCapes);
				});
				
				
				
				return geom;
			},
			onEachFeature : function(feature, latlng) {
				var pp = feature.properties;
				var html ='<div class="div_popup_visor"><div class="popup_pres">';
				$.each( pp, function( key, value ) {
						if(isValidValue(value) && !validateWkt(value)){
							if ( key != 'businessId' && key != 'slotd50'){
								html+='<div class="popup_data_row">';
								var txt = value;
								if (!$.isNumeric(txt)) {		    				
									txt = parseUrlTextPopUp(value,key);
									if (typeof txt == 'string' || txt instanceof String) {
										if(txt.indexOf("iframe")==-1 && txt.indexOf("img")==-1){
											html+='<div class="popup_data_key">'+key+'</div>';
											html+='<div class="popup_data_value">'+txt+'</div>';
										}else{
											html+='<div class="popup_data_img_iframe">'+txt+'</div>';
										}
									}
									else{
										var txtVal=txt;
										try{
											txtVal = JSON.stringify(txt);
										}catch(e){
											
										}																	
										html+='<div class="popup_data_key">'+key+'</div>';
										html+='<div class="popup_data_value">'+txtVal+'</div>';
									}
								}
								else {
									html+='<div class="popup_data_key">'+key+'</div>';
									html+='<div class="popup_data_value">'+txt+'</div>';
								}
								html+= '</div>';
							}
						}
					
				});		
				html+='</div></div>';
				var tipus = feature.geometry.type; 
				if (optionsVis!=undefined && optionsVis.campEtiqueta!=undefined){
					var style = "font-family:"+optionsVis.fontFamily+";font-size:"+optionsVis.fontSize+";color:"+optionsVis.fontColor;
					if (optionsVis.contorn!=undefined && optionsVis.contorn=="si") {
						style+=";text-shadow:1px 1px #ffffff";
					}
					else 	style+=";text-shadow:0px 0px #ffffff";
					if (optionsVis.fontStyle!=undefined){
						if (optionsVis.fontStyle=="normal" || optionsVis.fontStyle=="bold") style+= ";font-weight:"+optionsVis.fontStyle;
						else if (optionsVis.fontStyle=="italic") style+= ";font-style:"+optionsVis.fontStyle;
					}
					if (optionsVis.caixa!=undefined && optionsVis.caixa=="si"){
						style += ";background-color:"+optionsVis.caixaColor;
					}
					else style += ";background-color:transparent";
					createClass('.etiqueta_style_'+layer.businessId,style);
				}
				var zoomInicialEtiqueta = "2";
				if (optionsVis!=undefined && optionsVis.zoomInicial!=undefined) zoomInicialEtiqueta=optionsVis.zoomInicial;
				var zoomFinalEtiqueta = "19";
				if (optionsVis!=undefined && optionsVis.zoomFinal!=undefined)  zoomFinalEtiqueta=optionsVis.zoomFinal;
				if (tipus=="Point") {
					if (optionsVis!=undefined && optionsVis.campEtiqueta!=undefined) {
						if (optionsVis!=undefined && optionsVis.opcionsVis!=undefined && 
								(optionsVis.opcionsVis=="nomesetiqueta" || optionsVis.opcionsVis=="etiquetageom")){
							latlng.bindLabel(pp[optionsVis.campEtiqueta],
								{opacity:1, noHide: true,clickable:true,  direction: 'altre',className: "etiqueta_style_"+layer.businessId,offset: [0, 0]});						
						}
						if ((zoomInicialEtiqueta!=undefined && map.getZoom()<zoomInicialEtiqueta) ||
								(zoomFinalEtiqueta!=undefined && map.getZoom() > zoomFinalEtiqueta)) {//ocultem labels
								try{
									if (latlng.label!=undefined) latlng.label.setOpacity(0);
									else latlng.hideLabel();
								}catch(err){
									
								}
						}
					}
				}
				else if (tipus=="LineString"){
					if (optionsVis!=undefined && optionsVis.campEtiqueta!=undefined) {
						if (optionsVis!=undefined && optionsVis.opcionsVis!=undefined) {
								if ((optionsVis.opcionsVis=="nomesetiqueta" || optionsVis.opcionsVis=="etiquetageom")  ){
									latlng.bindLabelEx(map,pp[optionsVis.campEtiqueta], 
											{ noHide: true, direction: 'center',className: "etiqueta_style_"+layer.businessId,clickable:true, offset: [0, 0]});
								}	
								if (optionsVis.opcionsVis=="geometries"){
									latlng.hideLabel();
								}
								if ((zoomInicialEtiqueta!=undefined && map.getZoom()<zoomInicialEtiqueta) ||
										(zoomFinalEtiqueta!=undefined && map.getZoom() > zoomFinalEtiqueta)) {//ocultem labels
									latlng.hideLabel();
								}
						}
					}
					//latlng.bindLabelEx(map,"prova3", { noHide: true, direction: 'center',clickable:true, offset: [0, 0]});
				}
				else if (tipus=="Polygon"){
					if (optionsVis!=undefined && optionsVis.campEtiqueta!=undefined) {
						if (optionsVis!=undefined && optionsVis.opcionsVis!=undefined) {
								if ((optionsVis.opcionsVis=="nomesetiqueta" || optionsVis.opcionsVis=="etiquetageom")  ){
									latlng.bindLabelExPolygon(map,pp[optionsVis.campEtiqueta], 
										{ noHide: true, direction: 'center',className: "etiqueta_style_"+layer.businessId,clickable:true,offset: [0, 0] });
								}	
								if (optionsVis.opcionsVis=="geometries"){
									latlng.hideLabel();
								}
								if ((zoomInicialEtiqueta!=undefined && map.getZoom()<zoomInicialEtiqueta) ||
										(zoomFinalEtiqueta!=undefined && map.getZoom() > zoomFinalEtiqueta)) {//ocultem labels
									latlng.hideLabel();
								}
						}
					}
					//latlng.bindLabelExPolygon(map,"prova4",	{ noHide: true, direction: 'center',clickable:true, offset: [0, 0] });
				}

				//latlng.feature.properties.capaNom = layer.serverName;
				//latlng.feature.properties.popupData=html;
				latlng.properties={
					capaNom: layer.serverName,
					popupData:html,
					feature: latlng.feature,
					data: latlng.feature.properties
				};
				if (tipus != 'Point'){
					latlng.on('click', function(e) {
						PopupManager().createMergedDataPopup(latlng, e, controlCapes);
					});
				}
				
				//return PopupManager().createMergedDataPopup(feature, e, controlCapes);;
			}
		});	
	}	
	/**
	 * TEMATIC CLASIC O MIDES
	 */	
	else if(options.tem == tem_clasic || options.tem == tem_size){
		var tipusAcc = options.tipusAcc;
		var tipusCodi = options.tipusCodi;
		var tipusFont = options.tipusFont;
		var nomCampCodi = options.nomCampCodi;		

		options.nom = layer.serverName;
		options.businessId = layer.businessId;

		param_url += "&tipusAcc="+tipusAcc+
			"&tipusCodi="+tipusCodi+
			"&tipusFont="+tipusFont+
			"&nomCampCodi="+nomCampCodi;

		//SOCRATA		
		if (urlFile.indexOf("socrata")>-1)	param_url = urlFile;
		
		capaURLfileLoad = new L.GeoJSON.AJAX(param_url, {
			nom : layer.serverName,
			tipus : layer.serverType,
			geometryType: geometryType,
			businessId : layer.businessId,
			pointToLayer : function(feature, latlng) {
				var estilGeom=self.estil_do;  //ficat default point style????
				$.each( estil_do.estils, function( index, estil ) {
					if((estil.valueMax == estil.ValueMin && dataFieldValue == estil.valueMax) || //rang unic
							(dataFieldValue>=estil.valueMin && dataFieldValue<=estil.valueMax)){//per valors
						estilGeom = { radius : estil.estil.simbolSize, fillColor : estil.estil.color, color : "#ffffff", weight : 2, opacity : 1, fillOpacity : 0.8, isCanvas: true };
						return false;	
					}

				});
				var geom = L.circleMarker(latlng, estilGeom);		 
				var pp = feature.properties;
				var dataFieldValue = "";
				var html ='<div class="div_popup_visor"><div class="popup_pres">';
				$.each( pp, function( key, value ) {
					if(isValidValue(value) && !validateWkt(value)){
						if ( key != 'businessId' && key != 'slotd50'){
							html+='<div class="popup_data_row">';
							var txt = value;
							if (!$.isNumeric(txt)) {		    				
								txt = parseUrlTextPopUp(value,key);
								if(txt.indexOf("iframe")==-1 && txt.indexOf("img")==-1){
									html+='<div class="popup_data_key">'+key+'</div>';
									html+='<div class="popup_data_value">'+txt+'</div>';
								}else{
									html+='<div class="popup_data_img_iframe">'+txt+'</div>';
								}
							}
							else {
								html+='<div class="popup_data_key">'+key+'</div>';
								html+='<div class="popup_data_value">'+txt+'</div>';
							}
							html+= '</div>';
						}
					}

					if(key.toLowerCase()==estil_do.dataField) dataFieldValue = value;
				});	
				html+='</div></div>';    	

				
				   	
				feature.properties.capaNom=layer.serverName;
				feature.properties.popupData=html;
				geom.on('click', function(e) {
					PopupManager().createMergedDataPopup(feature, e, controlCapes);
				});
				
				return geom;
			},
			onEachFeature : function(feature, latlng) {
				var pp = feature.properties;
				var dataFieldValue = "";
				var html ='<div class="div_popup_visor"><div class="popup_pres">';
				$.each( pp, function( key, value ) {
					if(isValidValue(value) && !validateWkt(value)){
						if ( key != 'businessId' && key != 'slotd50'){
							html+='<div class="popup_data_row">';
							var txt = value;
							if (!$.isNumeric(txt)) {		    				
								txt = parseUrlTextPopUp(value,key);
								if(txt.indexOf("iframe")==-1 && txt.indexOf("img")==-1){
									html+='<div class="popup_data_key">'+key+'</div>';
									html+='<div class="popup_data_value">'+txt+'</div>';
								}else{
									html+='<div class="popup_data_img_iframe">'+txt+'</div>';
								}
							}
							else {
								html+='<div class="popup_data_key">'+key+'</div>';
								html+='<div class="popup_data_value">'+txt+'</div>';
							}
							html+= '</div>';
						}
					}
					if(key.toLowerCase()==estil_do.dataField) dataFieldValue = value;
				});	
				html+='</div></div>'; 
				$.each( estil_do.estils, function( index, estil ) {
					if((estil.valueMax == estil.valueMin && dataFieldValue == estil.valueMax) || //rang unic
							(parseFloat(dataFieldValue)>=parseFloat(estil.valueMin) && parseFloat(dataFieldValue)<=parseFloat(estil.valueMax))){//per valors	

						if(latlng.feature.geometry.type.toLowerCase() == t_polygon ){		
							latlng.setStyle({
								weight: 2,
								fillColor: estil.estil.color,
								color: estil.estil.borderColor,
								fillOpacity: 0.5,
								opacity: 1
							});
						}else if(latlng.feature.geometry.type.toLowerCase().indexOf(t_polyline)!=-1 
								|| latlng.feature.geometry.type.toLowerCase().indexOf(t_linestring)!=-1){
							latlng.setStyle({
								weight: 2,
								color: estil.estil.color,
								fillOpacity: 1,
								opacity: 1
							});
						}else if(latlng.feature.geometry.type.toLowerCase() == t_multipolygon ){
							latlng.setStyle({
								weight: 2,
								fillColor: estil.estil.color,
								color: estil.estil.borderColor,
								fillOpacity: 0.5,
								opacity: 1
							});
						}
						return false;	
					}
				});	

				latlng.feature.properties.capaNom = layer.serverName;
				latlng.feature.properties.popupData=html;
				latlng.properties={
					capaNom: layer.serverName,
					popupData:html,
					feature: latlng.feature,
					data: latlng.feature.properties
				};
				var tipus = feature.geometry.type;
				if (tipus != 'Point'){
					latlng.on('click', function(e) {
						PopupManager().createMergedDataPopup(latlng, e, controlCapes);
					});
				}

				return latlng;
			}
		});	
	}	
	/**
	 * TEMATIC CLUSTER
	 */	
	else if(options.tem == tem_cluster){
		param_url += "&tem="+tem_cluster;	
		//SOCRATA		
		if (urlFile.indexOf("socrata")>-1)	param_url = urlFile;
		capaURLfileLoad = new L.GeoJSON.AJAX(param_url, {
			nom : layer.serverName,
			tipus : layer.serverType,
			geometryType: geometryType,
			estil_do: estil_do,
			businessId : layer.businessId,
			pointToLayer : function(feature, latlng) {
				var geom = L.circleMarker(latlng, estil_do);
				var pp = feature.properties;
				var html ='<div class="div_popup_visor"><div class="popup_pres">';
				$.each( pp, function( key, value ) {
					if(isValidValue(value) && !validateWkt(value)){
						if ( key != 'businessId' && key != 'slotd50'){
							html+='<div class="popup_data_row">';
							var txt = value;
							if (!$.isNumeric(txt)) {		    				
								txt = parseUrlTextPopUp(value,key);
								if(txt.indexOf("iframe")==-1 && txt.indexOf("img")==-1){
									html+='<div class="popup_data_key">'+key+'</div>';
									html+='<div class="popup_data_value">'+txt+'</div>';
								}else{
									html+='<div class="popup_data_img_iframe">'+txt+'</div>';
								}
							}
							else {
								html+='<div class="popup_data_key">'+key+'</div>';
								html+='<div class="popup_data_value">'+txt+'</div>';
							}
							html+= '</div>';
						}
					}
				});		
				html+='</div></div>'; 
				feature.properties.capaNom=layer.serverName;
				feature.properties.popupData=html;
				geom.on('click', function(e) {
					PopupManager().createMergedDataPopup(feature, e, controlCapes);
				});
				
				return geom;
			},
			onEachFeature : function(feature, latlng) {
				var pp = feature.properties;
				var html ='<div class="div_popup_visor"><div class="popup_pres">';
				$.each( pp, function( key, value ) {
					if(isValidValue(value) && !validateWkt(value)){
						if ( key != 'businessId' && key != 'slotd50'){
							html+='<div class="popup_data_row">';
							var txt = value;
							if (!$.isNumeric(txt)) {		    				
								txt = parseUrlTextPopUp(value,key);
								if(txt.indexOf("iframe")==-1 && txt.indexOf("img")==-1){
									html+='<div class="popup_data_key">'+key+'</div>';
									html+='<div class="popup_data_value">'+txt+'</div>';
								}else{
									html+='<div class="popup_data_img_iframe">'+txt+'</div>';
								}
							}
							else {
								html+='<div class="popup_data_key">'+key+'</div>';
								html+='<div class="popup_data_value">'+txt+'</div>';
							}
							html+= '</div>';
						}
					}
				});		
				html+='</div></div>';
				latlng.feature.properties.capaNom = layer.serverName;
				latlng.feature.properties.popupData=html;
				latlng.properties={
					capaNom: layer.serverName,
					popupData:html,
					feature: latlng.feature,
					data: latlng.feature.properties
				};
				var tipus = feature.geometry.type;
				if (tipus != 'Point'){
					latlng.on('click', function(e) {
						PopupManager().createMergedDataPopup(latlng, e, controlCapes);
					});
				}
				return latlng;
			}
		});
	}
	/**
	 * TEMATIC HEATMAP
	 */
	else if(options.tem == tem_heatmap){
				
		param_url += "&tem="+tem_heatmap;	
		//SOCRATA		
		if (urlFile.indexOf("socrata")>-1)	param_url = urlFile;
		capaURLfileLoad = new L.GeoJSON.AJAX(param_url, {
			nom : layer.serverName,
			tipus : layer.serverType,
			geometryType: geometryType,
			estil_do: estil_do,
			businessId : layer.businessId,
			pointToLayer : function(feature, latlng) {
				var geom = L.circleMarker(latlng, estil_do);
				feature.properties.capaNom=layer.serverName;
				feature.properties.popupData=html;
				geom.on('click', function(e) {
					PopupManager().createMergedDataPopup(feature, e, controlCapes);
				});
				
				/*var popup = L.popup().setContent("");
				return geom.bindPopup(popup);*/
				return geom;
			}
		});
	}
	
	capaURLfileLoad.on('data:loaded', function(e){
		var self = this;
		
		if(options.tem == null || options.tem == tem_simple){
			self.options = options;
			addLayerUrlToMap(self, layer, controlCapes, options.origen, map);
		}else if(options.tem == tem_clasic || options.tem == tem_size){
			self.options = options;
			addLayerUrlToMap(self, layer, controlCapes, options.origen, map);
			if ($(location).attr('href').indexOf('/mapa.html')!=-1){
				loadMapLegendEdicioDinamics(self);
			}
		}else if(options.tem == tem_cluster){
			var clusterLayer = L.markerClusterGroup({
				singleMarkerMode : true
			});
			self.eachLayer(function(layer) {
				var marker = L.marker(new L.LatLng(layer.getLatLng().lat, layer.getLatLng().lng), {
					title : layer._leaflet_id
				});
				marker.bindPopup(layer._popup._content);
				clusterLayer.addLayer(marker);
			});
			
			clusterLayer.options.businessId = layer.businessId;
			clusterLayer.options.nom = layer.serverName;
			clusterLayer.options.zIndex = parseInt(layer.capesOrdre);
			clusterLayer.options.tipus = layer.serverType;
			clusterLayer.options.dataset = options.dataset;
			clusterLayer.options.tipusRang = tem_cluster;
			if(self.error){
				clusterLayer.error = true;
			}
			
			addLayerUrlToMap(clusterLayer, layer, controlCapes, options.origen, map);
			
		}else if(options.tem == tem_heatmap){
			var arrP=[];
			self.options = options;
			self.eachLayer(function(layer){
				var d = [layer.getLatLng().lat,layer.getLatLng().lng,1];	
				arrP.push(d);	
			});

			var heatLayerActiu = L.heatLayer(arrP,{
				radius:20,
				blur:15,
				max:1,
				gradient: {			
					0.35: "#070751",
					0.40: "#0095DE",
					0.45: "#02D5FF",
					0.50: "#02E0B9",
					0.55: "#00B43F",
					0.60: "#97ED0E",
					0.61: "#FFF800",
					0.65: "#FF9700",
					0.70: "#FF0101",
					1: "#720404"
				}	
			});

			heatLayerActiu.options.businessId = layer.businessId;
			heatLayerActiu.options.nom = layer.serverName;
			heatLayerActiu.options.zIndex = parseInt(layer.capesOrdre);
			heatLayerActiu.options.tipus = layer.serverType;
			heatLayerActiu.options.tipusRang = tem_heatmap;
			if(self.error){
				heatLayerActiu.error = true;
			}
			addLayerUrlToMap(heatLayerActiu, layer, controlCapes, options.origen, map);	
		}
		
		defer.resolve();
	});
		
	capaURLfileLoad.on('data:progress', function (e) {
		if (e.error) {
			// handle error
			var self = this;
			self.error = true;
			defer.reject(e.error);
		}
	});
		
	return defer.promise();
}

function addLayerUrlToMap(capaURLfileLoad, layer, controlCapes, origen, map){	

	if (!layer.capesOrdre || layer.capesOrdre == null || layer.capesOrdre == 'null'){
		capaURLfileLoad.options.zIndex = controlCapes._lastZIndex + 1;
	}else if(layer.capesOrdre != capesOrdre_sublayer){
		capaURLfileLoad.options.zIndex = parseInt(layer.capesOrdre);
	}		

	if(!origen){
		capaURLfileLoad.options.businessId = layer.businessId;
		controlCapes.addOverlay(capaURLfileLoad, layer.serverName, true);
		controlCapes._lastZIndex++;	
	}else{//Si te origen es una sublayer
		var origenL = getLeafletIdFromBusinessId(origen);
		capaURLfileLoad.options.zIndex = capesOrdre_sublayer;
		controlCapes.addOverlay(capaURLfileLoad, layer.serverName, true, origenL);
	}
	
	if (layer.capesActiva== null || layer.capesActiva == 'null' || layer.capesActiva == true || layer.capesActiva == "true"){
		capaURLfileLoad.addTo(map);
	}
	
	
}

function constructLayer(layer, estil_do){
	layer.eachLayer(function(marker) {
		var geometryType = transformTipusGeometry(marker.feature.geometry.type);
		if(geometryType == t_marker){
			var geom = L.circleMarker(marker._latlng, estil_do);
		}else if(geometryType == t_polyline){
			var geom = L.polyline(marker._latlngs, {color: estil_do.fillColor, weight: "3", opacity: "1"});
		}else if(geometryType == t_polygon){
			var geom = L.polygon(marker._latlngs, {color: estil_do.color, fillColor: estil_do.fillColor, fillOpacity: estil_do.fillOpacity, weight: estil_do.weight});
		}
		var pp = marker.toGeoJSON().properties;
		var html ='<div class="div_popup_visor"><div class="popup_pres">';
		$.each( pp, function( key, value ) {
			if(isValidValue(value) && !validateWkt(value)){
				if ( key != 'businessId' && key != 'slotd50'){
					html+='<div class="popup_data_row">';
					var txt = value;
					if (!$.isNumeric(txt)) {		    				
						txt = parseUrlTextPopUp(value,key);
						if(txt.indexOf("iframe")==-1 && txt.indexOf("img")==-1){
							html+='<div class="popup_data_key">'+key+'</div>';
							html+='<div class="popup_data_value">'+txt+'</div>';
						}else{
							html+='<div class="popup_data_img_iframe">'+txt+'</div>';
						}
					}
					else {
						html+='<div class="popup_data_key">'+key+'</div>';
						html+='<div class="popup_data_value">'+txt+'</div>';
					}
					html+= '</div>';
				}
			}
		});		
		html+='</div></div>';    	

		geom.properties = { capaNom: layer.serverName };
		geom.popupData = html;

		geom.on('click', function(e) {
			PopupManager().createMergedDataPopup(geom, e, controlCapes);
		});
		
		layer.removeLayer(marker);
		layer.addLayer(geom);
	});
}

function loadURLfileLayer2(layer) {
	var defer = $.Deferred();
	var options = jQuery.parseJSON( layer.options );
	var tipusFile = options.tipusFile;
	var estil_do = options.estil_do;
	var urlFile = layer.url;

	if(tipusFile == t_file_geojson){
		var capaURLfile = omnivore.geojson(urlFile, null, L.FeatureGroup())
		.on('ready', function() {
			constructLayer(this, estil_do);
		})
		.on('error', function() {
			console.debug("Error omnivore");
		})
		.addTo(map);					
	}else if(tipusFile == t_file_topojson){
		var capaURLfile = omnivore.topojson(urlFile, null, L.FeatureGroup())
		.on('ready', function() {
			constructLayer(this, estil_do);
		})
		.on('error', function() {
			console.debug("Error omnivore");
		})
		.addTo(map);					
	}else if(tipusFile == t_file_wkt){
		var capaURLfile = omnivore.wkt(urlFile, null, L.FeatureGroup())
		.on('ready', function() {
			constructLayer(this, estil_do);
		})
		.on('error', function() {
			console.debug("Error omnivore");
		})
		.addTo(map);					
	}else if(tipusFile == t_file_wkt){
		var capaURLfile = omnivore.wkt(urlFile, null, L.FeatureGroup())
		.on('ready', function() {
			constructLayer(this, estil_do);
		})
		.on('error', function() {
			console.debug("Error omnivore");
		})
		.addTo(map);					
	}else if(tipusFile == t_file_kml){
		var capaURLfile = omnivore.kml(urlFile, null, L.FeatureGroup())
		.on('ready', function() {
			constructLayer(this, estil_do);
		})
		.on('error', function() {
			console.debug("Error omnivore");
		})
		.addTo(map);					
	}else if(tipusFile == t_file_gpx){
		var capaURLfile = omnivore.gpx(urlFile, null, L.FeatureGroup())
		.on('ready', function() {
			constructLayer(this, estil_do);
		})
		.on('error', function() {
			console.debug("Error omnivore");
		})
		.addTo(map);					
	}else if(tipusFile == t_file_csv){
		var capaURLfile = omnivore.csv(urlFile, null, L.FeatureGroup())
		.on('ready', function() {
			constructLayer(this, estil_do);
		})
		.on('error', function() {
			console.debug("Error omnivore");
		})
		.addTo(map);					
	}

	capaURLfile.options.businessId = layer.businessId;
	capaURLfile.options.nom = layer.serverName;
	capaURLfile.options.tipus = t_url_file;
	capaURLfile.options.url = urlFile;
	capaURLfile.options.options = jQuery.parseJSON('{"tipusFile":"'+tipusFile+'"}');
	capaURLfile.options.options.estil_do = estil_do;
	capaURLfile.options.zIndex = controlCapes._lastZIndex+1; 
	controlCapes.addOverlay(capaURLfile, layer.serverName, true);
	controlCapes._lastZIndex++;
	activaPanelCapes(true);	
	return defer.promise();
}

function defineGeometryType(data){
	if(data.indexOf("Point")!=-1){
		return t_point;
	}else if(data.indexOf("Line")!=-1){
		return t_linestring;
	}else if(data.indexOf("Polygon")!=-1){
		return t_polygon;
	}
}

function loadUrlFileHeatmapLayer(layer){

	var options = jQuery.parseJSON( layer.options );
	var style = options.style;
	var tipusFile = options.tipusFile;
	var geometryType = options.geometryType;
	var epsgIN = options.epsgIN;
	var colX = options.colX;
	var colY = options.colY;
	var urlFile = layer.url;
	var dinamic = options.dinamic;
	var param_url = paramUrl.urlFileDin + "tipusFile=" + tipusFile+"&colX="+colX+"&colY="+colY+"&epsgIN="+epsgIN+"&dinamic="+dinamic+"&urlFile="+encodeURIComponent(urlFile);	

	var capaURLfileLoad = new L.GeoJSON.AJAX(param_url, {
		nom : layer.serverName,
		tipus : layer.serverType,
		geometryType: geometryType,
		estil_do: estil_do,
		style: style,
		businessId : layer.businessId,
		pointToLayer : function(feature, latlng) {
			var geom = L.circleMarker(latlng, estil_do);
			feature.properties.capaNom=layer.serverName;
			feature.properties.popupData=html;
			geom.on('click', function(e) {
				PopupManager().createMergedDataPopup(feature, e, controlCapes);
			});
			
		}
	});		

	capaURLfileLoad.on('data:loaded', function(e){

		var arrP=[];
		capaURLfileLoad.eachLayer(function(layer){
			var d =[layer.getLatLng().lat,layer.getLatLng().lng,1];	
			arrP.push(d);			
		});

		var heatLayerActiu = L.heatLayer(arrP,{radius:20,blur:15,max:1,
			gradient: {			
				0.35: "#070751",
				0.40: "#0095DE",
				0.45: "#02D5FF",
				0.50: "#02E0B9",
				0.55: "#00B43F",
				0.60: "#97ED0E",
				0.61: "#FFF800",
				0.65: "#FF9700",
				0.70: "#FF0101",
				1: "#720404"
			}	
		});

		heatLayerActiu.options.businessId = layer.businessId;
		heatLayerActiu.options.nom = layer.serverName;
		heatLayerActiu.options.zIndex = parseInt(layer.capesOrdre);
		heatLayerActiu.options.tipus = layer.serverType;
		heatLayerActiu.options.tipusRang = tem_heatmap;

		if (layer.capesActiva == true || layer.capesActiva == "true"){
			map.addLayer(heatLayerActiu);
		}

		var origen = getLeafletIdFromBusinessId(options.origen);
		controlCapes.addOverlay(heatLayerActiu,	heatLayerActiu.options.nom, true, origen);
		activaPanelCapes(true);		
	});

}



