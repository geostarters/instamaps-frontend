function creaClusterMap(capa) {

	_gaq.push(['_trackEvent', 'mapa', tipus_user+'estils', 'cluster', 1]);
//	_kmq.push(['record', 'estils', {'from':'mapa', 'tipus user':tipus_user, 'tipus tematic':'cluster'}]);
	
	var nom = window.lang.convert("Agrupació");
	
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
					serverName: capa.layer.options.nom+" "+nom,
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
					clusterLayer.options.nom = capa.layer.options.nom +" "+nom;
					clusterLayer.options.tipus = t_dades_obertes;
					clusterLayer.options.tipusRang = tem_cluster;

					map.addLayer(clusterLayer);
					clusterLayer.options.zIndex = capesOrdre_sublayer;//controlCapes._lastZIndex + 1;
					controlCapes.addOverlay(clusterLayer, clusterLayer.options.nom, true, capa.layer._leaflet_id);
//					controlCapes._lastZIndex++;
					activaPanelCapes(true);
					//Desactivem la capa mare
					if ($( "#input-"+capa.layer.options.businessId).attr("checked")!=undefined) $( "#input-"+capa.layer.options.businessId).click();
//					$(".layers-list").mCustomScrollbar({
//						   advanced:{
//						     autoScrollOnFocus: false,
//						     updateOnContentResize: true
//						   }           
//					});						

//					map.removeLayer(capa.layer);
				}else{
					console.debug('error create server in map');
				}
			});				
			//tipus json
		}else if(capa.layer.options.tipus == t_url_file){
			
			
			var options = {
					url: capa.layer.options.url,//capaMare.options.url,
					tem: tem_cluster,
					origen: capa.layer.options.businessId,
					tipus : t_url_file,
//					businessId : '-1',
					tipusFile: capa.layer.options.tipusFile,
//					estil_do: estil_do,
					epsgIN: capa.layer.options.epsgIN,
					geometryType: capa.layer.options.geometryType,
					colX: capa.layer.options.colX,
					colY: capa.layer.options.colY,
					dinamic: capa.layer.options.dinamic
				};
			
//				console.debug(options);			
			
			var data = {
					uid:$.cookie('uid'),
					mapBusinessId: url('?businessid'),
					serverName: capa.layer.options.nom+" "+nom,
//					serverName: capa.layer.options.nom+" "+window.lang.convert("Bàsic"),
					serverType: capa.layer.options.tipus,
					calentas: false,
		            activas: true,
		            visibilitats: true,
		            order: capesOrdre_sublayer,				
		            epsg: capa.layer.options.epsgIN,
		            imgFormat: 'image/png',
		            infFormat: 'text/html',
//		            tiles: true,	            
		            transparency: true,
		            opacity: 1,
		            visibilitat: 'O',
		            url: capa.layer.options.url,//capaMare.options.url,
					options: JSON.stringify(options)
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
					clusterLayer.options.nom = capa.layer.options.nom +" "+nom;
					clusterLayer.options.tipus = t_url_file;
					clusterLayer.options.tipusRang = tem_cluster;

					map.addLayer(clusterLayer);
					clusterLayer.options.zIndex = capesOrdre_sublayer;//controlCapes._lastZIndex + 1;
					controlCapes.addOverlay(clusterLayer, clusterLayer.options.nom, true, capa.layer._leaflet_id);

					activaPanelCapes(true);
					//Desactivem la capa mare
					if ($( "#input-"+capa.layer.options.businessId).attr("checked")!=undefined) $( "#input-"+capa.layer.options.businessId).click();
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
			    options: '{"x":"'+capa.layer.options.options.x+'", "y":"'+capa.layer.options.options.y+'","titol":"'+capa.layer.options.options.titol+'","descripcio":"'+capa.layer.options.options.descripcio+'", "imatge":"'+capa.layer.options.options.imatge+'","vincle":"'+capa.layer.options.options.vincle+'","tem":"'+tem_cluster+'","origen":"'+capa.layer.options.businessId+'"}'
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
					clusterLayer.options.nom = capa.layer.options.nom +" "+nom;
					clusterLayer.options.tipus = t_json;
					clusterLayer.options.tipusRang = tem_cluster;

					map.addLayer(clusterLayer);
					clusterLayer.options.zIndex = capesOrdre_sublayer;//controlCapes._lastZIndex + 1;
					controlCapes.addOverlay(clusterLayer, clusterLayer.options.nom, true, capa.layer._leaflet_id);
//					controlCapes._lastZIndex++;
					activaPanelCapes(true);
					//Desactivem la capa mare
					if ($( "#input-"+capa.layer.options.businessId).attr("checked")!=undefined) $( "#input-"+capa.layer.options.businessId).click();
//					$(".layers-list").mCustomScrollbar({
//						   advanced:{
//						     autoScrollOnFocus: false,
//						     updateOnContentResize: true
//						   }           
//					});	

//					map.removeLayer(capa.layer);
				}else{
					console.debug("Error add cluster JSON");
				}
			});	

		}else if (capa.layer.options.tipus == t_visualitzacio){
			var data = {
					businessId: capa.layer.options.businessId,//businessId id de la visualización de origen
					uid: $.cookie('uid'),//uid id de usuario
		            mapBusinessId: url('?businessid'),//mapBusinessId id del mapa donde se agrega la visualización	           
		            nom: capa.layer.options.nom+" "+nom,//nom nombre de la nueva visualizacion
		            activas: true,
		            order: capesOrdre_sublayer,//order (optional) orden de la capa en el mapa
					tem: tem_cluster//tem_heatmap
//		            estils: JSON.stringify(rangs[0])
				};	
				
				createVisualitzacioHeatCluster(data).then(function(results){
					if(results.status == 'OK'){
						
						capa.layer.eachLayer(function(layer) {
							console.debug(layer);
							var marker = L.marker(new L.LatLng(layer.getLatLng().lat, layer.getLatLng().lng), {
								title : layer._leaflet_id
							});
							var html='';
							$.each( layer.properties.data, function( key, value ) {
								if(isValidValue(key) && isValidValue(value) && !validateWkt(value)){
									if (key != 'id' && key != 'businessId' && key != 'slotd50' && 
											key != 'NOM' && key != 'Nom' && key != 'nom' && 
											key != 'name' && key != 'Name' && key != 'NAME' &&
											key != 'nombre' && key != 'Nombre' && key != 'NOMBRE'){
										html+='<div class="popup_data_row">';
										var txt = value;
										if (!$.isNumeric(txt)) {
											txt = parseUrlTextPopUp(value, key);
											if(txt.indexOf("iframe")==-1 && txt.indexOf("img")==-1){
												html+='<div class="popup_data_key">'+key+'</div>';
												html+='<div class="popup_data_value">'+
												(isBlank(txt)?window.lang.convert("Sense valor"):txt)+
												'</div>';
											}else{
												html+='<div class="popup_data_img_iframe">'+txt+'</div>';
											}
										}
										else {
											html+='<div class="popup_data_key">'+key+'</div>';
											html+='<div class="popup_data_value">'+txt+'</div>';
										}
										html+= '</div>';
									}
								}
							});	
							
							marker.bindPopup(html);
							//marker.bindPopup("<b>"+layer.properties.data.nom+"</b><br><b>"+layer.properties.data.text+"</b>");
							
							clusterLayer.addLayer(marker);
						});
						
						clusterLayer.options.businessId = results.layer.businessId;
						clusterLayer.options.nom = capa.layer.options.nom +" "+nom;
						clusterLayer.options.tipus = capa.layer.options.tipus;
						clusterLayer.options.tipusRang = tem_cluster;
						
						map.addLayer(clusterLayer);
						clusterLayer.options.zIndex = capesOrdre_sublayer; //controlCapes._lastZIndex+1;
						controlCapes.addOverlay(clusterLayer, clusterLayer.options.nom, true, capa.layer._leaflet_id);
//						controlCapes._lastZIndex++;
						activaPanelCapes(true);
						if ($( "#input-"+capa.layer.options.businessId).attr("checked")!=undefined) $( "#input-"+capa.layer.options.businessId).click();
						
					}else{
						//TODO error
						console.debug("createVisualitzacioCluster ERROR");					
					}
				},function(results){
					//TODO error
					console.debug("createVisualitzacioCluster ERROR");
				});			
		}
		else if (capa.layer.options.tipus == t_vis_wms){
			var instamapsWms = InstamapsWms({
				loadTemplateParam :false});
			var dataWMS = {url: capa.layer._url};
			instamapsWms.getWMSLayers(dataWMS).then(function(results) {
				var layers = [];
				layers=results.Capability.Layer.Layer;
				for (var i=0;i<layers.length;i++){
					var layer = layers[i];
					if (layers[i].Name.indexOf("cluster")>-1) {
						var data = {
								businessId: capa.layer.options.businessId,//businessId id de la visualización de origen
								uid: $.cookie('uid'),//uid id de usuario
					            mapBusinessId: url('?businessid'),//mapBusinessId id del mapa donde se agrega la visualización	           
					            nom: layers[i].Name,//nom nombre de la nueva visualizacion
					            activas: true,
					            order: capesOrdre_sublayer,//order (optional) orden de la capa en el mapa
								tem: tem_heatmap,
								serverType: tem_cluster_wms,//tem_cluster
								url: capa.layer._url
//					            estils: JSON.stringify(rangs[0])
						};
						createVisualitzacioHeatCluster(data).then(function(results){
							if(results.status == 'OK'){
								loadVisualitzacioWmsLayerSenseUtfGrid(results.layer);
								$('#input-'+results.layer.businessId).trigger( "click" );
								$('#input-'+results.layer.businessId).prop( "checked", false );
								$('#input-'+results.layer.businessId).trigger( "click" );
								$('#input-'+results.layer.businessId).prop( "checked", true );
								activaPanelCapes(true);	
								//Desactivem la capa mare
								if ($( "#input-"+capa.layer.options.businessId).attr("checked")!=undefined) $( "#input-"+capa.layer.options.businessId).click();
							}else{
								//TODO error
								console.debug("createVisualitzacioCluster ERROR");					
							}
						},function(results){
							//TODO error
							console.debug("createVisualitzacioCluster ERROR");
						});
						
					}
				}
			});
		}

	}else{
		
		clusterLayer.options.businessId = '-1';
		clusterLayer.options.nom = capa.layer.options.nom +" "+nom;
		clusterLayer.options.tipus = capa.layer.options.tipus;
		clusterLayer.options.tipusRang = tem_cluster;

		map.addLayer(clusterLayer);
		clusterLayer.options.zIndex = capesOrdre_sublayer; //controlCapes._lastZIndex + 1;
		controlCapes.addOverlay(clusterLayer, clusterLayer.options.nom, true, capa.layer._leaflet_id);
//		controlCapes._lastZIndex++;
		activaPanelCapes(true);
		//Desactivem la capa mare
		if ($( "#input-"+capa.layer.options.businessId).attr("checked")!=undefined) $( "#input-"+capa.layer.options.businessId).click();
//		$(".layers-list").mCustomScrollbar({
//			   advanced:{
//			     autoScrollOnFocus: false,
//			     updateOnContentResize: true
//			   }           
//		});			
	}	
}

function loadDadesObertesClusterLayer(layer, dfd){
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
		//console.debug("data:loaded");
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
		clusterLayer.options.zIndex = layer.capesOrdre;
		clusterLayer.options.tipus = layer.serverType;
		clusterLayer.options.dataset = options.dataset;
		clusterLayer.options.tipusRang = tem_cluster;

		if (layer.capesActiva == true || layer.capesActiva == "true"){
			map.addLayer(clusterLayer);
		}
		var origen = getLeafletIdFromBusinessId(options.origen);
		controlCapes.addOverlay(clusterLayer, clusterLayer.options.nom, true, origen);
//		controlCapes._lastZIndex++;
		activaPanelCapes(true);		
		
		if(dfd){
			try{
				dfd.resolve();
			}catch(e){
				
			}
		}
	});	
}


function loadJsonClusterLayer(layer){
	
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
		
		var clusterLayer = L.markerClusterGroup({
			singleMarkerMode : true
		});		
		
		for (key in v_respotaJSON) {
			
			var lat = v_respotaJSON[key][options.y];
			var lon = v_respotaJSON[key][options.x];
			var pp = L.marker(new L.LatLng(parseFloat(lat), parseFloat(lon)), {
				title : layer._leaflet_id
			});
//			marker.bindPopup(layer._popup._content);
//			var pp = L.circleMarker([ lat, lon ], estil_do);

			pp.properties = {};
			var empty = true;
			if (options.titol == "null") {
				pp.properties.nom = ""
			} else {
				pp.properties.nom = v_respotaJSON[key][options.titol];
				empty = empty && false;
			}
			if (options.descripcio == "null") {
				pp.properties.text = ""
			} else {
				pp.properties.text = v_respotaJSON[key][options.descripcio];
				empty = empty && false;
			}
			if (options.imatge == "null") {
				pp.properties.img = ""
			} else {
				pp.properties.img = '<img width="250px" src="'
						+ v_respotaJSON[key][options.imatge] + '">';
				empty = empty && false;
			}
			if (options.vincle == "null") {
				pp.properties.vincle = ""
			} else {
				pp.properties.vincle = '<a href="'
						+ v_respotaJSON[key][options.vincle]
						+ '" target="_blank">'
						+ v_respotaJSON[key][options.vincle] + '</a>';
				empty = empty && false;
			}

			if(!empty){
				pp.bindPopup("<div id='nom-popup-json'>" + pp.properties.nom + "</div><div id='text-popup-json'>"
						+ pp.properties.text + "</div><div id='image-popup-json'>"
						+ pp.properties.img + "</div><div>" + pp.properties.vincle
						+ "</div>");
			}
			
			clusterLayer.addLayer(pp);
		}
		
		clusterLayer.options.businessId = layer.businessId;
		clusterLayer.options.nom = layer.serverName;
		clusterLayer.options.zIndex = layer.capesOrdre;
		clusterLayer.options.tipus = layer.serverType;
		clusterLayer.options.tipusRang = tem_cluster;

		if (layer.capesActiva == true || layer.capesActiva == "true"){
			map.addLayer(clusterLayer);
		}
		var origen = getLeafletIdFromBusinessId(options.origen);
		controlCapes.addOverlay(clusterLayer, clusterLayer.options.nom, true, origen);
//		controlCapes._lastZIndex++;
		activaPanelCapes(true);	

	});
}

function loadTematicCluster(layer, zIndex, layerOptions, capesActiva){
	
	var options = jQuery.parseJSON(layerOptions);
	
	var clusterLayer = L.markerClusterGroup({
		singleMarkerMode : true
	});	
	
	$.each(layer.geometries.features.features, function(i, feature) {
		var marker = L.marker(new L.LatLng(feature.geometry.coordinates[1],feature.geometry.coordinates[0]), {
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
	
	if (capesActiva.indexOf("false")==-1){
		map.addLayer(clusterLayer);
	}		
	var origen = getLeafletIdFromBusinessId(options.origen);
	controlCapes.addOverlay(clusterLayer,	clusterLayer.options.nom, true, origen);
//	controlCapes._lastZIndex++;
	activaPanelCapes(true);		
}

function loadVisualitzacioCluster(layer, zIndex, layerOptions, capesActiva, dfd){
	var options; 
	if(typeof (layerOptions)=="string"){	
		try {
			options = JSON.parse(layerOptions);
		}
		catch (err) {
			options = layerOptions;		
		}
	}else{			
		options = layerOptions;	
	}

	var businessId;
	if (layer.geometriesBusinessId){
		businessId=layer.geometriesBusinessId
	}
	else businessId=options.origen;
	
	var data = {
			businessId: businessId,//businessId id de la visualización de origen
			uid: $.cookie('uid')//uid id de usuario
		};	
	
	//Carrego llistat geometries
	getGeometriesColleccioByBusinessId(data).then(function(results){
		if(results.status == 'OK'){
			
			var clusterLayer = L.markerClusterGroup({
				singleMarkerMode : true
			});				
			
			var arrP=[];
			$.each(results.geometries.geometria.features, function(i, feature) {
				var marker = L.marker(new L.LatLng(feature.geometry.coordinates[1],feature.geometry.coordinates[0]), {
					//title : layer._leaflet_id
				});
				marker.bindPopup("<b>"+feature.properties.nom+"</b><br><b>"+feature.properties.text+"</b>");
				clusterLayer.addLayer(marker);			
			});
			
			clusterLayer.options.businessId = layer.businessId;
			clusterLayer.options.nom =layer.nom;
			clusterLayer.options.zIndex = parseInt(zIndex);
			clusterLayer.options.tipus = t_visualitzacio;
			clusterLayer.options.tipusRang = tem_cluster;
			
			if (capesActiva!=undefined && capesActiva.indexOf("false")==-1){
				map.addLayer(clusterLayer);
			}		
			else if (capesActiva==undefined) map.addLayer(clusterLayer);
			
			var origen = getLeafletIdFromBusinessId(options.origen);
			controlCapes.addOverlay(clusterLayer, clusterLayer.options.nom, true, origen);
//			controlCapes._lastZIndex++;
			activaPanelCapes(true);	
			
			if(dfd){
				try{
					dfd.resolve();
				}catch(e){
					
				}
			}
			
		}else{
			console.debug("getGeometriesColleccioByBusinessId ERROR");					
		}
	},function(results){
		//TODO error
		console.debug("getGeometriesColleccioByBusinessId ERROR");
	});	
}
