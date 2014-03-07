
function createHeatMap(capa){
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
		            options: '{"dataset":"'+capa.layer.options.dataset+'","tem":"'+tem_heatmap+'"}'
			};	
			
			createServidorInMap(data).then(function(results){
				if (results.status == "OK"){
					
					heatLayerActiu.options.businessId = results.results.businessId;
					heatLayerActiu.options.nom = capa.layer.options.nom+" heatmap";
					heatLayerActiu.options.tipus = t_heatmap;
					
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
	            tipusRang: tem_heatmap,
	            rangs: rangs
	        }
			
			updateTematicRangs(data).then(function(results){
				if(results.status == 'OK'){
					
					heatLayerActiu.options.businessId = capa.layer.options.businessId;
					heatLayerActiu.options.nom = capa.layer.options.nom;
					heatLayerActiu.options.zIndex = capa.layer.options.zIndex;
					heatLayerActiu.options.tipus = capa.layer.options.tipus;

					map.addLayer(heatLayerActiu);
					map.removeLayer(capa.layer);
					controlCapes.removeLayer(capa.layer);
//					controlCapes._lastZIndex--;
					controlCapes.addOverlay(heatLayerActiu, heatLayerActiu.options.nom, true);
					
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
		heatLayerActiu.options.businessId = -1;
		heatLayerActiu.options.nom = capa.layer.options.nom+" heatmap";
		heatLayerActiu.options.tipus = t_dades_obertes;
		
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
		
		map.addLayer(heatLayerActiu);
		controlCapes.addOverlay(heatLayerActiu,	heatLayerActiu.options.nom, true);
		controlCapes._lastZIndex++;
		activaPanelCapes(true);		
	});
}

//function loadHeatLayer(layer){
//	console.info(layer);
//	
//	var options = jQuery.parseJSON( layer.options );
//	var list = options.arrP.split(",");
//	
//	var arrP=[];
//	for(var i=0;i<=list.length-3;i+=3){
////		var d = [ parseInt(list[i]), parseInt(list[i+1]), parseInt(list[i+2]) ];
//		arrP.push([ parseFloat(list[i]), parseFloat(list[i+1]), parseFloat(list[i+2]) ]);
//	}
//	
//	var heatLayerActiu = L.heatLayer(arrP,{radius:20,blur:15,max:1,
//		gradient: {			
//			0.35: "#070751",
//			0.40: "#0095DE",
//			0.45: "#02D5FF",
//			0.50: "#02E0B9",
//			0.55: "#00B43F",
//			0.60: "#97ED0E",
//			0.61: "#FFF800",
//			0.65: "#FF9700",
//			0.70: "#FF0101",
//			1: "#720404"
//			}	
//	});
//	
//	heatLayerActiu.options.businessId = layer.businessId;
//	heatLayerActiu.options.nom = layer.serverName;
//	heatLayerActiu.options.zIndex = layer.capesOrdre;
//	heatLayerActiu.options.tipus = layer.serverType;
//	heatLayerActiu.options.capaOrigen=options.capaOrigen;
//	
//	map.addLayer(heatLayerActiu);
//	controlCapes.addOverlay(heatLayerActiu,	heatLayerActiu.options.nom, true);
//	activaPanelCapes(true);	
//}
