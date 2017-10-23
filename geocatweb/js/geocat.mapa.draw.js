/**
 * Funcionalitats d'afegir features al mapa (punts, línies poligons) i
 * edició de les seves característiques: estils, coordenades, 
 * dades, capa on pertanyen...
 * */

var drawControl;
var featureActive,crt_Editing,crt_Remove;
var defaultPunt;
var canvas_linia={"id":"cv_linia","strokeStyle":"#FFC500","lineWidth":"3","tipus":"linia","opacity":"100"};
var canvas_pol={"id":"cv_pol","strokeStyle":"#FFC500","opacity":"0.5","fillStyle":"rgba(255, 197, 0,0.5)","lineWidth":"3","tipus":"pol"};
var canvas_obj_l,cv_ctx_l;
var canvas_obj_p,cv_ctx_p;
var objEdicio={'esticEnEdicio':false,'obroModalFrom':'creaCapa','featureID':null,'esticSobre':false,'edicioPopup':'textFeature'};

var drawnItems = new L.FeatureGroup();

function changeRandomDefaults(){

	var randomColorInit=getRamdomColorFromArray();
	canvas_linia.strokeStyle=randomColorInit;
	canvas_pol.strokeStyle=randomColorInit;
	canvas_pol.fillStyle="rgba("+hexToRgb(randomColorInit).r+", "+hexToRgb(randomColorInit).g+", "+hexToRgb(randomColorInit).b+",0.5)";
	var colorText=getClassFromColor(randomColorInit)	
	default_marker_style.markerColor = colorText,
	default_line_style.color=randomColorInit;
	default_area_style.color=randomColorInit;
	default_area_style.borderColor=randomColorInit;
	default_area_style.fillColor="rgb("+hexToRgb(randomColorInit).r+", "+hexToRgb(randomColorInit).g+", "+hexToRgb(randomColorInit).b+")";	
	estilP.colorGlif="#000000";
	estilP.iconFons="awesome-marker-web awesome-marker-icon-"+colorText;

}

function addRandomStyleInit(){

	jQuery('#div_punt').removeClass();
	jQuery('#div_punt').addClass('awesome-marker-web awesome-marker-icon-'+default_marker_style.markerColor+' fa fa-');	
	jQuery('#div_punt').css({"font-size":"14px", "width": "28px", "height": "42px", "color": "rgb(0, 0, 0)", "background-color": "transparent"});	
	changeDefaultLineStyle(canvas_linia);
	changeDefaultPointStyle(estilP);
	changeDefaultAreaStyle(canvas_pol);

}

function addDialegEstilsDraw() {
	
	changeRandomDefaults();
	addHtmlInterficieDraw();
	
	jQuery('#div_mes_punts').on("click", function(e) {	
		obrirMenuModal('#dialog_estils_punts','toggle',from_creaCapa);
	});

	jQuery('#div_mes_linies').on("click", function(e) {			
		obrirMenuModal('#dialog_estils_linies','toggle',from_creaCapa);
	});
	
	jQuery('#div_mes_arees').on("click", function(e) {	
		obrirMenuModal('#dialog_estils_arees','toggle',from_creaCapa);
	});

	

}

/**
 * Funcio que obre el menu dialeg d'estils per punts, linies i poligons
 * */
function obrirMenuModal(_menuClass,estat,_from){
	objEdicio.obroModalFrom=_from;
	//console.debug(_menuClass+","+estat+","+_from);
	//Udate dialog estils a mostrar
	if(_from == from_creaCapa){
		
		if(_menuClass.indexOf("arees")!=-1){
			var defPol = document.getElementById("cv_pol").getContext("2d");
			var fillColor = defPol.fillStyle;
			if(fillColor.indexOf("rgb")!=-1) fillColor = rgb2hex(defPol.fillStyle);
			var icon = {color: defPol.strokeStyle,
						fillOpacity : getRgbAlpha(defPol.fillStyle),
						fillColor: fillColor,//rgb2hex(defPol.fillStyle),
						weight: defPol.lineWidth,
						tipus: t_polygon
					};
			updateDialogStyleSelected(icon);
			
		}else if(_menuClass.indexOf("linies")!=-1){
			var defLine = document.getElementById("cv_linia").getContext("2d");
			var icon = {color: defLine.strokeStyle,
						weight: defLine.lineWidth,
						tipus: t_polyline
					};
			updateDialogStyleSelected(icon);			
		
		}else{//es t_marker

			 var styleProps = $("#div_punt").css(["width","height","color","background-color","font-size"]);
			 var punt_class = $("#div_punt").attr("class");
			 
			 console.info(punt_class);
			 var lclass = punt_class.split(" ");
			 //console.debug(punt_class);
			 //Si es punt inicial per defecte
			 if(punt_class == "dibuix_punt"){
					var icon = {icon: "",//glyph
						 	iconColor: "#000000",
						 	isCanvas: false,
						 	className: "awesome-marker",
						 	markerColor: 'orange',
						 	tipus: t_marker
				};
				
				console.info(icon);
				updateDialogStyleSelected(icon);				 
			 }else if (punt_class.indexOf("punt_r")!=-1){
				 	

				 	//Es punt sense glyphon, CANVAS
				 	if(!lclass[3] || lclass[3] === "fa-"){
						var icon = {icon: "",//glyph
								 	iconColor: rgb2hex(styleProps.color),
								 	fillColor: rgb2hex(styleProps["background-color"]),
								 	radius: getRadiusFromMida(styleProps.width),
								 	isCanvas: true,
								 	tipus: t_marker
						};
						updateDialogStyleSelected(icon);
						
				 	}else{//Es punt amb glyphon
					 	var iconGlyph = "";
					 	if(lclass[3]) iconGlyph = lclass[3];
					 	
					 	var font = " font"+styleProps["font-size"].substring(0,2);
						var icon = {icon: iconGlyph.substring(3) + font,//glyph
								 	iconColor: rgb2hex(styleProps.color),
								 	divColor: rgb2hex(styleProps["background-color"]),
								 	isCanvas: false,
								 	markerColor: punt_class,
								 	tipus: t_marker
						};
						updateDialogStyleSelected(icon);					 	
				 	}
			 }else{//Pintxo
				var markerColor = (lclass[1].split("-"))[3];
			 	var iconGlyph = "";
			 	if(lclass[3]) iconGlyph = lclass[3];
			 	
				var icon = {icon: iconGlyph.substring(3),//glyph
						 	iconColor: rgb2hex(styleProps.color),
						 	isCanvas: false,
						 	className: "awesome-marker",
						 	markerColor: markerColor,
						 	tipus: t_marker
				};
				updateDialogStyleSelected(icon);
			 }
		}
	}	
	
    if (jQuery.isPlainObject( _from )){
    	if (_from.from == tem_clasic){
    		//TODO
    		/*
    		jQuery('.fila-awesome-markers').hide();
            activaPuntZ();
            jQuery('#dialog_tematic_rangs').modal('hide');
            jQuery(_menuClass).modal(estat);
            */
    	}else{
    		

    		
    		var layers_from = controlCapes._layers[_from.leafletid].layer.getLayers();
        	if( layers_from.length > num_max_pintxos || _from.tipus == t_url_file){
                jQuery('.fila-awesome-markers').hide();
                jQuery('#filaM').hide();
                estilP.iconGlif = "fa fa-";
                activaPuntZ();
        	}else{
        		jQuery('#filaM').show();
                jQuery('.fila-awesome-markers').show();
               
        	}
        	jQuery('.modal').modal('hide');     
            jQuery(_menuClass).modal(estat);
    	}
    }else{
    	jQuery('.fila-awesome-markers').show();
    	jQuery('#filaM').show();
    	jQuery('.modal').modal('hide');     
        jQuery(_menuClass).modal(estat);
    }
    
}

function initCanvas(){
	addGeometryInitP(document.getElementById(canvas_pol.id),"inicial");
	addGeometryInitP(document.getElementById(canvas_pol.id+"0"));
	addGeometryInitL(document.getElementById(canvas_linia.id),"inicial");	
	addGeometryInitL(document.getElementById(canvas_linia.id+"0"));
	
    $('#colorpalette_pf').colorPalette().on('selectColor', function(e) {   	
    	$('.fill_color_pol').css('background-color',e.color);
        $('.fill_color_pol').css('color',e.color);
        canvas_pol.opacity=jQuery('#cmb_trans').val();//Forcem el valor de opacity pq en Chrome no anava bé
        canvas_pol.fillStyle="rgba("+hexToRgb(e.color).r+", "+hexToRgb(e.color).g+", "+hexToRgb(e.color).b+","+jQuery('#cmb_trans').val()+")";
    	addGeometryInitP(document.getElementById("cv_pol0"));
    });	
    
    $('#colorpalette_pl').colorPalette().on('selectColor', function(e) {    	
    	var color=rgb2hex($('.fill_color_pol').css('background-color'));
    	$('.border_color_pol').css('border-color',e.color);
    	canvas_pol.opacity=jQuery('#cmb_trans').val();//Forcem el valor de opacity pq en Chrome no anava bé
    	canvas_pol.strokeStyle=e.color;
    	canvas_pol.fillStyle="rgba("+hexToRgb(color).r+", "+hexToRgb(color).g+", "+hexToRgb(color).b+","+jQuery('#cmb_trans').val()+")";
    	addGeometryInitP(document.getElementById("cv_pol0"));  
    });
	
	$('#colorpalette_ll').colorPalette().on('selectColor', function(e) {   	
    $('.border_color_linia').css('background-color',e.color);
		canvas_linia.strokeStyle=e.color;
		addGeometryInitL(document.getElementById("cv_linia0"));
	});
 
	$('#colorpalette_icon').colorPalette().on('selectColor', function(e) {  
		 $('.fill_color_icon').css('background-color',e.color);
			estilP.colorGlif=e.color;			
			jQuery('.bs-glyphicons li').css('color',estilP.colorGlif);
			if(e.color=="#FFFFFF"){
				jQuery('.bs-glyphicons li').css('background-color','#aaaaaa');	
			}else{
				jQuery('.bs-glyphicons li').css('background-color','#FFFFFF');	
			}
			jQuery('#div_punt0').css('color',estilP.colorGlif);
			jQuery(this).addClass("estil_selected");
	});
	


	$('#colorpalette_punt').colorPalette().on('selectColor', function(e) {  
		 $('.fill_color_punt').css('background-color',e.color);			
		 if(!jQuery('#div_puntZ').hasClass("estil_selected")){
				activaPuntZ();				
		 }else{		 
			estilP.divColor=e.color;				
			jQuery('#div_punt0').css('background-color',estilP.divColor);
		 }
		    jQuery('#div_punt9').css('background-color',e.color);		
		});
	
	var options = {
			colors:[['#ffc500', '#ff7f0b', '#ff4b3a', '#ae59b9', '#00afb5', '#7cbd00', '#90a6a9', '#ebf0f1']]
	};
	
	$('#colorpalette_marker').colorPalette(options).on('selectColor', function(e) {  
		 $('.fill_color_marker').css('background-color',e.color);	
		 activaPuntM(e.color);
	});	

	jQuery("#cmb_trans").on('change', function(e) { 
    	var color=rgb2hex($('.fill_color_pol').css('background-color'));
    	canvas_pol.opacity=jQuery(this).val();
    	canvas_pol.fillStyle="rgba("+hexToRgb(color).r+", "+hexToRgb(color).g+", "+hexToRgb(color).b+","+jQuery('#cmb_trans').val()+")";
    	addGeometryInitP(document.getElementById("cv_pol0"));
    });
    
    jQuery("#cmb_gruix").on('change', function(e) { 
    	canvas_pol.lineWidth=jQuery(this).val();
    	var color=rgb2hex($('.fill_color_pol').css('background-color'));
    	canvas_pol.opacity=jQuery('#cmb_trans').val();
    	canvas_pol.fillStyle="rgba("+hexToRgb(color).r+", "+hexToRgb(color).g+", "+hexToRgb(color).b+","+jQuery('#cmb_trans').val()+")";
    	addGeometryInitP(document.getElementById("cv_pol0"));
    });
    
    jQuery("#cmb_gruix_l").on('change', function(e) { 
    	canvas_linia.lineWidth=jQuery(this).val();
    	var color=rgb2hex($('.fill_color_pol').css('background-color'));
    	canvas_pol.opacity=jQuery('#cmb_trans').val();
    	canvas_pol.fillStyle="rgba("+hexToRgb(color).r+", "+hexToRgb(color).g+", "+hexToRgb(color).b+","+jQuery('#cmb_trans').val()+")";
    	addGeometryInitL(document.getElementById("cv_linia0"));
    });
}

function addGeometryInitL(canvas,inicial){
	var	cv_ctx_l=canvas.getContext("2d");
	cv_ctx_l.clearRect(0, 0, canvas.width, canvas.height);
	cv_ctx_l.moveTo(0.7,39.42);
	cv_ctx_l.lineTo(2.05,34.43);
	cv_ctx_l.lineTo(3.62,31.00);
	cv_ctx_l.lineTo(5.95,27.72);
	cv_ctx_l.lineTo(8.17,25.61);
	cv_ctx_l.lineTo(10.72,23.84);
	cv_ctx_l.lineTo(13.059,22.73);
	cv_ctx_l.lineTo(15.32,22.28);
	cv_ctx_l.lineTo(17.76,22.08);
	cv_ctx_l.lineTo(20.30,21.47);
	cv_ctx_l.lineTo(23.28,20.51);
	cv_ctx_l.lineTo(25.88,18.90);
	cv_ctx_l.lineTo(28.265,16.83);
	cv_ctx_l.lineTo(29.9,14.71);
	cv_ctx_l.lineTo(31.89,12.195);
	cv_ctx_l.lineTo(33.62,9.42);
	cv_ctx_l.lineTo(34.81,6.64);
	cv_ctx_l.lineTo(35.46,3.92);
	cv_ctx_l.lineTo(35.52,0.54);
	cv_ctx_l.strokeStyle=canvas_linia.strokeStyle;
	cv_ctx_l.lineWidth=canvas_linia.lineWidth;
	var idLinia = canvas.id;
	if ((inicial==null || inicial==undefined) && idLinia=='cv_linia0'){
		cv_ctx_l.shadowColor = '#999999';
		cv_ctx_l.shadowBlur = 20;
		cv_ctx_l.shadowOffsetX = 15;
		cv_ctx_l.shadowOffsetY = 15;
		cv_ctx_l.stroke(); 	
		cv_ctx_l.shadowOffsetX = -15;
		cv_ctx_l.stroke(); 	
		cv_ctx_l.shadowOffsetY = -15;
		cv_ctx_l.stroke(); 
		cv_ctx_l.shadowOffsetX = 15;
	}
	cv_ctx_l.stroke(); 	
}

function addGeometryInitP(canvas,inicial){
	var	cv_ctx_p=canvas.getContext("2d");
	cv_ctx_p.clearRect(0, 0, canvas.width, canvas.height);
	cv_ctx_p.moveTo(5.13,15.82);
	cv_ctx_p.lineTo(25.49,5.13);
	cv_ctx_p.lineTo(37.08,13.16);
	cv_ctx_p.lineTo(20.66,38.01);
	cv_ctx_p.lineTo(2.06,33.67);
	cv_ctx_p.closePath();
	cv_ctx_p.strokeStyle=canvas_pol.strokeStyle;
//	console.debug(canvas_pol);
	if(canvas_pol.fillStyle.indexOf("rgb")!= -1) cv_ctx_p.fillStyle = canvas_pol.fillStyle;
	else cv_ctx_p.fillStyle=hexToRgba(canvas_pol.fillStyle,canvas_pol.opacity );
	
//	cv_ctx_p.fillStyle=canvas_pol.fillStyle;
	cv_ctx_p.lineWidth=canvas_pol.lineWidth;
//	cv_ctx_p.opacity=canvas_pol.opacity;
	var idPol = canvas.id;
	if ((inicial==null || inicial==undefined) && idPol=='cv_pol0'){
		cv_ctx_p.shadowColor = '#999999';
		cv_ctx_p.shadowBlur = 20;
		cv_ctx_p.shadowOffsetX = 15;
		cv_ctx_p.shadowOffsetY = 18;	
		cv_ctx_p.fill();
		cv_ctx_p.stroke(); 
		cv_ctx_p.shadowOffsetX = -15;
		cv_ctx_p.fill();
		cv_ctx_p.stroke(); 	
		cv_ctx_p.shadowOffsetY = -18;
		cv_ctx_p.fill();
		cv_ctx_p.stroke(); 
		cv_ctx_p.shadowOffsetX = 15;
	}
		cv_ctx_p.fill();
		cv_ctx_p.stroke(); 
}

//Funcio inicialitzar i afegir drawControl
function addDrawToolbar() {
	initCanvas();
	
	var ptbl = L.Icon.extend({
		options : {
			shadowUrl : null,
			iconAnchor : new L.Point(14, 40),
			iconSize : new L.Point(28, 40)
		}
	});

	defaultPunt= L.AwesomeMarkers.icon(default_marker_style);
	map.addLayer(drawnItems);
	
	var options = {
		draw : false,
		polyline : {
			guidelineDistance : 2,
			repeatMode:false,
			shapeOptions : {
				color : '#FFC400',
				weight : 3,
				opacity : 1,
				tipus: t_polyline
			},
			guideLayers: guideLayers
		},
		polygon : {
			allowIntersection : true, // Restricts shapes
			repeatMode:false,
			guidelineDistance : 2,			
			shapeOptions : {
				color : '#FFC400',
				fillColor: '#FFC400',
				weight : 3,
				fillOpacity : 0.5,
				tipus: t_polygon
			},
			snapDistance: 10,
			guideLayers: guideLayers
		},
		marker:{repeatMode:false,
			icon:L.icon({iconUrl:'/geocatweb/css/images/blank.gif'}),		
			snapDistance: 10,
			snapVertices: false,
			guideLayers: guideLayers
		},
		edit :{
		    featureGroup: drawnItems, //REQUIRED!!
		    remove: false,
		    edit:false
		    }
	};
	drawControl = new L.Control.Draw(options);
	
	map.addControl(drawControl);
	addDrawTooltips();
	addRandomStyleInit();
}

//function showEditText(accio){
//	jQuery('.search-edit').animate({
//		height :accio
//	});
//}

function activaEdicioUsuari() {
	jQuery('#div_punt').on('click', function() {
		if(featureActive){featureActive.disable();}
		featureActive = new L.Draw.Marker(map, drawControl.options.marker);		 
		featureActive.enable();
	});

	jQuery('#div_linia').on('click', function() {
		if(featureActive){featureActive.disable();}
		featureActive = new L.Draw.Polyline(map, drawControl.options.polyline);
		featureActive.enable();
	});

	jQuery('#div_area').on('click', function() {
		if(featureActive){featureActive.disable();}
		featureActive = new L.Draw.Polygon(map, drawControl.options.polygon);
		featureActive.enable();
	});

	map.on('draw:drawstart',function(e){
		map.off('click',L.TileLayer.BetterWMS.getFeatureInfo);		
	});

	map.on('draw:created',function(e){
		map.on('click',function(e) {
			PopupManager().createMergedDataPopup(e.target, e, controlCapes).then(function() {
				actualitzarComboCapes();				
			});
		});		
	});
	
	//Edicio de feature existent
	map.on('click',function(e){
		for(var i = 0;i < guideLayers.length; i++) {			
				
			if (guideLayers[i].snapediting!=undefined)  guideLayers[i].snapediting.disable();
			if (guideLayers[i].editing!=undefined) guideLayers[i].editing.disable();
			try{
				if (guideLayers[i].dragging!=undefined) guideLayers[i].dragging.disable();
			}catch(exc){
					
			}
		}
		
		if(objEdicio.esticEnEdicio){			
			try{
				updateFeatureMove(objEdicio.featureID, crt_Editing._featureGroup._leaflet_id, objEdicio.capaEdicioLeafletId);
			}catch(exc){
				
			}
			if(crt_Editing){
				try{
					crt_Editing.disable();
				}catch(exc){
					
				}
			}
//			updateFeatureMove(objEdicio.featureID, objEdicio.capaEdicioLeafletId);		
		}
		if(crt_Editing){
			try{
				crt_Editing.disable();
			}catch(exc){
				
			}
		}
	});
	
	//Controlem que si hi ha un click en un altre lloc del mapa l'edició de features es desactiva
	$('body').click(function(event) {		
		if(objEdicio.esticEnEdicio){
			 var target = $(event.target);
			 for(var i = 0;i < guideLayers.length; i++) {			
				 	
						if (guideLayers[i].snapediting!=undefined)  guideLayers[i].snapediting.disable();
						if (guideLayers[i].editing!=undefined) guideLayers[i].editing.disable();
					try{
						if (guideLayers[i].dragging!=undefined) guideLayers[i].dragging.disable();
				 	}catch(exc){
				 		
				 	}
			}
			 if(objEdicio.esticEnEdicio){			
					try{
						updateFeatureMove(objEdicio.featureID, crt_Editing._featureGroup._leaflet_id, objEdicio.capaEdicioLeafletId);
					}catch(exc){
						
					}
					if(crt_Editing){
						try{
							crt_Editing.disable();
						}catch(exc){
							
						}
					}
//					updateFeatureMove(objEdicio.featureID, objEdicio.capaEdicioLeafletId);		
				}
		
			if(crt_Editing){
				try{
					crt_Editing.disable();
				}catch(exc){
					
				}
			}
			target.click();
		}
	});
	
	map.on('preclick',function(e){
		if(crt_Editing){
			crt_Editing.disable();
		}
	});
	
	//Afegir features: point, lines and polygons
	map.on('draw:created', function(e) {
		var type = e.layerType, layer = e.layer;
		var totalFeature;
		var tipusCat,tipusCatDes;
		$.publish('analyticsEvent',{event:['mapa', tipus_user+'dibuixar geometria', type, 1]});
		//_kmq.push(['record', 'dibuixar geometria', {'from':'mapa', 'tipus user':tipus_user, 'type':type}]);
		 drawnItems.addLayer(layer);
		 
		if (type === t_marker) {
			tipusCat=window.lang.translate('Títol Punt');
			tipusCatDes=window.lang.translate('Descripció Punt');
			var nomDefecteCapa = window.lang.translate('Capa Punt');
			
			//Mira si és icona
			if(!defaultPunt.options.isCanvas){
				 var divIcon = L.divIcon({ 
					  html: "<span style='color:blue;'>textToDisplay</span>"
					});
								
				
				layer=L.marker([layer.getLatLng().lat,layer.getLatLng().lng],
					{icon: defaultPunt,isCanvas:defaultPunt.options.isCanvas,
					 tipus: t_marker}).addTo(map);//.bindLabel('Look revealing label!', { noHide: true , direction: 'center',className: "my-label", offset: [0, 0]}).addTo(map);
			}else{
				//Si és cercle sense glifon
				layer= L.circleMarker([layer.getLatLng().lat,layer.getLatLng().lng],
						{ radius : defaultPunt.options.radius, 
						  isCanvas:defaultPunt.options.isCanvas,
						  fillColor : defaultPunt.options.fillColor,
						  color :  defaultPunt.options.color,
						  weight :  defaultPunt.options.weight,
						  opacity :  defaultPunt.options.opacity,
						  fillOpacity : defaultPunt.options.fillOpacity,
						  tipus: t_marker}
						
				).addTo(map);//.bindLabel('Look revealing label!', { noHide: true, direction: 'center',className: "my-label", offset: [0, 0] }).addTo(map);
			}
			
			if(capaUsrActiva != null && capaUsrActiva.options.geometryType != t_marker){
				capaUsrActiva.removeEventListener('layeradd');
				capaUsrActiva = new L.FeatureGroup();
				var index = parseInt(controlCapes._lastZIndex)+1;
				capaUsrActiva.options = {
					businessId : '-1',
					nom : nomDefecteCapa+' '+ index,
					zIndex :  -1,
//					tipus : t_tematic,
					tipus : t_visualitzacio,
					geometryType: t_marker
				};				
				map.addLayer(capaUsrActiva);
				capaUsrActiva.on('layeradd',objecteUserAdded);
				
			}else if(capaUsrActiva == null){
				capaUsrActiva = new L.FeatureGroup();
				var index = parseInt(controlCapes._lastZIndex)+1;
				capaUsrActiva.options = {
					businessId : '-1',
					nom : nomDefecteCapa+' '+index,
					zIndex :  -1,
//					tipus : t_tematic,
					tipus : t_visualitzacio,
					geometryType: t_marker
				};
				map.addLayer(capaUsrActiva);
				capaUsrActiva.on('layeradd',objecteUserAdded);
			}
			
			layer.properties={
					'capaNom':capaUsrActiva.options.nom,//TODO desactualitzat quan es canvii nom capa!
					'capaBusinessId':capaUsrActiva.options.businessId,
					'capaLeafletId': capaUsrActiva._leaflet_id,
					'tipusFeature':t_marker};	
			
			var auxLat = layer._latlng.lat;
			auxLat= auxLat.toFixed(5);
			var auxLon = layer._latlng.lng;
			auxLon= auxLon.toFixed(5);
			var etrs = latLngtoETRS89(layer._latlng.lat, layer._latlng.lng);
			var auxX = etrs.x;
		    var auxY = etrs.y;
			
			layer.properties.data={
					'nom':tipusCat+' '+capaUsrActiva.getLayers().length,
					'text':tipusCatDes+' '+capaUsrActiva.getLayers().length,
					'latitud':auxLat,
					'longitud':auxLon,
					'etrs89_x':auxX,
					'etrs89_y':auxY
			};
			/*try{
				//Active snapping
				//layer.snapediting = new L.Handler.MarkerSnap(map, layer,{snapDistance:10});
				for(var i = 0;i < guideLayers.length; i++) {
				        // Add every already drawn layer to snap list
				        layer.snapediting.addGuideLayer(guideLayers[i]);
				        // Add the currently drawn layer to the snap list of the already drawn layers
				        guideLayers[i].snapediting.addGuideLayer(layer);
				        guideLayers[i].snapediting.disable();
				        if (guideLayers[i].dragging!=undefined) guideLayers[i].dragging.enable(); 
				 }
			}catch(exc){
				
			}*/
			
			  // Add to drawnItems
			 drawnItems.addLayer(layer);
			 // Add newly drawn feature to list of snappable features
			  guideLayers.push(layer);
			  capaUsrActiva.removeEventListener('layeradd');
			  capaUsrActiva.on('layeradd',objecteUserAdded);
			capaUsrActiva.addLayer(layer);
			
		} else if (type === t_polyline) {
			tipusCat=window.lang.translate('Títol Línia');
			tipusCatDes=window.lang.translate('Descripció Línia');
			var nomDefecteCapa = window.lang.translate('Capa Línia');
			
			if(capaUsrActiva != null && capaUsrActiva.options.geometryType != t_polyline){
				capaUsrActiva.removeEventListener('layeradd');
				capaUsrActiva = new L.FeatureGroup();
				var index = parseInt(controlCapes._lastZIndex)+1;
				capaUsrActiva.options = {
					businessId : '-1',
					nom : nomDefecteCapa+' '+index,
					zIndex :  -1,
//					tipus : t_tematic,
					tipus : t_visualitzacio,
					geometryType: t_polyline

				};
				map.addLayer(capaUsrActiva);
				capaUsrActiva.on('layeradd',objecteUserAdded);
			}else if(capaUsrActiva == null){
				capaUsrActiva = new L.FeatureGroup();
				var index = parseInt(controlCapes._lastZIndex)+1;
				capaUsrActiva.options = {
					businessId : '-1',
					nom : nomDefecteCapa+' '+index,
					zIndex :  -1,
//					tipus : t_tematic,
					tipus : t_visualitzacio,
					geometryType: t_polyline
				};
				map.addLayer(capaUsrActiva);
				capaUsrActiva.on('layeradd',objecteUserAdded);
			}
			
			layer.properties={
					'capaNom':capaUsrActiva.options.nom,//TODO desactualitzat quan es canvii nom capa!
					'capaBusinessId':capaUsrActiva.options.businessId,
					'capaLeafletId': capaUsrActiva._leaflet_id,
					'tipusFeature':t_polyline,
					'longitud (km)': calculateDistanceWithoutKm(layer.getLatLngs()) };	
			
			layer.properties.data={
					'nom':tipusCat+' '+capaUsrActiva.getLayers().length,
					'text':tipusCatDes+' '+capaUsrActiva.getLayers().length,
					'longitud (km)': calculateDistanceWithoutKm(layer.getLatLngs())
			};	
			//Activate snapping
			/*layer.snapediting = new L.Handler.PolylineSnap(map, layer,{snapDistance:10});
			for(var i = 0;i < guideLayers.length; i++) {
		        // Add every already drawn layer to snap list
		        layer.snapediting.addGuideLayer(guideLayers[i]);
		        // Add the currently drawn layer to the snap list of the already drawn layers
		        guideLayers[i].snapediting.addGuideLayer(layer);
		        guideLayers[i].snapediting.disable();
		        if (guideLayers[i].dragging!=undefined) guideLayers[i].dragging.enable(); 
			 }*/
			 
			 // Add to drawnItems
			 drawnItems.addLayer(layer);
			 // Add newly drawn feature to list of snappable features
			  guideLayers.push(layer);
			  capaUsrActiva.removeEventListener('layeradd');
			  capaUsrActiva.on('layeradd',objecteUserAdded);
			createClass('.polyline-style',"font-family:Verdana;font-size:20px;color:red;");
			capaUsrActiva.addLayer(layer);
			
		} else if (type === t_polygon) {
			tipusCat=window.lang.translate('Títol Polígon');
			tipusCatDes=window.lang.translate('Descripció Polígon');	
			var nomDefecteCapa = window.lang.translate('Capa Polígon');
			var mida = L.GeometryUtil.geodesicArea(layer.getLatLngs());
			mida = L.GeometryUtil.readableArea(mida,true);
			
			if(capaUsrActiva != null && capaUsrActiva.options.geometryType != t_polygon){
				capaUsrActiva.removeEventListener('layeradd');
				capaUsrActiva = new L.FeatureGroup();
				var index = parseInt(controlCapes._lastZIndex)+1;
				capaUsrActiva.options = {
					businessId : '-1',
					nom : nomDefecteCapa+' '+index,
					zIndex :  -1,
//					tipus : t_tematic,
					tipus : t_visualitzacio,
					geometryType: t_polygon
				};
				map.addLayer(capaUsrActiva);				
				capaUsrActiva.on('layeradd',objecteUserAdded);
			}else if(capaUsrActiva == null){
				capaUsrActiva = new L.FeatureGroup();
				var index = parseInt(controlCapes._lastZIndex)+1;
				capaUsrActiva.options = {
					businessId : '-1',
					nom : nomDefecteCapa+' '+index,
					zIndex :  -1,
//					tipus : t_tematic,
					tipus : t_visualitzacio,
					geometryType: t_polygon
				};
				map.addLayer(capaUsrActiva);
				capaUsrActiva.on('layeradd',objecteUserAdded);
			}
			layer.properties={
					'capaNom':capaUsrActiva.options.nom,//TODO desactualitzat quan es canvii nom capa!
					'capaBusinessId':capaUsrActiva.options.businessId,
					'capaLeafletId': capaUsrActiva._leaflet_id,
					'tipusFeature':t_polygon,
					'mida': mida,
					'area (ha)': calculateAreaWithoutHa(layer)};
			
			layer.properties.data={
					'nom':tipusCat+' '+capaUsrActiva.getLayers().length,
					'text':tipusCatDes+' '+capaUsrActiva.getLayers().length,
					'area (ha)': calculateAreaWithoutHa(layer)
			};		
			//Activate snapping
			/*layer.snapediting = new L.Handler.PolylineSnap(map, layer,{snapDistance:10});
			for(var i = 0;i < guideLayers.length; i++) {
		        // Add every already drawn layer to snap list
		        layer.snapediting.addGuideLayer(guideLayers[i]);
		        // Add the currently drawn layer to the snap list of the already drawn layers
		        guideLayers[i].snapediting.addGuideLayer(layer);
		        guideLayers[i].snapediting.disable();
		        if (guideLayers[i].dragging!=undefined) guideLayers[i].dragging.enable(); 
			 }
			*/
	
			  // Add to drawnItems
			 drawnItems.addLayer(layer);
			 // Add newly drawn feature to list of snappable features
			guideLayers.push(layer);
			capaUsrActiva.removeEventListener('layeradd');
			  capaUsrActiva.on('layeradd',objecteUserAdded);
			capaUsrActiva.addLayer(layer);			
		}
	});
	
}

//Funcio que crea Pop up de la feature quan te opcio d'edicio
function createPopupWindow(layer,type, editant,propFormat, propPrivacitat){
//	console.debug('createPopupWindow');
	var html = createPopUpContent(layer,type, editant,propFormat, propPrivacitat);
	//layer.bindPopup(html,{'offset':[0,-25]});
	//eventos del popup
	jQuery(document).on('click', "#titol_pres", function(e) {
		modeEditText();
	});
	
	jQuery(document).on('click', "#des_pres", function(e) {
		modeEditText();
	});

	jQuery(document).on('click', ".bs-ncapa li a", function(e) {
		e.preventDefault();
		var accio;
		if(jQuery(this).attr('id').indexOf('#')!=-1){			
			accio=jQuery(this).attr('id').split("#");				
		}
		
		objEdicio.featureID=accio[1];
		if(accio[0].indexOf("layer_edit")!=-1){
			objEdicio.edicioPopup='textCapa';
			jQuery('#layer_accio').text(window.lang.translate('Canviar el nom de la capa'))
			jQuery('#capa_edit').val(jQuery('#cmbCapesUsr').val());
			modeLayerTextEdit();

		}else if(accio[0].indexOf("layer_add")!=-1){
			objEdicio.edicioPopup='nouCapa';
			jQuery('#layer_accio').text(window.lang.translate('Nom nova capa'))
			jQuery('#capa_edit').val("").attr('placeholder',window.lang.translate('Nova capa'));
			modeLayerTextEdit();
		}else{
			
		}
	});
	
	 jQuery(document).on('focus', ".bs-ncapa li select", function(e) {
		 $(this).data('cmbCapesUsr_old',$(this).val());
	 });	 
	 
	 jQuery(document).on('change', ".bs-ncapa li select", function(e) {
		    e.stopImmediatePropagation();
		    
			e.preventDefault();
			e.stopPropagation();		    
//		    console.debug('on change select cmbusrcapa');
			var accio;
			if(jQuery(this).attr('id').indexOf('-')!=-1){			
				accio=jQuery(this).attr('id').split("-");				
			}
			objEdicio.featureID=accio[1];
			console.debug(accio);			
			var toBusinessId = jQuery(this).val().split("#");
			var fromBusinessId = $(this).data('cmbCapesUsr_old').split("#");
			//Actualitzem valor antic
			$(this).data('cmbCapesUsr_old',$(this).val());
			
			objEdicio.featureID=accio[1];
			var obj = map._layers[objEdicio.featureID];
			
			
			/*NOU MODEL*/
			var features = {
					type: obj.properties.tipusFeature,
					id:3124,
					businessId: obj.properties.businessId,//Bid de la geometria q estas afegint
					properties: obj.properties.data,
					estil: obj.properties.estil,
					geometry: obj.properties.feature.geometry
				};
			
			features = JSON.stringify(features);
			
			data= {
				toBusinessId: toBusinessId[0],//bID de la visualitzacio-capa
				fromBusinessId: fromBusinessId[0],//bID de la visualitzacio-capa
				uid: Cookies.get('uid'),
				features: features
			}	
			
			moveGeometriaToVisualitzacio(data).then(function(resultsMove) {
//				console.debug("moveGeometriaToVisualitzacio:"+ resultsMove.status);
				if(resultsMove.status === 'OK'){

					reloadSingleLayer(controlCapes._layers[accio[3]], resultsMove.layerFrom);
					reloadSingleLayer(controlCapes._layers[toBusinessId[1]], resultsMove.layerTo);
					
				}else{
					console.debug("moveGeometriaToVisualitzacio ERROR");
				}
			},function(results){
				console.debug("moveGeometriaToVisualitzacio ERROR");
			});					
	 });
	 
	jQuery(document).on('click', ".bs-popup li a", function(e) {
		e.stopImmediatePropagation();
		var accio;
		if(jQuery(this).attr('id').indexOf('#')!=-1){			
			if (jQuery(this).attr('id').indexOf('##')>-1) accio=jQuery(this).attr('id').split("##");			
			else accio=jQuery(this).attr('id').split("#");				
		}
		objEdicio.featureID=accio[1];
		
		if(accio[0].indexOf("feature_edit")!=-1){

			//Update modal estils, amb estil de la feature seleccionada
			var obj = map._layers[accio[1]];
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
		}else if(accio[0].indexOf("feature_remove")!=-1){
			map.closePopup();
			var data = {
	            businessId: map._layers[objEdicio.featureID].properties.businessId,
	            uid: Cookies.get('uid')
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
				uid: Cookies.get('uid'),
				features: features
			};
			var businessIdCapaOrigen=map._layers[objEdicio.featureID].properties.capaBusinessId;
			removeGeometriaFromVisualitzacio(data).then(function(results){
				if(results.status == 'OK'){
					/*var capaLeafletId = map._layers[objEdicio.featureID].properties.capaLeafletId;
					var capaBusinessId = map._layers[objEdicio.featureID].properties.capaBusinessId;
					if(map._layers[capaLeafletId]!= undefined) map._layers[capaLeafletId].removeLayer(map._layers[objEdicio.featureID]);					
					if(map._layers[objEdicio.featureID]!= null) map.removeLayer(map._layers[objEdicio.featureID]);					
					//Actualitzem comptador de la capa
					if(map._layers[capaLeafletId]!= undefined) updateFeatureCount(map._layers[capaLeafletId].options.businessId, null);
					else {						
						updateFeatureCount(capaBusinessId, null);		
					}*/
					
					var capaLeafletId = map._layers[objEdicio.featureID].properties.capaLeafletId;
					var capaBusinessId = map._layers[objEdicio.featureID].properties.capaBusinessId;
					if(map._layers[capaLeafletId]!= undefined) map._layers[capaLeafletId].removeLayer(map._layers[objEdicio.featureID]);					
					if(map._layers[objEdicio.featureID]!= null) map.removeLayer(map._layers[objEdicio.featureID]);	
					if(map._layers[capaLeafletId]!= undefined) {
						updateFeatureCount(map._layers[capaLeafletId].options.businessId, null);
					}
					else {						
						updateFeatureCount(capaBusinessId, null);		
					}		
					 var layer = controlCapes._layers[capaLeafletId];
					//recarrego les sublayers de la capa modificada	
					actualitzacioTematic(layer,businessIdCapaOrigen,null,null,null,"baixa");
					
					
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
			if (capaLeafletId==undefined) capaLeafletId =  map._layers[objEdicio.featureID]._leaflet_id;
			objEdicio.capaEdicioLeafletId = capaLeafletId;
			//Actualitzem capa activa
			if (capaUsrActiva){
				capaUsrActiva.removeEventListener('layeradd');
			}
			capaUsrActiva = map._layers[capaLeafletId];
			var capaEdicio = new L.FeatureGroup();
			capaEdicio.addLayer(map._layers[objEdicio.featureID]);
			
			try{
				capaUsrActiva.removeLayer(map._layers[objEdicio.featureID]);
			}
			catch(ex){
				
			}
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
		
		
		/*	if(map._layers[objEdicio.featureID].properties.tipusFeature=="marker" && map._layers[objEdicio.featureID].options.isCanvas){
				crt_Editing=new L.EditToolbar.Edit(map, {
					featureGroup: capaEdicio,
					selectedPathOptions: opcionsSel
				});
				crt_Editing.enable();
			}
			else {
				crt_Editing=new L.EditToolbar.SnapEdit(map, {
					featureGroup: capaEdicio,
					selectedPathOptions: opcionsSel,
					snapOptions: {
						guideLayer: guideLayers
					}
				});
				crt_Editing.enable();
				//activarSnapping(capaEdicio);
			}
			
			
			*/
			
			
			map.closePopup();
			
			
		}else if(accio[0].indexOf("feature_no")!=-1){
			jQuery('.popup_pres').show();
			jQuery('.popup_edit').hide();
			
		}else if(accio[0].indexOf("feature_ok")!=-1){
			if(objEdicio.edicioPopup=='textFeature'){
				var txtTitol=jQuery('#titol_edit').val();
				var txtDesc=jQuery('#des_edit').val();
				if (txtDesc.indexOf("'")>-1) txtDesc = txtDesc.replaceAll("'",'"');
				updateFeatureNameDescr(map._layers[objEdicio.featureID],txtTitol,txtDesc);

			}else if(objEdicio.edicioPopup=='textCapa'){
				if(jQuery('#capa_edit').val()!=""){
					jQuery('#cmbCapesUsr option:selected').text(jQuery('#capa_edit').val());	
					jQuery('.popup_pres').show();
					jQuery('.popup_edit').hide();
				}else{
					alert(window.lang.translate('Has de posar un nom de capa'));	
				}
			}else if(objEdicio.edicioPopup=='nouCapa'){
				if(jQuery('#capa_edit').val()!=""){
					generaNovaCapaUsuari(map._layers[objEdicio.featureID],jQuery('#capa_edit').val(), map._layers[objEdicio.featureID].properties.capaLeafletId);
				}else{
					alert(window.lang.translate('Has de posar un nom de capa'));	
				}
			}
		}else if(accio[0].indexOf("feature_data_table")!=-1){
			$('#modal_data_table').modal('show');
			var featureId=objEdicio.featureID;
			if (featureId==undefined) featureId=accio[2];
			
			if (map._layers[featureId]==undefined) {
				try{
					if (accio[6]!=undefined) featureId=accio[6];
					var props=map._layers[featureId].properties;
					if (props==undefined) props=map._layers[featureId].options;
					if (accio[3]==undefined)  fillModalDataTable(controlCapes._layers[accio[2]],props.businessId);
					else fillModalDataTable(controlCapes._layers[accio[3]],props.businessId);
				}
				catch(err){
					$.publish('analyticsEvent',{event:['error', 'feature_data_table',JSON.stringify(err) ]});
					
				}
			}
			else fillModalDataTable(controlCapes._layers[accio[3]],map._layers[featureId].properties.businessId);
		
		
		}else{
		//accio tanca
			map.closePopup();
		}
	});

	layer.on('click', function(e){
		layer.off('click', creaPopupUnic);	
		if(objEdicio.esticEnEdicio){
			//Si s'esta editant no es pot editar altre element
			map.closePopup();
		}
		else if(layer._oms) {
			//Si és un marker de l'spiderifier, ja es tracta el click en els seus events
		}
		else{
			//actualitzem popup
			PopupManager().createMergedDataPopup(e.target, e, controlCapes).then(function() {
				actualitzarComboCapes();				
			});
		}

	});

	return html;
}

function reFillCmbCapesUsr(type, businessIdCapa){
	var html = "";
	$.each( controlCapes._layers, function(i,val) {
		var layer = val.layer.options;
		if(layer.tipus==t_tematic && layer.geometryType==type ){
	        html += "<option value=\"";
	        html += layer.businessId +"#"+val.layer._leaflet_id+"\"";
	        if(businessIdCapa == layer.businessId) html += " selected";
	        html += ">"+ layer.nom + "</option>";            		
		}else if(layer.tipus==t_visualitzacio && layer.geometryType==type ){
	        html += "<option value=\"";
	        html += layer.businessId +"#"+val.layer._leaflet_id+"\"";
	        if(businessIdCapa == layer.businessId) html += " selected";
	        html += ">"+ layer.nom + "</option>";            		
		}
	});		
	return html;
}


function objecteUserAdded(f){
	
	var fId = this.toGeoJSON().features.length;
	
	var feature = f.layer.toGeoJSON();
	
	
	var crearNovaCapa=false;
	
	if(capaUsrActiva != null && capaUsrActiva.options.geometryType != f.layer.options.tipus){
		crearNovaCapa=true;
	}
	else if (capaUsrActiva !=null && capaUsrActiva.options.businessId==-1){
		crearNovaCapa=true;
	}
	else if(capaUsrActiva == null){
		crearNovaCapa=true;
	}


	feature.properties.data = f.layer.properties.data;    	

	var features = JSON.stringify(feature);

	var rangsJSON = getFeatureStyle(f,fId);
	var rangs = JSON.stringify(rangsJSON);
	
	if (crearNovaCapa) {
		
		var _this = this;
		
	
		var opts = "text,nom,";
		if  (f.layer.options.tipus==t_marker){
			opts += "latitud,longitud,etrs89_x,etrs89_y";
		}
		else if (f.layer.options.tipus==t_polyline){
			opts += "longitud (km)";
		}
		else if (f.layer.options.tipus==t_polygon){
			opts += "area (ha)";
		}
		var optionsStr =  "{\"propName\":\""+opts+"\"}";
		/*NOU MODEL: Crear nova visualització*/
		var data ={
				uid: Cookies.get('uid'),
				nom: f.layer.properties.capaNom,
				mapBusinessId: url('?businessid'),
				geometryType: f.layer.options.tipus,
				activas: true,
				visibilitats: true,				
				publica : true,
				options: optionsStr
		};		
		
		createVisualitzacioLayer(data).then(function(results) {
			
			if(results.status === 'OK'){
				
				_this.options.businessId = results.results.businessId;
				f.layer.properties.capaBusinessId = results.results.businessId;
				//Ara afegim nova geometria
				var features = {
						type:f.layer.options.tipus,
						id:fId,
						properties: feature.properties.data,
						estil: rangsJSON,
						geometry: feature.geometry
					};
				
				features = JSON.stringify(features);				
				
				
		
				
				data = {
						businessId: f.layer.properties.capaBusinessId,//Bid de la visualitzacio
						uid: Cookies.get('uid'),
						features: features,
						geometryType: f.layer.options.tipus,
						options: opts
//							geometriaBusinessId: '4c216bc1cdd8b3a69440b45b2713b014'//Bid de la geometria q estas afegint						
				};
				
				addGeometriaToVisualitzacio(data).then(function(results) {
					if(results.status === 'OK'){
					
//							_this.options.businessId = results.results.businessId;
//							f.layer.properties.capaBusinessId = results.results.businessId;
						f.layer.properties.businessId = results.feature.businessId;
						f.layer.properties.estil = results.results.estil[0];
						f.layer.properties.feature = results.feature;	
						finishAddFeatureToTematic(f.layer);			
					
						
					}else{
						console.debug('addGeometriaToVisualitzacio ERROR');
					}
				},function(results){
					console.debug('addGeometriaToVisualitzacio ERROR');
				});
				
			}else{//ERROR: control Error
				console.debug('createVisualitzacioLayer ERROR');
			}
		},function(results){//ERROR: control Error
			console.debug('createVisualitzacioLayer ERROR');
		});			

	} else  {
	
		var businessIdCapa="";
		var leafletIdCapa=capaUsrActiva._leaflet_id;
		if (capaUsrActiva!=null && businessIdCapa==""){
			businessIdCapa=capaUsrActiva.options.businessId;
		}
		else if (businessIdCapa==""){
			businessIdCapa = this.options.businessId;
		} 
		f.layer.properties.capaBusinessId=businessIdCapa;
		var features = {
				type:f.layer.options.tipus,
				id:fId,
				properties: feature.properties.data,
				estil: rangsJSON,
				geometry: feature.geometry
			};
		features = JSON.stringify(features);				
		
		data = {
				businessId: businessIdCapa,//f.layer.properties.capaBusinessId,//Bid de la visualitzacio
				uid: Cookies.get('uid'),
				features: features
//					geometriaBusinessId: '4c216bc1cdd8b3a69440b45b2713b014'//Bid de la geometria q estas afegint						
		};		
		var businessIdCapaOrigen = data.businessId;
		
		addGeometriaToVisualitzacio(data).then(function(results) {
			if(results.status === 'OK'){
				
//					_this.options.businessId = results.results.businessId;
//					f.layer.properties.capaBusinessId = results.results.businessId;
				f.layer.properties.businessId = results.feature.businessId;
				f.layer.properties.estil = results.results.estil[0];
				f.layer.properties.feature = results.feature;
				var layerServidor=results.servidor;
				findLayerByBusinessId(businessIdCapaOrigen).then(function(layerAct){
					capaUsrActiva = layerAct;
					finishAddFeatureToTematic(f.layer).then(function(){
						reloadSingleLayer(controlCapes._layers[capaUsrActiva._leaflet_id], layerServidor);
					})
			
				});
				

			
			}else{
				console.debug('addGeometriaToVisualitzacio ERROR');
			}
		},function(results){
			console.debug('addGeometriaToVisualitzacio ERROR');
		});			
	}
}

function getFeatureStyle(f, fId){
	var rangs = {};
	//ESTIL MARKER
	if(f.layer.options.tipus == t_marker){
		if (!f.layer._ctx && f.layer.options.icon!= undefined){
			rangs = {
				color : f.layer.options.icon.options.fillColor,//Color principal
				marker: f.layer.options.icon.options.markerColor,//Si es de tipus punt_r o el color del marker
				simbolColor: f.layer.options.icon.options.iconColor,//Glyphon
				radius : f.layer.options.icon.options.radius,//Radius
				iconSize : f.layer.options.icon.options.iconSize.x+"#"+f.layer.options.icon.options.iconSize.y,//Size del cercle
				iconAnchor : f.layer.options.icon.options.iconAnchor.x+"#"+f.layer.options.icon.options.iconAnchor.y,//Anchor del cercle
				simbol : jQuery.trim(f.layer.options.icon.options.icon),//tipus glyph
				simbolSize : f.layer.options.icon.options.simbolSize,//mida glyphon
//				puntTMP.options.symbolSize = style.symbolSize;//mida glyphon
				opacity : (f.layer.options.opacity * 100),
				label : false,
				labelSize : 10,
				labelFont : 'arial',
				labelColor : '#000000',
			};
		}else{
			rangs = {
				color : f.layer.options.fillColor,
				simbolSize : f.layer.options.radius,
				opacity : (f.layer.options.fillOpacity * 100),
				label : false,
				labelSize : 10,
				labelFont : 'arial',
				labelColor : '#000000',
				borderWidth : f.layer.options.weight,
				borderColor : f.layer.options.color,
			};
		}
	//ESTIL LINE
	}else if(f.layer.options.tipus == t_polyline){
		rangs = {
			color : f.layer.options.color,
			lineWidth : f.layer.options.weight,
			lineStyle : 'solid',
			borderWidth : 2,
			borderColor : f.layer.options.color,
			opacity : (f.layer.options.opacity * 100),
			label : false,
			labelSize : 10,
			labelFont : 'arial',
			labelColor : '#000000',
		};	
	//ESTIL POLIGON		
	}else{
		var fillColor = f.layer.options.color;
		if(f.layer.options.fillColor) fillColor = rgb2hex(f.layer.options.fillColor);	
		var fillOpacity = f.layer.options.fillOpacity;
		rangs = {
				color : fillColor,
				fillColor: fillColor,
				fillOpacity: fillOpacity,
				lineWidth : f.layer.options.dashArray,
				lineStyle : 'solid',
				borderWidth : f.layer.options.dashArray,
				borderColor : f.layer.options.color,
				opacity : (f.layer.options.fillOpacity * 100),
				label : false,
				labelSize : 10,
				labelFont : 'arial',
				labelColor : '#000000'
			};				
	}
	return rangs;
}


function getFeatureStyle2(estil,tipus){
	var rangs = {};
	//ESTIL MARKER
	if( tipus == t_marker){
		if (estil.icon!= undefined){
			rangs = {
				color : estil.icon.options.fillColor,//Color principal
				marker:estil.icon.options.markerColor,//Si es de tipus punt_r o el color del marker
				simbolColor:estil.icon.options.iconColor,//Glyphon
				radius :estil.icon.options.radius,//Radius
				iconSize :estil.icon.options.iconSize.x+"#"+estil.icon.options.iconSize.y,//Size del cercle
				iconAnchor :estil.icon.options.iconAnchor.x+"#"+estil.icon.options.iconAnchor.y,//Anchor del cercle
				simbol : jQuery.trim(estil.icon.options.icon),//tipus glyph
				simbolSize : estil.icon.options.simbolSize,//mida glyphon
//				puntTMP.options.symbolSize = style.symbolSize;//mida glyphon
				opacity : (estil.opacity * 100),
				label : false,
				labelSize : 10,
				labelFont : 'arial',
				labelColor : '#000000',
				businessId: estil.businessId
			};
		}else{
			rangs = {
				color : estil.fillColor,
				simbolSize : estil.radius,
				opacity : (estil.fillOpacity * 100),
				label : false,
				labelSize : 10,
				labelFont : 'arial',
				labelColor : '#000000',
				borderWidth : estil.weight,
				borderColor : estil.color,
				businessId: estil.businessId
			};
		}
	//ESTIL LINE
	}else if(tipus == t_polyline){
		rangs = {
			color : estil.color,
			lineWidth : estil.weight,
			lineStyle : 'solid',
			borderWidth : 2,
			borderColor : estil.color,
			opacity : (estil.opacity * 100),
			label : false,
			labelSize : 10,
			labelFont : 'arial',
			labelColor : '#000000',
			businessId: estil.businessId
		};	
	//ESTIL POLIGON		
	}else{
		var fillColor = estil.color;
		if(estil.fillColor) fillColor = rgb2hex(estil.fillColor);	
		var fillOpacity = estil.fillOpacity;
		rangs = {
				color : fillColor,
				fillColor: fillColor,
				fillOpacity: fillOpacity,
				lineWidth : estil.dashArray,
				lineStyle : 'solid',
				borderWidth : estil.dashArray,
				borderColor : estil.color,
				opacity : (estil.fillOpacity * 100),
				label : false,
				labelSize : 10,
				labelFont : 'arial',
				labelColor : '#000000',
				businessId: estil.businessId
			};				
	}
	return rangs;
}

function finishAddFeatureToTematic(layer){
	var defer = $.Deferred();
	var type = layer.options.tipus;
	//Afegir capa edicio a control de capes en cas que sigui nova
	if (capaUsrActiva.toGeoJSON().features.length == 1 ) {
		//Actualitzem zIndex abans d'afegir al control de capes
		capaUsrActiva.options.zIndex = controlCapes._lastZIndex+1; 								
		controlCapes.addOverlay(capaUsrActiva,	capaUsrActiva.options.nom, true);
		controlCapes._lastZIndex++;
		activaPanelCapes(true);
	}else{
			//Actualitzem comptador de la capa
			updateFeatureCount(null, capaUsrActiva.options.businessId);
	}
		
	var html = createPopupWindow(layer,type, true);
	layer.properties.feature.properties.popupData = html;
	layer.properties.feature.properties.capaNom = capaUsrActiva.options.nom;
	layer.properties.popupData = html;
	layer.properties.capaNom = capaUsrActiva.options.nom;
	layer.properties.capaLeafletId = capaUsrActiva._leaflet_id;
	map.closePopup();
	if (layer.properties.tipusFeature=="polygon" || layer.properties.tipusFeature=="polyline"){
		PopupManager().createMergedDataPopup(layer, {latlng: layer._latlngs[0]}, controlCapes).then(function() {
			actualitzarComboCapes();				
		});
	}
	else {
		PopupManager().createMergedDataPopup(layer, {latlng: layer._latlng}, controlCapes).then(function() {
			actualitzarComboCapes();				
		});
	}
	return defer.promise();

}

function updateFeatureNameDescr(layer, titol, descr){
	
	layer.properties.data.nom=titol;
	layer.properties.data.text=descr;
	
//	//VELL!!
//	if(!nou_model){
//		if (layer.properties.feature.properties){
//			layer.properties.feature.properties.nom = titol;
//			layer.properties.feature.properties.text = descr;
//		}
//			
//		var feature = layer.toGeoJSON();
//		feature.geometry = layer.properties.feature.geometry;
//		//CAL???
//		if (layer.properties.feature.properties){	
//			feature.properties = layer.properties.feature.properties;
//		}else{
//			//Obsolet a nou model
//			feature.properties = layer.properties;
//			//
//		}		
//	}

	var features = {
			type: layer.properties.tipusFeature,
			id:3124,
			businessId: layer.properties.businessId,//Bid de la geometria q estas afegint
			properties: layer.properties.data,
			estil: layer.properties.estil,
			geometry: layer.properties.feature.geometry
		};
	
	features = JSON.stringify(features);
	
    var data = {
            uid : Cookies.get('uid'),
            features : features,
            businessId: layer.properties.businessId
        };      	
	
    
    updateGeometria(data).then(function(results){
	    if(results.status == 'OK'){
	    	//recarrego les sublayers de la capa modificada
			var html = createPopupWindow(layer, "marker", true);
			layer.properties.feature.properties.popupData = html;
			layer.properties.popupData = html;
			var capaEdicio = controlCapes._layers[layer.properties.capaLeafletId];
			actualitzacioTematic(capaEdicio,layer.properties.capaBusinessId,"3124",null,features,"modificacioInfo");
			jQuery('#titol_pres').text(titol).append(' <i class="glyphicon glyphicon-pencil gris-semifosc"></i>');
			var txt = descr;			
			if (!$.isNumeric(txt) && !validateWkt(txt)) {
				txt = parseUrlTextPopUp(txt,"");
				if(txt.indexOf("iframe")==-1 && txt.indexOf("img")==-1){
					jQuery('#des_pres').html('');
					jQuery('#des_pres').append('<span id="descrText" style="display:none;">'+descr+'</span>');
					jQuery('#des_pres').append(txt).append(' <i class="glyphicon glyphicon-pencil gris-semifosc"></i>');
				}else{
					jQuery('#des_pres').html('');
					jQuery('#des_pres').append('<span id="descrText" style="display:none;">'+descr+'</span>');
					jQuery('#des_pres').append(txt).append(' <i class="glyphicon glyphicon-pencil gris-semifosc"></i>');
				}
			}
			else {
				jQuery('#des_pres').html('');
				jQuery('#des_pres').append('<span id="descrText" style="display:none;">'+descr+'</span>');
				jQuery('#des_pres').text(txt).append(' <i class="glyphicon glyphicon-pencil gris-semifosc"></i>');
			}
			
			jQuery('.popup_pres').show();
			jQuery('.popup_edit').hide();  
						
			
	    }else{
	        console.debug("updateGeometria ERROR");
	    }
	}, function(results){
		  console.debug("updateGeometria ERROR");
	}); 		
        
}

function updateFeatureMove(featureID, capaEdicioID, capaEdicioLeafletId){
	
    var layer = map._layers[featureID];
    
    var feature = layer.toGeoJSON();
    
    feature.geometry = layer.properties.feature.geometry;      
        
    if(layer.properties.tipusFeature == t_marker){
        var newLatLng = layer.getLatLng();
        feature.geometry.coordinates[1] = newLatLng.lat;
        feature.geometry.coordinates[0] = newLatLng.lng;           
    }else{
	    var lcoordinates = [];
	    $.each(layer._latlngs, function(i,val) {
	    	lcoordinates.push([val.lng, val.lat]);
	    });              
	    if(layer.properties.tipusFeature == t_polyline){
	    	feature.geometry.coordinates = lcoordinates;
	    	layer.properties.mida = calculateDistance(layer.getLatLngs());
	    }else{
	    	lcoordinates.push(lcoordinates[0]);
	    	feature.geometry.coordinates[0] = lcoordinates;
	    	layer.properties.mida = calculateArea(layer);
	    }
    }
	
	var features = {
			type: layer.properties.tipusFeature,
			id:3124,
			businessId: layer.properties.businessId,//Bid de la geometria q estas afegint
			properties: layer.properties.data,
			estil: layer.properties.estil,
			geometry: feature.geometry
		};
	features = JSON.stringify(features);
	
    var data = {
            uid : Cookies.get('uid'),
            features : features,
            businessId: layer.properties.businessId
        };      	
	
    updateGeometria(data).then(function(results){
	    if(results.status == 'OK'){
	    	if (layer.properties.tipusFeature=="marker" && layer.properties.data.nom &&  layer.properties.data.text) {

	    		var html = createPopupWindow(layer, "marker", true);
				layer.properties.feature.properties.popupData = html;
				layer.properties.popupData = html;

	    	}

	    	jQuery('.popup_pres').show();
	    	//Actualitzem visualitzacions de la capa on estava la geometria modificada
	    	var capaEdicio = controlCapes._layers[capaEdicioLeafletId];
	    	//recarrego les sublayers de la capa modificada	
	    	actualitzacioTematic(capaEdicio,layer.properties.capaBusinessId,null,null,null,"baixa");
			/*jQuery.each(capaEdicio._layers, function(i, sublayer){
            	if(jQuery.type(sublayer.layer.options)== "string"){
					sublayer.layer.options = $.parseJSON(sublayer.layer.options);
				}	            	  
				//Sublayer visualitzacio, carrego la capa
				if(sublayer.layer.options.tipus.indexOf(t_visualitzacio)!=-1){
            		  
            		  sublayer.layer.serverName = sublayer.layer.options.nom;
            		  sublayer.layer.serverType = sublayer.layer.options.tipus;
            		  sublayer.layer.capesActiva = "true";
            		  sublayer.layer.options.origen = layer.properties.capaBusinessId;//BusinessIdCapaorigen
            		  //tipusRang
            		  sublayer.layer.businessId = sublayer.layer.options.businessId;//Si no, no ho trobarà després
            		  sublayer.layer.options = JSON.stringify(sublayer.layer.options);
            		  loadVisualitzacioLayer(sublayer.layer).then(function(results){
            			//console.debug("LoadVisualitzacio despres de update Geometria"); 
						map.closePopup();
						map.removeLayer(sublayer.layer);
						//Eliminem la capa de controlCapes
						controlCapes.removeLayer(sublayer);
            		  });
            	  }
            	
              });*/
	    
	    	
	    }else{
	        console.debug("updateFeature ERROR");
	    }
	}, function(results){
		  console.debug("updateFeature ERROR");
	});      	
  
    //Retornem la geometria a la seva capa original
    capaUsrActiva.addLayer(layer);
    capaUsrActiva.on('layeradd',objecteUserAdded);//Deixem activat event layeradd, per la capa activa
    map._layers[capaEdicioID].removeLayer(layer);
    //Refresh de la capa
    controlCapes._map.removeLayer(capaUsrActiva);
	controlCapes._map.addLayer(capaUsrActiva);
	map.removeLayer(map._layers[capaEdicioID]);
    
    //Fi edicio
    objEdicio.esticEnEdicio=false;
}

function fillCmbCapesUsr(type,_leaflet_id){
	var html = "";
	var layers;
	if (undefined != controlCapes._layers) layers = controlCapes._layers;
	else if (undefined != controlCapes._visLayers) layers = controlCapes._visLayers;
	
	$.each( layers, function(i,val) {
		var layer = val;
		if (undefined != val.layer) layer = val.layer.options;
			
		var isVisualitzacio = (layer.tipus==t_visualitzacio || layer.tipus==tem_origen || layer.tipus==tem_simple || layer.tipus==tem_clasic ||
							layer.tipus==tem_heatmap || layer.tipus==tem_cluster);
			
		if(layer.tipus==t_tematic && layer.geometryType==type ){
	        html += "<option value=\"";
	        html += layer.businessId +"#"+_leaflet_id+"\"";
	        if(capaUsrActiva && (capaUsrActiva.options.businessId == layer.businessId)) html += " selected";
	        html += ">"+ layer.nom + "</option>";
	    //nou model    
		}else if(isVisualitzacio && layer.geometryType==type /*&& !layer.source*/){
	        html += "<option value=\"";
	        html += layer.businessId +"#"+_leaflet_id+"\"";
	        if(capaUsrActiva && (capaUsrActiva.options.businessId == layer.businessId)) html += " selected";
	        html += ">"+ layer.nom + "</option>";
		}
	});		
	return html;
}

function createPopUpContent(player,type, editant, propFormat, propPrivacitat){
	var isEditing = (undefined == typeof editant ? true : editant);
	
	var auxNom = window.lang.translate('Nom');
	var auxText = window.lang.translate('Descripció');
	var auxLon,auxLat;
	var auxX,auxY;
	if(player.properties.data.nom) {
		auxNom = player.properties.data.nom;
		if (propFormat!=undefined && propFormat['nom']!=undefined){
			var formatValue =dataFormatter.formatValue(auxNom, propFormat['nom']);
			if (formatValue.indexOf("error")>-1) auxNom=formatValue;
			//auxNom= dataFormatter.formatValue(auxNom, propFormat['nom']);
		}		
	}
	if(player.properties.data.text) {
		auxText = player.properties.data.text;
		if (propFormat!=undefined && propFormat['text']!=undefined){
			var formatValue =dataFormatter.formatValue(auxText, propFormat['text']);
			if (formatValue.indexOf("error")>-1) auxText=formatValue;
			//auxText= dataFormatter.formatValue(auxText, propFormat['text']);
		}
	}
	if (player.options.tipus=="marker" && player._latlng) {
		auxLat = player._latlng.lat;
		auxLat= auxLat.toFixed(5);
		auxLon = player._latlng.lng;
		auxLon= auxLon.toFixed(5);
		var etrs = latLngtoETRS89(player._latlng.lat, player._latlng.lng);
		auxX = etrs.x;
	    auxY = etrs.y;
	}
	var html='<div class="div_popup">' 
	+'<div class="popup_pres">'							
	+'<div id="titol_pres">'+auxNom+' <i class="glyphicon glyphicon-pencil gris-semifosc"></i></div>'	
	+'<div id="des_pres">'+auxText+' <i class="glyphicon glyphicon-pencil gris-semifosc"></i></div>';
	
	if (player.options.tipus=="marker" && auxLat!=undefined && auxLon!=undefined) {
		html+='<div id="coordsBox">';
		if (auxX!=undefined && auxY!=undefined){
			html+='ETRS89 UTM 31N: '+auxX+','+auxY;
		}
		html +='<br/>WGS84: '+ auxLon+','+auxLat;
		
		html += '</div>';
	}

	
	if(type == t_polyline && player.properties.mida){
		html+='<div id="mida_pres"><b>'+window.lang.translate('Longitud')+':</b> '+player.properties.mida+'</div>';	
	}else if(type == t_polygon && player.properties.mida){
		if (player.properties.mida.indexOf("NaN")==-1)	html+='<div id="mida_pres"><b>'+window.lang.translate('Àrea')+':</b> '+player.properties.mida+'</div>';
		else html+='<div id="mida_pres"><b>'+window.lang.translate('Àrea')+':</b> '+L.GeometryUtil.readableArea(L.GeometryUtil.geodesicArea(player.getLatLngs()),true)+'</div>';
	}
	
	//+'<div id="capa_pres">'
	html+='<ul class="bs-ncapa">'
		+'<li><span lang="ca" class="small">'+window.lang.translate('Capa actual:')+'</span>'
			+'<select id="cmbCapesUsr-'+player._leaflet_id+'-'+type+'-'+player.properties.capaLeafletId+'" data-leaflet_id='+player._leaflet_id+'>';
			html+= fillCmbCapesUsr(type,player._leaflet_id);
			html+= '</select></li>'
		//+'<li><a id="layer_edit#'+player._leaflet_id+'#'+type+'" lang="ca" title="Canviar el nom de la capa" href="#"><span class="glyphicon glyphicon-pencil blau12"></span></a></li>'
	+'<li><a id="layer_add#'+player._leaflet_id+'#'+type+'" lang="ca" title="Crear una nova capa" href="#"><span class="glyphicon glyphicon-plus gris-semifosc"></span></a></li>'
	+'</ul>'	
	//'</div>'
	if(isEditing)
	{

		html += '<div id="footer_edit"  class="modal-footer">'
		+'<ul class="bs-popup">'						
		+'<li class="edicio-popup"><a id="feature_edit##'+player._leaflet_id+'##'+type+'" lang="ca" href="#"><span class="geostart-palette gris-semifosc font18" data-toggle="tooltip" data-placement="bottom" title="'+window.lang.translate('Estils')+'"></span></a>   </li>';
		if(type == t_polyline || type == t_polygon){
			html+='<li class="edicio-popup"><a id="feature_move##'+player._leaflet_id+'##'+type+'" lang="ca" href="#"><span class="glyphicon glyphicon-pencil gris-semifosc" data-toggle="tooltip" data-placement="bottom" title="'+window.lang.translate('Editar')+'"></span></a>   </li>';
		}	
		else {
			html+='<li class="edicio-popup"><a id="feature_move##'+player._leaflet_id+'##'+type+'" lang="ca" href="#"><span class="glyphicon glyphicon-move gris-semifosc" data-toggle="tooltip" data-placement="bottom" title="'+window.lang.translate('Moure')+'"></span></a>   </li>';
		}
		html+='<li class="edicio-popup"><a id="feature_remove##'+player._leaflet_id+'##'+type+'" lang="ca" href="#"><span class="glyphicon glyphicon-trash gris-semifosc" data-toggle="tooltip" data-placement="bottom" title="'+window.lang.translate('Esborrar')+'"></span></a>   </li>';
	
		if (player.properties.estil) {
			html+='<li class="edicio-popup" id="feature_data_table_'+player._leaflet_id+'"><a id="feature_data_table##'+player._leaflet_id+'##'+type+'##'+player.properties.capaLeafletId+'##" lang="ca" href="#"><span class="glyphicon glyphicon-list-alt gris-semifosc" data-toggle="tooltip" data-placement="bottom" title="'+window.lang.translate('Dades')+'"></span></a>   </li>';					
		}
		else {
			html+='<li class="edicio-popup"><span class="glyphicon glyphicon-list-alt gris-semifosc" data-toggle="tooltip" data-placement="bottom" title="'+window.lang.translate('Dades')+'"></span>  </li>';					
		}
	
		html+='<li class="edicio-popup"><a class="faqs_link" href="http://betaportal.icgc.cat/wordpress/faq-dinstamaps/#finestrapunt" target="_blank"><span class="fa fa-question-circle-o gris-semifosc font21"></span></a></span></li>';
		html+='</ul>'														
		+'</div>'

	}
	
	html += '</div>'	
	+'<div class="popup_edit">'
	+'<div style="display:block" id="feature_txt">'
	+'<input class="form-control" id="titol_edit" type="text" value="'+auxNom+'" placeholder="">'
	+'<textarea id="des_edit" class="form-control" rows="2">'+auxText+'</textarea>'
	+'</div>'	
	+'<div  style="display:block" id="capa_txt">'
	+'<div id="layer_accio"></div>'
	+'<input class="form-control" id="capa_edit" type="text" value="'+player.properties.capaGrup+'" placeholder="">'
	+'</div>'
	+'<div class="modal-footer">'
	+'<ul class="bs-popup">'
	+'<li><a id="feature_no##'+player._leaflet_id+'##'+type+'"  class="btn btn-default btn-xs">'+window.lang.translate('Cancel·lar')+'</a></li>'			
	+'<li><a id="feature_ok##'+player._leaflet_id+'##'+type+'"  class="btn btn-success btn-xs">'+window.lang.translate('Acceptar')+'</a></li>'								
	+'</ul>'														
	+'</div>'								
	+'</div>'								
	+'</div>';
	return html;
}

function generaNovaCapaUsuari(feature,nomNovaCapa,leafletID){
	var opts = "text,nom,";
	if  (feature.properties.tipusFeature==t_marker){
		opts += "latitud,longitud,etrs89_x,etrs89_y";
	}
	else if (f.layer.options.tipus==t_polyline){
		opts += "longitud (km)";
	}
	else if (f.layer.options.tipus==t_polygon){
		opts += "area (ha)";
	}
	var optionsStr =  "{\"propName\":\""+opts+"\"}";
	/*NOU MODEL: Crear nova visualització*/
	var data ={
			uid: Cookies.get('uid'),
			nom: nomNovaCapa,
			mapBusinessId: url('?businessid'),
			geometryType: feature.properties.tipusFeature,
//				tipus : tem_origen,//no cal, per defecte li posa origen a servidor
//				calentas: false,
//				order: controlCapes._lastZIndex+1,
			activas: true,
			visibilitats: true,				
			publica : true,
			options: optionsStr
	};		
	
	createVisualitzacioLayer(data).then(function(results){
//			
		if(results.status === 'OK'){
			
			capaUsrActiva2= new L.FeatureGroup();
			capaUsrActiva2.options = {
				businessId : results.results.businessId,
				nom : nomNovaCapa,
//				tipus: t_tematic,
				tipus: t_visualitzacio,
				geometryType : feature.properties.tipusFeature
//					zIndex : controlCapes._lastZIndex//+1		
			};
			//Afegim nova capa al combo
			jQuery('#cmbCapesUsr-'+feature._leaflet_id+'-'+feature.properties.tipusFeature+'').append("<option selected value=\""+results.results.businessId+"\">"+nomNovaCapa+"</option>");	
			jQuery('.popup_pres').show();
			jQuery('.popup_edit').hide();
			
			map.addLayer(capaUsrActiva2);
			capaUsrActiva2.options.zIndex = controlCapes._lastZIndex+1;
			controlCapes.addOverlay(capaUsrActiva2,	capaUsrActiva2.options.nom, true);
			controlCapes._lastZIndex++;
			activaPanelCapes(true);		
				
			var features = {
					type: feature.properties.tipusFeature,
					id:3124,
					businessId: feature.properties.businessId,//Bid de la geometria q estas afegint
					properties: feature.properties.data,
					estil: feature.properties.estil,
					geometry: feature.properties.feature.geometry
				};
			
			features = JSON.stringify(features);
			
			data= {
				toBusinessId: results.results.businessId,//'4c216bc1cdd8b3a69440b45b2713b000',//bID de la visualitzacio-capa
				fromBusinessId: feature.properties.capaBusinessId,//'4c216bc1cdd8b3a69440b45b2713b001',//bID de la visualitzacio-capa
				uid: Cookies.get('uid'),
				features: features
			}	
			
			moveGeometriaToVisualitzacio(data).then(function(resultsMove) {
				console.debug("moveGeometriaToVisualitzacio:"+ resultsMove.status);
				if(resultsMove.status === 'OK'){
					reloadSingleLayer(controlCapes._layers[leafletID], resultsMove.layerFrom);
					reloadSingleLayer(controlCapes._layers[capaUsrActiva2._leaflet_id], resultsMove.layerTo);
					capaUsrActiva=capaUsrActiva2;
				}else{
					console.debug("moveGeometriaToVisualitzacio ERROR");
				}
			},function(results){
				console.debug("moveGeometriaToVisualitzacio ERROR");
			});
			
		}else{
			console.debug("createVisualitzacioLayer ERROR");
		}
	});		

}

function moveFeatureToLayer(feature_businessId,layer_fromBusinessId,layer_toBusinessId){

	/*NOU MODEL*/
	var features = {
			type: feature.options.tipus,
			id:3124,
			businessId: feature.properties.businessId,//Bid de la geometria q estas afegint
			properties: feature.properties.feature.properties,
			estil: feature.properties.estil,
			geometry: feature.properties.feature.geometry
		};
	
	features = JSON.stringify(features);
	
	data= {
		toBusinessId: results.results.businessId,//'4c216bc1cdd8b3a69440b45b2713b000',//bID de la visualitzacio-capa
		fromBusinessId: feature.properties.capaBusinessId,//'4c216bc1cdd8b3a69440b45b2713b001',//bID de la visualitzacio-capa
		uid: Cookies.get('uid'),
		features: features
	}	
	
	moveGeometriaToVisualitzacio(data).then(function(resultsMove) {
		console.debug("moveGeometriaToVisualitzacio:"+ resultsMove.status);
		if(resultsMove.status === 'OK'){
			
			if(capaUsrActiva) capaUsrActiva.removeLayer(feature);
			capaUsrActiva2.addLayer(feature);//.on('layeradd', objecteUserAdded);
			//feature.openPopup();
			//Actualitzem capa activa
			if(capaUsrActiva) capaUsrActiva.removeEventListener('layeradd');
			capaUsrActiva = capaUsrActiva2;//map._layers[capaUsrActiva2._leaflet_id];;
			capaUsrActiva.on('layeradd',objecteUserAdded);	
			//Actualitzem properties de la layer
			feature.properties.capaBusinessId = capaUsrActiva.options.businessId;
			feature.properties.capaNom = capaUsrActiva.options.nom;	
			feature.properties.capaLeafletId = capaUsrActiva._leaflet_id;
			//Actualitzem popup del marker
//			var html = createPopUpContent(feature,feature.options.tipus);
			//feature.setPopupContent(html);
			map.closePopup();
			if (layer.properties.tipusFeature=="polygon" || layer.properties.tipusFeature=="polyline"){
				PopupManager().createMergedDataPopup(feature, {latlng: feature._latlngs[0]}, controlCapes).then(function() {
					actualitzarComboCapes();				
				});
			}
			else {
				PopupManager().createMergedDataPopup(feature, {latlng: feature._latlng}, controlCapes).then(function() {
					actualitzarComboCapes();				
				});
			}
			
			//update rangs
		    //getRangsFromLayer(capaUsrActiva);
		    
			var capaEdicio = controlCapes._layers[capaUsrActiva._leaflet_id];
			//recarrego les sublayers de la capa modificada	
			actualitzacioTematic(capaEdicio,layer.properties.capaBusinessId,"3124",feature,features,"modificacio");
			
			//Actualitzem comptador de la capa
		    updateFeatureCount(data.fromBusinessId, data.toBusinessId);					
			
		}else{
			console.debug("moveGeometriaToVisualitzacio ERROR");
		}
	},function(results){
		console.debug("moveGeometriaToVisualitzacio ERROR");
	});		

}

function modeLayerTextEdit(){
	jQuery('#capa_txt').show();
	jQuery('#feature_txt').hide();
	jQuery('.popup_pres').hide();
	jQuery('.popup_edit').show();	
}

function modeEditText(){
	objEdicio.edicioPopup='textFeature';
	jQuery('#capa_txt').hide();
	jQuery('#feature_txt').show();
	var txtTitol=jQuery('#titol_pres').text();
	var txtDesc=jQuery('#descrText').html();
	jQuery('#titol_edit').val(txtTitol);	
	jQuery('#des_edit').text(txtDesc);
	jQuery('.popup_pres').hide();
	jQuery('.popup_edit').show();	
}

/*funcio que actualitza l'estil seleccionat al dialeg d'estils, 
 * amb el de la feature que es col editar 
 * */
function updateDialogStyleSelected(icon){
  
	if(icon.tipus == t_polyline){
		
		canvas_linia.lineWidth = icon.weight;
		canvas_linia.strokeStyle = icon.color;
		
		$("#cmb_gruix_l option[value='"+icon.weight+"']").prop("selected", "selected");
		$('.border_color_linia').css('background-color',icon.color);
		addGeometryInitL(document.getElementById("cv_linia0"));			
		
	}else if(icon.tipus == t_polygon){
		
		canvas_pol.strokeStyle = icon.color;
		canvas_pol.opacity = icon.fillOpacity;
		canvas_pol.fillStyle = icon.fillColor; //rgb2hex(icon.fillColor);
		canvas_pol.lineWidth = icon.weight;
		
		$('.border_color_pol').css('border-color',icon.color);
		$('.fill_color_pol').css('color',icon.fillColor);
		$('.fill_color_pol').css('background-color',icon.fillColor);
		$("#cmb_gruix option[value='"+icon.weight+"']").prop("selected", "selected");
		$("#cmb_trans option[value='"+icon.fillOpacity+"']").prop("selected", "selected");
		
	    addGeometryInitP(document.getElementById("cv_pol0"));
	    
	}else{//es t_marker
		
		//Deselecciono estil al modal 
		jQuery("#div_puntM").removeClass("estil_selected");
		jQuery("#div_puntZ").removeClass("estil_selected");
		jQuery(".bs-glyphicons li").removeClass("estil_selected");		
		
		
		if(icon.isCanvas){//Si es un punt
			
			var midaPunt = getMidaFromRadius(icon.radius);
			
			estilP.iconFons = 'awesome-marker-web awesome-marker-icon-punt_r';
			estilP.iconGlif = 'fa fa-'+icon.icon;
			estilP.colorGlif = icon.iconColor;
			estilP.divColor = icon.fillColor;
			estilP.width = midaPunt+'px';
			estilP.height = midaPunt+'px';

			
			
			
			
			jQuery("#div_puntZ").addClass("estil_selected");
			jQuery("#div_punt9").css("background-color",icon.fillColor);
			$('#cmb_mida_Punt option[value="'+midaPunt+'"]').prop("selected", "selected");
			jQuery("#dv_fill_color_punt").css("background-color",icon.fillColor);
			jQuery("#dv_fill_color_icon").css("background-color",icon.iconColor);
//			
		}else if(icon.markerColor.indexOf("punt_r")!=-1){
			
			var licon = icon.icon.split(" ");
			midaPunt = getMidaFromFont(licon[1]);
			
			estilP.iconFons = 'awesome-marker-web awesome-marker-icon-punt_r';
			estilP.iconGlif = 'fa fa-'+icon.icon;
			estilP.colorGlif =icon.iconColor;
			estilP.fontsize = licon[1];	
			estilP.width = midaPunt+'px';
			estilP.height = midaPunt+'px';
			estilP.divColor = icon.divColor;
			
		
			jQuery("#div_puntZ").addClass("estil_selected");
			jQuery("#div_punt9").css("background-color",icon.divColor);
			$('#cmb_mida_Punt option[value="'+midaPunt+'"]').prop("selected", "selected");
			
			jQuery("#dv_fill_color_punt").css("background-color",icon.divColor);
			jQuery("#dv_fill_color_icon").css("background-color",icon.iconColor);				
			
			jQuery(".bs-glyphicons li .fa-"+licon[0]).parent('li').addClass("estil_selected");
			jQuery("#dv_fill_color_icon").css("background-color",estilP.colorGlif);	
			jQuery('.bs-glyphicons li').css('color',estilP.colorGlif);
			if(estilP.colorGlif=="#FFFFFF"){
				jQuery('.bs-glyphicons li').css('background-color','#aaaaaa');	
			}else{
				jQuery('.bs-glyphicons li').css('background-color','#FFFFFF');	
			}			
			
			
		}else{//Si es marker
			
			
			
			estilP.iconFons = icon.className+'-web awesome-marker-icon-'+icon.markerColor;
			estilP.iconGlif = 'fa fa-'+icon.icon;
			estilP.colorGlif = icon.iconColor;
			estilP.fontsize = '14px';
			estilP.divColor = 'transparent';
			estilP.width = '28px';
			estilP.height = '42px';
			
			
			
			jQuery("#div_puntM").addClass("estil_selected");
			jQuery("#dv_fill_color_marker").css("background-color",getColorFromClass(icon.markerColor));
			jQuery('#div_punt_1').removeClass().addClass('awesome-marker-web awesome-marker-icon-'+icon.markerColor);
			
			jQuery(".bs-glyphicons li .fa-"+icon.icon).parent('li').addClass("estil_selected");
			jQuery("#dv_fill_color_icon").css("background-color",estilP.colorGlif);
			jQuery('.bs-glyphicons li').css('color',estilP.colorGlif);
			if(estilP.colorGlif=="#FFFFFF"){
				jQuery('.bs-glyphicons li').css('background-color','#aaaaaa');	
			}else{
				jQuery('.bs-glyphicons li').css('background-color','#FFFFFF');	
			}			
		}
		
		jQuery('#div_punt0').removeClass();
		jQuery('#div_punt0').addClass(estilP.iconFons+" "+estilP.iconGlif);
		jQuery('#div_punt0').css('width',estilP.width);
		jQuery('#div_punt0').css('height',estilP.height);	
		jQuery('#div_punt0').css('font-size',estilP.fontsize);
		jQuery('#div_punt0').css('background-color',estilP.divColor);
		jQuery('#div_punt0').css('color',estilP.colorGlif);			
	}
}

function getColorFromClass(classe){
	switch (classe)
	{
		case 'orange':
		  return '#ffc500';
		case 'darkorangeb':
		  return '#ff7f0b';
		case 'red':
		  return '#ff4b3a';
		case 'purple':
		  return '#ae59b9';	
		case 'blue':
		  return '#00afb5';
		case 'green':
		  return '#7cbd00';
		case 'darkgray':
		  return '#90a6a9';
		case 'gray':
		  return '#ebf0f1';		  
		 default:
			 return '#ffc500';
	} 		
}

function updateFeatureCount(fromBusinessId, toBusinessId){
	
	//Actualitzem comptador de la capa
	if(fromBusinessId){
		var sFromCount = $("#count-"+fromBusinessId).html();
		if (sFromCount!=undefined){
			sFromCount = sFromCount.replace("(", " ");
			sFromCount = sFromCount.replace(")", " ");	
			var fromCount = parseInt(sFromCount.trim());
			fromCount=fromCount-1;
			$("#count-"+fromBusinessId).html(' ('+fromCount+')');
		}
	}

	if(toBusinessId){
		var sToCount = $("#count-"+toBusinessId).html();
		if (sToCount!=undefined){
			sToCount = sToCount.replace("(", " ");
			sToCount = sToCount.replace(")", " ");	
			var toCount = parseInt(sToCount.trim());
			toCount=toCount+1;
			$("#count-"+toBusinessId).html(' ('+toCount+')');		
		}
	}
//	console.debug("Fi updateFeatureCount");
}

function addDrawTooltips() {
	L.drawLocal = {
		draw : {
			handlers : {
				marker : {
					
					tooltip : {
						start : window.lang.translate('Fes clic al mapa per posar un punt')
					}
				},
				polygon : {
					tooltip : {
						start : window.lang.translate('Clica per començar a dibuixar una àrea'),
						cont : window.lang.translate('Clica per continuar dibuixant una àrea'),
						end : window.lang.translate('Clica el primer punt per tancar aquesta àrea')
					}
				},
				polyline : {
					error : '<strong>Error:</strong> àrees no es poden creuar!',
					
					tooltip : {
						start : window.lang.translate('Clica per començar a dibuixar una línia'),
						cont : window.lang.translate('Clica per continuar dibuixant una línia'),
						end : window.lang.translate('Clica el darrer punt per acabar la línia')
					}
				}
			}
		},
		edit : {
			handlers : {
				edit : {
					
					tooltip : {
						text : window.lang.translate("Arrossega els vèrtex o el punt per editar l'objecte")+"<br/>"+window.lang.translate('Ctrl+clic esborra vèrtex'),
						subtext : window.lang.translate('Fes clic sobre el mapa per finalitzar')
					}
				}
			}
		}
	};
	return L.drawLocal;
}

function addHtmlInterficieDraw(){
	jQuery("#funcio_draw").append(
		'<h5 lang="ca" id="funcio_draw_titol_1">Situar un punt</h5>'+
		'	<div class="add_costat_r" style="margin-right: 33%;">'+
		'	<div lang="ca" id="div_mes_punts" class="icon-add taronja" data-toggle="tooltip" data-lang-title="Més tipus de punts" title="Més tipus de punts"></div>'+
		'</div>'+
		'<div style="height:50px ">'+
		'	<div id="div_punt" class="dibuix_punt" data-toggle="tooltip" data-lang-title="Clica per situar un punt" title="Clica per situar un punt">'+
		'	</div>'+
		'</div>'+
		'<h5 lang="ca" id="funcio_draw_titol_2">Dibuixar una línia o un polígon</h5>'+
		'<div class="div_auto">'+
		'	<div id="div_linia" class="dibuix_linia" data-toggle="tooltip" data-lang-title="Clica per començar a dibuixar una línia" title="Clica per començar a dibuixar una línia">'+
		'	<canvas id="cv_linia" width="40" height="40"></canvas>'+
		'	</div>'+
		'	<div class="add_costat">'+
		'		<div lang="ca" id="div_mes_linies" class="icon-add taronja" data-toggle="tooltip" data-lang-title="Més estils de línia" title="Més estils de línia"></div>'+
		'	</div>'+
		'</div>'+
		'<div class="div_auto">'+
		'	<div id="div_area" class="dibuix_poligon" data-toggle="tooltip" data-lang-title="Clica per començar a dibuixar una àrea" title="Clica per començar a dibuixar una àrea">'+
		'	<canvas id="cv_pol" width="40" height="40"></canvas>'+
		'	</div>'+
		'	<div class="add_costat">'+
		'		<div lang="ca" id="div_mes_arees" class="icon-add taronja" data-toggle="tooltip" data-lang-title="Més estils d\'àrees" title="Més estils d\'àrees"></div>'+
		'	</div>'+
		'</div>'
	);
	
	$('#div_punt').tooltip({placement : 'bottom',container : 'body'});
	$('#div_linia').tooltip({placement : 'bottom',container : 'body'});
	$('#div_area').tooltip({placement : 'bottom',container : 'body'});	
	
	$('#div_mes_punts').tooltip({placement : 'right',container : 'body'});
	$('#div_mes_linies').tooltip({placement : 'right',container : 'body'});
	$('#div_mes_arees').tooltip({placement : 'right',container : 'body'});	
}

function activarSnapping(capaEdicio){
	if (capaEdicio.getLayers()[0].snapediting==undefined){
		//Activate snapping
		if (capaEdicio.getLayers()[0].properties.tipusFeature != undefined && capaEdicio.getLayers()[0].properties.tipusFeature=="marker"){
			try{
				capaEdicio.getLayers()[0].editing = new L.Handler.MarkerSnap(map, capaEdicio.getLayers()[0],{snapDistance:10});
				capaEdicio.getLayers()[0].snapediting = new L.Handler.MarkerSnap(map, capaEdicio.getLayers()[0],{snapDistance:10});
			}catch(exc){
				
			}
		}
		else{					
			capaEdicio.getLayers()[0].editing = new L.Handler.PolylineSnap(map, capaEdicio.getLayers()[0],{snapDistance:10});
			capaEdicio.getLayers()[0].snapediting = new L.Handler.PolylineSnap(map, capaEdicio.getLayers()[0],{snapDistance:10});
		}
	}
		for(var i = 0;i < guideLayers.length; i++) {
			 // Add every already drawn layer to snap list
			capaEdicio.getLayers()[0].snapediting.addGuideLayer(guideLayers[i]);
	        // Add the currently drawn layer to the snap list of the already drawn layers
			if ( guideLayers[i].snapediting!=undefined){
				guideLayers[i].snapediting.addGuideLayer(capaEdicio.getLayers()[0]);
				guideLayers[i].snapediting.enable();
				if (guideLayers[i].editing!=undefined) guideLayers[i].editing.disable();
				if (guideLayers[i].dragging!=undefined) guideLayers[i].dragging.enable(); 
			}
			else {
				if (guideLayers[i].properties.tipusFeature != undefined && guideLayers[i].properties.tipusFeature=="marker"){
					try{
						guideLayers[i].snapediting = new L.Handler.MarkerSnap(map, layer,{snapDistance:10});
					}catch(exc){
						
					}
				}
				else{
					guideLayers[i].snapediting = new L.Handler.PolylineSnap(map, capaEdicio.getLayers()[0],{snapDistance:10});
				}
				if (guideLayers[i].snapediting!=undefined) {
					guideLayers[i].snapediting.addGuideLayer(capaEdicio.getLayers()[0]);
					guideLayers[i].snapediting.enable();
				}
				if (guideLayers[i].editing!=undefined)  guideLayers[i].editing.disable();
				if (guideLayers[i].dragging!=undefined) guideLayers[i].dragging.enable(); 
			}
			if (capaEdicio.getLayers()[0].properties.tipusFeature != undefined && capaEdicio.getLayers()[0].properties.tipusFeature=="marker"){
				try{
					if (guideLayers[i].editing!=undefined)  guideLayers[i].editing.disable();
					if (guideLayers[i].dragging!=undefined) guideLayers[i].dragging.enable();
				}catch(exc){
					
				}
			}
		 }
		try{
			capaEdicio.getLayers()[0].snapediting.enable();
		}
		catch(exc){
			
		}
		// capaEdicio.getLayers()[0].editing.enable();
		  // Add to drawnItems
		 drawnItems.addLayer(capaEdicio.getLayers()[0]);
		 // Add newly drawn feature to list of snappable features
		guideLayers.push(capaEdicio.getLayers()[0]);
}

function actualitzarComboCapes(){
	$.each( controlCapes._layers, function(i,val) {//refresquem combo de totes les capes del mapa
		var layer2 = val.layer.options;
		html = reFillCmbCapesUsr(layer2.geometryType, layer2.businessId);
		
		 $.each( val.layer._layers, function(i2,val2) {
			 jQuery('#cmbCapesUsr-'+val2._leaflet_id+'-'+layer2.geometryType+'-'+val2.properties.capaLeafletId).html(html);
		 });
		 
	});
}

function findLayerByBusinessId(businessId,servidor){
	var defer = $.Deferred();
	$.each( controlCapes._layers, function(i,val) {//busquem capa per businessId
		var layer = val.layer;
		if (layer.options.businessId==businessId){			
			defer.resolve(layer);
		}		
	});	
	return defer.promise();
}
