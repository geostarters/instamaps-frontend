/**
 * 
 */

function createURLfileLayer(urlFile, tipusFile){
	
	var nomCapa = window.lang.translate("Capa URL fitxer ");
	nomCapa += tipusFile;
	var estil_do = retornaEstilaDO(t_url_file);
	
	if(typeof url('?businessid') == "string"){
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
            options: '{"tipusFile":"'+tipusFile+'","estil_do":{"radius":"'+estil_do.radius+'","fillColor":"'+estil_do.fillColor+'","color":"'+estil_do.color+'","weight":"'+estil_do.weight+'","opacity":"'+estil_do.opacity+'","fillOpacity":"'+estil_do.fillOpacity+'","isCanvas":"'+estil_do.isCanvas+'"}}'
		};
		tipusFile = t_file_topojson;
		createServidorInMap(data).then(function(results){
			if (results.status == "OK"){
//				urlFile = 'image_locations.geojson';
				if(tipusFile == t_file_geojson){
					var capaURLfile = omnivore.geojson(urlFile, null, L.FeatureGroup())
				    .on('ready', function() {
				    	constructLayer2(this, estil_do, nomCapa, results.results.businessId, urlFile, tipusFile);
				    })
				    .on('error', function() {
				    	console.debug("Error omnivore");
				    });
//				    .addTo(map);					
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
				
//				L.Proj.GeoJSON(capaURLfile.toGeoJSON()).addTo(map);
				
//				jQuery('#dialog_dades_ex').modal('toggle');					
//				capaURLfile.options.businessId = results.results.businessId;
//				capaURLfile.options.nom = nomCapa;
//				capaURLfile.options.tipus = t_url_file;
//				capaURLfile.options.url = urlFile;
//				capaURLfile.options.options = jQuery.parseJSON('{"tipusFile":"'+tipusFile+'"}');
//				capaURLfile.options.options.estil_do = estil_do;
//				capaURLfile.options.zIndex = controlCapes._lastZIndex+1; 
//				controlCapes.addOverlay(capaURLfile, nomCapa, true);
//				controlCapes._lastZIndex++;
//				activaPanelCapes(true);	
				
//				 map.fitBounds(capaURLfile.getBounds());
				
			}else{
				console.debug("Error omnivore llegint");
			}
		});
	}else{
		//usuari no logat, no entra mai
	}
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
		    		if(isValidValue(value) && !validateWkt(value)){
		    			if (key != 'name' && key != 'Name' && key != 'description' && key != 'id' && key != 'businessId' && key != 'slotd50'){
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
//		$(".layers-list").mCustomScrollbar({
//			   advanced:{
//			     autoScrollOnFocus: false,
//			     updateOnContentResize: true
//			   }           
//		});	
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
    		if(isValidValue(value) && !validateWkt(value)){
    			if (key != 'name' && key != 'Name' && key != 'description' && key != 'id' && key != 'businessId' && key != 'slotd50'){
    				html+='<div class="popup_data_row">';
    				var txt=value;

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
    	geom.bindPopup(html);
    	layer.removeLayer(marker);
    	layer.addLayer(geom);
    	
    });
}

function loadURLfileLayer(layer) {

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
