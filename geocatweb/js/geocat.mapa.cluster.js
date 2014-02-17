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
		            options: '{"dataset":"'+capa.layer.options.dataset+'","tem":"'+tem_cluster+'"}'
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

					map.addLayer(clusterLayer);
					clusterLayer.options.zIndex = controlCapes._lastZIndex + 1;
					controlCapes.addOverlay(clusterLayer, clusterLayer.options.nom, true);
					controlCapes._lastZIndex++;
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
	            tipusRang: tem_cluster,
	            rangs: rangs
	        }
			
			updateTematicRangs(data).then(function(results){
				if(results.status == 'OK'){
					
//					var clusterLayer = L.markerClusterGroup({
//						singleMarkerMode : true
//					});
					
					capa.layer.eachLayer(function(layer) {
						var marker = L.marker(new L.LatLng(layer.getLatLng().lat, layer.getLatLng().lng), {
							title : layer._leaflet_id
						});
						marker.bindPopup("<b>"+layer.properties.name+"</b><br><b>"+layer.properties.description+"</b>");
						clusterLayer.addLayer(marker);
					});
					
					clusterLayer.options.businessId = capa.layer.options.businessId;
					clusterLayer.options.nom = capa.layer.options.nom;
					clusterLayer.options.zIndex = capa.layer.options.zIndex;
					clusterLayer.options.tipus = capa.layer.options.tipus;

					map.addLayer(clusterLayer);
					map.removeLayer(capa.layer);
					controlCapes.removeLayer(capa.layer);
//					controlCapes._lastZIndex--;
					controlCapes.addOverlay(clusterLayer, clusterLayer.options.nom, true);	
					
					//Actualitzem capaUsrActiva
					if(capaUsrActiva!=null && capaUsrActiva.options.businessId == capa.layer.options.businessId){
						capaUsrActiva.removeEventListener('layeradd');
						capaUsrActiva = null;
					}					
					
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
		clusterLayer.options.capaOrigen = capa.layer.options.businessId;

		map.addLayer(clusterLayer);
		clusterLayer.options.zIndex = controlCapes._lastZIndex + 1;
		controlCapes.addOverlay(clusterLayer, clusterLayer.options.nom, true);
		controlCapes._lastZIndex++;
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

		map.addLayer(clusterLayer);
		controlCapes.addOverlay(clusterLayer, clusterLayer.options.nom, true);
		controlCapes._lastZIndex++;
		activaPanelCapes(true);		
		
	});	
	
}
