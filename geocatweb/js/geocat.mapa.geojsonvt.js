/**
 * 
 */

function loadGeojsonvtLayer(layer){
//	console.debug("loadGeojsonvtLayer:");
//	console.debug(layer);
	var options = jQuery.parseJSON( layer.options );
//	var estil_do = options.estil_do;
//	var tipusFile = options.tipusFile;
//	var epsgIN = options.epsgIN;
//	var urlFile = layer.url;
//	var dinamic = false;
//	if(options.dinamic) dinamic = true;
	
//	var options = {
//			url : layer.url
//	};
	
	var canvasTiles = L.tileLayer.geoJSON(options);	

	canvasTiles.options.businessId = layer.businessId;
	canvasTiles.options.nom = layer.serverName;
	canvasTiles.options.tipus = layer.serverType;
	canvasTiles.options.url =  layer.url;
	
//	capaURLfileLoad.on('data:loaded', function(e){
//		console.debug("capaURLfileLoad loaded");
	if (layer.capesActiva== null || layer.capesActiva == 'null' || layer.capesActiva == true || layer.capesActiva == "true"){
		canvasTiles.addTo(map);
		
		var topPane = map.getPanes().mapPane.getElementsByClassName("leaflet-top-pane");
//		if(!isValidValue(topPane)){
		if(topPane.length <= 0){
			topPane = L.DomUtil.create('div', 'leaflet-top-pane', map.getPanes().mapPane);
		}
		$("div.leaflet-top-pane").append(canvasTiles.getContainer());
//		topPane.appendChild(canvasTiles.getContainer());
		canvasTiles.setZIndex(4);
		
//		console.debug("info map:");
//		console.debug(map._getMapPanePos());
//		console.debug("map.getPanes():");
//		console.debug(map.getPanes());
		
		
	}
			
	if (!layer.capesOrdre || layer.capesOrdre == null || layer.capesOrdre == 'null'){
		canvasTiles.options.zIndex = controlCapes._lastZIndex + 1;
	}else{
		canvasTiles.options.zIndex = parseInt(layer.capesOrdre);
	}		
	
	controlCapes.addOverlay(canvasTiles, layer.serverName, true);
	controlCapes._lastZIndex++;	
	
	console.debug("canvasTiles:");
	console.debug(canvasTiles);
//	});
			
}