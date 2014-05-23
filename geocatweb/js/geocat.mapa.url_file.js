/**
 * 
 */

function createURLfileLayer(urlFile, tipusFile, epsgIN){
	
	jQuery('#div_url_file').addClass('waiting_animation');
	
//	var nomCapa = window.lang.convert("Capa URL fitxer ");
	var nomCapa = jQuery("#input-url-file-name").val();
	nomCapa += tipusFile;
	var estil_do = retornaEstilaDO(t_url_file);
	
	var param_url = paramUrl.urlFile + "tipusFile=" + tipusFile+"&urlFile="+urlFile+"&epsgIN="+epsgIN;
	
	var capaURLfile = new L.GeoJSON.AJAX(param_url, {
//		onEachFeature : popUp,
		nom : nomCapa,
		tipus : t_url_file,
//		dataset: dataset,
		estil_do: estil_do,
		businessId : '-1',
		dataType : "jsonp",
//		zIndex: lastZIndex,
//		geometryType:t_marker,//TODO QUINA GEOMETRY TYPE!!!
		pointToLayer : function(feature, latlng) {
			  
			var geometryType = transformTipusGeometry(feature.geometry.type);
			if(geometryType == t_marker){
				var geom = L.circleMarker(latlng, estil_do);
			}else if(geometryType == t_polyline){
				var geom = L.polyline(latlng, {color: estil_do.fillColor, weight: "3", opacity: "1"});
			}else if(geometryType == t_polygon){
				var geom = L.polygon(latlng, {color: estil_do.color, fillColor: estil_do.fillColor, fillOpacity: estil_do.fillOpacity, weight: estil_do.weight});
			}
	    	    	
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

//	    	feature.geometry.coordinates[0]=latlng.lat;
//		  	feature.geometry.coordinates[1]=latlng.lng;
		    return geom.bindPopup(html);
		  }
//	,
//		  success: function(results){
//			  console.debug(results);
//		  },
//		  fail: function(results){
//			  console.debug(results);
//		  }
	});
	


	L.Util.jsonp(param_url).then(function(data){
		
		capaURLfile.on('data:loaded', function(e){	
		
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
		            options: '{"tipusFile":"'+tipusFile+'","epsgIN":"'+epsgIN+'","estil_do":{"radius":"'+estil_do.radius+'","fillColor":"'+estil_do.fillColor+'","color":"'+estil_do.color+'","weight":"'+estil_do.weight+'","opacity":"'+estil_do.opacity+'","fillOpacity":"'+estil_do.fillOpacity+'","isCanvas":"'+estil_do.isCanvas+'"}}'
				};
				
				createServidorInMap(data).then(function(results){
					if (results.status == "OK"){
						
						jQuery('#dialog_dades_ex').modal('toggle');					
						capaURLfile.options.businessId = results.results.businessId;
						capaURLfile.options.nom = nomCapa;
						capaURLfile.options.tipus = t_url_file;
						capaURLfile.options.url = urlFile;
						capaURLfile.options.options = jQuery.parseJSON('{"tipusFile":"'+tipusFile+'"}');
						capaURLfile.options.options.estil_do = estil_do;
						capaURLfile.options.zIndex = controlCapes._lastZIndex+1; 
						controlCapes.addOverlay(capaURLfile, nomCapa, true);
						controlCapes._lastZIndex++;
						activaPanelCapes(true);	
						
		//				 map.fitBounds(capaURLfile.getBounds());
						
					}else{
						console.debug("Error omnivore llegint");
					}
				});
			}else{
				//usuari no logat, no entra mai
			}
		});		
		jQuery('#div_url_file').removeClass('waiting_animation');
	},function(data){
		if(data.results.indexOf("CONVERT ERROR")!= -1){
			var txt_error = window.lang.convert("Error de conversió: format o EPSG incorrectes");
			jQuery("#div_url_file_message").html(txt_error);
		}
		else{
			var txt_error = window.lang.convert("Error durant el tractament del fitxer");
			jQuery("#div_url_file_message").html(txt_error);
		}
		jQuery('#div_url_file').removeClass('waiting_animation');
		jQuery("#div_url_file_message").show();
	});
	
}

function loadURLfileLayer(layer){
	var options = jQuery.parseJSON( layer.options );
	var estil_do = options.estil_do;
	var tipusFile = options.tipusFile;
	var epsgIN = options.epsgIN;
	var urlFile = layer.url;
	
	var param_url = paramUrl.urlFile + "tipusFile=" + tipusFile+"&urlFile="+urlFile+"&epsgIN="+epsgIN;
	
	var capaURLfileLoad = new L.GeoJSON.AJAX(param_url, {
//		onEachFeature : popUp,
		nom : layer.serverName,
		tipus : layer.serverType,
		estil_do: estil_do,
		businessId : layer.businessId,
		dataType : "jsonp",
		pointToLayer : function(feature, latlng) {
			  
			var geometryType = transformTipusGeometry(feature.geometry.type);
			if(geometryType == t_marker){
				var geom = L.circleMarker(latlng, estil_do);
			}else if(geometryType == t_polyline){
				var geom = L.polyline(latlng, {color: estil_do.fillColor, weight: "3", opacity: "1"});
			}else if(geometryType == t_polygon){
				var geom = L.polygon(latlng, {color: estil_do.color, fillColor: estil_do.fillColor, fillOpacity: estil_do.fillOpacity, weight: estil_do.weight});
			}
	    	    	
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
	    	
//	    	feature.geometry.coordinates[0]=latlng.lat;
//		  	feature.geometry.coordinates[1]=latlng.lng;
		    return geom.bindPopup(popup);
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

function constructLayer2(capaURLfile, estil_do, nomCapa, businessId, urlFile, tipusFile){
	
	var geojsonLayer = capaURLfile.toGeoJSON();
	geojsonLayer.crs = capaURLfile.options;	
//	geojsonLayer.crs = {
//			type: 'name',
//		    properties: {
//		        'name': 'urn:ogc:def:crs:EPSG::25831'
//		      }				    			
//	};
	
	var layer = L.Proj.geoJson(geojsonLayer, {
		  'pointToLayer': function(feature, latlng) {
			  
				var geometryType = transformTipusGeometry(feature.geometry.type);
				if(geometryType == t_marker){
					var geom = L.circleMarker(latlng, estil_do);
				}else if(geometryType == t_polyline){
					var geom = L.polyline(latlng, {color: estil_do.fillColor, weight: "3", opacity: "1"});
				}else if(geometryType == t_polygon){
					var geom = L.polygon(latlng, {color: estil_do.color, fillColor: estil_do.fillColor, fillOpacity: estil_do.fillOpacity, weight: estil_do.weight});
				}
		    	    	
		    	var pp = feature.properties;
		    	var html ='<div class="div_popup_visor"><div class="popup_pres">';
		    	$.each( pp, function( key, value ) {
					html+='<div class="popup_data_row">'+
					'<div class="popup_data_key">'+key+'</div>'+
				    '<div class="popup_data_value">'+value+'</div>'+
				    '</div>';
		    	});	
		    	html+='</div></div>';    	
//		    					    			  
//			  
			  	feature.geometry.coordinates[0]=latlng.lat;
			  	feature.geometry.coordinates[1]=latlng.lng;
    		    return geom.bindPopup(html);
    		  }
    		}).addTo(map);	
		
		jQuery('#dialog_dades_ex').modal('toggle');					
		layer.options.businessId = businessId;
		layer.options.nom = nomCapa;
		layer.options.tipus = t_url_file;
		layer.options.url = urlFile;
		layer.options.options = jQuery.parseJSON('{"tipusFile":"'+tipusFile+'"}');
		layer.options.options.estil_do = estil_do;
		layer.options.zIndex = controlCapes._lastZIndex+1; 
		controlCapes.addOverlay(layer, nomCapa, true);
		controlCapes._lastZIndex++;
		activaPanelCapes(true);	
		
//		 map.fitBounds(capaURLfile.getBounds());		
		
	
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
