
function createHeatMap(capa){
	//Heatmap
	var arrP=[];
	capa.layer.eachLayer(function(layer){
		var d =[layer.getLatLng().lat,layer.getLatLng().lng,1];	
		arrP.push(d);			
	});
	
	var heatLayerActiu = L.heatLayer(arrP,{radius:20,blur:15,max:1,
		gradient: {			
			0.35: "#070751",
			0.40: "#0095DE",
			0.45: "#02D5FF",
			0.50: "#02E0B9",
			0.55: "#00B43F",
			0.60: "#97ED0E",
			0.61: "#FFF800",
			0.65: "#FF9700",
			0.70: "#FF0101",
			1: "#720404"
			}	
	});
	
	if(typeof url('?businessid') == "string"){
		//Si capa origen dades obertes, creem nova capa
		if(capa.layer.options.tipus == t_dades_obertes){
			data = {
					uid:$.cookie('uid'),
					mapBusinessId: url('?businessid'),
					serverName: capa.layer.options.nom+" heatmap",
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
		            options: '{"dataset":"'+capa.layer.options.dataset+'","tem":"'+tem_heatmap+'"}'
			};	
			
			createServidorInMap(data).then(function(results){
				if (results.status == "OK"){
					
					heatLayerActiu.options.businessId = results.results.businessId;
					heatLayerActiu.options.nom = capa.layer.options.nom+" heatmap";
					heatLayerActiu.options.tipus = t_dades_obertes;
					heatLayerActiu.options.tipusRang = tem_heatmap;
					
					map.addLayer(heatLayerActiu);
					heatLayerActiu.options.zIndex = controlCapes._lastZIndex+1;
					controlCapes.addOverlay(heatLayerActiu,	heatLayerActiu.options.nom, true);
					controlCapes._lastZIndex++;
					activaPanelCapes(true);
					
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
	            nom: capa.layer.options.nom+" heatmap",
	            calentas: false,           
	            activas: true,
	            visibilitats: true,	            
	            tipusRang: tem_heatmap,
	            rangs: rangs
	        }
			
			duplicateTematicLayer(data).then(function(results){
				if(results.status == 'OK'){
					
					heatLayerActiu.options.businessId = results.results.businessId;
					heatLayerActiu.options.nom = capa.layer.options.nom+" heatmap";
					heatLayerActiu.options.tipus = capa.layer.options.tipus;
					heatLayerActiu.options.tipusRang = tem_heatmap;

					map.addLayer(heatLayerActiu);
					heatLayerActiu.options.zIndex = controlCapes._lastZIndex+1;
					controlCapes.addOverlay(heatLayerActiu,	heatLayerActiu.options.nom, true);
					controlCapes._lastZIndex++;
					activaPanelCapes(true);
					
				}else{
					//TODO error
					console.debug("updateTematicRangs ERROR");					
				}
			},function(results){
				//TODO error
				console.debug("updateTematicRangs ERROR");
			});
		}

	}else{
		heatLayerActiu.options.businessId = -1;
		heatLayerActiu.options.nom = capa.layer.options.nom+" heatmap";
		heatLayerActiu.options.tipus = capa.layer.options.tipus;
		heatLayerActiu.options.tipusRang = tem_heatmap;
		
		map.addLayer(heatLayerActiu);
		heatLayerActiu.options.zIndex = controlCapes._lastZIndex+1;
		controlCapes.addOverlay(heatLayerActiu,	heatLayerActiu.options.nom, true);
		controlCapes._lastZIndex++;
		activaPanelCapes(true);
	}	
}

function loadDOHeatmapLayer(layer){
	console.debug(layer);
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
	
	capaDadaOberta.on('data:loaded', function(e){
		console.debug("data:loaded");
		
		var arrP=[];
		capaDadaOberta.eachLayer(function(layer){
			var d =[layer.getLatLng().lat,layer.getLatLng().lng,1];	
			arrP.push(d);			
		});
		
		var heatLayerActiu = L.heatLayer(arrP,{radius:20,blur:15,max:1,
			gradient: {			
				0.35: "#070751",
				0.40: "#0095DE",
				0.45: "#02D5FF",
				0.50: "#02E0B9",
				0.55: "#00B43F",
				0.60: "#97ED0E",
				0.61: "#FFF800",
				0.65: "#FF9700",
				0.70: "#FF0101",
				1: "#720404"
				}	
		});
		
		heatLayerActiu.options.businessId = layer.businessId;
		heatLayerActiu.options.nom = layer.serverName;
		heatLayerActiu.options.zIndex = parseInt(layer.capesOrdre);
		heatLayerActiu.options.tipus = layer.serverType;
		heatLayerActiu.options.tipusRang = tem_heatmap;
		
		map.addLayer(heatLayerActiu);
		controlCapes.addOverlay(heatLayerActiu,	heatLayerActiu.options.nom, true);
		controlCapes._lastZIndex++;
		activaPanelCapes(true);		
	});
}

function loadTematicHeatmap(layer, zIndex){
	
	var arrP=[];
	$.each(layer.geometries.features.features, function(i, feature) {
		var d =[feature.geometry.coordinates[0],feature.geometry.coordinates[1],1];	
		arrP.push(d);			
	});
	
	var heatLayerActiu = L.heatLayer(arrP,{radius:20,blur:15,max:1,
		gradient: {			
			0.35: "#070751",
			0.40: "#0095DE",
			0.45: "#02D5FF",
			0.50: "#02E0B9",
			0.55: "#00B43F",
			0.60: "#97ED0E",
			0.61: "#FFF800",
			0.65: "#FF9700",
			0.70: "#FF0101",
			1: "#720404"
			}	
	});	
	
	heatLayerActiu.options.businessId = layer.businessId;
	heatLayerActiu.options.nom = layer.nom;
	heatLayerActiu.options.zIndex = parseInt(zIndex);
	heatLayerActiu.options.tipus = t_tematic;
	heatLayerActiu.options.tipusRang = tem_heatmap;
	
	if (layer.capesActiva == true || layer.capesActiva == "true"){
		map.addLayer(heatLayerActiu);
	}	
	
	controlCapes.addOverlay(heatLayerActiu,	heatLayerActiu.options.nom, true);
	controlCapes._lastZIndex++;
	activaPanelCapes(true);		
	
}