
/**
 * Funcions tematics generals*
 * */


function initButtonsTematic(){
	
	addHtmlInterficieTematics();
	addHtmlModalLayersTematic();
	addHtmlModalCategories();
	
	//botons tematic
	jQuery('#st_Color').on('click',function(){
		showTematicLayersModal(tem_simple,jQuery(this).attr('class'));
	});
	
	jQuery('#st_Tema').on('click',function(){
		showTematicLayersModal(tem_clasic,jQuery(this).attr('class'));
	});

//	jQuery('#st_Size').on('click',function(){
//		showTematicLayersModal(tem_size);
//	});
	
	jQuery('#st_Heat').on('click',function(e) {
		showTematicLayersModal(tem_heatmap,jQuery(this).attr('class'));
		
	});	

	jQuery('#st_Clust').on('click',function(e) {		
		showTematicLayersModal(tem_cluster,jQuery(this).attr('class'));
		
	});	
}

function showTematicLayersModal(tipus,className){
	//console.debug("showTematicLayersModal");
	var warninMSG="<div class='alert alert-danger'><strong>"+window.lang.convert('Aquest estil no es pot aplicar a cap capa de les que tens en el mapa')+"<strong>  <span class='fa fa-warning sign'></span></div>";
	jQuery('.modal').modal('hide');
	
	jQuery('#dialog_layers_tematic').modal('show');
	
	jQuery('#stActiu').removeClass();
	jQuery('#stActiu').addClass(className);
	
	var layers = [];
	jQuery.each( controlCapes._layers, function( key, value ) {
		var layerOptions = this.layer.options;
		var tipusCapa = layerOptions.tipus;
		//Si la capa no es multigeometrias
		if (layerOptions.geometryType != t_multiple){
			//Si la capa no esta tematitzada
			if(!layerOptions.tipusRang || layerOptions.tipusRang == tem_origen){
				if(tipus==tem_simple) {
					if (tipusCapa == t_tematic || tipusCapa == t_json){ //tematic
						layers.push(this);
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
						if (this.layer.options.dades){
							layers.push(this);
						}else{
							layers.push(this);
						}
					}
				}else if (tipus==tem_cluster || tipus==tem_heatmap) {
					var ftype = transformTipusGeometry(layerOptions.geometryType);
					//var ftype = layerOptions.geometryType;
					if(tipusCapa == t_dades_obertes || tipusCapa == t_json ||
						(tipusCapa == t_tematic && ftype == t_marker)){
						layers.push(this);
					}
				}else if (tipus==tem_size) {
					$('#list_tematic_layers').html(warninMSG);
					return;
				}else{		
					$('#list_tematic_layers').html(warninMSG);
					return;
				}
			}
		
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
		var ftype = transformTipusGeometry(data.geometrytype);
		if (tipus == tem_simple){
			if (ftype == t_marker  || data.tipus == t_dades_obertes || data.tipus == t_json ){
				obrirMenuModal('#dialog_estils_punts','toggle',data);
			}else if (ftype == t_polyline){
				obrirMenuModal('#dialog_estils_linies','toggle',data);
			}else if (ftype == t_polygon){
				obrirMenuModal('#dialog_estils_arees','toggle',data);
			}
		}else if(tipus == tem_clasic){
			showModalTematicCategories(data);
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

function loadCacheTematicLayer(layer){
	var defer = $.Deferred();
	var data={
		businessId: layer.businessId,
		uid: layer.entitatUid
	};
	
	var layerWms = layer;
	getCacheTematicLayerByBusinessId(data).then(function(results){
		results.results = jQuery.parseJSON( results.results );
		readTematic(defer, results, layerWms, layer);
	},function(results){
		//console.debug('getTematicLayerByBusinessId ERROR');
		defer.reject();
	});
	return defer.promise();
}

function loadTematicLayer(layer){
	var defer = $.Deferred();
	var data={
		businessId: layer.businessId
	};
	
	var layerWms = layer;
	
	//console.time("loadTematicLayer " + layerWms.serverName);
	getTematicLayerByBusinessId(data).then(function(results){
		readTematic(defer, results, layerWms, layer);
	},function(results){
		//console.debug('getTematicLayerByBusinessId ERROR');
		defer.reject();
	});
	return defer.promise();
}

function readTematic(defer, results, layerWms, layer){
	//console.timeEnd("readTematic " + layerWms.serverName);
	var capaTematic;
	if(results.status == "OK" ){
		var tematic = results.results;
		var hasSource = (tematic.options && (tematic.options.indexOf("source")!=-1) );
		//console.debug(tematic);
		if(tematic.tipusRang == tem_heatmap){
			loadTematicHeatmap(tematic, layer.capesOrdre, layer.options, layer.capesActiva);
		}else if(tematic.tipusRang == tem_cluster){
			loadTematicCluster(tematic, layer.capesOrdre, layer.options, layer.capesActiva);
		}else{
			var Lgeom = tematic.geometries.features.features;
			var idDataField = tematic.idDataField;
			var idGeomField = tematic.idGeomField;
			var dataField = tematic.dataField;
			var rangsField = "";
			var Lrangs = tematic.rangs;
			var Ldades = (tematic.capes ? tematic.capes.dades : []);
			capaTematic = new L.FeatureGroup();
			
			var hasDades = false;
			if (tematic.capes && tematic.capes.fieldsName){
				hasDades = true;
				var fieldsName = tematic.capes.fieldsName.split(",");
				var fieldPos = parseInt(dataField.replace("slotd",""))-1;
				if (fieldPos < fieldsName.length){
					rangsField = fieldsName[fieldPos];
				}
			}
			
			capaTematic.options = {
				businessId : layerWms.businessId,
				nom : layerWms.serverName,
				tipus : layerWms.serverType,
				tipusRang: tematic.tipusRang, 
				geometryType: tematic.geometryType,
				dades: hasDades,
				rangs: tematic.rangs,
				rangsField: rangsField
			};
			
			if(hasSource) {
				var source = jQuery.parseJSON(tematic.options);					
				capaTematic.options.source = source.source;
			}
			
			if (!layerWms.capesActiva || layerWms.capesActiva == true || layerWms.capesActiva == "true"){
				capaTematic.addTo(map);
			}
			
			for(var g=0;g<Lgeom.length;g++){
				var geom = Lgeom[g];
				var rangStyle;
				if (geom.geometry){
					var dataGeom = jQuery.grep(Ldades, function(e){ return e[idDataField] == geom.properties[idGeomField]; });
					if (dataGeom.length > 0){
						dataGeom = dataGeom[0];
						if (hasDades){
							var fieldsName = tematic.capes.fieldsName.split(",");
							jQuery.each(fieldsName, function(i, val){
								dataGeom[val] = dataGeom["slotd"+(i+1)];
							});
						}
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
						if (ftype == t_marker || ftype === t_multipoint){
							rangStyle = createRangStyle(ftype, default_circulo_style, Lgeom.length);
						}else{
							rangStyle = createRangStyle(ftype, null, Lgeom.length);
						}
					}
					//1 Rango
					else if (Lrangs.length == 1){
						rangStyle = Lrangs[0];
						rangStyle = createRangStyle(ftype, rangStyle, Lgeom.length);
					}
					//Multiples rangos
					else{
						if (dataGeom){
							rangStyle = jQuery.grep(Lrangs, function(e){
								if (e.valorMax && e.valorMin){
									return (parseFloat(e.valorMin) <= parseFloat(dataGeom[dataField]) && parseFloat(dataGeom[dataField]) <= parseFloat(e.valorMax));
								}else{
									return jQuery.trim(e.valorMax) == jQuery.trim(dataGeom[dataField]);
								}
							});
						}else{
							rangStyle = jQuery.grep(Lrangs, function(e){
								if (e.valorMax && e.valorMin){
									return (parseFloat(e.valorMin) <= parseFloat(geom.properties[dataField]) && parseFloat(geom.properties[dataField]) <= parseFloat(e.valorMax)); 
								}else{
									return jQuery.trim(e.valorMax) == jQuery.trim(geom.properties[dataField]); 
								}
							});
							if (rangStyle.length == 0){
								rangStyle = jQuery.grep(Lrangs, function(e){ return jQuery.trim(e.valorMax) == jQuery.trim(geom.properties.businessId); });
							}
						}
						if (rangStyle.length > 0){
							rangStyle = rangStyle[0];
							rangStyle = createRangStyle(ftype, rangStyle, Lgeom.length);
						}else{
							rangStyle = createRangStyle(ftype, default_circulo_style, Lgeom.length);
						}
						
						/*
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
						*/
					}
					
					var featureTem;
					if (ftype === t_marker){
						var coords=geom.geometry.coordinates;
						if(!rangStyle.isCanvas){//hi ha canvi de punt a pinxo i/o glifon
							featureTem = L.marker([coords[0],coords[1]],
								{icon: rangStyle, isCanvas:false, tipus: t_marker});
						}else{//hi ha canvia de pinxo a punt canvas
							featureTem= L.circleMarker([coords[0],coords[1]],
								rangStyle	
							);
						}
					}else if (ftype === t_multipoint){
						//TODO revisar que funcione
						var coords=geom.geometry.coordinates;
						for (var i = 0; i < coords.length; i++){
							var c=coords[i];
							if(!rangStyle.isCanvas){//hi ha canvi de punt a pinxo i/o glifon
								featureTem = L.marker([c[0], c[1]],
									{icon: rangStyle, isCanvas:false, tipus: t_marker});
							}else{//hi ha canvia de pinxo a punt canvas
								featureTem= L.circleMarker([c[0], c[1]],
									rangStyle	
								);
							}
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
					}else if (ftype === t_multilinestring){
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
						featureTem = new L.multiPolyline(llistaLines, rangStyle);
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
						featureTem.properties = geom.properties;
						featureTem.properties.capaLeafletId = capaTematic._leaflet_id;
						featureTem.properties.capaNom = capaTematic.options.nom;
						featureTem.properties.capaBusinessId = capaTematic.options.businessId;
						featureTem.properties.tipusFeature = ftype;
						if (featureTem.options){
							featureTem.options.tipus = ftype;
						}else{
							featureTem.options = {tipus: ftype};
						}
						featureTem.properties.feature = {};
						featureTem.properties.feature.geometry = geom.geometry;
						capaTematic.addLayer(featureTem);
						//							if(rangStyle.options.markerColor=='punt_r'){
////							var num=rangStyle.options.radius;
////							featureTem.options.icon.options.shadowSize = new L.Point(1, 1);
//							var color = hexToRgb(featureTem.options.icon.options.fillColor);
//							featureTem._icon.style.setProperty("background-color", color);
//						}		
						
						if(ftype == t_polygon){
							featureTem.properties.mida = calculateArea(featureTem.getLatLngs());
						}else if(ftype == t_polyline){
							featureTem.properties.mida = calculateDistance(featureTem.getLatLngs());
						}
						
//						//Si la capa no ve de fitxer
						if(!hasSource){
							if($(location).attr('href').indexOf('mapa')!=-1 && ((capaTematic.options.tipusRang == tem_origen) || !capaTematic.options.tipusRang) ){
								createPopupWindow(featureTem,ftype);
							}else{			
								createPopupWindowVisor(featureTem,ftype);
							}								
						}else{
							createPopupWindowData(featureTem,ftype);
						}
						map.closePopup();
					}
				}
			}
			
			//Afegim num d'elements al nom de la capa, si és un fitxer
			if(layer.dragdrop || layer.urlFile){
				capaTematic.options.nom = capaTematic.options.nom;// + " ("+capaTematic.getLayers().length+")";
				var data = {
					 	businessId: capaTematic.options.businessId, //url('?businessid') 
					 	uid: $.cookie('uid'),
					 	serverName: capaTematic.options.nom
					 }
					
					updateServidorWMSName(data).then(function(results){
						/*
						if(results.status==='OK')console.debug("CapaTematic name changed OK");
						else console.debug("CapaTematic name changed KO");
						*/
					});					
			}
			
			var options;
			if (layerWms.options){
				options = jQuery.parseJSON( layerWms.options );
			}
			if(layerWms.options && options.origen){//Si es una sublayer
				var origen = getLeafletIdFromBusinessId(options.origen);
				capaTematic.options.dataField = dataField;
//				updateControlCapes(capaTematic, capaTematic.options.nom, true, origen);
				controlCapes.addOverlay(capaTematic, capaTematic.options.nom, true, origen);
//				$(".layers-list").mCustomScrollbar({
//					   advanced:{
//					     autoScrollOnFocus: false,
//					     updateOnContentResize: true
//					   }           
//				});	
			}
			else {
				if (!layerWms.capesOrdre){
					capaTematic.options.zIndex = controlCapes._lastZIndex + 1;
				}else{
					capaTematic.options.zIndex = parseInt(layerWms.capesOrdre);
				}
				capaTematic.options.dataField = dataField;
//				updateControlCapes(capaTematic, capaTematic.options.nom, true);
				controlCapes.addOverlay(capaTematic, capaTematic.options.nom, true);
				controlCapes._lastZIndex++;
//				$(".layers-list").mCustomScrollbar({
//					   advanced:{
//					     autoScrollOnFocus: false,
//					     updateOnContentResize: true
//					   }           
//				});	
			}				
		}
	}else{
		//alert("Error getTematicLayerByBusinessId");
		console.debug("Error readTematic");
	}	
	defer.resolve(capaTematic);
}

function createPopupWindowVisor(player,type){
	//console.debug("createPopupWindowVisor");
	var html='<div class="div_popup_visor">' 
		+'<div class="popup_pres">';
	
	if (player.properties.nom && !isBusinessId(player.properties.nom)){
		html+='<div id="titol_pres_visor">'+player.properties.nom+'</div>';
	}
		
	
	html+='<div id="des_pres_visor">'+parseUrlTextPopUp(player.properties.text)+'</div>';

	if(type == t_polyline && player.properties.mida){
		html+='<div id="mida_pres"><b>'+window.lang.convert('Longitud')+':</b> '+player.properties.mida+'</div>';	
	}else if(type == t_polygon && player.properties.mida){
		html+='<div id="mida_pres"><b>'+window.lang.convert('Àrea')+':</b> '+player.properties.mida+'</div>';
	}
	
	html+='<div id="capa_pres_visor"><k>'+player.properties.capaNom+'</k></div>'
	+'</div></div>';
	
	player.bindPopup(html,{'offset':[0,-25]});	
}

function createPopupWindowData(player,type){
	//console.debug("createPopupWindowData");
	var html='';
	if (player.properties.nom && !isBusinessId(player.properties.nom)){
		html+='<h4>'+player.properties.nom+'</h4>';
	}
	if (player.properties.text){
		html+='<div>'+parseUrlTextPopUp(player.properties.text)+'</div>';
	}
	html+='<div class="div_popup_visor"><div class="popup_pres">';
	$.each( player.properties.data, function( key, value ) {
//		alert( key + ": " + value );
		if(key.indexOf("slot")==-1 && value!=undefined && value!=null && value != " "){
			if (key != 'id' && key != 'businessId' && key != 'slotd50'){
				html+='<div class="popup_data_row">';
				
				var txt = parseUrlTextPopUp(value);
				if(txt.indexOf("iframe")==-1 && txt.indexOf("img")==-1){
					html+='<div class="popup_data_key">'+key+'</div>';
					html+='<div class="popup_data_value">'+txt+'</div>'
				}else{
					html+='<div class="popup_data_img_iframe">'+txt+'</div>'
				}
				html+= '</div>';
			}
		}
	});	
	
	html+='</div></div>';
	//he quitado el openPopup() ya que si la capa no está activa no se ha cargado en el mapa y da error.
	player.bindPopup(html,{'offset':[0,-25]});
}

/*****************************/


/** Funcions que actualitzen l'estil per defecte, al seleccionat al dialeg d'estils
 * 	per punts, línies, i polígons. 
 * */

function changeDefaultLineStyle(canvas_linia){
	var estilTMP = default_line_style;
	estilTMP.color=canvas_linia.strokeStyle;
	estilTMP.weight=canvas_linia.lineWidth;
	estilTMP.tipus=t_polyline;
	if(objEdicio.obroModalFrom==from_creaCapa){
		 drawControl.options.polyline.shapeOptions= estilTMP;
	}
	return estilTMP;
}

function changeDefaultAreaStyle(canvas_pol){
	var estilTMP= default_area_style;
	estilTMP.fillColor=canvas_pol.fillStyle;
	estilTMP.fillOpacity=canvas_pol.opacity;
	estilTMP.weight=canvas_pol.lineWidth;
	estilTMP.color=canvas_pol.strokeStyle;
	estilTMP.tipus=t_polygon;
	
	if(objEdicio.obroModalFrom==from_creaCapa){
		drawControl.options.polygon.shapeOptions= estilTMP;
	}
	return estilTMP;
}

function changeDefaultPointStyle(estilP) {
	//console.debug("changeDefaultPointStyle");
	var puntTMP= new L.AwesomeMarkers.icon(default_marker_style);
	var _iconFons=estilP.iconFons.replace('awesome-marker-web awesome-marker-icon-','');
	var _iconGlif=estilP.iconGlif;	
	var cssText="";
	
	if(_iconGlif.indexOf("fa fa-")!=-1){
		_iconGlif=estilP.iconGlif.replace('fa fa-','');
	};
	
//	console.debug(_iconFons);
	
	var _colorGlif=estilP.colorGlif;
	
	if(_iconFons.indexOf("_r")!=-1){ //sóc rodó		
		var num=estilP.size;
		puntTMP.options.shadowSize = new L.Point(1, 1);
		var tt=estilP.fontsize;
		puntTMP.options.divColor=estilP.divColor;
		if(tt=="9px" || tt=="8px"){
			cssText="font9";			
		}else if(tt=="11px" || tt=="10.5px"){
			cssText="font11";
		}else if(tt=="12px"){
			cssText="font12";
		}else if(tt=="15px"){
			cssText="font15";
		}else if(tt=="17px"){
			cssText="font17";		
		}
				
		puntTMP.options.fillColor =estilP.divColor;
		if(_iconGlif==""){//no tin glif soc Canvas
			puntTMP.options.icon="";
			puntTMP.options.radius = parseInt(estilP.size/2.4);
			puntTMP.options.isCanvas=true;
		}else{
			puntTMP.options.iconAnchor= new L.Point(parseInt(num/2), parseInt(num/2));
			puntTMP.options.iconSize = new L.Point(num, num);	
			puntTMP.options.icon=_iconGlif + " "+cssText;
			puntTMP.options.isCanvas=false;
		}
	}else{ // sóc pinxo
		puntTMP.options.iconAnchor= new L.Point(14, 42);
		puntTMP.options.iconSize = new L.Point(28, 42);
		puntTMP.options.shadowSize = new L.Point(36, 16);
		puntTMP.options.divColor='transparent';
		puntTMP.options.icon=_iconGlif + " "+cssText;
		puntTMP.options.isCanvas=false;
	}
	puntTMP.options.markerColor=_iconFons;
	puntTMP.options.iconColor=_colorGlif;
	if(objEdicio.obroModalFrom==from_creaCapa){
		defaultPunt=puntTMP;
	}
	return puntTMP;
}
/*****************************/

/**Funcions per crear un objecte de tipus estil, amb les característiques que li passes
 * per punt, línia, poligon */

function createFeatureLineStyle(style){
	var estilTMP = default_line_style;
	estilTMP.color=style.color;
	estilTMP.weight=style.lineWidth;
	estilTMP.tipus=t_polyline;
	return estilTMP;
}

function createFeatureAreaStyle(style){
	var estilTMP= default_area_style;
	estilTMP.fillColor=style.color;
	estilTMP.fillOpacity=style.opacity/100;
	estilTMP.weight=style.borderWidth;
	estilTMP.color=style.borderColor;
	estilTMP.tipus=t_polygon;
	return estilTMP;
}

function createFeatureMarkerStyle(style, num_geometries){
	//console.debug("createFeatureMarkerStyle");
	if (!num_geometries){
		num_geometries = num_max_pintxos - 1;
	}
	if (style.marker && num_geometries <= num_max_pintxos){
		//Especifiques per cercle amb glyphon
		if(style.marker == 'punt_r'){
			var puntTMP = new L.AwesomeMarkers.icon(default_circuloglyphon_style);
			puntTMP.options.iconColor = style.simbolColor;
			puntTMP.options.icon = style.simbol;
			puntTMP.options.markerColor = style.marker;
			puntTMP.options.isCanvas=false;
			puntTMP.options.divColor= style.color;
			puntTMP.options.shadowSize = new L.Point(1, 1);
			puntTMP.options.radius = style.radius;
			var anchor = style.iconAnchor.split("#");
			var size = style.iconSize.split("#");
			puntTMP.options.iconAnchor.x = parseInt(anchor[0]);
			puntTMP.options.iconAnchor.y = parseInt(anchor[1]);
			puntTMP.options.iconSize.x = size[0];
			puntTMP.options.iconSize.y = size[1];
		}else{
			var puntTMP = new L.AwesomeMarkers.icon(default_marker_style);
			puntTMP.options.iconColor = style.simbolColor;
			puntTMP.options.icon = style.simbol;
			puntTMP.options.markerColor = style.marker;
			puntTMP.options.isCanvas=false;
			puntTMP.options.iconAnchor.x = 14;
			puntTMP.options.iconAnchor.y = 42;
			puntTMP.options.iconSize.x = 28;
			puntTMP.options.iconSize.y = 42;
		}
	}else{ //solo circulo
		var puntTMP = { 
			radius: style.simbolSize, 
			isCanvas: true,
			fillColor: style.color,
			color:  style.borderColor,
			weight:  style.borderWidth,
			fillOpacity: style.opacity/100,
			opacity: 1,
			tipus: t_marker
		};
	}
	return puntTMP;
}

function createRangStyle(ftype, style, num_geometries){
	var rangStyle;
	if (style){
		if (ftype === t_marker){
			rangStyle = createFeatureMarkerStyle(style, num_geometries);
		}else if (ftype === t_multipoint){
			rangStyle = createFeatureMarkerStyle(style, num_geometries);
		}else if (ftype === t_polyline){
			rangStyle = createFeatureLineStyle(style);
		}else if (ftype === t_multilinestring){
			rangStyle = createFeatureLineStyle(style);
		}else if (ftype === t_polygon){
			rangStyle = createFeatureAreaStyle(style);
		}else if (ftype === t_multipolygon){
			rangStyle = createFeatureAreaStyle(style);
		}
	}else{
		if (ftype === t_marker){
			rangStyle = L.AwesomeMarkers.icon(default_marker_style);
		}else if (ftype === t_multipoint){
			rangStyle = L.AwesomeMarkers.icon(default_marker_style);
		}else if (ftype === t_polyline){
			rangStyle = default_line_style;
		}else if (ftype === t_multilinestring){
			rangStyle = default_line_style;
		}else if (ftype === t_polygon){
			rangStyle = default_area_style;
		}else if (ftype === t_multipolygon){
			rangStyle = default_area_style;
		}
	}
	return rangStyle;
}
/*************************************************/

/**Funcio que actualitza els rangs de la capa quan: 
 * - Es canvia l'estil d'una feature
 * - Es mou una feature d'una capa a un altre
 * - Cada cop que es carrega un fitxer (dragdrop urlfile) i es vol centrar al mapa als features*/	
function getRangsFromLayer(layer){
	//console.debug("getRangsFromLayer");
	if (layer.options.tipus == t_tematic){
		var styles = jQuery.map(layer.getLayers(), function(val, i){
			return {key: val.properties.businessId, style: val};
		});
		
		var tematic = layer.options;
		tematic.tipusRang = tematic.tipusRang ? tematic.tipusRang : tem_origen;
		tematic.businessid = tematic.businessId; 
		tematic.leafletid = layer._leaflet_id;
		tematic.geometrytype = tematic.geometryType;
		tematic.from = tematic.tipusRang;
		
		var rangs = getRangsFromStyles(tematic, styles);
        rangs = JSON.stringify({rangs:rangs});
        
        var data = {
          businessId: tematic.businessid,
          uid: $.cookie('uid'),
          tipusRang: tematic.from,
          rangs: rangs
        };
              
        updateTematicRangs(data).then(function(results){
        	//console.debug(results);
        },function(results){
			//TODO error
			console.debug("getRangsFromLayer ERROR");
		});
	}
}

function getRangsFromStyles(tematic, styles){
	//console.debug("getRangsFromStyles");
	if (tematic.tipus == t_dades_obertes){
		tematic.geometrytype = t_marker;
	}
	
	var ftype = transformTipusGeometry(tematic.geometrytype);
	
	var rangs = [];
	if (jQuery.isArray(styles)){
		jQuery.each(styles, function(i, val){
			var rang = getRangsFromStyles(tematic, val.style);
			rang[0].featureLeafletId = val.style._leaflet_id;
			rang = rang[0];
			rang.valorMax = val.key;
			rangs.push(rang);
		});
	}else{
		if (ftype == t_marker){
			
			if (styles.options.isCanvas){
				var rang = {
					isCanvas: true,	
					simbolSize : styles.options.radius, 
					color :  jQuery.Color(styles.options.fillColor).toHexString(),
					borderColor :  styles.options.color,
					borderWidth :  styles.options.weight,
					opacity: (styles.options.fillOpacity * 100)
				};
			}else{
				
//				var auxOptions = styles.options;
//				while(jQuery.type(styles.options.icon) === "object"){
//					//if(jQuery.trim(styles.options.icon) != "" && jQuery.isPlainObject(styles.options.icon)){
//					styles.options = styles.options.icon.options;
//				}
				
				
				if(jQuery.type(styles.options.icon) === "object"){
					var auxOptions = styles.options.icon.options;
				}else{
					var auxOptions = styles.options;
				}
				
				var rang = {
					isCanvas: false,
					llegenda : 'TODO ficar llegenda',//TODO ficar nom de la feature del popup de victor
//					valorMax : "feature" + fId,
					//Canviat a divColor, si es marker, sera sempre 'transparent'
					color : auxOptions.divColor,//auxOptions.fillColor,//Color principal
					marker: auxOptions.markerColor,//Si es de tipus punt_r o el color del marker
					simbolColor: auxOptions.iconColor,//Glyphon
					radius : auxOptions.radius,//Radius
					iconSize : auxOptions.iconSize.x+"#"+auxOptions.iconSize.y,//Size del cercle
					iconAnchor : auxOptions.iconAnchor.x+"#"+auxOptions.iconAnchor.y,//Anchor del cercle
					simbol : auxOptions.icon,//tipus glyph
					opacity : (auxOptions.opacity * 100),
					label : false,
					labelSize : 10,
					labelFont : 'arial',
					labelColor : '#000000',
				};
			}
		}else if (ftype == t_polyline){
			
			if (styles._options){
				styles.options = styles._options;
			}else if(!styles.options) styles.options = styles;
			
			var rang = {
				color: styles.options.color,
				lineWidth: styles.options.weight,
				opacity: (styles.options.opacity * 100),
			};
		}else if (ftype == t_polygon){
			if (styles._options){
				styles = styles._options;
			}else if(styles.options){
				styles = styles.options;
			}
			styles.fillColor = jQuery.Color(styles.fillColor).toHexString();
			var rang = {
				borderWidth: styles.weight,
				borderColor: styles.color,
				color: styles.fillColor,
				opacity: (styles.fillOpacity * 100)
			};
		}
//		rang.businessId = styles.properties.businessId;
//		rang.featureLeafletId = styles._leaflet_id;
		rangs.push(rang);
	}
	return rangs;
}

/*******************************************************************/

function canviaStyleSinglePoint(cvStyle,feature,capaMare,openPopup){
	var isCanvas=false;
	if(feature._ctx){isCanvas=true;}
	var featureID=feature._leaflet_id
	
	var noCanvi=(isCanvas==cvStyle.options.isCanvas);

	if(noCanvi && !isCanvas){//pinxo i/o glifons
		map._layers[featureID].setIcon(cvStyle);		
	}else if (noCanvi && isCanvas){//Nomes punt
		map._layers[featureID].setStyle(cvStyle.options);
		map._layers[featureID].setRadius(cvStyle.options.radius);
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
		if (capaMare.options.tipus == t_dades_obertes){
			//popUp(feature, capaMare);
		}else{
			createPopupWindow(layerTMP,layerTMP.options.tipus);	
			if(!openPopup){
				//map.closePopup();
			}
		}
	}
	map.closePopup();	
}

function addHtmlInterficieTematics(){
	jQuery("#funcio_tematics").append(
			'<h5 lang="ca">Triar l\'estil del mapa</h5>'+
			'<div class="div_gr3_estils">'+
			'	<div id="st_Color" lang="ca" data-toggle="tooltip" title="Bàsic" class="div_estil_1"></div>'+
			'	<div id="st_Tema" lang="ca" data-toggle="tooltip" title="Categories" class="div_estil_2"></div>'+
			'	<!--<div id="st_Size" lang="ca" data-toggle="tooltip" title="Mides"	class="div_estil_3"></div>-->'+
			'	<div id="st_Heat" lang="ca" data-toggle="tooltip" title="Concentració" class="div_estil_4"></div>'+
			'	<div id="st_Clust" lang="ca" data-toggle="tooltip" title="Agrupació" class="div_estil_5"></div>'+
			'</div>'			
	);
}

function addHtmlModalLayersTematic(){
	
	jQuery('#mapa_modals').append(
	'	<!-- Modal Tematics Layers -->'+
	'		<div class="modal fade" id="dialog_layers_tematic">'+
	'		<div class="modal-dialog">'+
	'			<div class="modal-content">'+
	'				<div class="modal-header">'+
	'					<button type="button" class="close" data-dismiss="modal"'+
	'						aria-hidden="true">&times;</button>'+
	'					<h4 class="modal-title" lang="ca">Triar una capa per aplicar-hi l\'estil</h4>'+
	'				</div>'+
	'				<div class="modal-body">'+
	'					<script id="tematic-layers-template" type="text/x-handlebars-template">'+
	'					<div class="panel-warning">'+					
	'					<ul class="bs-dadesO_USR panel-heading">'+
	'						{{#each layers}}'+
	'						<li><a class="usr_wms_layer lable-usr" data-leafletid="{{layer._leaflet_id}}" data-businessId="{{layer.options.businessId}}" data-geometryType="{{layer.options.geometryType}}" data-tipus="{{layer.options.tipus}}">{{name}}</a></li>'+
	'						{{/each}}'+
	'					</ul>'+	
	'					</div>'+
	'					</script>'+
	'					<div id="list_tematic_layers"></div>'+
	'			</div>'+
	'				<div class="modal-footer">'+
	'				<div style="float:right;line-height: 40px;"><span lang="ca">Estil actiu</span>:  <div style="float: right;width:42px;height:42px" id="stActiu"></div></div>'+
	'					<!-- <button type="button" class="btn btn-default" data-dismiss="modal">Tancar</button>'+
	'        <button type="button" class="btn btn-success">Canviar</button> -->'+
	'				</div>'+
	'			</div>'+
	'			<!-- /.modal-content -->'+
	'		</div>'+
	'		<!-- /.modal-dialog -->'+
	'	</div>'+
	'	<!-- /.modal -->'+
	'	<!-- fi Modal Tematics Layers -->'		
	);
	
}

function addHtmlModalCategories(){
	
	jQuery('#mapa_modals').append(
	'	<!-- Modal Tematics Rangs -->'+
	'		<div class="modal fade" id="dialog_tematic_rangs">'+
	'		<div class="modal-dialog">'+
	'			<div class="modal-content">'+
	'				<div class="modal-header">'+
	'					<button type="button" class="close" data-dismiss="modal"'+
	'						aria-hidden="true">&times;</button>'+
	'					<h4 class="modal-title" lang="ca">Defineix les categories</h4>'+
	'				</div>'+
	'				<div class="modal-body">'+
	'					<div class="labels_fields">'+
	'						<span lang="ca">Escull el camp per simbolitzar</span>:'+
	'						<select name="dataField" id="dataField">'+
	'						</select>'+
	'					</div>'+
	'					<script id="tematic-layers-fields" type="text/x-handlebars-template">'+
	'						{{#each fields}}'+
	'						<option value="{{this}}">{{@key}}</option>'+
	'						{{/each}}'+
	'					</script>'+
	'					<br/>'+										
	'					<div id="tipus_agrupacio_grp" class="labels_fields">'+
	'						<span lang="ca">Escull l\'interval</span>:'+
	'						<span class="rd_separator"></span>'+
	'						<input type="radio" id="rd_tipus_unic" name="rd_tipus_agrupacio" value="U">'+
	'						<label for="rd_tipus_unic" lang="ca">únic</label>'+
	'						<span class="rd_separator"></span>'+
	'						<input type="radio" id="rd_tipus_rang" name="rd_tipus_agrupacio" value="R">'+
	'						<label for="rd_tipus_rang" lang="ca">per intervals</label>'+
	'<!-- 						<select id="cmb_tipus_agrupacio"> -->'+
	'<!-- 							<option lang="ca" value="U">Únic</option> -->'+
	'<!-- 							<option lang="ca" value="R">Rang</option> -->'+
	'<!-- 						</select> -->'+
	'					</div>'+			
	'					<div id="num_rangs_grp" class="labels_fields" >'+
	'						<select id="cmb_num_rangs">'+
	'							<option value="---" selected >Intervals</option>'+
	'							<option value="2">2</option>'+
	'							<option value="3">3</option>'+
	'							<option value="4">4</option>'+
	'							<option value="5">5</option>'+
	'							<option value="6">6</option>'+
	'							<option value="7">7</option>'+
	'							<option value="8">8</option>'+
	'							<option value="9">9</option>'+
	'						</select>'+
	'					</div>'+
	'					<script id="tematic-values-unic-punt-template" type="text/x-handlebars-template">'+
	'					<table class="table">'+
	'						<tbody>'+
	'						{{#each values}}'+
	'						<tr><td>{{v}}</td><td>'+
	'							{{#if style.isCanvas}}'+
	'								<div id="div_punt{{index}}" class="awesome-marker-web awesome-marker-icon-punt_r fa fa-"'+ 
	'									style="font-size: 8px; width: 16px; height: 16px; color: rgb(51, 51, 51); background-color: {{style.fillColor}};"> </div>'+
	'							{{else}}'+
	'								<div id="div_punt{{index}}" class="awesome-marker-web awesome-marker-icon-{{style.markerColor}} fa'+
	'									{{#if style.icon}}'+
	'										fa-{{style.icon}}"></div>'+	
	'									{{else}}'+
	'										"></div>'+
	'									{{/if}}'+
	'							{{/if}}'+
	'						</td></tr>'+
	'						{{/each}}'+
	'						</tbody>'+
	'					</table>'+	
	'					</script>'+
	'					<script id="tematic-values-unic-polyline-template" type="text/x-handlebars-template">'+
	'					<table class="table">'+
	'						<tbody>'+
	'						{{#each values}}'+
	'						<tr><td>{{v}}</td><td>'+
	'							<canvas id="cv_pol{{index}}" height="40" width="40"></canvas>'+
	'						</td></tr>'+
	'						{{/each}}'+
	'						</tbody>'+
	'					</table>'+	
	'					</script>'+
	'					<script id="tematic-values-unic-polygon-template" type="text/x-handlebars-template">'+
	'					<table class="table">'+
	'						<tbody>'+
	'						{{#each values}}'+
	'						<tr><td>{{v}}</td><td>'+
	'							<canvas id="cv_pol{{index}}" height="40" width="40"></canvas>'+
	'						</td></tr>'+
	'						{{/each}}'+
	'						</tbody>'+
	'					</table>'+	
	'					</script>'+
	'					<script id="tematic-values-rangs-punt-template" type="text/x-handlebars-template">'+
	'					<table class="table">'+
	'						<thead>'+
	'						<tr>'+
	'     						<th lang="ca">Valor min</th>'+
	'     						<th lang="ca">Valor max</th>'+
	'  						</tr>'+
	' 						</thead>'+
	'						<tbody>'+
	'						{{#each values}}'+
	'						<tr><td><input type="text" value="{{v.min}}" name="min"></td>'+
	'							<td><input type="text" value="{{v.max}}" name="max"></td>'+
	'							<td>'+
	'							{{#if style.isCanvas}}'+
	'								<div id="div_punt{{index}}" class="awesome-marker-web awesome-marker-icon-punt_r fa fa-"'+ 
	'									style="font-size: 10.5px; width: 21px; height: 21px; color: rgb(51, 51, 51); background-color: {{style.fillColor}};"> </div>'+
	'							{{else}}'+
	'								<div id="div_punt{{index}}" class="awesome-marker-web awesome-marker-icon-{{style.markerColor}} fa'+
	'									{{#if style.icon}}'+
	'										fa-{{style.icon}}"></div>'+	
	'									{{else}}'+
	'										"></div>'+
	'									{{/if}}'+
	'							{{/if}}'+
	'						</td></tr>'+
	'						{{/each}}'+
	'						</tbody>'+
	'					</table>'+	
	'					</script>'+
	'					<script id="tematic-values-rangs-polyline-template" type="text/x-handlebars-template">'+
	'					<table class="table">'+
	'						<tbody>'+
	'						{{#each values}}'+
	'						<tr><td><input type="text" value="{{v.min}}" name="min"></td>'+
	'							<td><input type="text" value="{{v.max}}" name="max"></td>'+
	'							<td>'+
	'							<canvas id="cv_pol{{index}}" height="40" width="40"></canvas>'+
	'						</td></tr>'+
	'						{{/each}}'+
	'						</tbody>'+
	'					</table>'+	
	'					</script>'+
	'					<script id="tematic-values-rangs-polygon-template" type="text/x-handlebars-template">'+
	'					<table class="table">'+
	'						<tbody>'+
	'						{{#each values}}'+
	'						<tr><td><input type="text" value="{{v.min}}" name="min"></td>'+
	'							<td><input type="text" value="{{v.max}}" name="max"></td>'+
	'							<td>'+
	'							<canvas id="cv_pol{{index}}" height="40" width="40"></canvas>'+
	'						</td></tr>'+
	'						{{/each}}'+
	'						</tbody>'+
	'					</table>'+	
	'					</script>'+
	'					<div id="palet_warning" class="alert alert-warning"><span class="glyphicon glyphicon-info-sign"></span>'+
	'					<span lang="ca">Per facilitar la llegibilitat del mapa hem limitat el número màxim de colors per a aquest estil a 9. La resta de categories es simbolitzaran amb color gris</span></div>'+
	'					<div id="list_tematic_values"></div>'+
	'				</div>'+
	'				<div class="modal-footer">'+
	'					<div id="paletes_colors">'+
	'						<div lang="ca">Tria la paleta de colors</div>'+
	'						<img id="paletaPaired" src="img/paleta2.png" class="btn-paleta" lang="ca" title="Paired">'+
	'						<img id="paletaPastel" src="img/paleta1.png" class="btn-paleta" lang="ca" title="Pastel">'+
	'						<img id="paletaDivergent" src="img/paleta_divergent.png" class="btn-paleta" lang="ca" title="Divergent">'+
	'						<img id="paletaSecuencial" src="img/paleta_sequencial.png" class="btn-paleta" lang="ca" title="Sequencial">'+
	'					</div>'+
	'					<button type="button" class="btn btn-default" data-dismiss="modal" lang="ca">Tancar</button>'+
	'         			<button type="button" class="btn btn-success" lang="ca">Canviar</button>'+
	'				</div>'+
	'			</div>'+
	'			<!-- /.modal-content -->'+
	'		</div>'+
	'		<!-- /.modal-dialog -->'+
	'	</div>'+
	'	<!-- /.modal -->'+
	'	<!-- fi Modal Tematics Rangs -->'		
	);
}