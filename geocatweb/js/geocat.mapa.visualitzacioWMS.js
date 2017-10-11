/**
 * 
 */

 function createOptionsUtfGrid(layer, jsonOptions) {

 	return {
            layers : layer.businessId,
            crs : L.CRS.EPSG4326,
            srs: "EPSG:4326",
            transparent : true,
            format : 'utfgrid',
            nom : (layer.serverName ? layer.serverName : layer.nom) + " utfgrid",
	    	tipus: layer.serverType,
	    	group: jsonOptions.group,  
	    	businessId: layer.businessId            
	}

 }

function loadVisualitzacioWmsLayer(layer){
	
//	console.debug("loadVisualitzacioWmsLayer");
//	console.debug(layer);
	
	var jsonOptions;	
	
	if(typeof (layer.options)=="string"){
		try {
			jsonOptions = JSON.parse(layer.options);
		}
		catch (err) {
			jsonOptions = layer.options;	
		}
	}else{
		
		jsonOptions = layer.options;	
	}
	
	
	var optionsWMS = {
	        layers : layer.businessId,
	        crs : L.CRS.EPSG3857,
	        transparent : true,
	        format : layer.imgFormat,//'image/png'
	    	version: layer.version,
	    	tileSize:512,
	        opacity: layer.opacity,	    
	    	nom : layer.serverName,
	    	tipus: layer.serverType,
	    	zIndex :  parseInt(layer.capesOrdre),
	    	group: jsonOptions.group,
	    	businessId: layer.businessId	        	
	}
	var url = layer.url;
	if (url.indexOf("http://www.instamaps.cat")>-1) url = url.replace("http","https");
	
	var wmsLayer = new L.tileLayer.betterWms(url, optionsWMS);

	var optionsUtfGrid = createOptionsUtfGrid(layer, jsonOptions);
	var utfGridLayer = createUtfGridLayer(url,optionsUtfGrid, false);
	
//	var utfGrid = new L.UtfGrid(layer.url,optionsUtfGrid);
	//Mostrar informacio
	/*
	utfGrid.on('mouseover', function (e) {});
	utfGrid.on('mouseout', function (e) {});

	utfGrid.on('click', function (e) {
		if (e.data!=null){
			console.debug(e.data);
			
			jQuery('#bt_info_geojsonvt_close').on('click', function (e) {
//				tancaFinestra();
				jQuery('#info_geojsonvt .div_popup_visor').html('');
				jQuery('#info_geojsonvt').hide();
			});
			
			var html ='';
			html+='<div class="popup_pres">';
			$.each( e.data, function( key, value ) {
				console.debug( key + ": " + value );
				console.debug("key : data");
				console.debug(key);
				console.debug(data);
				if(key.indexOf("slot")==-1 && value!=undefined && value!=null && value != " "){
					if (key != 'id' && key != 'businessId' && key != 'slotd50'){
						html+='<div class="popup_data_row">';
						
						var txt = parseUrlTextPopUp(String(value), key);
						if(txt.indexOf("iframe")==-1 && txt.indexOf("img")==-1){
							html+='<div class="popup_data_key">'+key+'</div>';
							html+='<div class="popup_data_value">'+
							(isBlank(txt)?window.lang.translate("Sense valor"):txt)+
							'</div>';
						}else{
							html+='<div class="popup_data_img_iframe">'+txt+'</div>';
						}
						html+= '</div>';
					}
				}
			});
			html+= '</div>';
			
			//var html = '<p>Hello world!<br />This is a nice popup.</p>';
			jQuery('#info_geojsonvt .div_popup_visor').html(html);
			jQuery('#info_geojsonvt').show();
			console.debug("html:");
			console.debug(html);
			
		}else{
			console.debug("null");
		}
	});
	*/	
	
	if (!layer.capesActiva || layer.capesActiva == true || layer.capesActiva == "true"){
		map.addLayer(wmsLayer).addLayer(utfGridLayer);
		wmsLayer.options.utfGridLeafletId = utfGridLayer._leaflet_id; 
	}
	
	if (!layer.capesOrdre){
		wmsLayer.options.zIndex = controlCapes._lastZIndex + 1;
	}else{
		wmsLayer.options.zIndex = parseInt(layer.capesOrdre);
	}
	controlCapes.addOverlay(wmsLayer, wmsLayer.options.nom, true);
	controlCapes._lastZIndex++;	
}

function loadVisualitzacioWmsLayerSenseUtfGrid(layer){
	var defer = $.Deferred();
	var optionsWMS = {
	        layers : layer.serverName,
	        crs : L.CRS.EPSG3857,
	        transparent : true,
	        format : layer.imgFormat,//'image/png'
	    	version: layer.version,
	    	tileSize:512,
	    	//    opacity: layer.opacity,	    
	    	nom : layer.serverName,
	    	tipus: layer.serverType,
	    	zIndex :  parseInt(layer.capesOrdre),	    
	    	businessId: layer.businessId	        	
	}
	var url = layer.url;
	if (url.indexOf("http://www.instamaps.cat")>-1) url = url.replace("http","https");
	var wmsLayer =L.tileLayer.betterWms(url, optionsWMS);
	map.addLayer(wmsLayer);
	
	var jsonOptions;
	if(typeof (layer.options)=="string"){
		try {
			jsonOptions = JSON.parse(layer.options);
		}
		catch (err) {
			jsonOptions = layer.options;	
		}
	}else{		
		jsonOptions = layer.options;	
	}	
	
	var origen = getLeafletIdFromBusinessId(jsonOptions.origen);
    wmsLayer.options.zIndex = capesOrdre_sublayer;
	controlCapes.addOverlay(wmsLayer, wmsLayer.options.nom, true,origen);
	defer.resolve();
	
}

function createUtfGridLayer(url,options, isClickable){

	var utfGrid = new L.UtfGrid(url,options);
	var clickable = (undefined !== isClickable && isClickable);
	if(clickable)
	{

		utfGrid.on('click', function (e) {
			if (e.data!=null){
	//			console.debug(e.data);
				
				jQuery('#bt_info_geojsonvt_close').on('click', function (e) {
	//				tancaFinestra();
					jQuery('#info_geojsonvt .div_popup_visor').html('');
					jQuery('#info_geojsonvt').hide();
				});
				
				var html ='';
				html+='<div class="popup_pres">';
				$.each( e.data, function( key, value ) {
	//				console.debug( key + ": " + value );
					if(key.indexOf("slot")==-1 && value!=undefined && value!=null && value != " "){
						//treiem caracter '_' del nom de la propietat
						key = key.replace('_', ' ');
						if (key != 'id' && key != 'businessId' && key != 'slotd50'){
							html+='<div class="popup_data_row width100">';
							
							var txt = value;
		    				if (!$.isNumeric(txt) && !validateWkt(value)){	    				
			    				txt = parseUrlTextPopUp(value,key);
			    				if(txt.indexOf("iframe")==-1 && txt.indexOf("img")==-1){
			    					html+='<div class="popup_data_key">'+key+'</div>';
			    					html+='<div class="popup_data_value">'+
									(isBlank(txt)?window.lang.translate("Sense valor"):txt)+
									'</div>';
			    				}else{
			    					html+='<div class="popup_data_img_iframe">'+txt+'</div>';
			    				}
		    				}
		    				else {
		    					html+='<div class="popup_data_key">'+key+'</div>';
		    					html+='<div class="popup_data_value">'+
									(isBlank(txt)?window.lang.translate("Sense valor"):txt)+
									'</div>';
		    				}
							html+= '</div>';
						}
					}
				});
				html+= '</div>';
				
				//var html = '<p>Hello world!<br />This is a nice popup.</p>';
				jQuery('#info_geojsonvt .div_popup_visor').html(html);
				jQuery('#info_geojsonvt').show();
				
			}else{
				console.debug("null");
			}
		});

	}
	else
	{

		utfGrid.off('click');

	}
	
	return utfGrid;
}