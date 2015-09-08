/**
 * 
 */


function createURLfileLayer(urlFile, tipusFile, epsgIN, dinamic, nomCapa, colX, colY, tipusAcc, tipusFont, tipusCodi, nomCampCodi){

	console.debug("createURLfileLayer...");
//	console.debug(tipusAcc);
	console.debug(tipusCodi);
	console.debug(tipusFont);
	
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
//	console.debug(markerStyle);
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
	
	/*** DINAMIC ***/
	if(dinamic){

		//TODO: PENDENT ON FICAR BUSY A FALSE QUAN ACABA!!!		
		busy = false;

		console.debug("Dinamic...");
		var propName = "";
		var param_url = paramUrl.urlFile	+"tipusFile=" + tipusFile+
											 "&urlFile="+encodeURIComponent(urlFile)+
											 "&epsgIN="+epsgIN+
											 "&dinamic="+dinamic+
											 "&uploadFile="+paramUrl.uploadFile+
											 "&colX="+colX+
											 "&colY="+colY+
											 "&uid="+$.cookie('uid');		
		
		console.debug(param_url);
		
		var capaURLfile = new L.GeoJSON.AJAX(param_url, {
			nom : nomCapa,
			tipus : t_url_file,
			estil_do: estil_do,
			style: estil_lin_pol,//Estil de poligons i linies
			//businessId : '-1',
			pointToLayer : function(feature, latlng) {
				var geom = L.circleMarker(latlng, estil_do);
		    	var pp = feature.properties;
		    	var html ='<div class="div_popup_visor"><div class="popup_pres">';
		    	propName = "";
		    	$.each( pp, function( key, value ) {
		    		propName = propName+key+",";
		    		if(value){
						html+='<div class="popup_data_row">'+
						'<div class="popup_data_key">'+key+'</div>'+
					    '<div class="popup_data_value">'+value+'</div>'+
					    '</div>';	    			
		    		}
		    	});	
		    	propName = propName.substr(0, propName.length-1);
		    	console.debug(propName);
		    	html+='</div></div>'; 
			    return geom.bindPopup(html);
			  },
			  onEachFeature : function(feature, latlng) {
			    	var pp = feature.properties;
			    	var html ='<div class="div_popup_visor"><div class="popup_pres">';
			    	propName = "";
			    	$.each( pp, function( key, value ) {
			    		propName = propName+key+",";
			    		if(value){
							html+='<div class="popup_data_row">'+
							'<div class="popup_data_key">'+key+'</div>'+
						    '<div class="popup_data_value">'+value+'</div>'+
						    '</div>';	    			
			    		}
			    	});	
			    	propName = propName.substr(0, propName.length-1);
			    	console.debug(propName);
			    	html+='</div></div>'; 
				    return latlng.bindPopup(html);
				  },			  
			  middleware:function(data){
			    	console.debugbug("capaURLfile");
			    	console.debug(capaURLfile);
			    	busy = false;
				  if(data.status && data.status.indexOf("ERROR")!=-1){
					  processFileError(data);
				  }else{
					  console.debug(data);	
					  console.debug("propName:");
					  console.debug(propName);
					   var stringData = JSON.stringify(data);
					   var geometryType = defineGeometryType(stringData);
					   console.debug("geometryType");
					   console.debug(geometryType);	
				    	
					   console.debug("CapaURLFILE style abans:");
					   console.debug(capaURLfile.options.style);
					   
				    	if(geometryType.indexOf("point")!=-1){
//				    		capaURLfile.setStyle(estil_do);
				    		capaURLfile.options.style = estil_do;
				    	}else if(geometryType.indexOf("line")!=-1){
//				    		capaURLfile._setLayerStyle(lineStyle);
				    		capaURLfile.options.style = lineStyle;
				    	}else if(geometryType.indexOf("polygon")!=-1){
//				    		capaURLfile.setStyle(polygonStyle);
				    		capaURLfile.options.style = polygonStyle;
				    	}
				    	
						   console.debug("CapaURLFILE style despres:");
						   console.debug(capaURLfile.options.style);				    	
				    	
					  capaURLfile.addData(data);
					  
						//Un cop tinc la capa a client, la creo a servidor
						var data = {
							uid:$.cookie('uid'),
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
				            options: '{"tipusFile":"'+tipusFile+'","nom":"'+nomCapa+'","propName":"'+propName+'","url":"'+urlFile+'","tipus":"'+t_url_file+'","epsgIN":"'+epsgIN+'", "geometryType":"'+geometryType+'","colX":"'+colX+'","colY":"'+colY+'", "dinamic":"'+dinamic+'", "style":'+JSON.stringify(capaURLfile.options.style)+',"estil_do":{"radius":"'+estil_do.radius+'","fillColor":"'+estil_do.fillColor+'","color":"'+estil_do.color+'","weight":"'+estil_do.weight+'","opacity":"'+estil_do.opacity+'","fillOpacity":"'+estil_do.fillOpacity+'","isCanvas":"'+estil_do.isCanvas+'"}}'
						};
						
						console.debug("Abans create servidor in map, data:");
						console.debug(data);
						
						createServidorInMap(data).then(function(results){
								if (results.status == "OK"){
									console.debug("Create servidor in Map ok!");
									_gaq.push(['_trackEvent', 'mapa', tipus_user+'dades externes dinamiques', urlFile, 1]);
									
									jQuery('#dialog_dades_ex').modal('toggle');					
									
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
									
									capaURLfile.addTo(map);
									capaURLfile.options.zIndex = controlCapes._lastZIndex+1; 
									controlCapes.addOverlay(capaURLfile, nomCapa, true);
									controlCapes._lastZIndex++;
									activaPanelCapes(true);	
									
								}else{
									console.debug("1.Error a createServidorInMap:"+results.status);
									var txt_error = window.lang.convert("Error durant la càrrega de dades. Torni a intentar-ho");
									jQuery("#div_url_file_message").html(txt_error);							
								}
						},function(results){
							console.debug("2.Error a createServidorInMap:"+results.status);
							var txt_error = window.lang.convert("Error durant la càrrega de dades. Torni a intentar-ho");
							jQuery("#div_url_file_message").html(txt_error);					
						});
				  }
			  }
		});
	
  /*** NO DINAMICA ***/		
	}else{
		console.debug("getUrlFile PROVES NO DINAMICA");
		
		var codiUnic = getCodiUnic();
		
		var data = {
			 mapBusinessId: url('?businessid'),
			 serverName: nomCapa,
			 tipusFile: tipusFile,
			 urlFile: urlFile,
			 epsgIN: epsgIN,
			 dinamic: dinamic,
			 uploadFile: paramUrl.uploadFile,
			 uid: $.cookie('uid'),
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
		}
		
		$('#dialog_dades_ex').modal('hide');

		jQuery("#div_uploading_txt").html("");
		jQuery("#div_uploading_txt").html(
				'<div id="div_upload_step1" class="status_current" lang="ca">1. '+window.lang.convert('Descarregant fitxer')+'<span class="one">.</span><span class="two">.</span><span class="three">.</span></div>'+
				'<div id="div_upload_step2" class="status_uncheck" lang="ca">2. '+window.lang.convert('Analitzant fitxer')+'</div>'+
				'<div id="div_upload_step3" class="status_uncheck" lang="ca">3. '+window.lang.convert('Creant geometries')+'</div>'+
				'<div id="div_upload_step4" class="status_uncheck" lang="ca">4. '+window.lang.convert('Processant la resposta')+'</div>'//+	
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
								'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.convert('Fitxer descarregat')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></span></div>'+
								'<div id="div_upload_step2" class="status_current" lang="ca">2. '+window.lang.convert('Analitzant fitxer')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
								'<div id="div_upload_step3" class="status_uncheck" lang="ca">3. '+window.lang.convert('Creant geometries')+'</div>'+
								'<div id="div_upload_step4" class="status_uncheck" lang="ca">4. '+window.lang.convert('Processant la resposta')+'</div>'//+	
							);									
							
						}else if(data.status.indexOf("PAS3")!=-1){
							jQuery("#div_uploading_txt").html("");
							jQuery("#div_uploading_txt").html(
								'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.convert('Fitxer descarregat')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></span></div>'+
								'<div id="div_upload_step2" class="status_check" lang="ca">2. '+window.lang.convert('Fitxer analitzat')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
								'<div id="div_upload_step3" class="status_current" lang="ca">3. '+window.lang.convert('Creant geometries')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
								'<div id="div_upload_step4" class="status_uncheck" lang="ca">4. '+window.lang.convert('Processant la resposta')+'</div>'//+	
							);									
						}else if(data.status.indexOf("OK")!=-1){
//							console.debug("Ha acabat:");
//							console.debug(data);
							clearInterval(pollInterval);
							
							jQuery("#div_uploading_txt").html("");
							jQuery("#div_uploading_txt").html(
								'<div id="div_upload_step1" class="status_check" lang="ca">1. '+window.lang.convert('Fitxer descarregat')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></span></div>'+
								'<div id="div_upload_step2" class="status_check" lang="ca">2. '+window.lang.convert('Fitxer analitzat')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
								'<div id="div_upload_step3" class="status_check" lang="ca">3. '+window.lang.convert('Geometries creades')+' <span class="glyphicon glyphicon-ok" aria-hidden="true"></span></div>'+
								'<div id="div_upload_step4" class="status_current" lang="ca">4. '+window.lang.convert('Processant la resposta')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'//+	
							);									
							
							addDropFileToMap(data);
							_gaq.push(['_trackEvent', 'mapa', tipus_user+'carregar dades ok', envioArxiu.ext+"#"+envioArxiu.categoriaMidaFitxer, 1]);
						
						}else if(data.status.indexOf("ERROR")!=-1){
							console.error("Error al carregar fitxer:");
							console.error(data);
							busy = false;
							
							clearInterval(pollInterval);
							jQuery('#info_uploadFile').hide();
							
							$('#dialog_error_upload_txt').html("");
							
							if(data.codi){
								
								_gaq.push(['_trackEvent', 'mapa', tipus_user+'carregar dades error '+data.codi, envioArxiu.ext+"#"+envioArxiu.categoriaMidaFitxer, 1]);
								
								if(data.codi.indexOf("01")!=-1){//cas 01: Exception durant el tractament del fitxer
									var msg = "[01]: " + window.lang.convert("Ha ocorregut un error inesperat durant la càrrega del fitxer.");
									$('#dialog_error_upload_txt').html(msg);
									
								}else if(data.codi.indexOf("02")!=-1){//cas 02: Error durant les conversions de format del fitxer
									var msg = "[02]: " + window.lang.convert("Error durant el procés de conversió de format del fitxer. Comprovi que el fitxer és correcte.");
									$('#dialog_error_upload_txt').html(msg);
									
								}else if(data.codi.indexOf("03")!=-1){//cas 03: OGRInfo ha donat resposta fallida
									var msg = "[03]: " + window.lang.convert("Error durant l'anàlisi de la informació del fitxer. Comprovi que el fitxer és correcte.");
									$('#dialog_error_upload_txt').html(msg);
										
								}else if(data.codi.indexOf("04")!=-1){//cas 04: OGRInfo ha donat una excepció
									var msg = "[04]: " + window.lang.convert("Ha ocorregut un error inesperat durant l'anàlisi de la informació del fitxer.");
										$('#dialog_error_upload_txt').html(msg);
								
								}else if(data.codi.indexOf("05")!=-1){//cas 05: OGRInfo ha tornat resposta buida
									var msg = "[05]: " + window.lang.convert("L'anàlisi de la informació del fitxer no ha tornat resultats. Comprovi el fitxer i torni a intentar-ho.");
									$('#dialog_error_upload_txt').html(msg);
									
								}else if(data.codi.indexOf("06")!=-1){//cas 06: Accedeix a fileDefault_Error, no li ha arribat be el nom del fitxer
									var msg = "[06]: " + window.lang.convert("Problema de comunicació amb el servidor. Si us plau, torni a intentar-ho.");
									$('#dialog_error_upload_txt').html(msg);
									
								}else if(data.codi.indexOf("07")!=-1){//cas 07: EnviaFileReady a myUtils.jsp ha donat una excepcio
									var msg = "[07]: " + window.lang.convert("Ha ocorregut un error inesperat durant la comunicació amb el servidor. Si us plau, torni a intentar-ho.");
									$('#dialog_error_upload_txt').html(msg);
								}
								
							}else{
								_gaq.push(['_trackEvent', 'mapa', tipus_user+'carregar dades error sense codi', envioArxiu.ext+"#"+envioArxiu.categoriaMidaFitxer, 1]);
								$('#dialog_error_upload_txt').html(window.lang.convert("Error en la càrrega de l'arxiu"));
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

function processFileError(data){
	
	var txt_error = window.lang.convert("Error durant el tractament de les dades");
	
	if(data.results.indexOf("CONVERT ERROR")!= -1){
		var txt_error = window.lang.convert("Error de conversió: format o EPSG incorrectes");
	}else if(data.results.indexOf("501")!= -1){//+ de 5000 punts
		txt_error += ": "+window.lang.convert("El número de punts supera el màxim permès. Redueixi a 10000 o menys i torni a intentar-ho");
	}else if(data.results.indexOf("502")!= -1){//+ de 1000 features
		txt_error += ": "+window.lang.convert("El número de línies/polígons supera el màxim permès. Redueixi a 2000 o menys i torni a intentar-ho");
	}else if(data.results.indexOf("503")!= -1){//+ de 6000 geometries
		txt_error += ": "+window.lang.convert("El número total de geometries supera el màxim permès. Redueixi a 6000 o menys i torni a intentar-ho");
	}
	
	_gaq.push(['_trackEvent', 'mapa', tipus_user+'dades externes error', data.results, 1]);
	//_kmq.push.push(['record', 'dades externes error', {'from':'mapa', 'tipus user':tipus_user, 'tipus error':data.results}]);
	
	jQuery("#div_url_file_message").html(txt_error);
//	jQuery('#div_url_file').removeClass('waiting_animation');
	jQuery("#div_url_file_message").show();
}

function loadURLfileLayer(layer){
	
	var defer = $.Deferred();

	var options = JSON.parse(layer.options);
	//console.debug("options:");
	//console.debug(options);
	
	if(options.tem == null || options.tem == tem_simple){
	
		var estil_do = options.estil_do;
		var style = options.style;
		var tipusFile = options.tipusFile;
		var geometryType = options.geometryType;
		var epsgIN = options.epsgIN;
		var colX = options.colX;
		var colY = options.colY;
		var urlFile = layer.url;
		var dinamic = options.dinamic;
		
		options.nom = layer.serverName;
		options.businessId = layer.businessId;
		
		var param_url = paramUrl.urlFile + "tipusFile=" + tipusFile+
										   "&colX="+colX+
										   "&colY="+colY+
										   "&epsgIN="+epsgIN+
										   "&dinamic="+dinamic+
										   "&urlFile="+encodeURIComponent(urlFile)+
										   "&uid="+$.cookie('uid');
		
		var capaURLfileLoad = new L.GeoJSON.AJAX(param_url, {
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
		    		if(value){
						html+='<div class="popup_data_row">'+
						'<div class="popup_data_key">'+key+'</div>'+
					    '<div class="popup_data_value">'+value+'</div>'+
					    '</div>';	    			
		    		}
		    	});	
		    	html+='</div></div>';    	
		    	var popup = L.popup().setContent(html);
			    return geom.bindPopup(popup);
			  },
			  onEachFeature : function(feature, latlng) {
			    	var pp = feature.properties;
			    	var html ='<div class="div_popup_visor"><div class="popup_pres">';
			    	$.each( pp, function( key, value ) {
			    		if(value){
							html+='<div class="popup_data_row">'+
							'<div class="popup_data_key">'+key+'</div>'+
						    '<div class="popup_data_value">'+value+'</div>'+
						    '</div>';	    			
			    		}
			    	});	
			    	html+='</div></div>'; 
				    return latlng.bindPopup(html);
				  }
		});		
			
		capaURLfileLoad.on('data:loaded', function(e){
//			console.debug("capa loaded!");
			capaURLfileLoad.options = options;

			if (layer.capesActiva== null || layer.capesActiva == 'null' || layer.capesActiva == true || layer.capesActiva == "true"){
				capaURLfileLoad.addTo(map);
			}
	
			if (!layer.capesOrdre || layer.capesOrdre == null || layer.capesOrdre == 'null'){
				capaURLfileLoad.options.zIndex = controlCapes._lastZIndex + 1;
			}else if(layer.capesOrdre != capesOrdre_sublayer){
				capaURLfileLoad.options.zIndex = parseInt(layer.capesOrdre);
			}		
			
			if(!options.origen){
				capaURLfileLoad.options.businessId = layer.businessId;
				controlCapes.addOverlay(capaURLfileLoad, layer.serverName, true);
				controlCapes._lastZIndex++;	
			}else{//Si te origen es una sublayer
				var origen = getLeafletIdFromBusinessId(options.origen);
				capaURLfileLoad.options.zIndex = capesOrdre_sublayer;
				controlCapes.addOverlay(capaURLfileLoad, layer.serverName, true, origen);
			}		
			defer.resolve();
		});
		
	}else if(options.tem == tem_clasic || options.tem == tem_size){
		
//		console.debug("Load layer categories!!");
		
		var estil_do = options.estil_do;
		var style = options.style;
		var tipusFile = options.tipusFile;
		var geometryType = options.geometryType;
		var epsgIN = options.epsgIN;
		var colX = options.colX;
		var colY = options.colY;
		var urlFile = layer.url;
		var dinamic = options.dinamic;
		
		options.nom = layer.serverName;
		options.businessId = layer.businessId;
		
		var param_url = paramUrl.urlFile + "tipusFile=" + tipusFile+
										   "&colX="+colX+
										   "&colY="+colY+
										   "&epsgIN="+epsgIN+
										   "&dinamic="+dinamic+
										   "&urlFile="+encodeURIComponent(urlFile)+
										   "&uid="+$.cookie('uid');
		
		var capaURLfileLoad = new L.GeoJSON.AJAX(param_url, {
			nom : layer.serverName,
			tipus : layer.serverType,
			geometryType: geometryType,
			businessId : layer.businessId,
			pointToLayer : function(feature, latlng) {
				
		    	var pp = feature.properties;
		    	var dataFieldValue = "";
		    	var html ='<div class="div_popup_visor"><div class="popup_pres">';
		    	$.each( pp, function( key, value ) {
		    		if(value){
						html+='<div class="popup_data_row">'+
						'<div class="popup_data_key">'+key+'</div>'+
					    '<div class="popup_data_value">'+value+'</div>'+
					    '</div>';	    			
		    		}
		    		
		    		if(key.toLowerCase()==estil_do.dataField) dataFieldValue = value;
		    	});	
		    	html+='</div></div>';    	

		    	var estilGeom; //ficat default point style????
		    	$.each( estil_do.estils, function( index, estil ) {
		    		if((estil.valueMax == estil.ValueMin && dataFieldValue == estil.valueMax) || //rang unic
		    			(dataFieldValue>=estil.valueMin && dataFieldValue<=estil.valueMax)){//per valors
	    				estilGeom = { radius : estil.estil.simbolSize, fillColor : estil.estil.color, color : "#ffffff", weight : 2, opacity : 1, fillOpacity : 0.8, isCanvas: true };
	    				return false;	
		    		}
		    		
		    	});
		    	var geom = L.circleMarker(latlng, estilGeom);		    	
		    	var popup = L.popup().setContent(html);
			    return geom.bindPopup(popup);
			  },
			  onEachFeature : function(feature, latlng) {
			    	var pp = feature.properties;
			    	var dataFieldValue = "";
			    	var html ='<div class="div_popup_visor"><div class="popup_pres">';
			    	$.each( pp, function( key, value ) {
			    		if(value){
							html+='<div class="popup_data_row">'+
							'<div class="popup_data_key">'+key+'</div>'+
						    '<div class="popup_data_value">'+value+'</div>'+
						    '</div>';	    			
			    		}
			    		if(key.toLowerCase()==estil_do.dataField) dataFieldValue = value;
			    	});	
			    	html+='</div></div>'; 

			    	$.each( estil_do.estils, function( index, estil ) {
			    		if((estil.valueMax == estil.valueMin && dataFieldValue == estil.valueMax) || //rang unic
				    			(parseInt(dataFieldValue)>=parseInt(estil.valueMin) && parseInt(dataFieldValue)<=parseInt(estil.valueMax))){//per valors
			    			if(latlng.feature.geometry.type.toLowerCase() == t_polygon){
			    				latlng.options.weight = 2;
					    		latlng.options.color = "#ffffff";
					    		latlng.options.fillColor = estil.estil.color;
					    		latlng.options.fillOpacity = 0.5;			    					
					    		latlng.options.opacity = 1;
		    				}else if(latlng.feature.geometry.type.toLowerCase().indexOf(t_polyline)!=-1 || latlng.feature.geometry.type.toLowerCase().indexOf(t_linestring)!=-1){
			    				latlng.options.weight = 2;
					    		latlng.options.color = estil.estil.color;
					    		latlng.options.fillOpacity = 1;			    					
					    		latlng.options.opacity = 1;
		    				}
			    			return false;	
			    		}
			    	});	
				    return latlng.bindPopup(html);
				  }
		});		
			
		capaURLfileLoad.on('data:loaded', function(e){
//			console.debug("capa loaded!");
			capaURLfileLoad.options = options;

			if (layer.capesActiva== null || layer.capesActiva == 'null' || layer.capesActiva == true || layer.capesActiva == "true"){
				capaURLfileLoad.addTo(map);
			}
	
			if (!layer.capesOrdre || layer.capesOrdre == null || layer.capesOrdre == 'null'){
				capaURLfileLoad.options.zIndex = controlCapes._lastZIndex + 1;
			}else if(layer.capesOrdre != capesOrdre_sublayer){
				capaURLfileLoad.options.zIndex = parseInt(layer.capesOrdre);
			}		
			
			if(!options.origen){
				capaURLfileLoad.options.businessId = layer.businessId;
				controlCapes.addOverlay(capaURLfileLoad, layer.serverName, true);
				controlCapes._lastZIndex++;	
			}else{//Si te origen es una sublayer
				var origen = getLeafletIdFromBusinessId(options.origen);
				capaURLfileLoad.options.zIndex = capesOrdre_sublayer;
				controlCapes.addOverlay(capaURLfileLoad, layer.serverName, true, origen);
			}		
			defer.resolve();
		});		
		
		
	}else if(options.tem == tem_cluster){
		
		var options = jQuery.parseJSON( layer.options );
		var estil_do = retornaEstilaDO(options.dataset);
		
		var estil_do = options.estil_do;
		var style = options.style;
		var tipusFile = options.tipusFile;
		var geometryType = options.geometryType;
		var epsgIN = options.epsgIN;
		var colX = options.colX;
		var colY = options.colY;
		var urlFile = layer.url;
		var dinamic = options.dinamic;
		
		var param_url = paramUrl.urlFile + "tipusFile=" + tipusFile+
										   "&colX="+colX+
										   "&colY="+colY+
										   "&epsgIN="+epsgIN+
										   "&dinamic="+dinamic+
										   "&urlFile="+encodeURIComponent(urlFile);	
		
		var capaURLfileLoad = new L.GeoJSON.AJAX(param_url, {
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
		    		if(value){
						html+='<div class="popup_data_row">'+
						'<div class="popup_data_key">'+key+'</div>'+
					    '<div class="popup_data_value">'+value+'</div>'+
					    '</div>';	    			
		    		}
		    	});	
		    	html+='</div></div>';    	
		    	var popup = L.popup().setContent(html);
			    return geom.bindPopup(popup);
			  },
			  onEachFeature : function(feature, latlng) {
			    	var pp = feature.properties;
			    	var html ='<div class="div_popup_visor"><div class="popup_pres">';
			    	$.each( pp, function( key, value ) {
			    		if(value){
							html+='<div class="popup_data_row">'+
							'<div class="popup_data_key">'+key+'</div>'+
						    '<div class="popup_data_value">'+value+'</div>'+
						    '</div>';	    			
			    		}
			    	});	
			    	html+='</div></div>'; 
				    return latlng.bindPopup(html);
				  }
		});

		map.addLayer(capaURLfileLoad);
		capaURLfileLoad.on('data:loaded', function(e){
			//console.debug("data:loaded");
			map.removeLayer(capaURLfileLoad);
			
			var clusterLayer = L.markerClusterGroup({
				singleMarkerMode : true
			});
			
			capaURLfileLoad.eachLayer(function(layer) {
				var marker = L.marker(new L.LatLng(layer.getLatLng().lat, layer.getLatLng().lng), {
					title : layer._leaflet_id
				});
				marker.bindPopup(layer._popup._content);
				clusterLayer.addLayer(marker);
			});	
			
			clusterLayer.options.businessId = layer.businessId;
			clusterLayer.options.nom = layer.serverName;
			clusterLayer.options.zIndex = layer.capesOrdre;
			clusterLayer.options.tipus = layer.serverType;
			clusterLayer.options.dataset = options.dataset;
			clusterLayer.options.tipusRang = tem_cluster;
	
			if (layer.capesActiva == true || layer.capesActiva == "true"){
				map.addLayer(clusterLayer);
			}
			var origen = getLeafletIdFromBusinessId(options.origen);
			controlCapes.addOverlay(clusterLayer, clusterLayer.options.nom, true, origen);
	//		controlCapes._lastZIndex++;
			activaPanelCapes(true);		
		
		});		

		
//		loadUrlFileClusterLayer(layer);
//		defer.resolve();
	}else if(options.tem == tem_heatmap){

		var estil_do = retornaEstilaDO(t_url_file);
		var tipusFile = options.tipusFile;
		var geometryType = options.geometryType;
		var epsgIN = options.epsgIN;
		var colX = options.colX;
		var colY = options.colY;
		var urlFile = layer.url;
		var dinamic = options.dinamic;
		var param_url = paramUrl.urlFile + "tipusFile=" + tipusFile+
										   "&colX="+colX+
										   "&colY="+colY+
										   "&epsgIN="+epsgIN+
										   "&dinamic="+dinamic+
										   "&urlFile="+encodeURIComponent(urlFile)+
										   "&uid="+$.cookie('uid')+
										   "&tem="+tem_heatmap;	
		
		var capaURLfileLoad = new L.GeoJSON.AJAX(param_url, {
			nom : layer.serverName,
			tipus : layer.serverType,
			geometryType: geometryType,
			estil_do: estil_do,
			businessId : layer.businessId,
			pointToLayer : function(feature, latlng) {
				var geom = L.circleMarker(latlng, estil_do);
				var popup = L.popup().setContent("");
			    return geom.bindPopup(popup);
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
//			console.debug("Business ID origen:");
//			console.debug(origen);
			controlCapes.addOverlay(heatLayerActiu,	heatLayerActiu.options.nom, true, origen);
//			controlCapes._lastZIndex++;
			activaPanelCapes(true);	
			defer.resolve();
		});		
//		defer.resolve();		
	}
	return defer.promise();
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
			html+='<div class="popup_data_row">'+
			'<div class="popup_data_key">'+key+'</div>'+
		    '<div class="popup_data_value">'+value+'</div>'+
		    '</div>';
    	});	
    	html+='</div></div>';    	
    	geom.bindPopup(html);
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
	console.debug("loadUrlFileHeatmapLayer");

	var options = jQuery.parseJSON( layer.options );
//	var estil_do = options.estil_do;
	var style = options.style;
	var tipusFile = options.tipusFile;
	var geometryType = options.geometryType;
	var epsgIN = options.epsgIN;
	var colX = options.colX;
	var colY = options.colY;
	var urlFile = layer.url;
	var dinamic = options.dinamic;
	var param_url = paramUrl.urlFile + "tipusFile=" + tipusFile+"&colX="+colX+"&colY="+colY+"&epsgIN="+epsgIN+"&dinamic="+dinamic+"&urlFile="+encodeURIComponent(urlFile);	
	
	var capaURLfileLoad = new L.GeoJSON.AJAX(param_url, {
		nom : layer.serverName,
		tipus : layer.serverType,
		geometryType: geometryType,
		estil_do: estil_do,
		style: style,
		businessId : layer.businessId,
		pointToLayer : function(feature, latlng) {
			var geom = L.circleMarker(latlng, estil_do);
		  }
	});		
	
	capaURLfileLoad.on('data:loaded', function(e){
		//console.debug("data:loaded");
		
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
//		controlCapes._lastZIndex++;
		activaPanelCapes(true);		
	});

}

//function replacer(key, value) {
//	console.debug(key);
//	console.debug(value);
//	
//	if (typeof value === 'number' || typeof value === 'boolean') return String(value);
//	else return value;
//}
