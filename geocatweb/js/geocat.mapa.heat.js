
function createHeatMap(capa){
	
	_gaq.push(['_trackEvent', 'mapa', 'estils', 'heatmap', tipus_user]);	
	
	var nom = window.lang.convert("Concentració");
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
					serverName: capa.layer.options.nom+" "+nom,
					serverType: t_dades_obertes,
					calentas: false,
		            activas: true,
		            order: capesOrdre_sublayer,
		            visibilitats: true,
		            epsg: '4326',
		            imgFormat: 'image/png',
		            infFormat: 'text/html',
		            tiles: true,	            
		            transparency: true,
		            opacity: 1,
		            visibilitat: 'O',
		            options: '{"dataset":"'+capa.layer.options.dataset+'","tem":"'+tem_heatmap+'","origen":"'+capa.layer.options.businessId+'"}'
			};	
			
			createServidorInMap(data).then(function(results){
				if (results.status == "OK"){
					
					heatLayerActiu.options.businessId = results.results.businessId;
					
					heatLayerActiu.options.nom = capa.layer.options.nom+" "+nom;
					heatLayerActiu.options.tipus = t_dades_obertes;
					heatLayerActiu.options.tipusRang = tem_heatmap;
					
					map.addLayer(heatLayerActiu);
					heatLayerActiu.options.zIndex = capesOrdre_sublayer; //controlCapes._lastZIndex+1;
					controlCapes.addOverlay(heatLayerActiu,	heatLayerActiu.options.nom, true, capa.layer._leaflet_id);
//					controlCapes._lastZIndex++;
					activaPanelCapes(true);
					
				}else{
					console.debug('error create server in map');
				}
			});				
		
		//tipus json 
		}else if(capa.layer.options.tipus == t_json){
			
			var data = {
				uid:$.cookie('uid'),
				mapBusinessId: url('?businessid'),
				serverName: capa.layer.options.nom+" "+nom,
				serverType: t_json,
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
			    url: capa.layer.options.url,
			    calentas: false,
			    activas: true,
			    visibilitats: true,
			    options: '{"x":"'+capa.layer.options.options.x+'", "y":"'+capa.layer.options.options.y+'","tem":"'+tem_heatmap+'","origen":"'+capa.layer.options.businessId+'"}'
//			    options: '{"x":"'+cmd_json_x+'", "y":"'+cmd_json_y+'","titol":"'+cmd_json_titol+'","descripcio":"'+cmd_json_desc+'", "imatge":"'+cmd_json_img+'","vincle":"'+cmd_json_vin+'","estil_do":{"radius":"'+estil_do.radius+'","fillColor":"'+estil_do.fillColor+'","color":"'+estil_do.color+'","weight":"'+estil_do.weight+'","opacity":"'+estil_do.opacity+'","fillOpacity":"'+estil_do.fillOpacity+'","isCanvas":"'+estil_do.isCanvas+'"}}'
			};			
			
			createServidorInMap(data).then(function(results){
				if (results.status == "OK"){
					heatLayerActiu.options.businessId = results.results.businessId;
					
					heatLayerActiu.options.nom = capa.layer.options.nom+" "+nom;
					heatLayerActiu.options.tipus = t_json;
					heatLayerActiu.options.tipusRang = tem_heatmap;
					
					map.addLayer(heatLayerActiu);
					heatLayerActiu.options.zIndex = capesOrdre_sublayer; //controlCapes._lastZIndex+1;
					controlCapes.addOverlay(heatLayerActiu,	heatLayerActiu.options.nom, true, capa.layer._leaflet_id);
//					controlCapes._lastZIndex++;
					activaPanelCapes(true);					
				}else{
					console.debug("Error add heatmap JSON");
				}
			});
		}else{
			var rangs = JSON.stringify({rangs:[{}]});			
			var data = {
	            businessId: capa.layer.options.businessId,
	            uid: $.cookie('uid'),
	            mapBusinessId: url('?businessid'),	           
	            nom: capa.layer.options.nom+" "+nom,
	            calentas: false,   
	            order: capesOrdre_sublayer,
	            activas: true,
	            visibilitats: true,	            
	            tipusRang: tem_heatmap,
	            rangs: rangs
	        }
			
			duplicateTematicLayer(data).then(function(results){
				if(results.status == 'OK'){
					
					heatLayerActiu.options.businessId = results.results.businessId;
					heatLayerActiu.options.nom = capa.layer.options.nom+" "+nom;
					heatLayerActiu.options.tipus = capa.layer.options.tipus;
					heatLayerActiu.options.tipusRang = tem_heatmap;

//					map.addLayer(heatLayerActiu);Comentat per control de un heatmap actiu alhora
					heatLayerActiu.options.zIndex = capesOrdre_sublayer; //controlCapes._lastZIndex+1;
					controlCapes.addOverlay(heatLayerActiu,	heatLayerActiu.options.nom, true, capa.layer._leaflet_id);
//					controlCapes._lastZIndex++;
					activaPanelCapes(true);
					$('#input-'+results.results.businessId).trigger( "click" );
					$('#input-'+results.results.businessId).prop( "checked", true );
					
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
		heatLayerActiu.options.nom = capa.layer.options.nom+" "+nom;
		heatLayerActiu.options.tipus = capa.layer.options.tipus;
		heatLayerActiu.options.tipusRang = tem_heatmap;
		
		map.addLayer(heatLayerActiu);
		heatLayerActiu.options.zIndex = capesOrdre_sublayer; //controlCapes._lastZIndex+1;
		controlCapes.addOverlay(heatLayerActiu,	heatLayerActiu.options.nom, true, capa.layer._leaflet_id);
//		controlCapes._lastZIndex++;
		activaPanelCapes(true);
	}	
}

function loadDOHeatmapLayer(layer){
	//console.debug(layer);
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
		//console.debug("data:loaded");
		
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
		var origen = getLeafletIdFromBusinessId(options.origen);
		controlCapes.addOverlay(heatLayerActiu,	heatLayerActiu.options.nom, true, origen);
//		controlCapes._lastZIndex++;
		activaPanelCapes(true);		
	});
}

function loadJsonHeatmapLayer(layer){
	console.debug("loadJsonHeatmapLayer");
	
	var options = jQuery.parseJSON( layer.options );

	var v_respotaJSON;
	getJSONPServei(layer.url).then(function(results) {
		var op = [];
		if (jQuery.isArray(results)) {
			v_respotaJSON = results;
		} else {
			for (key in results) {
				if (jQuery.isArray(results[key])) {
					v_respotaJSON = results[key];
				}
			}
		}

		if (!jQuery.isArray(v_respotaJSON)) {
			alert(window.lang.convert("No s'ha interpretat bé l'estructura del JSON"));
			return;
		}
		var arrP=[];
		
		for (key in v_respotaJSON) {
			var lat = v_respotaJSON[key][options.y];
			var lon = v_respotaJSON[key][options.x];
			var d =[parseFloat(lat),parseFloat(lon),1];	
			arrP.push(d);
		}
		
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
		heatLayerActiu.options.zIndex = layer.capesOrdre;
		heatLayerActiu.options.tipus = layer.serverType;
		heatLayerActiu.options.tipusRang = tem_heatmap;
		
		map.addLayer(heatLayerActiu);
		var origen = getLeafletIdFromBusinessId(options.origen);
		controlCapes.addOverlay(heatLayerActiu,	heatLayerActiu.options.nom, true, origen);
		activaPanelCapes(true);
		console.debug("FI loadJsonHeatmapLayer");
	});
}

function loadTematicHeatmap(layer, zIndex, layerOptions){
	
	var options = jQuery.parseJSON(layerOptions);
	
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
	
	var origen = getLeafletIdFromBusinessId(options.origen);
	controlCapes.addOverlay(heatLayerActiu,	heatLayerActiu.options.nom, true, origen);
//	controlCapes._lastZIndex++;
	activaPanelCapes(true);		
	
}