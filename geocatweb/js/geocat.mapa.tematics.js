
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
					if (tipusCapa == t_tematic || tipusCapa == t_json || tipusCapa == t_visualitzacio || tipusCapa == t_url_file){ //tematic
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
					if (tipusCapa == t_tematic || tipusCapa == t_visualitzacio){ //tematic
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
						(tipusCapa == t_tematic && ftype == t_marker) ||
						(tipusCapa == t_url_file && ftype == t_marker) ||
						(tipusCapa == t_visualitzacio && ftype == t_marker)){
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
		//Revisar majus minus del "geometryType"!
		var ftype = "";
		if(data.geometrytype) ftype = transformTipusGeometry(data.geometrytype);
		else ftype = transformTipusGeometry(data.geometrType);
		
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
	try {map.spin(true);} catch (Err) {}
	var defer = $.Deferred();
	var data={
		businessId: layer.businessId
	};
	
	var layerWms = layer;
	
	//console.time("loadTematicLayer " + layerWms.serverName);
	getTematicLayerByBusinessId(data).then(function(results){
		try {map.spin(false);} catch (Err) {}
		readTematic(defer, results, layerWms, layer);
	},function(results){
		//console.debug('getTematicLayerByBusinessId ERROR');
		try {map.spin(false);} catch (Err) {}
		defer.reject();
	});
	return defer.promise();
}


//function createPopupWindowVisor(player,type){
//	console.debug("createPopupWindowVisor");
//	var html='<div class="div_popup_visor">' 
//		+'<div class="popup_pres">';
//	
//	if (player.properties.data.nom && !isBusinessId(player.properties.data.nom)){
//		html+='<div id="titol_pres_visor">'+player.properties.data.nom+'</div>';
//	}else if(player.properties.name && !isBusinessId(player.properties.name)){
//		html+='<div id="titol_pres_visor">'+player.properties.name+'</div>';
//	}
//		
//	if (player.properties.data.text){
//		html+='<div id="des_pres_visor">'+parseUrlTextPopUp(player.properties.data.text)+'</div>';
//	}
//	if(type == t_polyline && player.properties.mida){
//		html+='<div id="mida_pres"><b>'+window.lang.convert('Longitud')+':</b> '+player.properties.mida+'</div>';	
//	}else if(type == t_polygon && player.properties.mida){
//		html+='<div id="mida_pres"><b>'+window.lang.convert('Ã€rea')+':</b> '+player.properties.mida+'</div>';
//	}
//	
//	html+='<div id="capa_pres_visor"><k>'+player.properties.capaNom+'</k></div>'
//	+'</div></div>';
//	
//	player.bindPopup(html,{'offset':[0,-25]});	
//}

function createPopupWindowData(player,type, editable, origen){
//	console.debug("createPopupWindowData");
//	console.debug(player);
	var html='';
	if (player.properties.data.nom && !isBusinessId(player.properties.data.nom)){
		html+='<h4 class="my-text-center">'+player.properties.data.nom+'</h4>';
	}else if(player.properties.name && !isBusinessId(player.properties.name)){
		html+='<h4 class="my-text-center">'+player.properties.name+'</h4>';
	}
	
//	if (player.properties.data.text){
//		html+='<div>'+parseUrlTextPopUp(player.properties.data.text)+'</div>';
//	}
	
	html+='<div class="div_popup_visor"><div class="popup_pres">';
	$.each( player.properties.data, function( key, value ) {
//		alert( key + ": " + value );
//		if(key.indexOf("slot")==-1 && value!=undefined && value!=null && value != " "){
		if(isValidValue(key) && isValidValue(value)){
			if (key != 'id' && key != 'businessId' && key != 'slotd50' && key != 'nom' && key != 'name'){
				html+='<div class="popup_data_row">';
				
				var txt = parseUrlTextPopUp(value, key);
				if(txt.indexOf("iframe")==-1 && txt.indexOf("img")==-1){
					html+='<div class="popup_data_key">'+key+'</div>';
					html+='<div class="popup_data_value">'+
					(isBlank(txt)?window.lang.convert("Sense valor"):txt)+
					'</div>';
				}else{
					html+='<div class="popup_data_img_iframe">'+txt+'</div>';
				}
				html+= '</div>';
			}
		}
	});	
	
	if(editable){
		html+= '<div id="footer_edit"  class="modal-footer">'
					+'<ul class="bs-popup">'
					
						+'<li class="edicio-popup"><a id="feature_edit#'+player._leaflet_id+'#'+type+'" lang="ca" href="#"><span class="glyphicon glyphicon-map-marker verd" data-toggle="tooltip" data-placement="bottom" title="'+window.lang.convert('Estils')+'"></span></a>   </li>'
						+'<li class="edicio-popup"><a id="feature_move#'+player._leaflet_id+'#'+type+'" lang="ca" href="#"><span class="glyphicon glyphicon-move magenta" data-toggle="tooltip" data-placement="bottom" title="'+window.lang.convert('Editar')+'"></span></a>   </li>'
						+'<li class="edicio-popup"><a id="feature_remove#'+player._leaflet_id+'#'+type+'" lang="ca" href="#"><span class="glyphicon glyphicon-trash vermell" data-toggle="tooltip" data-placement="bottom" title="'+window.lang.convert('Esborrar')+'"></span></a>   </li>'
						+'<li class="edicio-popup"><a id="feature_data_table#'+player._leaflet_id+'#'+type+'#'+player.properties.capaLeafletId+'" lang="ca" href="#"><span class="glyphicon glyphicon-list-alt blau" data-toggle="tooltip" data-placement="bottom" title="'+window.lang.convert('Dades')+'"></span></a>   </li>'					
					/*
						+'<li class="edicio-popup"><a id="feature_edit#'+player._leaflet_id+'#'+type+'" lang="ca" href="#">'+window.lang.convert('Estils')+'<span class="glyphicon glyphicon-map-marker verd"></span></a>   </li>'
						+'<li class="edicio-popup"><a id="feature_move#'+player._leaflet_id+'#'+type+'" lang="ca" href="#">'+window.lang.convert('Editar')+'<span class="glyphicon glyphicon-move magenta"></span></a>   </li>'
						+'<li class="edicio-popup"><a id="feature_remove#'+player._leaflet_id+'#'+type+'" lang="ca" href="#">'+window.lang.convert('Esborrar')+'<span class="glyphicon glyphicon-trash vermell"></span></a>   </li>'
						+'<li class="edicio-popup"><a id="feature_data_table#'+player._leaflet_id+'#'+type+'#'+player.properties.capaLeafletId+'" lang="ca" href="#">'+window.lang.convert('Dades')+'<span class="glyphicon glyphicon-list-alt blau"></span></a>   </li>'
					*/
					+'</ul>'														
				+'</div>';	
	}else{
		var capaLeafletId = player.properties.capaLeafletId;
		if(isValidValue(origen)) {
			capaLeafletId = origen; 
		}
		html+= '<div id="footer_edit"  class="modal-footer">'
			+'<ul class="bs-popup">'						
				+'<li class="consulta-popup"><a id="feature_data_table#'+player._leaflet_id+'#'+type+'#'+capaLeafletId+'" lang="ca" href="#"><span class="glyphicon glyphicon-list-alt blau-left" data-toggle="tooltip" data-placement="right" title="'+window.lang.convert('Obrir la taula de dades')+'"></span></a>   </li>'
			+'</ul>'														
		+'</div>';			
	}
	
	html+='</div>'; 
	if(type == t_polyline && player.properties.mida){
		html+='<div id="mida_pres"><b>'+window.lang.convert('Longitud')+':</b> '+player.properties.mida+'</div>';	
	}else if(type == t_polygon && player.properties.mida){
		html+='<div id="mida_pres"><b>'+window.lang.convert('Ã€rea')+':</b> '+player.properties.mida+'</div>';
	}
	html+='</div>';
	//he quitado el openPopup() ya que si la capa no estÃ¡ activa no se ha cargado en el mapa y da error.
	player.bindPopup(html,{'offset':[0,-25]});
	
	//Afegim events/accions al popUp
	jQuery(document).on('click', ".bs-popup li a", function(e) {
		e.stopImmediatePropagation();
		var accio;
		if(jQuery(this).attr('id').indexOf('#')!=-1){			
			accio=jQuery(this).attr('id').split("#");				
		}
		objEdicio.featureID=accio[1];
		
		if(accio[0].indexOf("feature_edit")!=-1){

			//Update modal estils, amb estil de la feature seleccionada
			var obj = map._layers[accio[1]];
			//console.debug(obj);
			if(obj.options.icon /*|| obj.options.icon.options.markerColor.indexOf("punt_r")!=-1*/){
				var icon = obj.options.icon.options;	
			}else if(obj._options){
				var icon = obj._options;
			}else{
				var icon = obj.options;
			}
			updateDialogStyleSelected(icon);

			
			if(accio[2].indexOf("marker")!=-1){
				obrirMenuModal('#dialog_estils_punts','toggle',from_creaPopup);
			}else if(accio[2].indexOf("polygon")!=-1){
				obrirMenuModal('#dialog_estils_arees','toggle',from_creaPopup);
			}else{
				obrirMenuModal('#dialog_estils_linies','toggle',from_creaPopup);
			}
		}else if(accio[0].indexOf("feature_data_table")!=-1){
		
			$('#modal_data_table').modal('show');
			fillModalDataTable(controlCapes._layers[accio[3]],map._layers[objEdicio.featureID].properties.businessId);
		
		}else if(accio[0].indexOf("feature_remove")!=-1){
			map.closePopup();
			var data = {
	            businessId: map._layers[objEdicio.featureID].properties.businessId,
	            uid: $.cookie('uid')
	        };
			
			var features = {
					type:"Feature",
					id: 3124,
					businessId: map._layers[objEdicio.featureID].properties.businessId,
					properties: map._layers[objEdicio.featureID].properties.data,
					estil: map._layers[objEdicio.featureID].properties.estil,
					geometry: map._layers[objEdicio.featureID].properties.feature.geometry
				};				
			
			features = JSON.stringify(features);
			
			var data = {
				businessId: map._layers[objEdicio.featureID].properties.capaBusinessId,//bID de la visualitzacio-capa
				uid: $.cookie('uid'),
				features: features
			};
			
			removeGeometriaFromVisualitzacio(data).then(function(results){
				if(results.status == 'OK'){
					var capaLeafletId = map._layers[objEdicio.featureID].properties.capaLeafletId;
					map._layers[capaLeafletId].removeLayer(map._layers[objEdicio.featureID]);
					if(map._layers[objEdicio.featureID]!= null) map.removeLayer(map._layers[objEdicio.featureID]);					
					//Actualitzem comptador de la capa
					updateFeatureCount(map._layers[capaLeafletId].options.businessId, null);
				}else{
					console.debug("ERROR deleteFeature");
				}
			},function(results){
				console.debug("ERROR deleteFeature");
			});					
		}else if(accio[0].indexOf("feature_text")!=-1){
			modeEditText();
		}else if(accio[0].indexOf("feature_move")!=-1){
			objEdicio.esticEnEdicio=true;
			var capaLeafletId = map._layers[objEdicio.featureID].properties.capaLeafletId;	
			objEdicio.capaEdicioLeafletId = capaLeafletId;//Ho guarda per despres poder actualitzar vis filles
			//Actualitzem capa activa
			if (capaUsrActiva){
				capaUsrActiva.removeEventListener('layeradd');
			}
			capaUsrActiva = map._layers[capaLeafletId];
			
			var capaEdicio = new L.FeatureGroup();
			capaEdicio.addLayer(map._layers[objEdicio.featureID]);
			capaUsrActiva.removeLayer(map._layers[objEdicio.featureID]);
			map.addLayer(capaEdicio);
			
			var opcionsSel={
					color: '#FF1EE5',
					"weight": 7,
					opacity: 0.6,
					dashArray: '1, 1',
					fill: true,
					fillColor: '#fe57a1',
					fillOpacity: 0.1
				};
			
			crt_Editing=new L.EditToolbar.Edit(map, {
				featureGroup: capaEdicio,
				selectedPathOptions: opcionsSel
			});
			crt_Editing.enable();
			map.closePopup();
			
		}else if(accio[0].indexOf("feature_no")!=-1){
			jQuery('.popup_pres').show();
			jQuery('.popup_edit').hide();
			
		}else if(accio[0].indexOf("feature_ok")!=-1){
			if(objEdicio.edicioPopup=='textFeature'){
				var txtTitol=jQuery('#titol_edit').val();
				var txtDesc=jQuery('#des_edit').val();
				
				updateFeatureNameDescr(map._layers[objEdicio.featureID],txtTitol,txtDesc);

			}else if(objEdicio.edicioPopup=='textCapa'){
				if(jQuery('#capa_edit').val()!=""){
					jQuery('#cmbCapesUsr option:selected').text(jQuery('#capa_edit').val());	
					jQuery('.popup_pres').show();
					jQuery('.popup_edit').hide();
				}else{
					alert(window.lang.convert('Has de posar un nom de capa'));	
				}
			}else if(objEdicio.edicioPopup=='nouCapa'){
				if(jQuery('#capa_edit').val()!=""){
					generaNovaCapaUsuari(map._layers[objEdicio.featureID],jQuery('#capa_edit').val());
				}else{
					alert(window.lang.convert('Has de posar un nom de capa'));	
				}
			}
		}else{
		//accio tanca
			map.closePopup();
		}
	});	

	player.on('popupopen', function(e){
		if(objEdicio.esticEnEdicio){//Si s'esta editant no es pot editar altre element
			map.closePopup();
		}
	});	
}

/*****************************/


/** Funcions que actualitzen l'estil per defecte, al seleccionat al dialeg d'estils
 * 	per punts, lÃ­nies, i polÃ­gons. 
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
	
	if(_iconFons.indexOf("_r")!=-1){ //sÃ³c rodÃ³		
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
		if(_iconGlif=="" || _iconGlif=="undefined" || _iconGlif==null){//no tin glif soc Canvas
			puntTMP.options.icon="";
			puntTMP.options.radius = parseInt(estilP.size/2.4);
			puntTMP.options.isCanvas=true;
		}else{
			puntTMP.options.iconAnchor= new L.Point(parseInt(num/2), parseInt(num/2));
			puntTMP.options.iconSize = new L.Point(num, num);	
			puntTMP.options.icon=_iconGlif + " "+cssText;
			puntTMP.options.isCanvas=false;
		}
	}else{ // sÃ³c pinxo
		puntTMP.options.iconAnchor= new L.Point(14, 42);
		puntTMP.options.iconSize = new L.Point(28, 42);
		puntTMP.options.shadowSize = new L.Point(36, 16);
		puntTMP.options.divColor='transparent';
		if(_iconGlif=="" || _iconGlif=="undefined" || _iconGlif==null){
			puntTMP.options.icon="";
		}else{
			puntTMP.options.icon=_iconGlif + " "+cssText;			
		}
		puntTMP.options.isCanvas=false;
	}
	puntTMP.options.markerColor=_iconFons;
	if(puntTMP.options.icon==""){
		puntTMP.options.iconColor="#000000";
	}else{
		puntTMP.options.iconColor=_colorGlif;
	}
	
	if(objEdicio.obroModalFrom==from_creaCapa){
		defaultPunt=puntTMP;
	}
	return puntTMP;
}
/*****************************/

/**Funcions per crear un objecte de tipus estil, amb les caracterÃ­stiques que li passes
 * per punt, lÃ­nia, poligon */

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


function getMarkerRangFromStyle(styles){
	
	if (styles.options.isCanvas){
		var rang = {
			isCanvas: true,	
			simbolSize : styles.options.radius, 
			color :  jQuery.Color(styles.options.fillColor).toHexString(),
			borderColor :  styles.options.color,
			borderWidth :  styles.options.weight,
			opacity: (styles.options.fillOpacity * 100),
			label : false,
			labelSize : 10,
			labelFont : 'arial',
			labelColor : '#000000',					
		};
	}else{
		//CAL??
		if(jQuery.type(styles.options.icon) === "object"){
			var auxOptions = styles.options.icon.options;
		}else{
			var auxOptions = styles.options;
		}
		
		var rang = {
			isCanvas: false,
			color : auxOptions.divColor,//auxOptions.fillColor,//Color principal
			marker: auxOptions.markerColor,//Si es de tipus punt_r o el color del marker
			simbolColor: auxOptions.iconColor,//Glyphon
			radius : auxOptions.radius,//Radius
			iconSize : auxOptions.iconSize.x+"#"+auxOptions.iconSize.y,//Size del cercle
			iconAnchor : auxOptions.iconAnchor.x+"#"+auxOptions.iconAnchor.y,//Anchor del cercle
			simbol : $.trim(auxOptions.icon),//tipus glyph
			opacity : (auxOptions.opacity * 100),
			label : false,
			labelSize : 10,
			labelFont : 'arial',
			labelColor : '#000000',
		};
	}
	return rang;
}

function getLineRangFromStyle(styles){
	var rang = {
		color: styles.strokeStyle,//styles.color,
		lineWidth: styles.lineWidth,//styles.weight,
		lineStyle : 'solid',
		borderWidth : 2,
		borderColor : styles.strokeStyle,				
		//opacity: (styles.opacity * 100),
		opacity: 100,
		label : false,
		labelSize : 10,
		labelFont : 'arial',
		labelColor : '#000000'
	};	
	return rang;
}

function getPolygonRangFromStyle(styles){
	styles.fillColor = jQuery.Color(styles.fillColor).toHexString();
	console.debug("------getPolygonRangFromStyle---------");
	
	console.debug("styles:");
	console.debug(styles);

	var rang = {
		borderWidth: styles.lineWidth,//styles.weight,
		borderColor: styles.strokeStyle,//styles.color,
		color: rgb2hex(styles.fillStyle),//styles.fillColor,
		opacity: (styles.opacity * 100),//(styles.fillOpacity * 100),
		lineStyle : 'solid',
		label : false,
		labelSize : 10,
		labelFont : 'arial',
		labelColor : '#000000',
		weight: styles.lineWidth
	};	
	
	console.debug("rang:");
	console.debug(rang);	
	console.debug("-------------------------------------");
	return rang;
}

function getRangsFromStyles(tematic, styles){
	//console.debug("getRangsFromStyles");
	if (tematic.tipus == t_dades_obertes){
		tematic.geometrytype = t_marker;
	}
	
//	var ftype_vell = transformTipusGeometry(tematic.geometrytype);
//	var ftype = transformTipusGeometry(tematic.geometryType);
	
	//Revisar majus minus del "geometryType"!
	var ftype = "";
	if(tematic.geometrytype) ftype = transformTipusGeometry(tematic.geometrytype);
	else if(tematic.geometryType) ftype = transformTipusGeometry(tematic.geometryType);
	else ftype = transformTipusGeometry(tematic.geometrType);
	
	/*Control cas multiple
	if(ftype == t_multiple && styles.options){
		 ftype = transformTipusGeometry(styles.options.tipus);
	}*/
	
	var rangs = [];
	if (jQuery.isArray(styles)){
		jQuery.each(styles, function(i, val){
			var rang = getRangsFromStyles(tematic, val.style);
			if(rang[0]){
				rang[0].featureLeafletId = val.style._leaflet_id;
				rang = rang[0];
				rang.valorMax = val.key;
				rangs.push(rang);			
			}

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
					opacity: (styles.options.fillOpacity * 100),
					label : false,
					labelSize : 10,
					labelFont : 'arial',
					labelColor : '#000000',					
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
					//legenda : 'TODO ficar llegenda',//TODO ficar nom de la feature del popup de victor
//					valorMax : "feature" + fId,
					//Canviat a divColor, si es marker, sera sempre 'transparent'
					color : auxOptions.divColor,//auxOptions.fillColor,//Color principal
					marker: auxOptions.markerColor,//Si es de tipus punt_r o el color del marker
					simbolColor: auxOptions.iconColor,//Glyphon
					radius : auxOptions.radius,//Radius
					iconSize : auxOptions.iconSize.x+"#"+auxOptions.iconSize.y,//Size del cercle
					iconAnchor : auxOptions.iconAnchor.x+"#"+auxOptions.iconAnchor.y,//Anchor del cercle
					simbol : $.trim(auxOptions.icon),//tipus glyph
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
				lineStyle : 'solid',
				borderWidth : 2,
				borderColor : styles.options.color,				
				opacity: (styles.options.opacity * 100),
				label : false,
				labelSize : 10,
				labelFont : 'arial',
				labelColor : '#000000'
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
				opacity: (styles.fillOpacity * 100),
				lineStyle : 'solid',
				label : false,
				labelSize : 10,
				labelFont : 'arial',
				labelColor : '#000000'					
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
			'	<div id="st_Color" lang="ca" class="div_estil_1"></div>'+
			'	<div id="st_Tema" lang="ca" class="div_estil_2"></div>'+
			'	<!--<div id="st_Size" lang="ca" data-toggle="tooltip" title="Mides"	class="div_estil_3"></div>-->'+
			'	<div id="st_Heat" lang="ca" class="div_estil_4"></div>'+
			'	<div id="st_Clust" lang="ca" class="div_estil_5"></div>'+
			'</div>'			
	);
	
	$('#st_Color').tooltip({placement : 'bottom',container : 'body',title : window.lang.convert("BÃ sic")});
	$('#st_Tema').tooltip({placement : 'bottom',container : 'body',title : window.lang.convert("Categories")});
	$('#st_Heat').tooltip({placement : 'bottom',container : 'body',title : window.lang.convert("ConcentraciÃ³")});
	$('#st_Clust').tooltip({placement : 'bottom',container : 'body',title : window.lang.convert("AgrupaciÃ³")});	
	
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
	'						<span>1.</span><span lang="ca">Escull el camp per simbolitzar</span>:'+
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
	'						<span>2.</span><span lang="ca">Escull l\'interval</span>:'+
	'						<span class="rd_separator"></span>'+
	'						<input type="radio" id="rd_tipus_unic" name="rd_tipus_agrupacio" value="U">'+
	'						<label for="rd_tipus_unic" lang="ca">'+window.lang.convert("Ãºnic")+'</label>'+
	'						<span class="rd_separator"></span>'+
	'						<input type="radio" id="rd_tipus_rang" name="rd_tipus_agrupacio" value="R">'+
	'						<label for="rd_tipus_rang" lang="ca">per intervals</label>'+
	'<!-- 						<select id="cmb_tipus_agrupacio"> -->'+
	'<!-- 							<option lang="ca" value="U">Ãšnic</option> -->'+
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
	'								<div id="div_punt{{index}}" class="awesome-marker-web awesome-marker-icon-punt_r fa fa- dropdown-toggle" data-toggle="dropdown"'+ 
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
	'							<canvas id="cv_pol{{index}}" height="30" width="30" class="shadow dropdown-toggle" data-toggle="dropdown"></canvas>'+
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
	'							<canvas id="cv_pol{{index}}" height="30" width="30" class="shadow dropdown-toggle" data-toggle="dropdown"></canvas>'+
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
	'								<div id="div_punt{{index}}" class="awesome-marker-web awesome-marker-icon-punt_r fa fa- dropdown-toggle" data-toggle="dropdown"'+ 
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
	'					<script id="tematic-values-rangs-polyline-template" type="text/x-handlebars-template">'+
	'					<table class="table">'+
	'						<tbody>'+
	'						{{#each values}}'+
	'						<tr><td><input type="text" value="{{v.min}}" name="min"></td>'+
	'							<td><input type="text" value="{{v.max}}" name="max"></td>'+
	'							<td>'+
	'							<canvas id="cv_pol{{index}}" height="30" width="30" class="shadow dropdown-toggle" data-toggle="dropdown"></canvas>'+
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
	'							<canvas id="cv_pol{{index}}" height="30" width="30" class="shadow dropdown-toggle" data-toggle="dropdown"></canvas>'+
	'						</td></tr>'+
	'						{{/each}}'+
	'						</tbody>'+
	'					</table>'+	
	'					</script>'+
	'					<div id="palet_warning" class="alert alert-warning"><span class="glyphicon glyphicon-info-sign"></span>'+
	'					<span lang="ca">Per facilitar la llegibilitat del mapa hem limitat el nÃºmero mÃ xim de colors per a aquest estil a 9. La resta de categories es simbolitzaran amb color gris</span></div>'+
	'					<div id="list_tematic_values"></div>'+

	'					<div id="paletes_colors">'+
	'						<div lang="ca">Tria la paleta de colors</div>'+
	'<div class="ramp BuGn"><svg height="75" width="15"><rect y="0" height="15" width="15" fill="rgb(237,248,251)"/><rect y="15" height="15" width="15" fill="rgb(178,226,226)"/><rect y="30" height="15" width="15" fill="rgb(102,194,164)"/><rect y="45" height="15" width="15" fill="rgb(44,162,95)"/><rect y="60" height="15" width="15" fill="rgb(0,109,44)"/></svg></div>'+
	'<div class="ramp BuPu"><svg height="75" width="15"><rect y="0" height="15" width="15" fill="rgb(237,248,251)"/><rect y="15" height="15" width="15" fill="rgb(179,205,227)"/><rect y="30" height="15" width="15" fill="rgb(140,150,198)"/><rect y="45" height="15" width="15" fill="rgb(136,86,167)"/><rect y="60" height="15" width="15" fill="rgb(129,15,124)"/></svg></div>'+
	'<div class="ramp GnBu"><svg height="75" width="15"><rect y="0" height="15" width="15" fill="rgb(240,249,232)"/><rect y="15" height="15" width="15" fill="rgb(186,228,188)"/><rect y="30" height="15" width="15" fill="rgb(123,204,196)"/><rect y="45" height="15" width="15" fill="rgb(67,162,202)"/><rect y="60" height="15" width="15" fill="rgb(8,104,172)"/></svg></div>'+
	'<div class="ramp OrRd"><svg height="75" width="15"><rect y="0" height="15" width="15" fill="rgb(254,240,217)"/><rect y="15" height="15" width="15" fill="rgb(253,204,138)"/><rect y="30" height="15" width="15" fill="rgb(252,141,89)"/><rect y="45" height="15" width="15" fill="rgb(227,74,51)"/><rect y="60" height="15" width="15" fill="rgb(179,0,0)"/></svg></div>'+
	'<div class="ramp PuBu"><svg height="75" width="15"><rect y="0" height="15" width="15" fill="rgb(241,238,246)"/><rect y="15" height="15" width="15" fill="rgb(189,201,225)"/><rect y="30" height="15" width="15" fill="rgb(116,169,207)"/><rect y="45" height="15" width="15" fill="rgb(43,140,190)"/><rect y="60" height="15" width="15" fill="rgb(4,90,141)"/></svg></div>'+
	'<div class="ramp PuBuGn"><svg height="75" width="15"><rect y="0" height="15" width="15" fill="rgb(246,239,247)"/><rect y="15" height="15" width="15" fill="rgb(189,201,225)"/><rect y="30" height="15" width="15" fill="rgb(103,169,207)"/><rect y="45" height="15" width="15" fill="rgb(28,144,153)"/><rect y="60" height="15" width="15" fill="rgb(1,108,89)"/></svg></div>'+
	
	'<div class="ramp PuRd"><svg height="75" width="15"><rect y="0" height="15" width="15" fill="rgb(241,238,246)"/><rect y="15" height="15" width="15" fill="rgb(215,181,216)"/><rect y="30" height="15" width="15" fill="rgb(223,101,176)"/><rect y="45" height="15" width="15" fill="rgb(221,28,119)"/><rect y="60" height="15" width="15" fill="rgb(152,0,67)"/></svg></div>'+
	'<div class="ramp RdPu"><svg height="75" width="15"><rect y="0" height="15" width="15" fill="rgb(254,235,226)"/><rect y="15" height="15" width="15" fill="rgb(251,180,185)"/><rect y="30" height="15" width="15" fill="rgb(247,104,161)"/><rect y="45" height="15" width="15" fill="rgb(197,27,138)"/><rect y="60" height="15" width="15" fill="rgb(122,1,119)"/></svg></div>'+
	'<div class="ramp YlGn"><svg height="75" width="15"><rect y="0" height="15" width="15" fill="rgb(255,255,204)"/><rect y="15" height="15" width="15" fill="rgb(194,230,153)"/><rect y="30" height="15" width="15" fill="rgb(120,198,121)"/><rect y="45" height="15" width="15" fill="rgb(49,163,84)"/><rect y="60" height="15" width="15" fill="rgb(0,104,55)"/></svg></div>'+
	'<div class="ramp YlGnBu"><svg height="75" width="15"><rect y="0" height="15" width="15" fill="rgb(255,255,204)"/><rect y="15" height="15" width="15" fill="rgb(161,218,180)"/><rect y="30" height="15" width="15" fill="rgb(65,182,196)"/><rect y="45" height="15" width="15" fill="rgb(44,127,184)"/><rect y="60" height="15" width="15" fill="rgb(37,52,148)"/></svg></div>'+
	'<div class="ramp YlOrBr"><svg height="75" width="15"><rect y="0" height="15" width="15" fill="rgb(255,255,212)"/><rect y="15" height="15" width="15" fill="rgb(254,217,142)"/><rect y="30" height="15" width="15" fill="rgb(254,153,41)"/><rect y="45" height="15" width="15" fill="rgb(217,95,14)"/><rect y="60" height="15" width="15" fill="rgb(153,52,4)"/></svg></div>'+
	'<div class="ramp YlOrRd"><svg height="75" width="15"><rect y="0" height="15" width="15" fill="rgb(255,255,178)"/><rect y="15" height="15" width="15" fill="rgb(254,204,92)"/><rect y="30" height="15" width="15" fill="rgb(253,141,60)"/><rect y="45" height="15" width="15" fill="rgb(240,59,32)"/><rect y="60" height="15" width="15" fill="rgb(189,0,38)"/></svg></div>'+
	
	'<div class="ramp BrBG"><svg height="75" width="15"><rect y="0" height="15" width="15" fill="rgb(166,97,26)"/><rect y="15" height="15" width="15" fill="rgb(223,194,125)"/><rect y="30" height="15" width="15" fill="rgb(245,245,245)"/><rect y="45" height="15" width="15" fill="rgb(128,205,193)"/><rect y="60" height="15" width="15" fill="rgb(1,133,113)"/></svg></div>'+
	'<div class="ramp PRGn"><svg height="75" width="15"><rect y="0" height="15" width="15" fill="rgb(123,50,148)"/><rect y="15" height="15" width="15" fill="rgb(194,165,207)"/><rect y="30" height="15" width="15" fill="rgb(247,247,247)"/><rect y="45" height="15" width="15" fill="rgb(166,219,160)"/><rect y="60" height="15" width="15" fill="rgb(0,136,55)"/></svg></div>'+
	'<div class="ramp PuOr"><svg height="75" width="15"><rect y="0" height="15" width="15" fill="rgb(230,97,1)"/><rect y="15" height="15" width="15" fill="rgb(253,184,99)"/><rect y="30" height="15" width="15" fill="rgb(247,247,247)"/><rect y="45" height="15" width="15" fill="rgb(178,171,210)"/><rect y="60" height="15" width="15" fill="rgb(94,60,153)"/></svg></div>'+
	'<div class="ramp RdGy"><svg height="75" width="15"><rect y="0" height="15" width="15" fill="rgb(202,0,32)"/><rect y="15" height="15" width="15" fill="rgb(244,165,130)"/><rect y="30" height="15" width="15" fill="rgb(255,255,255)"/><rect y="45" height="15" width="15" fill="rgb(186,186,186)"/><rect y="60" height="15" width="15" fill="rgb(64,64,64)"/></svg></div>'+
	'<div class="ramp RdYlBu"><svg height="75" width="15"><rect y="0" height="15" width="15" fill="rgb(215,25,28)"/><rect y="15" height="15" width="15" fill="rgb(253,174,97)"/><rect y="30" height="15" width="15" fill="rgb(255,255,191)"/><rect y="45" height="15" width="15" fill="rgb(171,217,233)"/><rect y="60" height="15" width="15" fill="rgb(44,123,182)"/></svg></div>'+
	'<div class="ramp RdYlGn"><svg height="75" width="15"><rect y="0" height="15" width="15" fill="rgb(215,25,28)"/><rect y="15" height="15" width="15" fill="rgb(253,174,97)"/><rect y="30" height="15" width="15" fill="rgb(255,255,191)"/><rect y="45" height="15" width="15" fill="rgb(166,217,106)"/><rect y="60" height="15" width="15" fill="rgb(26,150,65)"/></svg></div>'+
	'<div class="ramp Spectral"><svg height="75" width="15"><rect y="0" height="15" width="15" fill="rgb(215,25,28)"/><rect y="15" height="15" width="15" fill="rgb(253,174,97)"/><rect y="30" height="15" width="15" fill="rgb(255,255,191)"/><rect y="45" height="15" width="15" fill="rgb(171,221,164)"/><rect y="60" height="15" width="15" fill="rgb(43,131,186)"/></svg></div>'+
	
	'<div class="ramp Paired"><svg height="75" width="15"><rect y="0" height="15" width="15" fill="rgb(166,206,227)"/><rect y="15" height="15" width="15" fill="rgb(31,120,180)"/><rect y="30" height="15" width="15" fill="rgb(178,223,138)"/><rect y="45" height="15" width="15" fill="rgb(51,160,44)"/><rect y="60" height="15" width="15" fill="rgb(251,154,153)"/></svg></div>'+
	'<div class="ramp Set3"><svg height="75" width="15"><rect y="0" height="15" width="15" fill="rgb(141,211,199)"/><rect y="15" height="15" width="15" fill="rgb(255,255,179)"/><rect y="30" height="15" width="15" fill="rgb(190,186,218)"/><rect y="45" height="15" width="15" fill="rgb(251,128,114)"/><rect y="60" height="15" width="15" fill="rgb(128,177,211)"/></svg></div>'+
	'<div class="ramp Set1"><svg height="75" width="15"><rect y="0" height="15" width="15" fill="rgb(228,26,28)"/><rect y="15" height="15" width="15" fill="rgb(55,126,184)"/><rect y="30" height="15" width="15" fill="rgb(77,175,74)"/><rect y="45" height="15" width="15" fill="rgb(152,78,163)"/><rect y="60" height="15" width="15" fill="rgb(255,127,0)"/></svg></div>'+
	'<div class="ramp Dark2"><svg height="75" width="15"><rect y="0" height="15" width="15" fill="rgb(27,158,119)"/><rect y="15" height="15" width="15" fill="rgb(217,95,2)"/><rect y="30" height="15" width="15" fill="rgb(117,112,179)"/><rect y="45" height="15" width="15" fill="rgb(231,41,138)"/><rect y="60" height="15" width="15" fill="rgb(102,166,30)"/></svg></div>'+
	
//	'						<img id="paletaPaired" src="img/paleta2.png" class="btn-paleta" lang="ca" title="Paired">'+
//	'						<img id="paletaPastel" src="img/paleta1.png" class="btn-paleta" lang="ca" title="Pastel">'+
//	'						<img id="paletaDivergent" src="img/paleta_divergent.png" class="btn-paleta" lang="ca" title="Divergent">'+
//	'						<img id="paletaSecuencial" src="img/paleta_sequencial.png" class="btn-paleta" lang="ca" title="Sequencial">'+
	'					</div>'+
	
	
	'				</div>'+
	'				<div class="modal-footer">'+
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


/*NOU MODEL VISUALITZACIO*/
function loadVisualitzacioLayer(layer){
	var defer = $.Deferred();
	var data={
		uid : jQuery.cookie('uid'),
		businessId: layer.businessId
	};
	
//	var layerWms = layer;
	//console.time("loadTematicLayer " + layerWms.serverName);
	getVisualitzacioByBusinessId(data).then(function(results){
		if(results.status == "OK" ){
			//console.debug("visualitzacio:");
			//console.debug(results.results);
			//console.debug("layer:");
			//console.debug(layer);			
			readVisualitzacio(defer, results.results, layer);			
		}else{
			console.debug('getVisualitzacioByBusinessId ERROR');
			defer.reject();
		}
	},function(results){
		console.debug('getVisualitzacioByBusinessId ERROR');
		defer.reject();
	});
	return defer.promise();
}

function readVisualitzacio(defer, visualitzacio, layer){
//	console.debug("readVisualitzacio:");
//	console.debug(layer);
//	if(layer.options && jQuery.type(layer.options)== "object"){
//		layer.options = JSON.stringify();
//	}
	
	var hasSource = (visualitzacio.options && (visualitzacio.options.indexOf("source")!=-1) ) 
					|| (layer.options && (layer.options.indexOf("source")!=-1) );
	
	if(visualitzacio.tipus == tem_heatmap){
//		loadTematicHeatmap(visualitzacio, layer.capesOrdre, layer.options, layer.capesActiva);
		loadVisualitzacioHeatmap(visualitzacio, layer.capesOrdre, layer.options, layer.capesActiva);
	}else if(visualitzacio.tipus == tem_cluster){
//		loadTematicCluster(visualitzacio, layer.capesOrdre, layer.options, layer.capesActiva);
		loadVisualitzacioCluster(visualitzacio, layer.capesOrdre, layer.options, layer.capesActiva);
	}else{
		
		capaVisualitzacio = new L.FeatureGroup();
		
		capaVisualitzacio.options = {
			businessId : layer.businessId,
			nom : layer.serverName,
			tipus : layer.serverType,
			tipusRang: visualitzacio.tipus, //Â¿?
			geometryType: visualitzacio.geometryType,
//			dades: hasDades, //No cal?
//			rangs: tematic.rangs,
			estil: visualitzacio.estil
//			rangsField: rangsField
		};
	
		if(hasSource) {
			var source = jQuery.parseJSON(visualitzacio.options);					
			capaVisualitzacio.options.source = source.source;
		}
		
		//Pel cas de del tematic categories, tenir els rangs d'estils
		if(visualitzacio.options && visualitzacio.options.indexOf("estilsRangs")!=-1) {
			var options = jQuery.parseJSON(visualitzacio.options);
			capaVisualitzacio.options.estilsRangs = options.estilsRangs;
		}

		//Pel cas de del tematic categories, tenir els rangs d'estils
		if(visualitzacio.options && visualitzacio.options.indexOf("rangsEstilsLegend")!=-1) {
			var options = jQuery.parseJSON(visualitzacio.options);
			capaVisualitzacio.options.rangsEstilsLegend = options.rangsEstilsLegend;
		}		
		
		if (!layer.capesActiva || layer.capesActiva == true || layer.capesActiva == "true"){
			capaVisualitzacio.addTo(map);
		}	
		
		var options;
		var origen = "";
		if (layer.options){
			options = jQuery.parseJSON( layer.options );
		}
		if(layer.options && options.origen){//Si es una sublayer
			origen = getLeafletIdFromBusinessId(options.origen);
		}
		
		//Afegim geomatries a la capa
		//per cada estil de la visualitzacio
		jQuery.each(visualitzacio.estil, function(index, estil){
			//console.debug("estil:");
			//console.debug(estil);
			var geomTypeVis = visualitzacio.geometryType;
			var geomStyle;
			
			if (geomTypeVis === t_marker){
				geomStyle = createMarkerStyle(estil, estil.geometria.features.length);
			}else if (geomTypeVis === t_multipoint){
				geomStyle = createMarkerStyle(estil, estil.geometria.features.length);
			}else if (geomTypeVis === t_polyline){
				geomStyle = createLineStyle(estil);
			}else if (geomTypeVis === t_multilinestring){
				geomStyle = createLineStyle(estil);
			}else if (geomTypeVis === t_polygon){
				geomStyle = createAreaStyle(estil);
			}else if (geomTypeVis === t_multipolygon){
				geomStyle = createAreaStyle(estil);
			}		
			
			//per cada geometria d'aquell estil
			jQuery.each(estil.geometria.features, function(indexGeom, geom){
//				console.debug("geom:");
//				console.debug(geom);
				var featureTem = [];
				var geomType = (geom.geometry.type?geom.geometry.type.toLowerCase():geomTypeVis);
//				var geomType = geomTypeVis;

				//MultyPoint
				if (geomTypeVis === t_marker && geomType === t_multipoint){
					//TODO revisar que funcione
					var coords=geom.geometry.coordinates;
					for (var i = 0; i < coords.length; i++){
						var c=coords[i];
						if(!geomStyle.isCanvas){
							featureTem.push(new L.marker([c[1], c[0]],
								{icon: rangStyle, isCanvas:false, tipus: t_marker}));
						}else{
							featureTem.push(new L.circleMarker([c[1], c[0]],geomStyle));
						}
					}
				//Punt
				}else if (geomTypeVis === t_marker){
					var coords=geom.geometry.coordinates;
					if(!geomStyle.isCanvas){
						featureTem.push(new L.marker([coords[1],coords[0]],
												{icon: geomStyle, isCanvas:false, 
												tipus: t_marker}
											));
					}else{
						featureTem.push(new L.circleMarker([coords[1],coords[0]],geomStyle));
					}
				//MultiPoint
				}else if (geomTypeVis === t_polyline && geomType === t_multilinestring){
					var coords=geom.geometry.coordinates;
					var llistaLines=[];
					var llistaLines2=[];
					
					for (var i = 0; i < coords.length; i++){
						var lines=coords[i];
						var llistaPunts=[];
						var myPolyline = new L.polyline(llistaPunts,geomStyle);
						
						for (var k = 0; k < lines.length; k++){
							var c=lines[k];
							var punt=new L.LatLng(c[1], c[0]);
							myPolyline.addLatLng(punt);
//							llistaPunts.push(punt);
						}
						featureTem.push(myPolyline);
//						llistaLines.push(llistaPunts);
//						llistaLines2.push(myPolyline.getLatLngs());
					}
//					featureTem = new L.multiPolyline(llistaLines, geomStyle);
//				
				//multiLine
				}else if (geomTypeVis === t_polyline){
					var coords=geom.geometry.coordinates;
					var llistaPunts=[];
					for (var i = 0; i < coords.length; i++){
						var c=coords[i];
						var punt=new L.LatLng(c[1], c[0]);
						llistaPunts.push(punt);
					}
					featureTem.push(new L.polyline(llistaPunts, geomStyle));
				//multiPolygon
				}else if(geomTypeVis === t_polygon && geomType === t_multipolygon){
					
					
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
								var punt=new L.LatLng(c[1], c[0]);
								llistaPunts.push(punt);
							}
							llistaLines.push(llistaPunts);
						}
						llistaPoligons.push(llistaLines);
					}
//					featureTem = new L.multiPolygon(llistaPoligons, geomStyle);	
					featureTem.push(new L.multiPolygon(llistaPoligons, geomStyle));
					
//					var coords=geom.geometry.coordinates;
//					var llistaPoligons=[];
//					for (var p = 0; p < coords.length; p++){
//						var poligonCoord=coords[p];
//						var llistaPunts=[];
//						var myPolygon = new L.polygon(llistaPunts,geomStyle);
//						for (var i = 0; i < poligonCoord.length; i++){
//							var pol=poligonCoord[i];
//							for (var j = 0; j < pol.length; j++){
//								
//								var c = pol[j];
//								var punt=new L.LatLng(c[0], c[1]);
//								myPolygon.addLatLng(punt);
//							}
//						}
//						//llistaPoligons.push(myPolygon);
//						featureTem.push(myPolygon);
//					}
//					//featureTem.push(llistaPoligons, geomStyle);
//				//polygon
				}else if (geomTypeVis === t_polygon){
					var coords=geom.geometry.coordinates;
					var llistaLines=[];
					for (var i = 0; i < coords.length; i++){
						var lines=coords[i];
						var llistaPunts=[];
						for (var k = 0; k < lines.length; k++){
							var c=lines[k];
							var punt=new L.LatLng(c[1], c[0]);
							llistaPunts.push(punt);
						}
						llistaLines.push(llistaPunts);
					}
					featureTem.push(new L.Polygon(llistaLines, geomStyle));
				}
				
				//console.debug("featuretem:");
				//console.debug(featureTem);
				jQuery.each(featureTem, function(index, feat){
					feat.properties = {};
					feat.properties.businessId = geom.businessId;
					feat.properties.data = geom.properties;
					feat.properties.estil = estil;
					feat.properties.capaLeafletId = capaVisualitzacio._leaflet_id;
					feat.properties.capaNom = capaVisualitzacio.options.nom;
					feat.properties.capaBusinessId = capaVisualitzacio.options.businessId;
					feat.properties.tipusFeature = geomTypeVis;
					
					//Cal??
					if (feat.options){
						feat.options.tipus = geomTypeVis;
					}else{
						feat.options = {tipus: geomTypeVis};
					}
					
					feat.properties.feature = {};
					feat.properties.feature.geometry = geom.geometry;
//					console.debug("Add feat:");
					capaVisualitzacio.addLayer(feat);
					//console.debug(feat);
				
					if(geomTypeVis == t_polygon){
						feat.properties.mida = calculateArea(feat.getLatLngs());
					}else if(geomTypeVis == t_polyline){
						feat.properties.mida = calculateDistance(feat.getLatLngs());
					}
				
	//				//Si la capa no ve de fitxer
					if(!hasSource){
//						console.debug("no te source, no ve de fitxer");
						if($(location).attr('href').indexOf('mapa')!=-1 && ((capaVisualitzacio.options.tipusRang == tem_origen) || !capaVisualitzacio.options.tipusRang) ){
							createPopupWindow(feat,geomTypeVis);
						}else{
//							console.debug("Estem mode vis i no es tem origen:");
//							createPopupWindowVisor(feat,geomTypeVis);
							createPopupWindowData(feat,geomTypeVis, false, origen);
						}								
					}else{
//						console.debug("Te source, ve de fitxer");
//						console.debug(capaVisualitzacio);
						if($(location).attr('href').indexOf('mapa')!=-1 && capaVisualitzacio.options.tipusRang == tem_origen){
//							console.debug("Estem mode mapa i es tem origen");
							createPopupWindowData(feat,geomTypeVis, true, origen);
						}else{
//							console.debug("Estem mode vis i no es tem origen:");
//							console.debug(origen);
							createPopupWindowData(feat,geomTypeVis, false, origen);
						}
						
					}
					map.closePopup();					
				});
				
			});
		});	
		
		//Afegim num d'elements al nom de la capa, si Ã©s un fitxer
		if(layer.dragdrop || layer.urlFile){
			capaVisualitzacio.options.nom = capaVisualitzacio.options.nom;// + " ("+capaTematic.getLayers().length+")";
			var data = {
				 	businessId: capaVisualitzacio.options.businessId, //url('?businessid') 
				 	uid: $.cookie('uid'),
				 	serverName: capaVisualitzacio.options.nom
				 }
				
				updateServidorWMSName(data).then(function(results){
					/*
					if(results.status==='OK')console.debug("CapaTematic name changed OK");
					else console.debug("CapaTematic name changed KO");
					*/
				});					
		}
		
//		var options;
//		if (layer.options){
//			options = jQuery.parseJSON( layer.options );
//		}
		if(layer.options && options.origen){//Si es una sublayer
//			var origen = getLeafletIdFromBusinessId(options.origen);
//			if(dataField) capaVisualitzacio.options.dataField = dataField;
//			console.debug("Leaflet id origen de la sublayer:");
//			console.debug(origen);
			controlCapes.addOverlay(capaVisualitzacio, capaVisualitzacio.options.nom, true, origen);
		}else {
			if (!layer.capesOrdre){
				capaVisualitzacio.options.zIndex = controlCapes._lastZIndex + 1;
			}else{
				capaVisualitzacio.options.zIndex = parseInt(layer.capesOrdre);
			}
			controlCapes.addOverlay(capaVisualitzacio, capaVisualitzacio.options.nom, true);
			controlCapes._lastZIndex++;
		}				
	}
		defer.resolve(capaVisualitzacio);		
		return defer.promise();
	}
	
/**Funcions per crear un objecte de tipus estil, amb les caracterÃ­stiques que li passes
 * per punt, lÃ­nia, poligon */

function createMarkerStyle(style, num_geometries){
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

function createLineStyle(style){
	var estilTMP = default_line_style;
	estilTMP.color=style.color;
	estilTMP.weight=style.lineWidth;
	estilTMP.tipus=t_polyline;
	return estilTMP;
}

function createAreaStyle(style){
	var estilTMP= default_area_style;
	estilTMP.fillColor=style.color;
	estilTMP.fillOpacity=style.opacity/100;
	estilTMP.weight=style.borderWidth;
	estilTMP.color=style.borderColor;
	estilTMP.tipus=t_polygon;
	return estilTMP;
}

function loadCacheVisualitzacioLayer(layer){
	var defer = $.Deferred();
	var data={
		businessId: layer.businessId,
		uid: layer.entitatUid
	};
	
	var layerWms = layer;
	getCacheVisualitzacioLayerByBusinessId(data).then(function(results){
		if(results.status == "OK" ){
			readVisualitzacio(defer, results.results, layer);			
		}else{
			console.debug('getVisualitzacioByBusinessId ERROR');
			defer.reject();
		}		
	},function(results){
		//console.debug('getTematicLayerByBusinessId ERROR');
		defer.reject();
	});
	return defer.promise();
}
