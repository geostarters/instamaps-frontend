function showTematicLayersModal(tipus,className){
	var warninMSG="<div class='alert alert-danger'><strong>"+window.lang.convert('No hi ha capes disponibles per aquest estil de mapa !!')+"<strong>  <span class='fa fa-warning sign'></span></div>";
	jQuery('.modal').modal('hide');
	jQuery('#dialog_layers_tematic').modal('show');
	
	jQuery('#stActiu').removeClass();
	jQuery('#stActiu').addClass(className);
	
	var layers = [];
	jQuery.each( controlCapes._layers, function( key, value ) {
		var layerOptions = this.layer.options;
		var tipusCapa = layerOptions.tipus;
		var geomCapa = layerOptions.geometryType;
		
		if(tipus==tem_simple) {
			if (tipusCapa == t_tematic){ //tematic
				if (geomCapa == t_marker || 
					geomCapa == t_point ||
					geomCapa == t_polyline || 
					geomCapa == t_polygon ||
					geomCapa == t_multipolygon){
					layers.push(this);
				}
			}else if(tipusCapa == t_dades_obertes){ //dades obertes
				var dataset = layerOptions.dataset;
				if (dataset != "incidencies" &&
					dataset != "cameres" &&
					dataset != "meteo_comarca" &&
					dataset != "meteo_costa"){
					layers.push(this);
				}
			}
		}else if (tipus==tem_clasic){
			if (tipusCapa == t_tematic){ //tematic
				if (geomCapa == t_marker || 
					geomCapa == t_point ||
					geomCapa == t_polyline || 
					geomCapa == t_polygon ||
					geomCapa == t_multipolygon){
					layers.push(this);
				}
			}
		}else if (tipus==tem_heatmap) {
			if (tipusCapa == t_marker || 
				tipusCapa == t_point ||
				tipusCapa == t_polyline || 
				tipusCapa == t_polygon ||
				tipusCapa == t_tematic || 
				tipusCapa == t_dades_obertes ){
				if(this.layer.options.tipus==t_tematic){				
					if(this.layer.options.geometryType==t_marker ){layers.push(this);}
				}else{				
					layers.push(this);			
				}			
			}
		}else if (tipus==tem_cluster) {
			if (tipusCapa == t_marker || 
				tipusCapa == t_point ||
				tipusCapa == t_polyline || 
				tipusCapa == t_polygon ||
				tipusCapa == t_tematic || 
				tipusCapa == t_dades_obertes  ){
				if(this.layer.options.tipus==t_tematic){				
					if(this.layer.options.geometryType==t_marker ){layers.push(this);}
				}else{				
					layers.push(this);			
				}
			}
		}else if (tipus==tem_size) {
			$('#list_tematic_layers').html(warninMSG);
			return;
		}else{		
			$('#list_tematic_layers').html(warninMSG);
			return;
		}
	});// fi each
	if(layers.length ==0){
		$('#list_tematic_layers').html(warninMSG);		
		return;
	}
	layers = {layers: layers};

	var source = jQuery("#tematic-layers-template").html();
	var template = Handlebars.compile(source);
	var html = template(layers);
	$('#list_tematic_layers').html(html);
	
	$('.usr_wms_layer').on('click',function(e){
		var _this = jQuery(this);
		var data = _this.data();
		data.from = tipus;
		if (tipus == tem_simple){
			if (data.geometrytype == t_marker  || data.tipus == t_dades_obertes || data.tipus == t_xarxes_socials){
				obrirMenuModal('#dialog_estils_punts','toggle',data);
			}else if (data.geometrytype == t_polyline){
				obrirMenuModal('#dialog_estils_linies','toggle',data);
			}else if (data.geometrytype == t_polygon){
				obrirMenuModal('#dialog_estils_arees','toggle',data);
			}
		}else if(tipus == tem_clasic){
			createTematicClasic(data);
		}else if(tipus == tem_heatmap){
			createHeatMap(controlCapes._layers[data.leafletid]);
			jQuery('#dialog_layers_tematic').modal('hide');
		}else if(tipus == tem_cluster){
			creaClusterMap(controlCapes._layers[data.leafletid]);
			jQuery('#dialog_layers_tematic').modal('hide');
		}else if(tipus == tem_size){
			
		}
	});
}

function createTematicClasic(data){
	jQuery('.modal').modal('hide');
	jQuery('#dialog_tematic_rangs').modal('show');
	//console.debug(data);
	
	jQuery('#dialog_tematic_rangs .btn-success').on('click',function(e){	
		jQuery('#dialog_tematic_rangs').modal('hide');
	});
	
	var dataTem={
		businessId: data.businessid,
		uid: jQuery.cookie('uid')
	};
		
	getTematicLayer(dataTem).then(function(results){
		if (results.status == "OK"){
			var tematic = results.results;
			//console.debug(tematic);
			var fields = {};
			if (tematic.capes){
				var dataNames = tematic.capes.fieldsName.split(',');
				jQuery.each(dataNames, function( index, value ) {
					fields[value] = "slotd"+(index+1);
				});
			}else{ //sin datos
				fields['nom'] = 'nom';
				var geomNames = tematic.geometries.fieldsName.split(',');
				jQuery.each(geomNames, function( index, value ) {
					fields[value] = "slotf"+(index+1);
				});
			}
			var source1 = jQuery("#tematic-layers-fields").html();
			var template1 = Handlebars.compile(source1);
			var html1 = template1({fields:fields});
			jQuery('#dataField').html(html1);
			
			jQuery('#dataField').on('change',function(e){
				var this_ = jQuery(this);
				readDataTematicFromSlotd(tematic, this_.val()).then(function(results){
					displayTematicRangs(tematic ,results);
					
				});
			});
			
			jQuery('#dataField').val(tematic.dataField);
			readDataTematicFromSlotd(tematic, jQuery('#dataField').val()).then(function(results){
				displayTematicRangs(tematic ,results);
			});
		}
	});
	/*
	var layer = controlCapes._layers[data.leafletid];
	//console.debug(layer.layer);
	var features = layer.layer.getLayers();
	var fields = [];
	if (features.length > 0){
		var feature = features[0];
		jQuery.each(feature.properties, function( key, value ) {
			if (key != 'businessId' && key != 'data'){
				fields.push(key);
			}
		});
	}
	*/	
}

function displayTematicRangs(tematic ,results){
	showTematicRangs(tematic ,results).then(function(results1){
		var source1 = jQuery("#tematic-values-template").html();
		var template1 = Handlebars.compile(source1);
		var html1 = template1({values:results1});
		jQuery('#list_tematic_values').html(html1);
	});
}

function readDataTematicFromSlotd(tematic, slotd){
	var defer = jQuery.Deferred();
	var dades = tematic.capes.dades;
	var values = jQuery.map( dades, function( a ) {
		return a[slotd];
	});
	defer.resolve(values);
	return defer.promise();
}

function showTematicRangs(tematic, values){
	var defer = jQuery.Deferred();
	var rangs = tematic.rangs;
	var valuesStyle = [];
	if(rangs.length == 0){
		if (tematic.geometryType == t_marker){
			valuesStyle = jQuery.map( values, function( a ) {
				return {v: a, style: default_point_style};
			});
		}else if (tematic.geometryType == t_polyline){
			valuesStyle = jQuery.map( values, function( a ) {
				return {v: a, style: default_line_style};
			});
		}else if (tematic.geometryType == t_polygon){
			valuesStyle = jQuery.map( values, function( a ) {
				return {v: a, style: default_area_style};
			});
		}
	}else if(rangs.length == 1){
		rangStyle = rangs[0];
		if (tematic.geometryType == t_marker){
			valuesStyle = jQuery.map( values, function( a ) {
				return {v: a, style: rangStyle};
			});
		}else if (tematic.geometryType == t_polyline){
			valuesStyle = jQuery.map( values, function( a ) {
				return {v: a, style: rangStyle};
			});
		}else if (tematic.geometryType == t_polygon){
			valuesStyle = jQuery.map( values, function( a ) {
				return {v: a, style: rangStyle};
			});
		}
	}else{
		
	}
	defer.resolve(valuesStyle);
	
	return defer.promise();
}



function canviaStyleSinglePoint(cvStyle,feature,capaMare,openPopup){
	
	var isCanvas=false;
	if(feature._ctx){isCanvas=true;}
	var featureID=feature._leaflet_id
	
	var noCanvi=(isCanvas==cvStyle.options.isCanvas);

	if(noCanvi && !isCanvas){//pinxo i/o glifons
		map._layers[featureID].setIcon(cvStyle);		
	}else if (noCanvi && isCanvas){//Nomes punt
		map._layers[featureID].setStyle(cvStyle.options);
	}else if (!noCanvi ){
		capaMare.removeLayer(map._layers[featureID]);
		var layerTMP;
		if(isCanvas){//hi ha canvi de punt a pinxo i/o glifon
			layerTMP=L.marker([feature.getLatLng().lat,feature.getLatLng().lng],
					{icon: cvStyle,isCanvas:cvStyle.options.isCanvas,
					 tipus: t_marker});
		}else{//hi ha canvia de pinxo a punt canvas
			layerTMP= L.circleMarker([feature.getLatLng().lat,feature.getLatLng().lng],
				{ radius : cvStyle.options.radius, 
				  isCanvas:cvStyle.options.isCanvas,
				  fillColor : cvStyle.options.fillColor,
				  color :  cvStyle.options.color,
				  weight :  cvStyle.options.weight,
				  opacity :  cvStyle.options.opacity,
				  fillOpacity : cvStyle.options.fillOpacity,
				  tipus: t_marker}	
			);
		}
		layerTMP.properties=feature.properties;	
		layerTMP.addTo(capaMare);
		
		/*
		if (capaMare.options.tipus == t_dades_obertes){
			//popUp(feature, capaMare);
		}else{
			createPopupWindow(layerTMP,layerTMP.options.tipus);	
			if(!openPopup){
				map.closePopup();
			}
		}
		*/
	}
}

function changeTematicLayerStyle(tematic, styles){
	//console.debug(tematic);
	//console.debug(styles);
	var rangs = getRangsFromStyles(tematic, styles);
	//console.debug(rangs);
	var capaMare = map._layers[tematic.leafletid];
	
	if (jQuery.isArray(styles)){
		
	}else{
		var layer = controlCapes._layers[tematic.leafletid];
		if (tematic.geometrytype == t_marker){
			jQuery.each(capaMare._layers, function( key, value ) {	
				canviaStyleSinglePoint(styles,this,capaMare,false)
			});
		}else if (tematic.geometrytype == t_polyline){
			jQuery.each(layer.layer._layers, function( key, value ) {
				this.setStyle(styles);
			});
		}else if (tematic.geometrytype == t_polygon){
			jQuery.each(layer.layer._layers, function( key, value ) {
				this.setStyle(styles);
			});
		}
	}
	
	if(capaMare.options.tipus == t_dades_obertes){
		//console.debug(capaMare);
		//TODO Llamada al servidor
		//console.debug(styles.options);
		
		var options = {
			dataset: capaMare.options.dataset,
			tem: tem_simple,
			style: styles.options
		};
		
		var data = {
			uid:$.cookie('uid'),
			businessId: capaMare.options.businessId,
			mapBusinessId: url('?businessid'),
			serverName: capaMare.options.nom,
			serverType: capaMare.options.tipus,
			calentas: false,
            activas: true,
            visibilitats: true,
            epsg: '4326',
            transparency: true,
            visibilitat: 'O',
			options: JSON.stringify(options)
		};
		
		//console.debug(data);
		
		updateServidorWMS(data).then(function(results){
			////console.debug(results);
		});
		
	}else if (tematic.tipus == t_tematic){
		rangs = JSON.stringify({rangs:rangs});
		
		var data = {
			businessId: tematic.businessid,
			uid: $.cookie('uid'),
			rangs: rangs
		};
		
		updateTematicRangs(data).then(function(results){
			////console.debug(results);
		});
	}
}

function getRangsFromStyles(tematic, styles){
	//console.debug(styles);
	//console.debug(tematic);
	if (tematic.tipus == t_dades_obertes){
		tematic.geometrytype = t_marker;
	}
	var rangs = [];
	if (jQuery.isArray(styles)){
		
	}else{
		if (tematic.geometrytype == t_marker){
			
			if (styles.options.isCanvas){
				var rang = {
					simbolSize : styles.options.radius, 
					color :  jQuery.Color(styles.options.fillColor).toHexString(),
					borderColor :  styles.options.color,
					borderWidth :  styles.options.weight,
					opacity: (styles.options.fillOpacity * 100)
				};
			}else{
				var rang = {
					simbol: jQuery.trim(styles.options.icon),
					simbolSize: styles.options.iconSize.y, 
					simbolColor: styles.options.iconColor, 
					marker: styles.options.markerColor
				};
			}
		}else if (tematic.geometrytype == t_polyline){
			var rang = {
				color: styles.color,
				lineWidth: styles.weight,
				opacity: (styles.opacity * 100),
			};
			/*var rang = {
				borderWidth: 2,
				borderColor: '#000000',
				color: styles.options.iconColor,
				label: false,
				labelColor: '#000000',
				labelFont: 'arial',
				labelHaloColor: '#ffffff',
				labelHaloWidth: 2,
				labelSize: 10,
				lineWidth: styles.lineWidth,
				lineStyle: 'solid',			
				llegenda: '',
				opacity: (styles.opacity * 100),
				poligonStyle: '',
				simbol: styles.options.icon,
				simbolSize: , 
				simbolColor: styles.options.markerColor, 
				valorMax: '',
				valorMin: '',
				marker: ''
			};
			*/
		}else if (tematic.geometrytype == t_polygon){
			styles.fillColor = jQuery.Color(styles.fillColor).toHexString();
			var rang = {
				borderWidth: styles.weight,
				borderColor: styles.color,
				color: styles.fillColor,
				opacity: (styles.fillOpacity * 100)
			};
		}
		rangs.push(rang);
	}
	return rangs;
}

function loadTematicLayer(layer){
	var data={
		businessId: layer.businessId,
		uid: $.cookie('uid')
	};
	
	var layerWms = layer;
	
	//console.time("loadTematicLayer " + layerWms.serverName);
	getTematicLayer(data).then(function(results){
		//console.timeEnd("loadTematicLayer " + layerWms.serverName);
		if(results.status == "OK" ){
			var tematic = results.results;
			//console.debug(tematic);
			var Lgeom = tematic.geometries.features.features;
			var idDataField = tematic.idDataField;
			var idGeomField = tematic.idGeomField;
			var dataField = tematic.dataField;
			var Lrangs = tematic.rangs;
			var Ldades = (tematic.capes ? tematic.capes.dades : []);
			
			var capaTematic = new L.FeatureGroup();
			
			capaTematic.options = {
				businessId : layerWms.businessId,
				nom : layerWms.serverName,
				//zIndex :  parseInt(layerWms.capesOrdre),
				tipus : layerWms.serverType,
				geometryType: tematic.geometryType
			};
			
			//console.debug(capaTematic.options);
			
			capaTematic.addTo(map);
			if (!layerWms.capesOrdre){
				capaTematic.options.zIndex = controlCapes._lastZIndex + 1;
			}else{
				capaTematic.options.zIndex = parseInt(layerWms.capesOrdre);
			}
			controlCapes.addOverlay(capaTematic, layerWms.serverName, true);
			controlCapes._lastZIndex++;
			
			for(var g=0;g<Lgeom.length;g++){
				var geom = Lgeom[g];
				//console.debug(geom);
				var rangStyle;
				if (geom.geometry){
					var dataGeom = jQuery.grep(Ldades, function(e){ return e[idDataField] == geom.properties[idGeomField]; });
					if (dataGeom.length > 0){
						dataGeom = dataGeom[0];
						jQuery.extend(geom.properties, {data: dataGeom});
					}else{
						dataGeom = null;
					}
					var ftype = geom.geometry.type;
					ftype = ftype.toLowerCase();
					if (ftype === t_point){
						ftype = t_marker;
					}else if (ftype === t_linestring){
						ftype = t_polyline;
					}
					//Sin rangos
					if (Lrangs.length == 0){
						rangStyle = createRangStyle(ftype);
					}
					//1 Rango
					else if (Lrangs.length == 1){
						rangStyle = Lrangs[0];
						rangStyle = createRangStyle(ftype, rangStyle);
					}
					//Multiples rangos
					else{
						if (dataGeom){
							rangStyle = jQuery.grep(Lrangs, function(e){ return e.valorMax == dataGeom[dataField]; });
							if (rangStyle.length > 0){
								rangStyle = rangStyle[0];
								rangStyle = createRangStyle(ftype, rangStyle);
							}else{
								rangStyle = createRangStyle(ftype);
							}
						}else{
							rangStyle = createRangStyle(ftype);
						}
					}
					var featureTem;
					if (ftype === t_marker){
						var coords=geom.geometry.coordinates;
						//console.debug(rangStyle);
						if(!rangStyle.isCanvas){//hi ha canvi de punt a pinxo i/o glifon
							featureTem = L.marker([coords[0],coords[1]],
									 {icon: rangStyle, isCanvas:false, tipus: t_marker});
						}else{//hi ha canvia de pinxo a punt canvas
							featureTem= L.circleMarker([coords[0],coords[1]],
								rangStyle	
							);
						}
					}else if (ftype === t_polyline){
						var coords=geom.geometry.coordinates;
						var llistaPunts=[];
						for (var i = 0; i < coords.length; i++){
							var c=coords[i];
							var punt=new L.LatLng(c[0], c[1]);
							llistaPunts.push(punt);
						}
						featureTem = L.polyline(llistaPunts, rangStyle);
					}else if (ftype === t_polygon){
						var coords=geom.geometry.coordinates;
						var llistaLines=[];
						for (var i = 0; i < coords.length; i++){
							var lines=coords[i];
							var llistaPunts=[];
							for (var k = 0; k < lines.length; k++){
								var c=lines[k];
								var punt=new L.LatLng(c[0], c[1]);
								llistaPunts.push(punt);
							}
							llistaLines.push(llistaPunts);
						}
						featureTem = new L.Polygon(llistaLines, rangStyle);
					}else if (ftype === t_multipolygon){
						var coords=geom.geometry.coordinates;
						var llistaPoligons=[];
						for (var p = 0; p < coords.length; p++){
							var poligons=coords[p];
							var llistaLines=[];
							for (var i = 0; i < poligons.length; i++){
								var lines=poligons[i];
								var llistaPunts=[];
								for (var k = 0; k < lines.length; k++){
									var c=lines[k];
									var punt=new L.LatLng(c[0], c[1]);
									llistaPunts.push(punt);
								}
								llistaLines.push(llistaPunts);
							}
							llistaPoligons.push(llistaLines);
						}
						featureTem = new L.multiPolygon(llistaPoligons, rangStyle);
					}
					if (featureTem){
						//console.debug(capaTematic);
						featureTem.properties = geom.properties;
						featureTem.properties.capaLeafletId = capaTematic._leaflet_id;
						featureTem.properties.capaNom = capaTematic.options.nom;
						featureTem.properties.capaBusinessId = capaTematic.options.businessId;
						featureTem.properties.tipusFeature = ftype;
						featureTem.properties.feature = {};
						featureTem.properties.feature.geometry = geom.geometry;
						//console.debug(featureTem);
						capaTematic.addLayer(featureTem);
						
						if($(location).attr('href').contains('mapa')){
							createPopupWindow(featureTem,ftype);
						}else{
							createPopupWindowVisor(featureTem,ftype);
						}
						
						map.closePopup();
					}
				}
			}
		}else{
			alert("Error getTematicLayer");
		}		
	},function(results){
		//console.debug('getTematicLayer ERROR');
	});
}

function createRangStyle(ftype, style){
	var rangStyle;
	if (style){
		if (ftype === t_marker){
			rangStyle = createFeatureMarkerStyle(style);
		}else if (ftype === t_polyline){
			rangStyle = createFeatureLineStyle(style);
		}else if (ftype === t_polygon){
			rangStyle = createFeatureAreaStyle(style);
		}else if (ftype === t_multipolygon){
			rangStyle = createFeatureAreaStyle(style);
		}
	}else{
		if (ftype === t_marker){
			rangStyle = L.AwesomeMarkers.icon(default_point_style);
		}else if (ftype === t_polyline){
			rangStyle = default_line_style;
		}else if (ftype === t_polygon){
			rangStyle = default_area_style;
		}else if (ftype === t_multipolygon){
			rangStyle = default_area_style;
		}
	}
	return rangStyle;
}
