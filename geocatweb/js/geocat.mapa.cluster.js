function creaClusterMap(capa) {

	var clusterLayer = L.markerClusterGroup({
		singleMarkerMode : true
	});
	
	if(typeof url('?businessid') == "string"){
		var data;
		//Si capa origen dades obertes, creem nova capa
		if(capa.layer.options.tipus == t_dades_obertes){
			
			data = {
					uid:$.cookie('uid'),
					mapBusinessId: url('?businessid'),
					serverName: capa.layer.options.nom+" cluster",
					serverType: t_dades_obertes,
					calentas: false,
		            activas: true,
		            visibilitats: true,
		            order: capesOrdre_sublayer,
		            epsg: '4326',
		            imgFormat: 'image/png',
		            infFormat: 'text/html',
		            tiles: true,	            
		            transparency: true,
		            opacity: 1,
		            visibilitat: 'O',
		            calentas: false,
		            activas: true,
		            visibilitats: true,
		            options: '{"dataset":"'+capa.layer.options.dataset+'","tem":"'+tem_cluster+'","origen":"'+capa.layer.options.businessId+'"}'
			};	
			
			createServidorInMap(data).then(function(results){
				if (results.status == "OK"){
					
					capa.layer.eachLayer(function(layer) {
						var marker = L.marker(new L.LatLng(layer.getLatLng().lat, layer.getLatLng().lng), {
							title : layer._leaflet_id
						});
						marker.bindPopup(layer._popup._content);
						clusterLayer.addLayer(marker);
					});					
					
					clusterLayer.options.businessId = results.results.businessId;
					clusterLayer.options.nom = capa.layer.options.nom + " cluster";
					clusterLayer.options.tipus = t_dades_obertes;
					clusterLayer.options.tipusRang = tem_cluster;

					map.addLayer(clusterLayer);
					clusterLayer.options.zIndex = capesOrdre_sublayer;//controlCapes._lastZIndex + 1;
					controlCapes.addOverlay(clusterLayer, clusterLayer.options.nom, true, capa.layer._leaflet_id);
//					controlCapes._lastZIndex++;
					activaPanelCapes(true);

//					map.removeLayer(capa.layer);
				}else{
					console.debug('error create server in map');
				}
			});				
			
		//Si no, es que es de tipus tematic	
		}else{
			var rangs = JSON.stringify({rangs:[{}]});			
			var data = {
		            businessId: capa.layer.options.businessId,
		            uid: $.cookie('uid'),
		            mapBusinessId: url('?businessid'),	           
		            nom: capa.layer.options.nom+" cluster",
		            calentas: false,           
		            activas: true,
		            order: capesOrdre_sublayer,
		            visibilitats: true,
		            tipusRang: tem_cluster,
		            rangs: rangs
		        }
			
			duplicateTematicLayer(data).then(function(results){
				if(results.status == 'OK'){
					
					capa.layer.eachLayer(function(layer) {
						var marker = L.marker(new L.LatLng(layer.getLatLng().lat, layer.getLatLng().lng), {
							title : layer._leaflet_id
						});
						marker.bindPopup("<b>"+layer.properties.nom+"</b><br><b>"+layer.properties.text+"</b>");
						clusterLayer.addLayer(marker);
					});
					
					clusterLayer.options.businessId = results.results.businessId;
					clusterLayer.options.nom = capa.layer.options.nom +" cluster";
					clusterLayer.options.tipus = capa.layer.options.tipus;
					clusterLayer.options.tipusRang = tem_cluster;
					
					map.addLayer(clusterLayer);
					clusterLayer.options.zIndex = capesOrdre_sublayer; //controlCapes._lastZIndex+1;
					controlCapes.addOverlay(clusterLayer,	clusterLayer.options.nom, true, capa.layer._leaflet_id);
//					controlCapes._lastZIndex++;
					activaPanelCapes(true);					
					
				}else{
					//TODO error
					conosle.debug("updateTematicRangs ERROR");					
				}
			},function(results){
				//TODO error
				console.debug("updateTematicRangs ERROR");
			});
		}

	}else{
		
		clusterLayer.options.businessId = '-1';
		clusterLayer.options.nom = capa.layer.options.nom + " cluster";
		clusterLayer.options.tipus = capa.layer.options.tipus;
		clusterLayer.options.tipusRang = tem_cluster;

		map.addLayer(clusterLayer);
		clusterLayer.options.zIndex = capesOrdre_sublayer; //controlCapes._lastZIndex + 1;
		controlCapes.addOverlay(clusterLayer, clusterLayer.options.nom, true, capa.layer._leaflet_id);
//		controlCapes._lastZIndex++;
		activaPanelCapes(true);
	}	
}

function loadDadesObertesClusterLayer(layer){
	var options = jQuery.parseJSON( layer.options );
	var estil_do = retornaEstilaDO(options.dataset);
	var url_param = paramUrl.dadesObertes + "dataset=" + options.dataset;	
	
	var capaDadaOberta = new L.GeoJSON.AJAX(url_param, {
		onEachFeature : popUp,
		nom : layer.serverName,
		tipus : layer.serverType,
		dataset: options.dataset,
		businessId : layer.businessId,
		dataType : "jsonp",
		zIndex: parseInt(layer.capesOrdre),
		pointToLayer : function(feature, latlng) {
			return L.circleMarker(latlng, estil_do);
		}	
	});
	
//	map.addLayer(capaDadaOberta);
	capaDadaOberta.on('data:loaded', function(e){
		console.debug("data:loaded");
		map.removeLayer(capaDadaOberta);
		var clusterLayer = L.markerClusterGroup({
			singleMarkerMode : true
		});
		
		capaDadaOberta.eachLayer(function(layer) {
			var marker = L.marker(new L.LatLng(layer.getLatLng().lat, layer.getLatLng().lng), {
				title : layer._leaflet_id
			});
			marker.bindPopup(layer._popup._content);
			clusterLayer.addLayer(marker);
		});	
		
		clusterLayer.options.businessId = layer.businessId;
		clusterLayer.options.nom = layer.serverName;
		clusterLayer.options.zIndex = parseInt(layer.capesOrdre);
		clusterLayer.options.tipus = layer.serverType;
		clusterLayer.options.dataset = options.dataset;
		clusterLayer.options.tipusRang = tem_cluster;

		map.addLayer(clusterLayer);
		var origen = getLeafletIdFromBusinessId(options.origen);
		controlCapes.addOverlay(clusterLayer, clusterLayer.options.nom, true, origen);
//		controlCapes._lastZIndex++;
		activaPanelCapes(true);		
		
	});	
}

function loadTematicCluster(layer, zIndex, layerOptions){
	
	var options = jQuery.parseJSON(layerOptions);
	
	var clusterLayer = L.markerClusterGroup({
		singleMarkerMode : true
	});	
	
	$.each(layer.geometries.features.features, function(i, feature) {
		var marker = L.marker(new L.LatLng(feature.geometry.coordinates[0],feature.geometry.coordinates[1]), {
			//title : layer._leaflet_id
		});
		marker.bindPopup("<b>"+feature.properties.nom+"</b><br><b>"+feature.properties.text+"</b>");
		clusterLayer.addLayer(marker);
	});
	
	clusterLayer.options.businessId = layer.businessId;
	clusterLayer.options.nom =layer.nom;
	clusterLayer.options.zIndex = parseInt(zIndex);
	clusterLayer.options.tipus = t_tematic;
	clusterLayer.options.tipusRang = tem_cluster;
	
	if (layer.capesActiva == true || layer.capesActiva == "true"){
		map.addLayer(clusterLayer);
	}		
	var origen = getLeafletIdFromBusinessId(options.origen);
	controlCapes.addOverlay(clusterLayer,	clusterLayer.options.nom, true, origen);
//	controlCapes._lastZIndex++;
	activaPanelCapes(true);		
}
