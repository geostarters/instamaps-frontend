/**
 * 
 */

function createURLfileLayer(urlFile, tipusFile, epsgIN, dinamic, nomCapa, colX, colY){

	var estil_do = retornaEstilaDO(t_url_file);
	console.debug("estil_do:");
	console.debug(estil_do);
	
	var estil_lin_pol = estil_do;
	
//	var markerStyle = JSON.stringify(getMarkerRangFromStyle(defaultPunt));
//	console.debug("markerStyle:");
//	console.debug(markerStyle);
//
	 var lineStyle = getLineRangFromStyle(canvas_linia);
	 lineStyle.weight = lineStyle.lineWidth;
	 console.debug(lineStyle);
	 
	 var polygonStyle = getPolygonRangFromStyle(canvas_pol);
	 console.debug("polygonStyle:");
	 console.debug(polygonStyle);
	 
	 polygonStyle.weight = polygonStyle.lineWidth;
	 polygonStyle.color = polygonStyle.borderColor;
	 polygonStyle.fillColor = polygonStyle.color;
	 polygonStyle.fillOpacity = polygonStyle.opacity/100; 
	 polygonStyle.opacity = 1;

	 console.debug(polygonStyle);
	
	var markerStyle2 = getMarkerRangFromStyle(defaultPunt);
	console.debug("markerStyle2:");
	console.debug(markerStyle2);	
	
	if(markerStyle2.isCanvas){
		estil_do.color = markerStyle2.borderColor;
		estil_do.fillColor = markerStyle2.color;
		estil_do.fillOpacity = 1;
		estil_do.opacity = 1;
		estil_do.radius = markerStyle2.simbolSize;
		estil_do.weight = markerStyle2.borderWidth;
	}
	
	console.debug("estil_do:");
	console.debug(estil_do);	
	
	if(dinamic){
		
		var param_url = paramUrl.urlFile	+ "tipusFile=" + tipusFile+
											 "&urlFile="+encodeURIComponent(urlFile)+
											 "&epsgIN="+epsgIN+
											 "&dinamic="+dinamic+
											 "&uploadFile="+paramUrl.uploadFile+
											 "&colX="+colX+
											 "&colY="+colY+
											 "&uid="+$.cookie('uid');		
		
		var capaURLfile = new L.GeoJSON.AJAX(param_url, {
			nom : nomCapa,
			tipus : t_url_file,
			estil_do: estil_do,
			style: estil_lin_pol,//Estil de poligons i linies
			businessId : '-1',
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
			    return geom.bindPopup(html);
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
				  },			  
			  middleware:function(data){
			    	console.debug("capaURLfile");
			    	console.debug(capaURLfile);				  
				  if(data.status && data.status.indexOf("ERROR")!=-1){
					  processFileError(data);
				  }else{
					  console.debug(data);	
					  
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
						if(typeof url('?businessid') == "string"){
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
					            options: '{"tipusFile":"'+tipusFile+'","tipus":"'+t_url_file+'","epsgIN":"'+epsgIN+'", "geometryType":"'+geometryType+'","colX":"'+colX+'","colY":"'+colY+'", "dinamic":"'+dinamic+'", "style":'+JSON.stringify(capaURLfile.options.style)+',"estil_do":{"radius":"'+estil_do.radius+'","fillColor":"'+estil_do.fillColor+'","color":"'+estil_do.color+'","weight":"'+estil_do.weight+'","opacity":"'+estil_do.opacity+'","fillOpacity":"'+estil_do.fillOpacity+'","isCanvas":"'+estil_do.isCanvas+'"}}'
							};
							
							console.debug("Abans create servidor in map, data:");
							console.debug(data);
							
							createServidorInMap(data).then(function(results){
									if (results.status == "OK"){
										console.debug("Create servidor in Map ok!");
										_gaq.push(['_trackEvent', 'mapa', tipus_user+'dades externes dinamiques', urlFile, 1]);
										//_kmq.push.push(['record', 'dades externes', {'from':'mapa', 'tipus user':tipus_user, 'url':urlFile,'mode':'dinamiques'}]);
										
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
							
						}else{
							//usuari no logat, no entra mai
						}					  
				  }
			  }
		});
	}else{
		
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
			 markerStyle: JSON.stringify(getMarkerRangFromStyle(defaultPunt)),
			 lineStyle: JSON.stringify(getLineRangFromStyle(canvas_linia)),
			 polygonStyle: JSON.stringify(getPolygonRangFromStyle(canvas_pol))
		}
		
		getUrlFile(data).then(function(results){
			if (results.status == "OK") {
				if(nou_model){
					//Si geometries tipus marker
					if(results.layerMarker){
						var defer = $.Deferred();
//						readVisualitzacio(defer, results.visualitzacioMarker, results.layerMarker);
						loadVisualitzacioLayer(results.layerMarker).then(function(results1){
							if(results1){
								map.fitBounds(results1.getBounds());
							}
						});						
					}					
					//Si geometries tipus línies
					if(results.layerLine){
						var defer = $.Deferred();
//						readVisualitzacio(defer, results.visualitzacioLine, results.layerLine);
						loadVisualitzacioLayer(results.layerLine).then(function(results1){
							if(results1){
								map.fitBounds(results1.getBounds());
							}
						});						
					}
					//Si geometries tipus polygon
					if(results.layerPolygon){
						var defer = $.Deferred();
//						readVisualitzacio(defer, results.visualitzacioPolygon, results.layerPolygon);
						loadVisualitzacioLayer(results.layerPolygon).then(function(results1){
							if(results1){
								map.fitBounds(results1.getBounds());
							}
						});						
					}
					jQuery('#dialog_dades_ex').modal('toggle');	
					
				}else{
					var businessId = results.results.businessId;

					// crear el servidor WMS i agregarlo al mapa
					var data = {
						uid : $.cookie('uid'),
						businessId : businessId,
						mapBusinessId : url('?businessid'),
						serverName : nomCapa,//results.results.nom,
						serverType : 'tematic',
						calentas : false,
						activas : true,
						visibilitats : true,
						epsg : '4326',
						transparency : true,
						visibilitat : 'O'
					};
					createServidorInMap(data).then(function(results) {
						if (results.status == "OK") {

							_gaq.push(['_trackEvent', 'mapa', tipus_user+'dades externes', urlFile, 1]);
							//_kmq.push.push(['record', 'dades externes', {'from':'mapa', 'tipus user':tipus_user, 'url':urlFile,'mode':'no dinamiques'}]);
							
							results.results.urlFile = true;
							loadTematicLayer(results.results).then(function(results1){
								getRangsFromLayer(results1);
								if(results1){
									map.fitBounds(results1.getBounds());
								}
							});
//							jQuery('#div_url_file').removeClass('waiting_animation');
							jQuery('#dialog_dades_ex').modal('toggle');
							refrescaPopOverMevasDades();
						}
					});					
				}
			}else{
				console.debug("Error getUrlFile:"+results);
				processFileError(results);
			}			
			
		},function(results){
			console.debug("Error getUrlFile:"+results);
			processFileError(results);
		});
	}
}

function processFileError(data){
	
	var txt_error = window.lang.convert("Error durant el tractament de les dades");
	
	if(data.results.indexOf("CONVERT ERROR")!= -1){
		var txt_error = window.lang.convert("Error de conversió: format o EPSG incorrectes");
	}else if(data.results.indexOf("501")!= -1){//+ de 5000 punts
		txt_error += ": "+window.lang.convert("El número de punts supera el màxim permès. Redueixi a 5000 o menys i torni a intentar-ho");
	}else if(data.results.indexOf("502")!= -1){//+ de 1000 features
		txt_error += ": "+window.lang.convert("El número de línies/polígons supera el màxim permès. Redueixi a 1000 o menys i torni a intentar-ho");
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
	//var options = jQuery.parseJSON(layer.options);
	var options = JSON.parse(layer.options);
	var estil_do = options.estil_do;
	var style = options.style;
	var tipusFile = options.tipusFile;
	var geometryType = options.geometryType;
	var epsgIN = options.epsgIN;
	var colX = options.colX;
	var colY = options.colY;
	var urlFile = layer.url;
	var dinamic = options.dinamic;
//	var dinamic = false;
//	if(options.dinamic) dinamic = true;
	
//	var param_url = paramUrl.urlFile + "tipusFile=" + tipusFile+"&epsgIN="+epsgIN+"&dinamic="+dinamic+"&urlFile="+encodeURIComponent(urlFile);
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
		
	capaURLfileLoad.on('data:loaded', function(e){
		console.debug("capa loaded!");
		capaURLfileLoad.options = options;
		console.debug("capaURLfileLoad loaded");
		console.debug(capaURLfileLoad);
		if (layer.capesActiva== null || layer.capesActiva == 'null' || layer.capesActiva == true || layer.capesActiva == "true"){
			capaURLfileLoad.addTo(map);
		}

		console.debug("layer:");
		console.debug(layer);
//TODO control si no es capa origen!!!!		
		if (!layer.capesOrdre || layer.capesOrdre == null || layer.capesOrdre == 'null'){
			capaURLfileLoad.options.zIndex = controlCapes._lastZIndex + 1;
		}else if(layer.capesOrdre != capesOrdre_sublayer){
			capaURLfileLoad.options.zIndex = parseInt(layer.capesOrdre);
		}		
		
		console.debug(options);
		if(!options.origen){
			capaURLfileLoad.options.businessId = layer.businessId;
			controlCapes.addOverlay(capaURLfileLoad, layer.serverName, true);
			controlCapes._lastZIndex++;	
		}else{//Si te origen es una sublayer
			var origen = getLeafletIdFromBusinessId(options.origen);
			capaURLfileLoad.options.zIndex = capesOrdre_sublayer;
			controlCapes.addOverlay(capaURLfileLoad, layer.serverName, true, origen);
			defer.resolve();
		}		
		
	});
			console.debug("Fi loadURLFIle!");
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

//function replacer(key, value) {
//	console.debug(key);
//	console.debug(value);
//	
//	if (typeof value === 'number' || typeof value === 'boolean') return String(value);
//	else return value;
//}
