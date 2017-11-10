
/**
 * Funcions tematics generals*
 * */


function initButtonsTematic(){
	
	addHtmlInterficieTematics();
	addHtmlModalLayersTematic();
	addHtmlModalCategories();
	addHtmlModalBubbles();
	
	//botons tematic
	jQuery('#st_Color').on('click',function(){
		showTematicLayersModal(tem_simple,jQuery(this).attr('class'));
	});
	
	jQuery('#st_Tema').on('click',function(){
		showTematicLayersModal(tem_clasic,jQuery(this).attr('class'));
	});

	jQuery('#st_Size').on('click',function(){
		showTematicLayersModal(tem_size,jQuery(this).attr('class'));
	});
	
	jQuery('#st_Heat').on('click',function(e) {
		showTematicLayersModal(tem_heatmap,jQuery(this).attr('class'));
		
	});	

	jQuery('#st_Clust').on('click',function(e) {		
		showTematicLayersModal(tem_cluster,jQuery(this).attr('class'));
		
	});	

	$('#updateRangeButton').on('click', function(e) {

		var minValue = $('#customRangeMinimumValue').val();
		var maxValue = $('#customRangeMaximumValue').val();
		var noRepetits = $("#dialog_tematic_rangs").data("values-norepetits");
		var first = noRepetits[0];
		var last = noRepetits[noRepetits.length-1];

		if(first.index == -1)
			noRepetits[0].v = minValue;
		else if(first.v != minValue)
			noRepetits.unshift({index: -1, v: minValue, style: noRepetits[0].style});

		if(last.index == -1)
			noRepetits[noRepetits.length-1].v = maxValue;
		else if(last.v != maxValue)
			noRepetits.push({index: -1, v: maxValue, style: noRepetits[0].style});

		$("#dialog_tematic_rangs").data("values-norepetits", noRepetits);
		loadTematicValueTemplate(noRepetits,'unic');
		updatePaletaRangs();

	});
}

function showTematicLayersModal(tipus,className){
//	console.debug("showTematicLayersModal");
	var warninMSG="<div class='alert alert-danger'><strong>"+window.lang.translate('Aquest estil no es pot aplicar a cap capa de les que tens en el mapa')+"<strong>  <span class='fa fa-warning sign'></span></div>";
	var warninMSG3D="<div class='alert alert-danger'><strong>"+window.lang.translate('Aquest estil no es pot aplicar amb modus 3D')+"<strong>  <span class='fa fa-warning sign'></span></div>";
	
	
	jQuery('.modal').modal('hide');
	
	jQuery('#dialog_layers_tematic').modal('show');
	
	jQuery('#stActiu').removeClass();
	jQuery('#stActiu').addClass(className);
	
	var basicHTML ='<span lang="ca">L\'estil bàsic genera una visualització dels elements d\'una capa uniformement per al conjunt.</span>'+
					'<br><br>'+
					'<div class="imagePeu">'+
					'	<img class="img1" src="css/images/original.jpg">'+
					'	<span class="peu" lang="ca">Capa d\'origen</span>'+
					'	<img src="css/images/basic.jpg">'+
					'	<span class="peu2" lang="ca">Visualització</span>'
					'</div>' ;
	var categoriesHTML ='<span lang="ca">L\'estil categories genera una visualització dels elements d\'una capa a partir d\'un camp, numèric o de text, de les dades.</span>'+
						'<br><br>'+
						'<div class="imagePeu">'+
						'	<img class="img1" src="css/images/original.jpg">'+
						'	<span class="peu" lang="ca">Capa d\'origen</span>'+
						'	<img src="css/images/categories.jpg">'+
						'	<span class="peu2" lang="ca">Visualització</span>'
						'</div>' ;
	var midesHTML ='<span lang="ca">L\'estil mides genera una visualització dels elements d\'una capa a partir d\'un camp numèric de les dades. Permet escollir entre interval graduat o proporcional al valor.</span>'+
					'<br><br>'+
					'<div class="imagePeu">'+
					'	<img class="img1" src="css/images/original.jpg">'+
					'	<span class="peu" lang="ca">Capa d\'origen</span>'+
					'	<img src="css/images/mides.jpg">'+
					'	<span class="peu2" lang="ca">Visualització</span>'
					'</div>' ;
	var heatMapHTML='<span lang="ca">L\'estil concentració genera una visualització dels elements d\'una capa a partir de la densitat de les dades en forma de mapa de calor (heatmap).</span>'+
					'<br><br>'+
					'<div class="imagePeu">'+
					'	<img class="img1" src="css/images/original.jpg">'+
					'	<span class="peu" lang="ca">Capa d\'origen</span>'+
					'	<img src="css/images/concentracio.jpg">'+
					'	<span class="peu2" lang="ca">Visualització</span>'
					'</div>' ;
	var clusterHTML ='<span lang="ca">L\'estil agrupació genera una visualització dels elements d\'una capa a partir de la densitat de les dades agrupats en grups de proximitat (clusters).</span>'+
					'<br><br>'+
					'<div class="imagePeu">'+
					'	<img class="img1" src="css/images/original.jpg">'+
					'	<span class="peu" lang="ca">Capa d\'origen</span>'+
					'	<img src="css/images/agrupacio.jpg">'+
					'	<span class="peu2" lang="ca">Visualització</span>'
					'</div>' ;
	
	if(tipus==tem_simple) jQuery('#txtTematic').html(basicHTML);
	else if (tipus==tem_clasic) jQuery('#txtTematic').html(categoriesHTML);
	else if (tipus==tem_size) jQuery('#txtTematic').html(midesHTML);
	else if (tipus==tem_heatmap)  jQuery('#txtTematic').html(heatMapHTML);
	else if (tipus==tem_cluster) jQuery('#txtTematic').html(clusterHTML); 
	
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
					if (tipusCapa == t_tematic || tipusCapa == t_visualitzacio || tipusCapa == t_url_file){ //tematic
						if (this.layer.options.dades){
							layers.push(this);
						}else{
							layers.push(this);
						}
					}
				}else if (tipus==tem_cluster || tipus==tem_heatmap) {	
					if(estatMapa3D){
						$('#list_tematic_layers').html(warninMSG3D);
					}else{
						var ftype = transformTipusGeometry(layerOptions.geometryType);
						//var ftype = layerOptions.geometryType;
						if(tipusCapa == t_dades_obertes || tipusCapa == t_json ||
							(tipusCapa == t_tematic && ftype == t_marker) ||
							(tipusCapa == t_url_file && ftype == t_marker) ||
							(tipusCapa == t_visualitzacio && ftype == t_marker) ||
							(tipusCapa == t_vis_wms)){
							layers.push(this);
						}
					}
				}else if (tipus==tem_size) {
					var ftype = transformTipusGeometry(layerOptions.geometryType);
					if ((tipusCapa == t_tematic || tipusCapa == t_visualitzacio || tipusCapa == t_url_file) && ftype == t_marker){ //tematic
						if (this.layer.options.dades){
							layers.push(this);
						}else{
							layers.push(this);
						}
					}
				}else{		
					$('#list_tematic_layers').html(warninMSG);
					return;
				}
			}
		}
	});// fi each
	if(layers.length ==0){
		
		if(estatMapa3D){
						$('#list_tematic_layers').html(warninMSG3D);
					return;
		}else{
		$('#list_tematic_layers').html(warninMSG);		
		return;
		}
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
				if (busy){
					$('#dialog_info_upload_txt').text(window.lang.translate("S'està executant una operació. Si us plau, espereu que aquesta acabi."));
					$('#dialog_info_upload').modal('show');
				}
				else obrirMenuModal('#dialog_estils_punts','toggle',data);
			}else if (ftype == t_polyline){
				if (busy){
					$('#dialog_info_upload_txt').text(window.lang.translate("S'està executant una operació. Si us plau, espereu que aquesta acabi."));
					$('#dialog_info_upload').modal('show');
				}
				else obrirMenuModal('#dialog_estils_linies','toggle',data);
			}else if (ftype == t_polygon){
				if (busy){
					$('#dialog_info_upload_txt').text(window.lang.translate("S'està executant una operació. Si us plau, espereu que aquesta acabi."));
					$('#dialog_info_upload').modal('show');
				}
				else obrirMenuModal('#dialog_estils_arees','toggle',data);
			}
		}else if(tipus == tem_clasic){
			if (busy){
				$('#dialog_info_upload_txt').text(window.lang.translate("S'està executant una operació. Si us plau, espereu que aquesta acabi."));
				$('#dialog_info_upload').modal('show');
			}
			else showModalTematicCategories(data);
		}else if(tipus == tem_heatmap){
			createHeatMap(controlCapes._layers[data.leafletid]);
			jQuery('#dialog_layers_tematic').modal('hide');
		}else if(tipus == tem_cluster){
			creaClusterMap(controlCapes._layers[data.leafletid]);
			jQuery('#dialog_layers_tematic').modal('hide');
		}else if(tipus == tem_size){
			if (busy){
				$('#dialog_info_upload_txt').text(window.lang.translate("S'està executant una operació. Si us plau, espereu que aquesta acabi."));
				$('#dialog_info_upload').modal('show');
			}
			else showModalTematicBubbles(data);
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

function createPopupWindowData(player,type, editable, origen, capa){
	var esVisor = (-1 != $(location).attr('href').indexOf('instavisor')) || (-1 != $(location).attr('href').indexOf('visor'));
	var data={
		type: type,
		editable: editable,
		origen: origen,
		capa: capa,
		esVisor: esVisor
	};
	var html = PopupManager().createPopupHtml(player, data);//player es feature
	
	PopupManager().addEventsPopup();
	
	player.on('popupopen', function(e){
		//console.debug(e);
		if(objEdicio.esticEnEdicio){//Si s'esta editant no es pot editar altre element
			map.closePopup();
		}
	});

	return html;
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
	
	if (_iconGlif.indexOf("font")!=-1){
		_iconGlif = _iconGlif.substring(0,_iconGlif.indexOf(" ")) ;
	}
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
		if(_iconGlif=="" || _iconGlif=="undefined" || _iconGlif==null){//no tin glif soc Canvas
			puntTMP.options.icon="";
			puntTMP.options.radius = parseInt(estilP.size/2.4);
			puntTMP.options.isCanvas=true;
		}else{
			puntTMP.options.iconAnchor= new L.Point(parseInt(num/2), parseInt(num/2));
			puntTMP.options.iconSize = new L.Point(num, num);
			console.debug(puntTMP.options.icon);
			puntTMP.options.icon=_iconGlif + " "+cssText;
			console.debug(puntTMP.options.icon);
			puntTMP.options.isCanvas=false;
		}
	}else{ // sóc pinxo
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
          uid: Cookies.get('uid'),
          tipusRang: tematic.from,
          rangs: rangs
        };
              
        updateTematicRangs(data).then(function(results){
        	//console.debug(results);
        },function(results){
			//TODO error
			console.debug("getRangsFromLayer ERROR");
			$.publish('analyticsEvent',{event:['error', 'getRangsFromLayerERROR',JSON.stringify(results)]});
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
			'<h5 lang="ca">Triar l\'estil de la capa</h5>'+
			'<div class="div_gr3_estils">'+
			'	<div id="st_Color" lang="ca" class="div_estil_1" data-toggle="tooltip" data-lang-title="Bàsic" title="Bàsic"></div>'+
			'	<div id="st_Tema" lang="ca" class="div_estil_2" data-toggle="tooltip" data-lang-title="Categories" title="Categories"></div>'+
			'	<div id="st_Size" lang="ca" class="div_estil_3" data-toggle="tooltip" data-lang-title="Mides" title="Mides"></div>'+
			'	<div id="st_Heat" lang="ca" class="div_estil_4" data-toggle="tooltip" data-lang-title="Concentració" title="Concentració"></div>'+
			'	<div id="st_Clust" lang="ca" class="div_estil_5" data-toggle="tooltip" data-lang-title="Agrupació" title="Agrupació"></div>'+
			'</div>'			
	);
	
	jQuery('.div_gr3_estils [data-toggle="tooltip"]').tooltip({container : 'body', placement: 'bottom'});
		
	/*
	$('#st_Color').tooltip({placement : 'bottom',container : 'body',title : window.lang.translate("Bàsic")});
	$('#st_Tema').tooltip({placement : 'bottom',container : 'body',title : window.lang.translate("Categories")});
	$('#st_Size').tooltip({placement : 'bottom',container : 'body',title : window.lang.translate("Mides")});	
	$('#st_Heat').tooltip({placement : 'bottom',container : 'body',title : window.lang.translate("Concentració")});
	$('#st_Clust').tooltip({placement : 'bottom',container : 'body',title : window.lang.translate("Agrupació")});
	*/
}

function addHtmlModalLayersTematic(){
	
	jQuery('#mapa_modals').append(
	'	<!-- Modal Tematics Layers -->'+
	'		<div class="modal fade" id="dialog_layers_tematic">'+
	'		<div class="modal-dialog">'+
	'			<div class="modal-content panel-primary">'+
	'				<div class="modal-header panel-heading">'+
	'					<button type="button" class="close" data-dismiss="modal"'+
	'						aria-hidden="true">&times;</button>'+
	'					<h4 class="modal-title"><span lang="ca">Triar una capa per aplicar-hi l\'estil</span><span><a class="faqs_link" href="http://betaportal.icgc.cat/wordpress/faq-dinstamaps/#mapestematics" target="_blank"><i class="fa fa-question-circle-o fa-lg fa-fw"></i></a></h4>'+
	'				</div>'+
	'				<div class="modal-body">'+
	'					<div class="alert alert-success" id="txtTematic">'+
	'					</div>'+
	'					<script id="tematic-layers-template" type="text/x-handlebars-template">'+
	'					<div class="panel-warning">'+					
	'					<ul class="bs-dadesO_USR panel-heading">'+
	'						{{#each layers}}'+
	'						<li><a class="usr_wms_layer lable-usr" data-leafletid="{{layer._leaflet_id}}" data-businessId="{{layer.options.businessId}}" data-geometryType="{{layer.options.geometryType}}" data-tipus="{{layer.options.tipus}}" data-propName="{{layer.options.propName}}">{{name}}</a></li>'+
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
	
	var html = '' +
	'	<!-- Modal Tematics Rangs -->'+
	'		<div class="modal fade" id="dialog_tematic_rangs">'+
	'		<div class="modal-dialog">'+
	'			<div class="modal-content panel-primary">'+
	'				<div class="modal-header panel-heading">'+
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
	'						<option value="---" lang="ca">Escull el camp</option>'+
	'						{{#each fields}}'+
	'						<option value="{{this}}">{{@key}}</option>'+
	'						{{/each}}'+
	'					</script>'+
	'					<br/>'+										
	'					<div id="tipus_agrupacio_grp" class="labels_fields">'+
	'						<span>2.</span><span lang="ca">Escull l\'interval</span>:'+
	'						<span class="rd_separator"></span>'+
	'						<input type="radio" id="rd_tipus_unic" name="rd_tipus_agrupacio" value="U">'+
	'						<label for="rd_tipus_unic" lang="ca">'+window.lang.translate("únic")+'</label>'+
	'						<span class="rd_separator"></span>'+
	'						<input type="radio" id="rd_tipus_semaforic" name="rd_tipus_agrupacio" value="S">'+
	'						<label for="rd_tipus_semaforic" lang="ca">Escala de color</label>'+
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
	'                       {{#if v.nodata}}'+
	'						<tr><td><input type="text" value="{{v.min}}" name="min" disabled></td>'+
	'							<td><input type="text" value="{{v.max}}" name="max" disabled></td>'+
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
	'                       {{else}}'+
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
	'                       {{/if}}'+
	'						{{/each}}'+
	'						</tbody>'+
	'					</table>'+	
	'					</script>'+
	'					<script id="tematic-values-rangs-polyline-template" type="text/x-handlebars-template">'+
	'					<table class="table">'+
	'						<tbody>'+
	'						{{#each values}}'+
	'                       {{#if v.nodata}}'+
	'						<tr><td><input type="text" value="{{v.min}}" name="min" disabled></td>'+
	'							<td><input type="text" value="{{v.max}}" name="max" disabled></td>'+
	'							<td>'+
	'							<canvas id="cv_pol{{index}}" height="30" width="30" class="shadow dropdown-toggle" data-toggle="dropdown"></canvas>'+
	'						</td></tr>'+
	'                       {{else}}'+
	'						<tr><td><input type="text" value="{{v.min}}" name="min"></td>'+
	'							<td><input type="text" value="{{v.max}}" name="max"></td>'+
	'							<td>'+
	'							<canvas id="cv_pol{{index}}" height="30" width="30" class="shadow dropdown-toggle" data-toggle="dropdown"></canvas>'+
	'						</td></tr>'+
	'                       {{/if}}'+
	'						{{/each}}'+
	'						</tbody>'+
	'					</table>'+	
	'					</script>'+
	'					<script id="tematic-values-rangs-polygon-template" type="text/x-handlebars-template">'+
	'					<table class="table">'+
	'						<tbody>'+
	'						{{#each values}}'+
	'                       {{#if v.nodata}}'+
	'						<tr><td><input type="text" value="{{v.min}}" name="min" disabled></td>'+
	'							<td><input type="text" value="{{v.max}}" name="max" disabled></td>'+
	'							<td>'+
	'							<canvas id="cv_pol{{index}}" height="30" width="30" class="shadow dropdown-toggle" data-toggle="dropdown"></canvas>'+
	'						</td></tr>'+
	'                       {{else}}'+
	'						<tr><td><input type="text" value="{{v.min}}" name="min"></td>'+
	'							<td><input type="text" value="{{v.max}}" name="max"></td>'+
	'							<td>'+
	'							<canvas id="cv_pol{{index}}" height="30" width="30" class="shadow dropdown-toggle" data-toggle="dropdown"></canvas>'+
	'						</td></tr>'+
	'                       {{/if}}'+
	'						{{/each}}'+
	'						</tbody>'+
	'					</table>'+	
	'					</script>'+
	'					<script id="tematic-values-semaforic-punt-template" type="text/x-handlebars-template">'+
	'					<table class="table">'+
	'						<tbody>'+
	'						<tr><td colspan="2"><span lang="ca">Valors menors que el de referència</span></td>'+
	'							<td>'+
	'							<div id="div_punt0" class="awesome-marker-web awesome-marker-icon-punt_r fa fa-dropdown-toggle" data-toggle="dropdown"'+ 
	'								style="font-size: 8px; width: 16px; height: 16px; color: rgb(51, 51, 51); background-color: ;"> </div>'+
	'						</td></tr>'+
	'						<tr><td><span lang="ca">Valor de referència</span></td>'+
	'							<td><input id="refValue" type="text" value="{{value}}" name="ref"></td>'+
	'							<td>'+
	'							<div id="div_punt1" class="awesome-marker-web awesome-marker-icon-punt_r fa fa-dropdown-toggle" data-toggle="dropdown"'+ 
	'								style="font-size: 8px; width: 16px; height: 16px; color: rgb(51, 51, 51); background-color: ;"> </div>'+
	'						</td></tr>'+
	'						<tr><td colspan="2"><span lang="ca">Valors majors que el de referència</span></td>'+
	'							<td>'+
	'							<div id="div_punt2" class="awesome-marker-web awesome-marker-icon-punt_r fa fa-dropdown-toggle" data-toggle="dropdown"'+ 
	'								style="font-size: 8px; width: 16px; height: 16px; color: rgb(51, 51, 51); background-color: ;"> </div>'+
	'						</td></tr>'+
	'						</tbody>'+
	'					</table>'+	
	'					</script>'+
	'					<script id="tematic-values-semaforic-polyline-template" type="text/x-handlebars-template">'+
	'					<table class="table">'+
	'						<tbody>'+
	'						<tr><td colspan="2"><span lang="ca">Valors menors que el de referència</span></td>'+
	'							<td>'+
	'							<canvas id="cv_pol0" height="30" width="30" class="shadow dropdown-toggle" data-toggle="dropdown"></canvas>'+
	'						</td></tr>'+
	'						<tr><td><span lang="ca">Valor de referència</span></td>'+
	'							<td><input id="refValue" type="text" value="{{value}}" name="ref"></td>'+
	'							<td>'+
	'							<canvas id="cv_pol1" height="30" width="30" class="shadow dropdown-toggle" data-toggle="dropdown"></canvas>'+
	'						</td></tr>'+
	'						<tr><td colspan="2"><span lang="ca">Valors majors que el de referència</span></td>'+
	'							<td>'+
	'							<canvas id="cv_pol2" height="30" width="30" class="shadow dropdown-toggle" data-toggle="dropdown"></canvas>'+
	'						</td></tr>'+
	'						</tbody>'+
	'					</table>'+	
	'					</script>'+
	'					<script id="tematic-values-semaforic-polygon-template" type="text/x-handlebars-template">'+
	'					<table class="table">'+
	'						<tbody>'+
	'						<tr><td colspan="2"><span lang="ca">Valors menors que el de referència</span></td>'+
	'							<td>'+
	'							<canvas id="cv_pol0" height="30" width="30" class="shadow dropdown-toggle" data-toggle="dropdown"></canvas>'+
	'						</td></tr>'+
	'						<tr><td><span lang="ca">Valor de referència</span></td>'+
	'							<td><input id="refValue" type="text" value="{{value}}" name="ref"></td>'+
	'							<td>'+
	'							<canvas id="cv_pol1" height="30" width="30" class="shadow dropdown-toggle" data-toggle="dropdown"></canvas>'+
	'						</td></tr>'+
	'						<tr><td colspan="2"><span lang="ca">Valors majors que el de referència</span></td>'+
	'							<td>'+
	'							<canvas id="cv_pol2" height="30" width="30" class="shadow dropdown-toggle" data-toggle="dropdown"></canvas>'+
	'						</td></tr>'+
	'						</tbody>'+
	'					</table>'+	
	'					</script>'+
	'					<div id="palet_warning" class="alert alert-warning"><span class="glyphicon glyphicon-info-sign"></span>'+
	'					<span lang="ca">Per facilitar la llegibilitat del mapa hem limitat el número màxim de colors per a aquest estil a 9. La resta de categories es simbolitzaran amb color gris</span></div>'+
	'					<div id="list_tematic_values"></div>'+
	'					<div id="valors_rangs_personalitzats" class="row" style="display: none;">' +
	'						<div class="form-group col-md-5">' +
	'							<div class="input-group">' +
  	'								<span class="input-group-addon" id="valor-minim-text">Valor mínim:</span>' +
  	'								<input type="number" class="form-control" id="customRangeMinimumValue" aria-describedby="valor-minim-text">' +
	'							</div>' +
	'						</div>' +
	'						<div class="form-group col-md-5">' +
	'							<div class="input-group">' +
  	'								<span class="input-group-addon" id="valor-maxim-text">Valor màxim:</span>' +
  	'								<input type="number" class="form-control" id="customRangeMaximumValue" aria-describedby="valor-maxim-text">' +
	'							</div>' +
	'						</div>' +
	'						<div class="col-md-2">' +
	'							<button id="updateRangeButton" type="button" class="btn btn-primary"><span class="glyphicon glyphicon-refresh" title="Actualitza valors" aria-label="Actualitza valors"></span></button>' +
	'						</div>' +
	'					</div>' +
	'					<div id="paletes_colors">' +
	'						<div><span lang="ca">Tria la paleta de colors</span><span class="glyphicon glyphicon-arrow-down btn-reverse-palete"></span><span lang="ca" class="btn-reverse-palete">Inverteix paleta</span></div>';

	var palettes = ["BuGn", "BuPu", "GnBu", "OrRd", "PuBu", "PuBuGn", "PuRd", "RdPu", "YlGn", "YlGnBu", "YlOrBr", "YlOrRd", 
		"BrBG", "PRGn", "PuOr", "RdGy", "RdYlBu", "RdYlGn", "Spectral", "Paired", "Set3", "Set1", "Dark2"];
	$.each(palettes, function(index, palette) {
		var palName = palette;
		var scale = createScale(palName, 4, false);
		html += '' +
		'	<div class="ramp ' + palName + '">' +
		'		<svg height="75" width="15">' + 
		'			<defs>' +
		'				<linearGradient id="gradient' + index + '" x1="0" x2="0" y1="0" y2="1">' +
		'					<stop offset="0%" stop-color="' + scale(0).hex() + '"/>' + 
		'					<stop offset="25%" stop-color="' + scale(1).hex() + '"/>' +
		'					<stop offset="50%" stop-color="' + scale(2).hex() + '"/>' +
		'					<stop offset="75%" stop-color="' + scale(3).hex() + '"/>' +
		'					<stop offset="100%" stop-color="' + scale(4).hex() + '"/>' +
		'				</linearGradient>' +
		'			</defs>' +
		'			<rect width="15" height="75" fill="url(#gradient' + index + ')" />' + 
		'		</svg>' +
		'	</div>';
	});

	html += '' +
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
	'	<!-- fi Modal Tematics Rangs -->';

	jQuery('#mapa_modals').append(html);
}


function addHtmlModalBubbles(){
	jQuery('#mapa_modals').append(
			'<!-- Modal Tematics Bubble -->'+
			'<div class="modal fade" id="dialog_tematic_bubble">'+
			'	<div class="modal-dialog">'+
			'		<div class="modal-content panel-primary">'+
			'			<div class="modal-header panel-heading">'+
			'				<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'+
			'				<h4 class="modal-title" lang="ca">Defineix les categories</h4>'+
			'			</div>'+
			'			<div class="modal-body">'+
			'				<div class="labels_fields">'+
			'					<span lang="ca">Escull el camp per simbolitzar</span>:'+
			'					<select name="dataFieldBubble" id="dataFieldBubble">'+
			'					</select>'+
			'				</div>'+
			'                <script id="tematic-layers-fields-bubble" type="text/x-handlebars-template">'+
			'						<option value="---" lang="ca">Escull el camp</option>'+
			'						{{#each fields}}'+
			'						<option value="{{this}}">{{@key}}</option>'+
			'						{{/each}}'+
			'					</script>'+
			'				<br/>'+										
			'				<div id="tipus_agrupacio_grp_bubble" class="labels_fields">'+
			"					<span lang='ca'>Escull l'interval</span>:"+
			'					<input type="radio" id="rd_tipus_graduado" name="rd_tipus_agrupacio_bubble" value="G">'+
			'					<label for="rd_tipus_graduado" lang="ca">graduat</label>'+
			'					<span class="rd_separator"></span>'+
			'                   <input type="radio" id="rd_tipus_proporcional" name="rd_tipus_agrupacio_bubble" value="P">'+
			'					<label for="rd_tipus_proporcional" lang="ca">proporcional</label>'+
			'				</div>'+			
			'				<div id="num_rangs_grp_bubble" class="labels_fields" >'+
			'					<select id="cmb_num_rangs_bubble">'+
			'						<option value="---" selected >Intervals</option>'+
			'						<option value="3">3</option>'+
			'						<option value="4">4</option>'+
			'						<option value="5">5</option>'+
			'						<option value="6">6</option>'+
			'						<option value="7">7</option>'+
			'					</select>'+
			'				</div>'+
			'				<script id="tematic-values-rangs-punt-template-bubble" type="text/x-handlebars-template">'+
			'				<table class="table">'+
			'					<thead>'+
			'					<tr>'+
		    ' 						<th lang="ca">Valor min.</th>'+
		    ' 						<th lang="ca">Valor max.</th>'+
			'						<th lang="ca">Mida</th>'+
			'						<th lang="ca"></th>'+
		  	'					</tr>'+
		 	'					</thead>'+
			'					<tbody>'+
			'					{{#each values}}'+
			'                   {{#if v.nodata}}'+
			'					<tr><td class="td_15"><input type="text" value="{{v.min}}" name="min" disabled></td>'+
			'						<td class="td_15"><input type="text" value="{{v.max}}" name="max" disabled></td>'+
			'						<td class="td_15"><input type="number" value="{{style.size}}" name="mida" class="mida nodata"></td>'+
			'						<td class="">'+
			'						<div id="div_punt{{index}}" class="awesome-marker-web awesome-marker-icon-punt_r fa fa- dropdown-toggle" data-toggle="dropdown"'+ 
			'								style="font-size: 10.5px; width: {{style.size}}px; height: {{style.size}}px; color: rgb(51, 51, 51); background-color: {{style.fillColor}}; border-radius:{{style.radius}}px"> </div>'+
			'					</td></tr>'+
			'                   {{else}}'+
			'					<tr><td class="td_15"><input type="text" value="{{v.min}}" name="min"></td>'+
			'						<td class="td_15"><input type="text" value="{{v.max}}" name="max"></td>'+
			'						<td class="td_15"><input type="number" value="{{style.size}}" name="mida" class="mida"></td>'+
			'						<td class="">'+
			'						<div id="div_punt{{index}}" class="awesome-marker-web awesome-marker-icon-punt_r fa fa- dropdown-toggle" data-toggle="dropdown"'+ 
			'								style="font-size: 10.5px; width: {{style.size}}px; height: {{style.size}}px; color: rgb(51, 51, 51); background-color: {{style.fillColor}}; border-radius:{{style.radius}}px"> </div>'+
			'					</td></tr>'+
			'                   {{/if}}'+
			'					{{/each}}'+
			'					</tbody>'+
			'				</table>	'+
			'				</script>'+
			'				<script id="tematic-values-proportional-punt-template-bubble" type="text/x-handlebars-template">'+
			'				<table class="table text-center buble_table">'+
			'					<tbody>'+
			'					{{#each values}}'+
			'                   {{#if v.nodata}}'+
			'                   <tr><td colspan="2">'+
			'                     <div class="buble_prop">'+
			'                       <div><label lang="ca">Sense valor</label>&nbsp;{{v.min}}<input type="hidden" value="{{v.min}}" name="min"></div>'+
			'                       <div><label lang="ca">mida</label>&nbsp;<input type="number" value="{{style.size}}" name="mida" class="mida nodata"></div>'+
			'						<div id="div_punt_nodata" class="awesome-marker-web awesome-marker-icon-punt_r fa fa- dropdown-toggle" data-toggle="dropdown"'+ 
			'								style="font-size: 10.5px; width: {{style.size}}px; height: {{style.size}}px; color: rgb(51, 51, 51); background-color: {{style.fillColor}}; border-radius:{{style.radius}}px"> </div>'+
			'                     </div></td>'+
			'                   </td></tr>'+
			'                   {{else}}'+
			'					<tr><td>'+
			'                     <div class="buble_prop">'+
			'                       <div><label lang="ca">Valor min.</label>&nbsp;{{v.min}}<input type="hidden" value="{{v.min}}" name="min"></div>'+
			'                       <div><label lang="ca">mida</label>&nbsp;<input type="number" value="{{style.size}}" name="mida" class="mida"></div>'+
			'						<div id="div_punt_min" class="awesome-marker-web awesome-marker-icon-punt_r fa fa- dropdown-toggle" data-toggle="dropdown"'+ 
			'								style="font-size: 10.5px; width: {{style.size}}px; height: {{style.size}}px; color: rgb(51, 51, 51); background-color: {{style.fillColor}}; border-radius:{{style.radius}}px"> </div>'+
			'                     </div></td>'+
			'						<td><div class="buble_prop">'+
			'                        <div><label lang="ca">Valor max.</label>&nbsp;{{v.max}}<input type="hidden" value="{{v.max}}" name="max"></div>'+
			'                       <div><label lang="ca">mida</label>&nbsp;<input type="number" value="{{style.sizeMax}}" name="mida_max" class="mida"></div>'+
			'						<div id="div_punt_max" class="awesome-marker-web awesome-marker-icon-punt_r fa fa- dropdown-toggle" data-toggle="dropdown"'+ 
			'								style="font-size: 10.5px; width: {{style.sizeMax}}px; height: {{style.sizeMax}}px; color: rgb(51, 51, 51); background-color: {{style.fillColor}}; border-radius:{{style.radiusMax}}px"> </div>'+
			'					</td></tr>'+
			'                   {{/if}}'+
			'					{{/each}}'+
			'					</tbody>'+
			'				</table>	'+
			'				</script>'+
			'				<div id="list_tematic_values_bubble"></div>'+
			'				<div id="size_warning_bubble_grad" class="alert alert-warning"><span class="glyphicon glyphicon-info-sign"></span>'+
			'				<span lang="ca">Les mides han de ser creixents</span></div>'+
			'				<div id="size_warning_bubble_prop" class="alert alert-warning"><span class="glyphicon glyphicon-info-sign"></span>'+
			'				<span lang="ca">La mida mínima ha de ser inferior a la màxima</span></div>'+
			'				<div id="palet_warning_bubble" class="alert alert-warning"><span class="glyphicon glyphicon-info-sign"></span>'+
			'				<span lang="ca">Has de seleccionar un camp amb valors numèrics</span></div>'+
			'			</div>'+
			'			<div class="modal-footer">'+
			'				<div id="paletes_colors">'+
			'					<div lang="ca">Tria el color</div>'+
			'					<div class="btn-group">'+
			'						<a class="btn btn-mini dropdown-toggle" data-toggle="dropdown">'+
			'							<div id="dv_fill_color_punt_bubble" class="fill_color_punt"></div>'+
			'						</a>'+
			'						<ul class="dropdown-menu">'+
			'							<li><div id="colorpalette_punt_bubble"></div></li>'+
			'						</ul>'+
			'					</div>'+
			'				</div>'+
			'				<button type="button" class="btn btn-default" data-dismiss="modal" lang="ca">Tancar</button>'+
		    '     			<button type="button" class="btn btn-success" lang="ca">Canviar</button>'+
			'			</div>'+
			'		</div>'+
			'		<!-- /.modal-content -->'+
			'	</div>'+
			'	<!-- /.modal-dialog -->'+
			'</div>'+
			'<!-- /.modal -->'+
			'<!-- fi Modal Tematics Bubble -->'
	);
}


/*NOU MODEL VISUALITZACIO*/
function loadVisualitzacioLayer(layer,removed){
	var businessId;
	if (layer.businessId!=undefined){
		businessId=layer.businessId;
	}else if (layer.options.businessId!=undefined){
		businessId = layer.options.businessId;
	}
	
	var defer = $.Deferred();
	var data={
		uid : Cookies.get('uid'),
		businessId: businessId
	};
	
	getVisualitzacioByBusinessId(data).then(function(results){
		if(results.status == "OK" ){
			if (removed){
				var data ={
					businessId: businessId,
					uid:Cookies.get('uid')
				};
				var resultats = results.results;
				getGeometriesPropertiesLayer(data).then(function(results2){
					 readVisualitzacio(defer, resultats, results2.layer);
				});
			}
			else 
			{

				if(!controlCapes.hasOwnProperty("_visLayers"))
				{
				
					controlCapes._visLayers = {};
					controlCapes._options = {};
				}
				controlCapes._visLayers[businessId] = results.results;
				controlCapes._options[businessId] = layer;
				readVisualitzacio(defer, results.results, layer);
			}
		}else{
			console.debug('getVisualitzacioByBusinessId ERROR');
			defer.reject();
		}
	},function(results){
		$.publish('analyticsEvent',{event:['error', 'getVisualitzacioByBusinessId3',JSON.stringify(results)]});
		console.debug('getVisualitzacioByBusinessId ERROR');
		defer.reject();
	});
	return defer.promise();
}

function reloadVisualitzacioLayer(capaVisualitzacio, visualitzacio, layer, map){
	var defer = $.Deferred();
	//update del options de la capa
	var optionsVis = getOptions(visualitzacio);
	capaVisualitzacio.options = $.extend(capaVisualitzacio.options, optionsVis);
	if(capaVisualitzacio.options.propName && jQuery.type( capaVisualitzacio.options.propName ) === "string"){
		capaVisualitzacio.options.propName = capaVisualitzacio.options.propName.split(",");
	}
		
	//limpiar las geometrias	
	try{
		capaVisualitzacio.clearLayers();
	}catch(err){
		if (capaVisualitzacio.layer!=undefined) capaVisualitzacio.layer.clearLayers();
	}
	//cargar las geometrias a la capa
	var layOptions = getOptions(layer);
	var origen = getOrigenLayer(layer);
	var hasSource = (optionsVis!=undefined && optionsVis.source!=undefined) 
	|| (optionsVis!=undefined && optionsVis.options && undefined != optionsVis.options.source)
	|| (layOptions!=undefined && layOptions.source!=undefined );
	try{
		capaVisualitzacio.off('layeradd',objecteUserAdded);//Deixem desactivat event layeradd, per la capa activa
	}catch(err){
		if (capaVisualitzacio.layer!=undefined) capaVisualitzacio.layer.off('layeradd',objecteUserAdded);//Deixem desactivat event layeradd, per la capa activa
	}
	loadGeometriesToLayer(capaVisualitzacio, visualitzacio, optionsVis, origen, map, hasSource);
	
	try{
		capaVisualitzacio.on('layeradd',objecteUserAdded);//Deixem activat event layeradd, per la capa activa
	}catch(err){
		if (capaVisualitzacio.layer!=undefined) 	capaVisualitzacio.layer.on('layeradd',objecteUserAdded);//Deixem activat event layeradd, per la capa activa
	}
	
	defer.resolve(capaVisualitzacio);
	
	return defer.promise();
}

function getOptions(visualitzacio){
	var visOptions = visualitzacio.options;
	if(typeof (visOptions)=="string"){	
		try {
			optionsVis = JSON.parse(visOptions);
		}
		catch (err) {
			optionsVis = visOptions;		
		}
	}else{			
		optionsVis = visOptions;	
	}
	return optionsVis;
}

function getOrigenLayer(layer){
	var origen = "",
	options;
	if (layer.options){
		options = getOptions(layer);
		if(options.origen){//Si es una sublayer
			origen = getLeafletIdFromBusinessId(options.origen);
		}
	}
	return origen;
}

function readVisualitzacio(defer, visualitzacio, layer, geometries){
	var layOptions; 
	if(typeof (layer.options)=="string"){	
		try {
			layOptions = JSON.parse(layer.options);
		}
		catch (err) {
			layOptions = layer.options;		
		}
	}else{			
		layOptions = layer.options;	
	}
	var hasSource = (visualitzacio.options && (visualitzacio.options.indexOf("source")!=-1) ) 
		|| (layOptions && (layOptions.toString().indexOf("source")!=-1) );
	if(visualitzacio.tipus == tem_heatmap){
		loadVisualitzacioHeatmap(visualitzacio, layer.capesOrdre, layer.options, layer.capesActiva, defer);
	}else if(visualitzacio.tipus == tem_cluster){
		loadVisualitzacioCluster(visualitzacio, layer.capesOrdre, layer.options, layer.capesActiva, defer);
	}else{
		var capaVisualitzacio = new L.FeatureGroup();
		if(layOptions){
			if ( layOptions.group) {
				capaVisualitzacio.options = {
					businessId : layer.businessId,
					nom : layer.serverName,
					tipus : layer.serverType,
					tipusRang: visualitzacio.tipus, 
					geometryType: visualitzacio.geometryType,
					estil: visualitzacio.estil,
					group: layOptions.group,
					propFormat: layOptions.propFormat,
					propPrivacitat: layOptions.propPrivacitat
				};
			}
			else{
				capaVisualitzacio.options = {
						businessId : layer.businessId,
						nom : layer.serverName,
						tipus : layer.serverType,
						tipusRang: visualitzacio.tipus, 
						geometryType: visualitzacio.geometryType,
						estil: visualitzacio.estil,
						propFormat: layOptions.propFormat,
						propPrivacitat: layOptions.propPrivacitat
					};
			}
		}else{
			capaVisualitzacio.options = {
				businessId : layer.businessId,
				nom : layer.serverName,
				tipus : layer.serverType,
				tipusRang: visualitzacio.tipus, 
				geometryType: visualitzacio.geometryType,
				estil: visualitzacio.estil
			};
		}
		
		var visOptions = visualitzacio.options;
		var optionsVis = getOptions(visualitzacio);
		
		if(hasSource) {
			capaVisualitzacio.options.source = optionsVis.source;
		}
		
		//Pel cas de del tematic categories, tenir els rangs d'estils
		if(visOptions && visOptions.indexOf("estilsRangs")!=-1) {
			capaVisualitzacio.options.estilsRangs = optionsVis.estilsRangs;
		}

		//Pel cas de del tematic categories, tenir els rangs d'estils
		if(visOptions && visOptions.indexOf("rangsEstilsLegend")!=-1) {
			capaVisualitzacio.options.rangsEstilsLegend = optionsVis.rangsEstilsLegend;
		}	
		
		//Pel cas de del tematic categories, tenir la paleta
		if(visOptions && visOptions.indexOf("paleta")!=-1) {
			capaVisualitzacio.options.paleta = optionsVis.paleta;
		}
		
		//Pel cas de del tematic categories, tenir la propietat reverse
		if(visOptions && visOptions.indexOf("reverse")!=-1) {
			capaVisualitzacio.options.reverse = optionsVis.reverse;
		}
		
		//Pel cas de del tematic categories, tenir la propietat dataField
		if(visOptions && visOptions.indexOf("dataField")!=-1) {
			capaVisualitzacio.options.dataField = optionsVis.dataField;
		}
		
		//Pel cas de del tematic categories, tenir la propietat labelField
		if(visOptions && visOptions.indexOf("labelField")!=-1) {
			capaVisualitzacio.options.labelField = optionsVis.labelField;
		}
		
		//Pel cas de del tematic categories, tenir la propietat tipusClasicTematic
		if(visOptions && visOptions.indexOf("tipusClasicTematic")!=-1) {
			capaVisualitzacio.options.tipusClasicTematic = optionsVis.tipusClasicTematic;
		}

		//Pel cas de del tematic semafòric, tenir la propietat de l'atribut fixat
		if(optionsVis && optionsVis.hasOwnProperty("trafficLightKey")) {
			capaVisualitzacio.options.trafficLightKey = optionsVis.trafficLightKey;
		}
		
		//Per les etiquetes
		var isCapaAmbEtiquetes=false;
		if(optionsVis && optionsVis.campEtiqueta!=undefined) {
			isCapaAmbEtiquetes=true;
			capaVisualitzacio.options.campEtiqueta = optionsVis.campEtiqueta;
			if(optionsVis && optionsVis.fontFamily!=undefined) capaVisualitzacio.options.fontFamily = optionsVis.fontFamily;
			if(optionsVis && optionsVis.fontSize!=undefined) capaVisualitzacio.options.fontSize = optionsVis.fontSize;
			if(optionsVis && optionsVis.fontColor!=undefined) capaVisualitzacio.options.fontColor = optionsVis.fontColor;
			if(optionsVis && optionsVis.fontStyle!=undefined) capaVisualitzacio.options.fontFamily = optionsVis.fontStyle;
			if(optionsVis && optionsVis.opcionsVis!=undefined) capaVisualitzacio.options.opcionsVisEtiqueta = optionsVis.opcionsVis;
			if(optionsVis && optionsVis.zoomInicial!=undefined) capaVisualitzacio.options.zoomInicial = optionsVis.zoomInicial;
			if(optionsVis && optionsVis.zoomFinal!=undefined) capaVisualitzacio.options.zoomFinal = optionsVis.zoomFinal;
			//Noves opcions de contorn i caixa
			if(optionsVis && optionsVis.contorn!=undefined) capaVisualitzacio.options.contorn = optionsVis.contorn;
			if(optionsVis && optionsVis.caixa!=undefined) capaVisualitzacio.options.caixa = optionsVis.caixa;
			if(optionsVis && optionsVis.caixaColor!=undefined) capaVisualitzacio.options.caixaColor = optionsVis.caixaColor;
		}
		
		var origen = getOrigenLayer(layer);
		
		//ordenar los estilos de mayor a menor para los bubbles
		if (visualitzacio.tipus == tem_size){
			var estilDesc = visualitzacio.estil.sort(sordDesc("simbolSize"));
			visualitzacio.estil = estilDesc;
		}
		
		var isCapaActiva=false;
		if (!layer.capesActiva || layer.capesActiva == true || layer.capesActiva == "true"){
			
			//Afegim geometries a la capa
			capaVisualitzacio.addTo(map);
			if (capaVisualitzacio.options.zIndex=="1") 	capaVisualitzacio.bringToFront();
			$.publish("addMapLayer");
			loadGeometriesToLayer(capaVisualitzacio, visualitzacio, optionsVis, origen, map, hasSource);
			
			
		}	
		else {
			//Afegim geometries a la capa pero no la capa al mapa
			loadGeometriesToLayer(capaVisualitzacio, visualitzacio, optionsVis, origen, map, hasSource);
			if (isCapaAmbEtiquetes){
				jQuery.each(capaVisualitzacio._layers, function(i, lay){
					if(lay.label){
						lay.label.setOpacity(0);
					}
				});	
			}
		}
		
		//Afegim num d'elements al nom de la capa, si és un fitxer
		if(layer.dragdrop || layer.urlFile){
			capaVisualitzacio.options.nom = capaVisualitzacio.options.nom;// + " ("+capaTematic.getLayers().length+")";
			var data = {
			 	businessId: capaVisualitzacio.options.businessId, //url('?businessid') 
			 	uid: Cookies.get('uid'),
			 	serverName: capaVisualitzacio.options.nom
			 };
				
			updateServidorWMSName(data).then(function(results){
			
			});					
		}
			
		if (layer.options){
			var options2;
			if(typeof (layer.options)=="string"){		
				try {
					options2 = JSON.parse(layer.options);
				}
				catch (err) {
					options2 = layer.options;
				}						
			}else{				
				options2 = layer.options;	
			}
			if (options2.propName != undefined) {
				capaVisualitzacio.options.propName = options2.propName;
			}
			else if (visualitzacio.options){
				var options2;
				if(typeof (visualitzacio.options)=="string"){	
					try {
						options2 = JSON.parse(visualitzacio.options);
					}
					catch (err) {
						options2 = visualitzacio.options;
					}
									
				}else{				
					options2 = visualitzacio.options;	
				}		
				if (options2.propName != undefined) {
					var dataNames = options2.propName.split(',');
					capaVisualitzacio.options.propName = dataNames;
				}		
				else if (geometries!=undefined){
					if (  geometries.options){
						var dataNames = geometries.options.split(',');
						//console.debug(dataNames);
						capaVisualitzacio.options.propName = dataNames;
					}
				}
			}			
		}else{
			if (geometries!=undefined){
				if (  geometries.options){
					var dataNames = geometries.options.split(',');
					capaVisualitzacio.options.propName = dataNames;
				}
			}
		}
		
		if (capaVisualitzacio.options.propName== undefined) {
			if (visualitzacio.estil!=undefined && visualitzacio.estil[0]!=undefined){
				if ( visualitzacio.estil[0].geometria!=undefined &&  visualitzacio.estil[0].geometria.features!=undefined &&
						visualitzacio.estil[0].geometria.features.length>0){
					//var props = console.debug(visualitzacio.estil[0].geometria.features[0].properties);
					
					var props;
					if(typeof (visualitzacio.estil[0].geometria.features[0].properties)=="string"){		
						try {
							props = JSON.parse(visualitzacio.estil[0].geometria.features[0].properties);
						}
						catch (err) {
							props = visualitzacio.estil[0].geometria.features[0].properties;
						}						
					}else{				
						props = visualitzacio.estil[0].geometria.features[0].properties;	
					}
					
					var dataNames ="";
					jQuery.each(props, function( index, value ) {
						dataNames+=index+",";						
					});
					capaVisualitzacio.options.propName = dataNames.substring(0,dataNames.length-1);
				}
			}			
		}
		if (capaVisualitzacio.options.propName== undefined) {
			var dataNames=[];
			dataNames[0]="nom";
			dataNames[1]="text";
			capaVisualitzacio.options.propName = dataNames;
		}

		if(layer.options && origen !== ""){//Si es una sublayer
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
		
		//Si la capa es tematic categories, afegir llegenda al mode edicio
		if ((visualitzacio.tipus == tem_clasic || visualitzacio.tipus == tem_size) && $(location).attr('href').indexOf('/mapa.html')!=-1){
			loadMapLegendEdicio(capaVisualitzacio);
		}
		
		defer.resolve(capaVisualitzacio);
	}		
	return defer.promise();
}

function loadGeometriesToLayer(capaVisualitzacio, visualitzacio, optionsVis, origen, map, hasSource){
	if (optionsVis!=undefined && optionsVis.campEtiqueta!=undefined){
		var style = "font-family:"+optionsVis.fontFamily+";font-size:"+optionsVis.fontSize+";color:"+optionsVis.fontColor;
		if (optionsVis.contorn!=undefined && optionsVis.contorn=="si") {
			style+=";text-shadow:1px 1px #ffffff";
		}
		else 	style+=";text-shadow:0px 0px #ffffff";
		if (optionsVis.fontStyle!=undefined){
			if (optionsVis.fontStyle=="normal" || optionsVis.fontStyle=="bold") style+= ";font-weight:"+optionsVis.fontStyle;
			else if (optionsVis.fontStyle=="italic") style+= ";font-style:"+optionsVis.fontStyle;
		}
		if (optionsVis.caixa!=undefined && optionsVis.caixa=="si"){
			style += ";background-color:"+optionsVis.caixaColor;
		}
		else style += ";background-color:transparent";
		createClass('.etiqueta_style_'+visualitzacio.businessId,style);
	}
	
	var zoomInicialEtiqueta = zoomInicialEt;
	if (optionsVis!=undefined && optionsVis.zoomInicial!=undefined) zoomInicialEtiqueta=optionsVis.zoomInicial;
	var zoomFinalEtiqueta = zoomFinalEt;
	if (optionsVis!=undefined && optionsVis.zoomFinal!=undefined)  zoomFinalEtiqueta=optionsVis.zoomFinal;

	var canSpiderify = (visualitzacio.tipus == tem_clasic || visualitzacio.tipus == tem_simple || visualitzacio.tipus == tem_origen);
	if(visualitzacio.businessId && optionsVis && optionsVis.hasOwnProperty("trafficLightKey") && optionsVis.hasOwnProperty("trafficLightValue"))
	{

		//Canviem la visualització perquè pot ser que la del servidor no estigui bé (passa quan un cop creada la capa es publica el mapa
		//havent canviat el valor pivot de la visualització. En el servidor només s'actualitza el valor i no la geometria associada als estils)
		var sorted = Semaforic.sortGeometry(visualitzacio.estil, optionsVis.trafficLightKey, optionsVis.trafficLightValue);

		//Actualitzem la geometria dels estils a partir de les geometries ordenades i els colors que té el semafòric
		visualitzacio.estil[0].color = optionsVis.trafficLightLowerColor;
		visualitzacio.estil[1].color = optionsVis.trafficLightEqualColor;
		visualitzacio.estil[2].color = optionsVis.trafficLightHigherColor;
		visualitzacio.estil[0].geometria.features = sorted.lowerGeom;
		visualitzacio.estil[1].geometria.features = sorted.equalGeom;
		visualitzacio.estil[2].geometria.features = sorted.higherGeom;

		//Actualitzem el nom de la capa
		visualitzacio.nom = Semaforic.getUpdatedLayerName(visualitzacio.nom, optionsVis.trafficLightValue);
		capaVisualitzacio.options.nom = visualitzacio.nom;

	}
	
	var props = [];
	var checkNumericProperties = false;
	var veientMapa = (-1 != $(location).attr('href').indexOf('instavisor')) || (-1 != $(location).attr('href').indexOf('visor'));
	if("undefined" !== typeof optionsVis && optionsVis.hasOwnProperty("propName") && !capaVisualitzacio.hasOwnProperty("isPropertyNumeric"))
	{
	
		props = optionsVis.propName.split(',');
		capaVisualitzacio.isPropertyNumeric = new Array(props.length);
		$.each(props, function(index, prop) {
			capaVisualitzacio.isPropertyNumeric[prop] = true;
		});
		checkNumericProperties = true;

	}
	
	//per cada estil de la visualitzacio
	jQuery.each(visualitzacio.estil, function(index, estil){
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
			var featureTem = [];
			if (undefined != geom.geometry){
			var geomType = (geom.geometry.type?geom.geometry.type.toLowerCase():geomTypeVis);

			//Actualitzem el vector de propietats de tipus numèrics de la visualització
			//Els que són falsos en algun feature ja no cal repassar-los, els eliminem del 
			//vector de propietats a comprovar
			
			if(checkNumericProperties)
			{

				//Actualitzem el vector de propietats de tipus numèrics de la visualització
				//Els que són falsos en algun feature ja no cal repassar-los, els eliminem del 
				//vector de propietats a comprovar
				var toRemove = [];
				$.each(props, function(index, prop) {
					capaVisualitzacio.isPropertyNumeric[prop] = capaVisualitzacio.isPropertyNumeric[prop] && $.isNumeric(geom.properties[prop]);
					if(!capaVisualitzacio.isPropertyNumeric[prop])
						toRemove.push(index);
				});
				for(var i=toRemove.length-1; i>=0; i--)
					props.splice(toRemove[i], 1);

			}

			//MultyPoint
			if (geomTypeVis === t_marker && geomType === t_multipoint){
				//TODO revisar que funcione
				var coords=geom.geometry.coordinates;
				for (var i = 0; i < coords.length; i++){
					var c=coords[i];
					if(!geomStyle.isCanvas){
						featureTem.push(new L.marker([c[1], c[0]],
							{icon: geomStyle, isCanvas:false, tipus: t_marker}));
					}else{
						featureTem.push(new L.circleMarker([c[1], c[0]],geomStyle));
					}
				}
			//Punt
			}else if (geomTypeVis === t_marker || geomType === "point"){
				var coords=geom.geometry.coordinates;
				if(!geomStyle.isCanvas){
					var marker=new L.marker([coords[1],coords[0]],{icon: geomStyle, isCanvas:false,tipus: t_marker});
					if (optionsVis!=undefined && optionsVis.opcionsVis!=undefined && optionsVis.opcionsVis=="nomesetiqueta" && origen==""){
						marker.setOpacity(0);
					}			
					if (optionsVis!=undefined && optionsVis.campEtiqueta!=undefined) {
						if (optionsVis!=undefined && optionsVis.opcionsVis!=undefined && 
								(optionsVis.opcionsVis=="nomesetiqueta" || optionsVis.opcionsVis=="etiquetageom") && origen==""){
								marker.bindLabel(geom.properties[optionsVis.campEtiqueta.toLowerCase()],
								{opacity:1, noHide: true, clickable:true, direction: 'center',className: "etiqueta_style_"+visualitzacio.businessId,offset: [0, 0]});							
						}
						if ((zoomInicialEtiqueta!=undefined && map.getZoom()<zoomInicialEtiqueta) ||
								(zoomFinalEtiqueta!=undefined && map.getZoom() > zoomFinalEtiqueta)) {//ocultem labels
							if (marker.label!=undefined) marker.label.setOpacity(0);
							else marker.hideLabel();
						}
					}
					featureTem.push(marker);
				}else{
					var markerCircle=new L.circleMarker([coords[1],coords[0]],geomStyle);
					if (optionsVis!=undefined && optionsVis.opcionsVis!=undefined && optionsVis.opcionsVis=="nomesetiqueta" && origen==""){
						geomStyle = createMarkerStyle(estil, estil.geometria.features.length,0);
						markerCircle=new L.circleMarker([coords[1],coords[0]],geomStyle);
					}
					if (optionsVis!=undefined && optionsVis.campEtiqueta!=undefined) {
						if (optionsVis!=undefined && optionsVis.opcionsVis!=undefined && 
								(optionsVis.opcionsVis=="nomesetiqueta" || optionsVis.opcionsVis=="etiquetageom") && origen==""){
							markerCircle.bindLabel(geom.properties[optionsVis.campEtiqueta.toLowerCase()],
								{opacity:1, noHide: true,clickable:true,  direction: 'altre',className: "etiqueta_style_"+visualitzacio.businessId,offset: [0, 0]});						
						}
						if ((zoomInicialEtiqueta!=undefined && map.getZoom()<zoomInicialEtiqueta) ||
								(zoomFinalEtiqueta!=undefined && map.getZoom() > zoomFinalEtiqueta)) {//ocultem labels
								try{
									if (markerCircle.label!=undefined) markerCircle.label.setOpacity(0);
									else markerCircle.hideLabel();
								}catch(err){
									$.publish('analyticsEvent',{event:['error', 'ZoomEtiqueta',JSON.stringify(err)]});	
								}
						}
					}
					featureTem.push(markerCircle);
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
					}
					featureTem.push(myPolyline);
				}

			//multiLine
			}else if (geomTypeVis === t_polyline){
				var coords=geom.geometry.coordinates;
				var llistaPunts=[];
				for (var i = 0; i < coords.length; i++){
					var c=coords[i];
					var punt=new L.LatLng(c[1], c[0]);
					llistaPunts.push(punt);
				}
				var polyline= (new L.polyline(llistaPunts, geomStyle));
				if (optionsVis!=undefined && optionsVis.opcionsVis!=undefined && optionsVis.opcionsVis=="nomesetiqueta" && origen==""){
					geomStyle = createLineStyle(estil,0);
					polyline= (new L.polyline(llistaPunts, geomStyle));
				}
				if (optionsVis!=undefined && optionsVis.campEtiqueta!=undefined) {
					if (optionsVis!=undefined && optionsVis.opcionsVis!=undefined) {
							if ((optionsVis.opcionsVis=="nomesetiqueta" || optionsVis.opcionsVis=="etiquetageom")  && origen==""){
								polyline.bindLabelEx(map,geom.properties[optionsVis.campEtiqueta.toLowerCase()], 
										{ noHide: true, direction: 'center',clickable:true, className: "etiqueta_style_"+visualitzacio.businessId ,offset: [0, 0]});
							}	
							if (optionsVis.opcionsVis=="geometries"){
								polyline.hideLabel();
							}
							if ((zoomInicialEtiqueta!=undefined && map.getZoom()<zoomInicialEtiqueta) ||
									(zoomFinalEtiqueta!=undefined && map.getZoom() > zoomFinalEtiqueta)) {//ocultem labels
								polyline.hideLabel();
							}
					}
				}
				featureTem.push(polyline);
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
				var multipolygon = new L.multiPolygon(llistaPoligons, geomStyle);
				multipolygon._options = jQuery.extend({}, multipolygon._options);
				if (optionsVis!=undefined && optionsVis.opcionsVis!=undefined && optionsVis.opcionsVis=="nomesetiqueta" && origen==""){
					geomStyle = createAreaStyle(estil,0);
					multipolygon = new L.multiPolygon(llistaLines, geomStyle);
				}
				if (optionsVis!=undefined && optionsVis.campEtiqueta!=undefined) {
					if (optionsVis!=undefined && optionsVis.opcionsVis!=undefined) {
							if ((optionsVis.opcionsVis=="nomesetiqueta" || optionsVis.opcionsVis=="etiquetageom")  && origen==""){
								multipolygon.bindLabelExPolygon(map,geom.properties[optionsVis.campEtiqueta.toLowerCase()], 
									{ noHide: true, direction: 'center',clickable:true, className: "etiqueta_style_"+visualitzacio.businessId,offset: [0, 0] });
							}	
							if (optionsVis.opcionsVis=="geometries"){
								multipolygon.hideLabel();
							}
							if ((zoomInicialEtiqueta!=undefined && map.getZoom()<zoomInicialEtiqueta) ||
									(zoomFinalEtiqueta!=undefined && map.getZoom() > zoomFinalEtiqueta)) {//ocultem labels
								multipolygon.hideLabel();
							}
					}
				}
				featureTem.push(multipolygon);
			//polygon
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
				var polygon = new L.Polygon(llistaLines, geomStyle);
				if (optionsVis!=undefined && optionsVis.opcionsVis!=undefined && optionsVis.opcionsVis=="nomesetiqueta" && origen==""){
					geomStyle = createAreaStyle(estil,0);
					polygon = new L.Polygon(llistaLines, geomStyle);
				}
				if (optionsVis!=undefined && optionsVis.campEtiqueta!=undefined) {
					if (optionsVis!=undefined && optionsVis.opcionsVis!=undefined) {
							if ((optionsVis.opcionsVis=="nomesetiqueta" || optionsVis.opcionsVis=="etiquetageom")  && origen==""){
								polygon.bindLabelExPolygon(map,geom.properties[optionsVis.campEtiqueta.toLowerCase()], 
									{ noHide: true, direction: 'center',clickable:true, className: "etiqueta_style_"+visualitzacio.businessId,offset: [0, 0] });
							}	
							if (optionsVis.opcionsVis=="geometries"){
								polygon.hideLabel();
							}
							if ((zoomInicialEtiqueta!=undefined && map.getZoom()<zoomInicialEtiqueta) ||
									(zoomFinalEtiqueta!=undefined && map.getZoom() > zoomFinalEtiqueta)) {//ocultem labels
								polygon.hideLabel();
							}
					}
				}
				featureTem.push(polygon);
			}
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
				try{
					capaVisualitzacio.addLayer(feat);
				}catch(err){
					if (capaVisualitzacio.layer!=undefined) capaVisualitzacio.layer.addLayer(feat);
				}
			
				if(geomTypeVis == t_polygon){
					feat.properties.mida = calculateArea(feat);
				}else if(geomTypeVis == t_polyline){
					feat.properties.mida = calculateDistance(feat.getLatLngs());
				}
				else if(geomTypeVis == t_marker && map.hasOwnProperty("oms") && canSpiderify ) {
					map.oms.addMarker(feat);
				}
			
				/*if(!geom.hasOwnProperty("popupData"))
				{*/
				
					//Si la capa no ve de fitxer
					var html;
					if(!hasSource){
						//"no te source, no ve de fitxer");
						if(!veientMapa && ((capaVisualitzacio.options.tipusRang == tem_origen) || !capaVisualitzacio.options.tipusRang) ){
							html = createPopupWindow(feat,geomTypeVis, true,capaVisualitzacio.options.propFormat, capaVisualitzacio.options.propPrivacitat);
						}else{
							//"Estem mode vis o no es tem origen:"
							html = createPopupWindowData(feat,geomTypeVis, false, origen, capaVisualitzacio);
						}								
					}else{
						//"Te source, ve de fitxer";
						if(!veientMapa && capaVisualitzacio.options.tipusRang == tem_origen){
							//"Estem mode mapa i es tem origen"
							html = createPopupWindowData(feat,geomTypeVis, true, origen, capaVisualitzacio);
						}else{
							//"Estem mode vis o no es tem origen:"
							html = createPopupWindowData(feat,geomTypeVis, false, origen, capaVisualitzacio);
						}
					}

					feat.properties.popupData = html;
					feat.properties.feature.properties = { 
						capaNom: feat.properties.capaNom,
						popupData: html };

				/*}
				else
				{

				}*/

				feat.on('click', creaPopupUnic);
				/*try{
					if (geomTypeVis===t_marker || geomTypeVis===t_multipoint){
						feat.snapediting = new L.Handler.MarkerSnap(map, feat,{snapDistance:10});
						feat.dragging.disable(); 
					}
					else {
						feat.snapediting = new L.Handler.PolylineSnap(map, feat,{snapDistance:10});
					}
					guideLayers.push(feat);
				}catch(err){
					
				}*/
				map.closePopup();					
			});
			}
		});
	});	
	//FIN EACH
}

function creaPopupUnic(e) {

	PopupManager().createMergedDataPopup(e.target, e, controlCapes).then(function() {
		actualitzarComboCapes();				
	});

}

/**Funcions per crear un objecte de tipus estil, amb les característiques que li passes
 * per punt, línia, poligon */

function createMarkerStyle(style, num_geometries,opacity){
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
		var fillOpacity=style.opacity/100;
		var opacitat=1;
		if (opacity!=undefined) {
			fillOpacity=opacity;
			opacitat=0;
		}
		
		var puntTMP = { 
			radius: style.simbolSize, 
			isCanvas: true,
			fillColor: style.color,
			color:  style.borderColor,
			weight:  style.borderWidth,
			fillOpacity: fillOpacity,
			opacity: opacitat,
			tipus: t_marker
		};
	}
	return puntTMP;
}

function createLineStyle(style,opacity){
	var estilTMP = default_line_style;
	estilTMP.color=style.color;
	estilTMP.weight=style.lineWidth;
	estilTMP.tipus=t_polyline;
	if (opacity!=undefined) {
		estilTMP.fillOpacity=opacity;
		estilTMP.opacity=opacity;
	}
	return estilTMP;
}

function createAreaStyle(style,opacity){
	
	var estilTMP= default_area_style;
	var opacitat=style.opacity/100;
	if (opacity!=undefined) {
		opacitat=opacity;
		estilTMP.opacity=opacity;
	}
	estilTMP.fillColor=style.color;
	estilTMP.fillOpacity=opacitat;
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
	
	if(!controlCapes.hasOwnProperty("_visLayers"))
	{
	
		controlCapes._visLayers = {};
		controlCapes._options = {};
	}

	$.get(HOST_APP+'capesuser/'+data.uid+'/'+data.businessId+'.json', function(results) { 
		if(results){
			controlCapes._visLayers[data.businessId] = results.results;
			controlCapes._options[data.businessId] = layer;
			readVisualitzacio(defer, results.results, layer);			
		}else{				
			getCacheVisualitzacioLayerByBusinessId(data).then(function(results){
				if(results.status == "OK" ){
					controlCapes._visLayers[data.businessId] = results.results;
					controlCapes._options[data.businessId] = layer;
					readVisualitzacio(defer, results.results, layer);			
				}else{
					console.debug('getVisualitzacioByBusinessId ERROR');
					defer.reject();	
				}	
			});
		}		
	}).fail(function() {
	   getCacheVisualitzacioLayerByBusinessId(data).then(function(results){
			if(results.status == "OK" ){
				controlCapes._visLayers[data.businessId] = results.results;
				controlCapes._options[data.businessId] = layer;
				readVisualitzacio(defer, results.results, layer);
			}else{
				console.debug('getVisualitzacioByBusinessId ERROR');
				$.publish('analyticsEvent',{event:['error', 'getVisualitzacioByBusinessId4',JSON.stringify(results)]});
				defer.reject();	
			}	
		});
	  });
	return defer.promise();
}

function sordDesc(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] > b[property]) ? -1 : (a[property] < b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}
function escapeSpecialChars(jsonString) {
	var myJSONString = JSON.stringify(jsonString);
	var myEscapedJSONString = myJSONString.replace(/\n/g, "\\n");
	//console.debug(myEscapedJSONString);
	return myEscapedJSONString;
  }

function actualitzacioTematic(layerMare,businessIdCapaMare,fId,feature,features,tipusModificacio) {
	//console.debug(layerMare);
	var isClasicTematic=false;
	if (layerMare!=undefined) {
		jQuery.each(layerMare._layers, function(i, sublayer){
			//console.debug(sublayer);
			if(jQuery.type(sublayer.layer.options)== "string"){
					sublayer.layer.options = $.parseJSON(sublayer.layer.options);
			}	            	  
			//Sublayer visualitzacio, carrego la capa
			if(sublayer.layer.options.tipus.indexOf(t_visualitzacio)!=-1){
				//if (sublayer.layer.options.tipusRang=="simpleTematic"){		
					if (tipusModificacio=="alta" || tipusModificacio=="modificacio"){
						if (sublayer.layer.options.tipusRang!="clusterTematic" && sublayer.layer.options.tipusRang!="heatmapTematic"){
							if (sublayer.layer.options.tipusRang=="clasicTematic"){
								var dataRemove = {
										businessId: url('?businessid'),
										uid: Cookies.get('uid'),
										servidorWMSbusinessId:sublayer.layer.options.businessId.toString()
								};
								
								removeLayerFromMap(dataRemove,sublayer);
					
								var props;
								if (layerMare.layer.options.propName!=undefined) props = layerMare.layer.options.propName.toString();
								else props='["nom","text"]';
								var data = {
										businessid: businessIdCapaMare,
										from:"clasicTematic",
										geometrytype:layerMare.layer.options.geometryType,
										leafletid:layerMare.layer._leaflet_id,
										propname:props,
										tipus:layerMare.layer.options.tipus
								};
								jQuery('#info_uploadFile').show();
								busy=true;
								jQuery("#div_uploading_txt").html("");
								jQuery("#div_uploading_txt").html(
									'<div id="div_upload_step1" class="status_current" lang="ca">1. '+window.lang.translate('Creant categories')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
									'<div id="div_upload_step2" class="status_uncheck" lang="ca">2. '+window.lang.translate('Processant la resposta')+'</div>'
								);
								createTematicCategoriesActualitzat(data,sublayer,businessIdCapaMare,layerMare);
							}
							else {	
								//Eliminem la capa de controlCapes
								controlCapes.removeLayer(sublayer);
								
								
								var rangsJSON2 = getFeatureStyle2(sublayer.layer.options.estil[0],sublayer.layer.options.geometryType);
								if (features==null){
									features = {
											type:feature.layer.options.tipus,
											id:fId,
											properties: feature.properties.data,
											estil: rangsJSON2,
											geometry: feature.geometry
									};
									features = JSON.stringify(features);
								}
								var data = {
										businessId: sublayer.layer.options.businessId,//f.layer.properties.capaBusinessId,//Bid de la visualitzacio
										uid: Cookies.get('uid'),
										features: features,
										estilBusinessId: sublayer.layer.options.estil[0].businessId
								};
								addGeometriaToVisualitzacioTematic(data).then(function(results) {
										if(results.status === 'OK'){
											sublayer.layer.serverName = sublayer.layer.options.nom;
											sublayer.layer.serverType = sublayer.layer.options.tipus;
											sublayer.layer.capesActiva = "true";
											sublayer.layer.options.origen = businessIdCapaMare;	
											sublayer.layer.businessId = sublayer.layer.options.businessId;//Si no, no ho trobarà després
												
											//eliminem sublayer del mapa, i recarreguem
											map.removeLayer(sublayer.layer);
											loadVisualitzacioLayer(sublayer.layer);
																			
										}else{
											console.debug('addGeometriaToVisualitzacio ERROR');
											$.publish('analyticsEvent',{event:['error', 'addGeometriaToVisualitzacio',JSON.stringify(results)]});
										}
								});
							}
						}
						else {
							sublayer.layer.serverName = sublayer.layer.options.nom;
							sublayer.layer.serverType = sublayer.layer.options.tipus;
							sublayer.layer.capesActiva = "true";
							sublayer.layer.options.origen = businessIdCapaMare;	
							sublayer.layer.businessId = sublayer.layer.options.businessId;//Si no, no ho trobarà després
							//eliminem sublayer del mapa, i recarreguem
							map.removeLayer(sublayer.layer);
							loadVisualitzacioLayer(sublayer.layer);
						}
					}
					else if (tipusModificacio=="baixa"){
						  sublayer.layer.serverName = sublayer.layer.options.nom;
				  		  sublayer.layer.serverType = sublayer.layer.options.tipus;
				  		  sublayer.layer.capesActiva = "true";
				  		  sublayer.layer.options.origen =businessIdCapaMare;//layer.properties.capaBusinessId;//BusinessIdCapaorigen
				  		  //tipusRang
				  		  sublayer.layer.businessId = sublayer.layer.options.businessId;//Si no, no ho trobarà després
				  		  //console.debug(sublayer);
				  		  //eliminem sublayer del mapa, i recarreguem
				  		  map.closePopup();
				  		  map.removeLayer(sublayer.layer);
				  		  controlCapes.removeLayer(sublayer);
				  		  loadVisualitzacioLayer(sublayer.layer);
				  		  
				  		  
					}
					else if (tipusModificacio=="modificacioInfo"){
						//Modificació informació d'una geometria - cal refer el temàtic.
						var dataRemove = {
								businessId: url('?businessid'),
								uid: Cookies.get('uid'),
								servidorWMSbusinessId:lbusinessId.toString()
							};
						removeLayerFromMap(dataRemove,sublayer);
						if (sublayer.layer.options.tipusRang=="clasicTematic"){
							var props;
							if (layerMare.layer.options.propName!=undefined) props = layerMare.layer.options.propName.toString();
							else props='["nom","text"]';
							var data = {
									businessid: businessIdCapaMare,
									from:"clasicTematic",
									geometrytype:layerMare.layer.options.geometryType,
									leafletid:layerMare.layer._leaflet_id,
									propname:props,
									tipus:layerMare.layer.options.tipus
							};
							jQuery('#info_uploadFile').show();
							busy=true;
							jQuery("#div_uploading_txt").html("");
							jQuery("#div_uploading_txt").html(
								'<div id="div_upload_step1" class="status_current" lang="ca">1. '+window.lang.translate('Creant categories')+'<span class="one">.</span><span class="two">.</span><span class="three">.</div>'+
								'<div id="div_upload_step2" class="status_uncheck" lang="ca">2. '+window.lang.translate('Processant la resposta')+'</div>'
							);
							createTematicCategoriesActualitzat(data,sublayer,businessIdCapaMare,layerMare);
						}
					}
				//}
			}
		 });
	}
	
}

function removeLayerFromMap(data,obj){
	removeServerToMap(data).then(function(results){
		if(results.status==='OK'){


			map.removeLayer(obj.layer);
			//Eliminem la capa de controlCapes
			controlCapes.removeLayer(obj);
			//Esborrem la llegenda de la capa eliminada
			emptyMapLegendEdicio(obj.layer);
			//actualitzem valors zindex de la resta si no es sublayer
			if(!obj.sublayer){
				var removeZIndex = obj.layer.options.zIndex;
				controlCapes._lastZIndex--;
				var aux = controlCapes._layers;
				for (var i in aux) {
					if (aux[i].layer.options.zIndex > removeZIndex) aux[i].layer.options.zIndex--;
				}
				//Eliminem les seves sublayers en cas que tingui
				for(indexSublayer in obj._layers){
					map.removeLayer(map._layers[indexSublayer]);
				}
			}

			//Actualitzem capaUsrActiva
			if(capaUsrActiva!=null && capaUsrActiva.options.businessId == obj.layer.options.businessId){
				capaUsrActiva.removeEventListener('layeradd');
				capaUsrActiva = null;
			}

			deleteServerRemoved(data).then(function(results){
				//se borran del listado de servidores
			});

			


		}else{
			return;//SI no ha anat be el canvi a BD. que no es faci tampoc a client, i es mostri un error
		}
	});
}


