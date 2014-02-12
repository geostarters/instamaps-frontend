

function creaClusterMap(capa){
	
	
	var markers = L.markerClusterGroup({singleMarkerMode:true,
		spiderfyOnMaxZoom: false,
		showCoverageOnHover: false,
		zoomToBoundsOnClick: false});
	//_popup._content
	//_leaflet_id
	capa.layer.eachLayer(function(layer){
		
		//var d =[layer.getLatLng().lat,layer.getLatLng().lng,1];	
		//arrP.push(d);		
		console.info(layer);
		var marker = L.marker(new L.LatLng(layer.getLatLng().lat, layer.getLatLng().lng), { title: layer._leaflet_id });
		marker.bindPopup(layer._popup._content);
		markers.addLayer(marker);
			
		});
	
	map.addLayer(markers);
	
	
	
	/*
	for (var i = 0; i < addressPoints.length; i++) {
		var a = addressPoints[i];
		var title = a[2];
		var marker = L.marker(new L.LatLng(a[0], a[1]), { title: title });
		marker.bindPopup(title);
		markers.addLayer(marker);
	}

	map.addLayer(markers);
	
	*/
	
	
}