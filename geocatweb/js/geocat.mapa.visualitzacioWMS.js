/**
 * 
 */

function loadVisualitzacioWmsLayer(layer){
	
//	console.debug("loadVisualitzacioWmsLayer");
//	console.debug(layer);
	
	var optionsWMS = {
	        layers : layer.businessId,
	        crs : L.CRS.EPSG4326,
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
	var wmsLayer = new L.tileLayer.betterWms(layer.url, optionsWMS);

	var optionsUtfGrid = {
            layers : layer.businessId,
            crs : L.CRS.EPSG4326,
            srs: "EPSG:4326",
            transparent : true,
            format : 'utfgrid',
            nom : layer.serverName + " utfgrid",
	    	tipus: layer.serverType,
	    	//zIndex :  parseInt(layer.capesOrdre),	    
	    	businessId: layer.businessId            
	}
	var utfGridLayer = createUtfGridLayer(layer.url,optionsUtfGrid);
	
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
							(isBlank(txt)?window.lang.convert("Sense valor"):txt)+
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

function createUtfGridLayer(url,options){

	var utfGrid = new L.UtfGrid(url,options);

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
						
						var txt = parseUrlTextPopUp(String(value), key);
						if(txt.indexOf("iframe")==-1 && txt.indexOf("img")==-1){
							html+='<div class="popup_data_key">'+key+'</div>';
							html+='<div class="popup_data_value">'+
							(isBlank(txt)?window.lang.convert("Sense valor"):txt)+
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
			
		}else{
			console.debug("null");
		}
	});	
	
	return utfGrid;
}