

function creaClusterMap(capa){
	
	
	var clusterLayer = L.markerClusterGroup(
			
	{singleMarkerMode:true}
	);
	//{singleMarkerMode:true,spiderfyOnMaxZoom: true,showCoverageOnHover: true,zoomToBoundsOnClick: false}
	capa.layer.eachLayer(function(layer){
		

		
		var marker = L.marker(new L.LatLng(layer.getLatLng().lat, layer.getLatLng().lng),
				{ title: layer._leaflet_id });
		marker.bindPopup(layer._popup._content);
		clusterLayer.addLayer(marker);
			
		});
	
	
	
	clusterLayer.options.businessId ='-1';
	clusterLayer.options.nom = capa.layer.options.nom+"_cluster";
	clusterLayer.options.zIndex = controlCapes._lastZIndex+1;
	clusterLayer.options.tipus = 'cluster';
	clusterLayer.options.capaOrigen=capa.layer.options.businessId;
	
	
		


	map.addLayer(clusterLayer);
		controlCapes.addOverlay(clusterLayer,
				clusterLayer.options.nom, true);
		
		
		
		activaPanelCapes(true);
	
	map.removeLayer(capa.layer);
	

	
		
	
}