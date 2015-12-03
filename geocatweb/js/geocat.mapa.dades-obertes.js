/**
 * Gestió de la creació i carrega de capes de Dades Obertes
 */

var _htmlDadesObertes = [];
function generaLListaDadesObertes() {
	getLListaDadesObertes().then(function(results) {
		_htmlDadesObertes.push('<div class="panel-danger"><ul class="bs-dadesO llista-do panel-heading">');
		$.each(results.dadesObertes, function(key, dataset) {
			_htmlDadesObertes.push('<li><a class="label-explora" lang="ca" title="Afegir capa" href="#" id="'
				+ dataset.dataset
				+ '">'
				+ dataset.text
				+ '</a>'
				+ '<a target="_blank" lang="ca" title="Informació de les dades" href="'+dataset.urn+'"><span class="glyphicon glyphicon-info-sign info-explora"></span></a>'							
				+'</li>');
		});
		_htmlDadesObertes.push('</ul><div id="div_do_message"></div></div>');
	});
}

function addCapaDadesObertes(dataset,nom_dataset) {

	_gaq.push(['_trackEvent', 'mapa', tipus_user+'dades obertes', nom_dataset, 1]);
//	_kmq.push(['record', 'dades obertes', {'from':'mapa', 'tipus user':tipus_user, 'dataset':nom_dataset}]);
	
	var param_url = paramUrl.dadesObertes + "dataset=" + dataset;
	var estil_do = retornaEstilaDO(dataset);
	
	var capaDadaOberta = new L.GeoJSON.AJAX(param_url, {
		onEachFeature : createPopupWindowDadesObertes,
		nom : dataset,
		tipus : t_dades_obertes,
		dataset: dataset,
		estil_do: estil_do,
		businessId : '-1',
		geometryType:t_marker,
		pointToLayer : function(feature, latlng) {
			if(dataset.indexOf('meteo')!=-1){
				return L.marker(latlng, {icon:L.icon({					
					    iconUrl: feature.style.iconUrl,
					    iconSize:     [44, 44], 
					    iconAnchor:   [22, 22], 				   
					    popupAnchor:  [-3, -3] 
				})});
			}else if(dataset.indexOf('incidencies')!=-1){
				var inci=feature.properties.descripcio_tipus;
				var arr = ["Obres", "Retenció", "Cons", "Meterologia" ];
				var arrIM = ["st_obre.png", "st_rete.png", "st_cons.png", "st_mete.png" ];
				var imgInci="/geocatweb/img/"+arrIM[jQuery.inArray( inci, arr )];
				return L.marker(latlng, {icon:L.icon({					
				    iconUrl: imgInci,
				    iconSize:     [30, 26], 
				    iconAnchor:   [15, 13], 				   
				    popupAnchor:  [-3, -3] 
			})});
			}else if(dataset.indexOf('cameres')!=-1){
				return L.marker(latlng, {icon:L.icon({					
				    iconUrl: "/geocatweb/img/st_came.png",
				    iconSize:     [30, 26], 
				    iconAnchor:   [15, 13], 				   
				    popupAnchor:  [-3, -3] 
			})});
			}else{
			return L.circleMarker(latlng, estil_do);
			}
		},
		middleware:function(data){
            
            if(data.status && data.status.indexOf("ERROR")!=-1){
        		if(data.results.indexOf("CONVERT ERROR")!= -1){
    			var txt_error = window.lang.convert("Error en el tractament de les dades");
    			jQuery("#div_do_message").html('<div class="alert alert-danger">'+txt_error+'</div>');
	    		}
	    		else{
	    			var txt_error = window.lang.convert("Impossible accedir a la font de dades");
	    			jQuery("#div_do_message").html('<div class="alert alert-danger">'+txt_error+'</div>');
	    		}            	
            }else{
            	
            	capaDadaOberta.addData(data);
            	
            	if(typeof url('?businessid') == "string"){
    				var data = {
    					uid:$.cookie('uid'),
    					mapBusinessId: url('?businessid'),
    					serverName: nom_dataset,
    					serverType: t_dades_obertes,
    					calentas: false,
    		            activas: true,
    		            visibilitats: true,
    		            order: controlCapes._lastZIndex+1,
    		            epsg: '4326',
    		            transparency: true,
    		            visibilitat: visibilitat_open,
    					options: '{"dataset":"'+dataset+'","estil_do":{"radius":"'+estil_do.radius+'","fillColor":"'+estil_do.fillColor+'","color":"'+estil_do.color+'","weight":"'+estil_do.weight+'","opacity":"'+estil_do.opacity+'","fillOpacity":"'+estil_do.fillOpacity+'","isCanvas":"'+estil_do.isCanvas+'"}}'			
    				};
    				
    				createServidorInMap(data).then(function(results){
    					if (results.status == "OK"){
    						capaDadaOberta.nom = nom_dataset;// +" ("+datasetLength+")";
    						
    						capaDadaOberta.options={"dataset":dataset,
    								"estil_do":{"radius":estil_do.radius,
    									"fillColor":estil_do.fillColor,
    									"color":estil_do.color,
    									"weight":estil_do.weight,
    									"opacity":estil_do.opacity,
    									"fillOpacity":estil_do.fillOpacity,
    									"isCanvas":estil_do.isCanvas}};
    						
    						capaDadaOberta.options.businessId = results.results.businessId;
    						
    						capaDadaOberta.addTo(map)
    						capaDadaOberta.options.zIndex = controlCapes._lastZIndex+1;
    						controlCapes.addOverlay(capaDadaOberta, nom_dataset, true);
    						controlCapes._lastZIndex++;
    						activaPanelCapes(true);
    						
    					}
    				});
    			}else{
    				capaDadaOberta.nom = nom_dataset;// +" ("+datasetLength+")";
    				capaDadaOberta.addTo(map);
    				capaDadaOberta.options.zIndex = controlCapes._lastZIndex+1;
    				controlCapes.addOverlay(capaDadaOberta, nom_dataset, true);
    				controlCapes._lastZIndex++;
    				activaPanelCapes(true);
    			}		            	
            }
        }
	});
}

function loadDadesObertesLayer(layer){
	
	var defer = $.Deferred();
	
	var options = jQuery.parseJSON( layer.options );
	if(options.tem == null || options.tem == tem_simple){
		var url_param = paramUrl.dadesObertes + "dataset=" + options.dataset;
		var estil_do = options.estil_do;
		
		if (options.tem == tem_simple){
			estil_do = createFeatureMarkerStyle(options.style);
		}
		var capaDadaOberta = new L.GeoJSON.AJAX(url_param, {
			onEachFeature : createPopupWindowDadesObertes,
			nom : layer.serverName,
			tipus : layer.serverType,
			dataset: options.dataset,
			businessId : layer.businessId,
			dataType : "jsonp",
			estil_do : estil_do, //per la llegenda
			pointToLayer : function(feature, latlng) {
				if(options.dataset.indexOf('meteo')!=-1){
					return L.marker(latlng, {icon:L.icon({					
						    iconUrl: feature.style.iconUrl,
						    iconSize:     [44, 44], 
						    iconAnchor:   [22, 22], 				   
						    popupAnchor:  [-3, -3] 
					})});
				}else if(options.dataset.indexOf('incidencies')!=-1){
					var inci=feature.properties.descripcio_tipus;
					var arr = ["Obres", "Retenció", "Cons", "Meterologia" ];
					var arrIM = ["st_obre.png", "st_rete.png", "st_cons.png", "st_mete.png" ];
					var imgInci="/geocatweb/img/"+arrIM[jQuery.inArray( inci, arr )];
					return L.marker(latlng, {icon:L.icon({					
					    iconUrl: imgInci,
					    iconSize:     [30, 26], 
					    iconAnchor:   [15, 13], 				   
					    popupAnchor:  [-3, -3] 
					})});
				}else if(options.dataset.indexOf('cameres')!=-1){
					return L.marker(latlng, {icon:L.icon({					
					    iconUrl: "/geocatweb/img/st_came.png",
					    iconSize:     [30, 26], 
					    iconAnchor:   [15, 13], 				   
					    popupAnchor:  [-3, -3] 
					})});
				}else{
					if (estil_do.isCanvas){
						return L.circleMarker(latlng, estil_do);
					}else{
						return L.marker(latlng, {icon:estil_do,isCanvas:false, tipus: t_marker});
					}
				}
			}
		});	
		
		
		//afegim group
		if (options.group){
			capaDadaOberta.options.group=options.group;
		}
		
		
		if (layer.capesActiva== null || layer.capesActiva == 'null' || layer.capesActiva == true || layer.capesActiva == "true"){
			capaDadaOberta.addTo(map);
		}
				
		if (!layer.capesOrdre || layer.capesOrdre == null || layer.capesOrdre == 'null'){
			capaDadaOberta.options.zIndex = controlCapes._lastZIndex + 1;
		}else{
			capaDadaOberta.options.zIndex = parseInt(layer.capesOrdre);
		}		
		
		if(!options.origen){
			//Fins que no estigui carregada del tot no afegim al controlcapes (per tenir be el comptador de features)
			capaDadaOberta.on('data:loaded', function(e){
				controlCapes.addOverlay(capaDadaOberta, layer.serverName, true);
				controlCapes._lastZIndex++;
				defer.resolve();
			});
		}else{//Si te origen es una sublayer
			var origen = getLeafletIdFromBusinessId(options.origen);
			capaDadaOberta.options.zIndex = capesOrdre_sublayer;
			controlCapes.addOverlay(capaDadaOberta, layer.serverName, true, origen);
			defer.resolve();
		}		
		
	}else if(options.tem == tem_cluster){
		loadDadesObertesClusterLayer(layer);
		defer.resolve();
	}else if(options.tem == tem_heatmap){
		loadDOHeatmapLayer(layer);
		defer.resolve();
	}
	return defer.promise();
}

function createPopupWindowDadesObertes(player,l){
	//console.debug("createPopupWindowData");
	var html='';
	var out = [];
	if (player.properties.nom && !isBusinessId(player.properties.nom)){
		html+='<h4>'+player.properties.nom+'</h4>';
	}else if(player.properties.name && !isBusinessId(player.properties.name)){
		html+='<h4>'+player.properties.name+'</h4>';
	}else if(player.properties.Name && !isBusinessId(player.properties.Name)){
		html+='<h4>'+player.properties.Name+'</h4>';
	}
	if (player.properties.description){
		html+='<div>'+parseUrlTextPopUp(player.properties.description)+'</div>';
	}
	html+='<div class="div_popup_visor"><div class="popup_pres">';

	$.each( player.properties, function( key, value ) {
		if(isValidValue(value)){
			if (key != 'name' && key != 'Name' && key != 'description' && key != 'id' && key != 'businessId' && key != 'slotd50'){
				html+='<div class="popup_data_row">';
				var txt = parseUrlTextPopUp(value,key);
				if(txt.indexOf("iframe")==-1 && txt.indexOf("img")==-1){
					html+='<div class="popup_data_key">'+key+'</div>';
					html+='<div class="popup_data_value">'+txt+'</div>';
				}else{
					html+='<div class="popup_data_img_iframe">'+txt+'</div>';
				}
				html+= '</div>';
			}
		}
	});	
	
	html+='</div></div>';
	l.bindPopup(html,{'offset':[0,-25]});
}