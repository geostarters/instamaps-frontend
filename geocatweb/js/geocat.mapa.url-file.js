/**
 * 
 */

function createURLfileLayer(urlFile, tipusFile, epsgIN, dinamic, nomCapa){

	var estil_do = retornaEstilaDO(t_url_file);
	
	if(dinamic){
		
		var param_url = paramUrl.urlFile	+ "tipusFile=" + tipusFile+
											 "&urlFile="+urlFile+
											 "&epsgIN="+epsgIN+
											 "&dinamic="+dinamic+
											 "&uploadFile="+paramUrl.uploadFile+
											 "&uid="+$.cookie('uid');		
		
		var capaURLfile = new L.GeoJSON.AJAX(param_url, {
			nom : nomCapa,
			tipus : t_url_file,
			estil_do: estil_do,
			style: estil_do,//Estil de poligons i linies
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
					            options: '{"tipusFile":"'+tipusFile+'","epsgIN":"'+epsgIN+'","dinamic":"'+dinamic+'","estil_do":{"radius":"'+estil_do.radius+'","fillColor":"'+estil_do.fillColor+'","color":"'+estil_do.color+'","weight":"'+estil_do.weight+'","opacity":"'+estil_do.opacity+'","fillOpacity":"'+estil_do.fillOpacity+'","isCanvas":"'+estil_do.isCanvas+'"}}'
							};
							
							createServidorInMap(data).then(function(results){
									if (results.status == "OK"){
										
										_gaq.push(['_trackEvent', 'mapa', tipus_user+'dades externes dinamiques', urlFile, 1]);
										
										jQuery('#dialog_dades_ex').modal('toggle');					
										capaURLfile.options.businessId = results.results.businessId;
										capaURLfile.options.nom = nomCapa;
										capaURLfile.options.tipus = t_url_file;
										capaURLfile.options.url = urlFile;
										capaURLfile.options.options = jQuery.parseJSON('{"tipusFile":"'+tipusFile+'"}');
										capaURLfile.options.options.estil_do = estil_do;
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
			 tipusFile: tipusFile,
			 urlFile: urlFile,
			 epsgIN: epsgIN,
			 dinamic: dinamic,
			 uploadFile: paramUrl.uploadFile,
			 uid: $.cookie('uid')
		}

		getUrlFile(data).then(function(results){
			
			if (results.status == "OK") {

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
						
						results.results.urlFile = true;
						loadTematicLayer(results.results).then(function(results1){
							getRangsFromLayer(results1);
							if(results1){
								map.fitBounds(results1.getBounds());
							}
						});
//						jQuery('#div_url_file').removeClass('waiting_animation');
						jQuery('#dialog_dades_ex').modal('toggle');
						refrescaPopOverMevasDades();
					}
				});
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
	
	jQuery("#div_url_file_message").html(txt_error);
//	jQuery('#div_url_file').removeClass('waiting_animation');
	jQuery("#div_url_file_message").show();
}

function loadURLfileLayer(layer){
	var options = jQuery.parseJSON( layer.options );
	var estil_do = options.estil_do;
	var tipusFile = options.tipusFile;
	var epsgIN = options.epsgIN;
	var urlFile = layer.url;
	var dinamic = false;
	if(options.dinamic) dinamic = true;
	
	var param_url = paramUrl.urlFile + "tipusFile=" + tipusFile+"&urlFile="+urlFile+"&epsgIN="+epsgIN+"&dinamic="+dinamic;
	
	var capaURLfileLoad = new L.GeoJSON.AJAX(param_url, {
		nom : layer.serverName,
		tipus : layer.serverType,
		estil_do: estil_do,
		style: estil_do,
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
		
		console.debug("capaURLfileLoad loaded");
		if (layer.capesActiva== null || layer.capesActiva == 'null' || layer.capesActiva == true || layer.capesActiva == "true"){
			capaURLfileLoad.addTo(map);
		}
				
		if (!layer.capesOrdre || layer.capesOrdre == null || layer.capesOrdre == 'null'){
			capaURLfileLoad.options.zIndex = controlCapes._lastZIndex + 1;
		}else{
			capaURLfileLoad.options.zIndex = parseInt(layer.capesOrdre);
		}		
		
		controlCapes.addOverlay(capaURLfileLoad, layer.serverName, true);
		controlCapes._lastZIndex++;		
		
	});
			
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
