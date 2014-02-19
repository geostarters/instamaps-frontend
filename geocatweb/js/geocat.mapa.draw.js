var drawControl;
var featureActive,crt_Editing,crt_Remove;
var defaultPunt;
var canvas_linia={"id":"cv_linia","strokeStyle":"#FFC500","lineWidth":"3","tipus":"linia"};
var canvas_pol={"id":"cv_pol","strokeStyle":"#FFC500","opacity":"0.5","fillStyle":"rgba(255, 197, 0,0.5)","lineWidth":"3","tipus":"pol"};
var canvas_obj_l,cv_ctx_l;
var canvas_obj_p,cv_ctx_p;
var objEdicio={'esticEnEdicio':false,'obroModalFrom':'creaCapa','featureID':null,'esticSobre':false,'edicioPopup':'textFeature'};
var opcionsSel={
	color: '#FF1EE5',
	"weight": 7,
	opacity: 0.6,
	dashArray: '1, 1',
	fill: true,
	fillColor: '#fe57a1',
	fillOpacity: 0.1
};

//drawControl.options.edit.selectedPathOptions
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function obrirMenuModal(_menuClass,estat,_from){
	objEdicio.obroModalFrom=_from;	
	jQuery('.modal').modal('hide');	
	jQuery(_menuClass).modal(estat);
}

function initCanvas(){
	addGeometryInitP(document.getElementById(canvas_pol.id));
	addGeometryInitP(document.getElementById(canvas_pol.id+"0"));
	addGeometryInitL(document.getElementById(canvas_linia.id));	
	addGeometryInitL(document.getElementById(canvas_linia.id+"0"));
	
    $('#colorpalette_pf').colorPalette().on('selectColor', function(e) {   	
    $('.fill_color_pol').css('background-color',e.color);
    $('.fill_color_pol').css('color',e.color);
    	canvas_pol.fillStyle="rgba("+hexToRgb(e.color).r+", "+hexToRgb(e.color).g+", "+hexToRgb(e.color).b+","+jQuery('#cmb_trans').val()+")";
    	addGeometryInitP(document.getElementById("cv_pol0"));
    });	
    
    $('#colorpalette_pl').colorPalette().on('selectColor', function(e) {   	
    $('.border_color_pol').css('border-color',e.color);
    	canvas_pol.strokeStyle=e.color;
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

	jQuery("#cmb_trans").on('change', function(e) { 
    	var color=rgb2hex($('.fill_color_pol').css('background-color'));
    	canvas_pol.opacity=jQuery(this).val();
    	canvas_pol.fillStyle="rgba("+hexToRgb(color).r+", "+hexToRgb(color).g+", "+hexToRgb(color).b+","+canvas_pol.opacity+")";
    	addGeometryInitP(document.getElementById("cv_pol0"));
    });
    
    jQuery("#cmb_gruix").on('change', function(e) { 
    	canvas_pol.lineWidth=jQuery(this).val();
    	addGeometryInitP(document.getElementById("cv_pol0"));
    });
    
    jQuery("#cmb_gruix_l").on('change', function(e) { 
    	canvas_linia.lineWidth=jQuery(this).val();
    	addGeometryInitL(document.getElementById("cv_linia0"));
    });
}

var hexDigits = new Array("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"); 

function rgb2hex(rgb) {
	rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)\)$/);
	return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

function hex(x) {
	return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
}

function addGeometryInitL(canvas){
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
	//cv_ctx_l.setLineDash([1,2]);
	cv_ctx_l.strokeStyle=canvas_linia.strokeStyle;
	cv_ctx_l.lineWidth=canvas_linia.lineWidth;
	cv_ctx_l.stroke(); 	
}

function addGeometryInitP(canvas){
	var	cv_ctx_p=canvas.getContext("2d");
	cv_ctx_p.clearRect(0, 0, canvas.width, canvas.height);
	cv_ctx_p.moveTo(5.13,15.82);
	cv_ctx_p.lineTo(25.49,5.13);
	cv_ctx_p.lineTo(37.08,13.16);
	cv_ctx_p.lineTo(20.66,38.01);
	cv_ctx_p.lineTo(2.06,33.67);
	cv_ctx_p.closePath();
	cv_ctx_p.strokeStyle=canvas_pol.strokeStyle;
	cv_ctx_p.fillStyle=canvas_pol.fillStyle;
	cv_ctx_p.lineWidth=canvas_pol.lineWidth;
	cv_ctx_p.fill();
	cv_ctx_p.stroke(); 
}

function addDrawToolbar() {
	initCanvas();
	
//	capaUsrPol = new L.FeatureGroup();
//	capaUsrPol.options = {
//		businessId : '-1',
//		nom : 'capaPol',
//		zIndex :  -1,
//		tipus : t_tematic,
//		geometryType: t_polygon
//
//	};
//
//	map.addLayer(capaUsrPol);

	var ptbl = L.Icon.extend({
		options : {
			shadowUrl : null,
			iconAnchor : new L.Point(14, 40),
			iconSize : new L.Point(28, 40)

		}
	});

	defaultPunt= L.AwesomeMarkers.icon(default_point_style);

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
			}
		},
		polygon : {
			allowIntersection : true, // Restricts shapes
			repeatMode:false,
			guidelineDistance : 2,
			shapeOptions : {
				color : '#FFC400',
				weight : 3,
				fillOpacity : 0.5,
				tipus: t_polygon
			}
		},
		 
		marker:{repeatMode:false,
			icon:L.icon({iconUrl:'/geocatweb/css/images/blank.gif'})
		},
		edit : false
	};
	drawControl = new L.Control.Draw(options);
	map.addControl(drawControl);
}

function showEditText(accio){
	jQuery('.search-edit').animate({
		height :accio
	});
}

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
		//showEditText('show');
		//objEdicio.esticEnEdicio=true;
	});
	
	map.on('click',function(e){
		if(crt_Editing){
			crt_Editing.disable();
		}

		if(objEdicio.esticEnEdicio){
			if(crt_Editing){
				crt_Editing.disable();
			}
			updateFeatureMove(objEdicio.featureID, crt_Editing._featureGroup._leaflet_id);			
			//featureActive.enable();	
		}
	});
	
	map.on('preclick',function(e){
		if(crt_Editing){
			crt_Editing.disable();
		}
	});
		
	map.on('draw:created', function(e) {
		var type = e.layerType, layer = e.layer;
		var totalFeature;
		var tipusCat,tipusCatDes;
	
		if (type === t_marker) {
			tipusCat=window.lang.convert('Titol Punt');
			tipusCatDes=window.lang.convert('Descripcio Punt');
			
			//Mira si és icona
			if(!defaultPunt.options.isCanvas){
				layer=L.marker([layer.getLatLng().lat,layer.getLatLng().lng],
					{icon: defaultPunt,isCanvas:defaultPunt.options.isCanvas,
					 tipus: t_marker}).addTo(map);
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
						
				).addTo(map);
			}
			
			if(capaUsrActiva != null && capaUsrActiva.options.geometryType != t_marker){
				capaUsrActiva.removeEventListener('layeradd');
				capaUsrActiva = new L.FeatureGroup();
				var index = parseInt(controlCapes._lastZIndex)+1;
				capaUsrActiva.options = {
					businessId : '-1',
					nom : 'capaPunts '+ index,
					zIndex :  -1,
					tipus : t_tematic,
					geometryType: t_marker
				};				
				map.addLayer(capaUsrActiva);
				capaUsrActiva.on('layeradd',objecteUserAdded);
				
			}else if(capaUsrActiva == null){
				capaUsrActiva = new L.FeatureGroup();
				var index = parseInt(controlCapes._lastZIndex)+1;
				capaUsrActiva.options = {
					businessId : '-1',
					nom : 'capaPunts '+ index,
					zIndex :  -1,
					tipus : t_tematic,
					geometryType: t_marker
				};
				map.addLayer(capaUsrActiva);
				capaUsrActiva.on('layeradd',objecteUserAdded);
			}
			
			layer.properties={'nom':tipusCat+' '+capaUsrActiva.getLayers().length,
					'text':tipusCatDes+' '+capaUsrActiva.getLayers().length,
					'capaNom':capaUsrActiva.options.nom,//TODO desactualitzat quan es canvii nom capa!
					'capaBusinessId':capaUsrActiva.options.businessId,
					'capaLeafletId': capaUsrActiva._leaflet_id,
					'tipusFeature':t_marker};			
			
			capaUsrActiva.addLayer(layer);
			
		} else if (type === t_polyline) {
			tipusCat=window.lang.convert('Titol Linia');
			tipusCatDes=window.lang.convert('Descripcio Linia');
			
			if(capaUsrActiva != null && capaUsrActiva.options.geometryType != t_polyline){
				capaUsrActiva.removeEventListener('layeradd');
				capaUsrActiva = new L.FeatureGroup();
				var index = parseInt(controlCapes._lastZIndex)+1;
				capaUsrActiva.options = {
					businessId : '-1',
					nom : 'capaLinea '+index,
					zIndex :  -1,
					tipus : t_tematic,
					geometryType: t_polyline

				};
				map.addLayer(capaUsrActiva);
				capaUsrActiva.on('layeradd',objecteUserAdded);
			}else if(capaUsrActiva == null){
				capaUsrActiva = new L.FeatureGroup();
				var index = parseInt(controlCapes._lastZIndex)+1;
				capaUsrActiva.options = {
					businessId : '-1',
					nom : 'capaLinea '+index,
					zIndex :  -1,
					tipus : t_tematic,
					geometryType: t_polyline

				};
				map.addLayer(capaUsrActiva);
				capaUsrActiva.on('layeradd',objecteUserAdded);
			}
			
			layer.properties={'nom':tipusCat+' '+capaUsrActiva.getLayers().length,
					'text':tipusCatDes+' '+capaUsrActiva.getLayers().length,
					'capaNom':capaUsrActiva.options.nom,//TODO desactualitzat quan es canvii nom capa!
					'capaBusinessId':capaUsrActiva.options.businessId,
					'capaLeafletId': capaUsrActiva._leaflet_id,
					'tipusFeature':t_polyline};			
			
			layer.addTo(map);
			capaUsrActiva.addLayer(layer);
			
		} else if (type === t_polygon) {
			tipusCat=window.lang.convert('Titol area');
			tipusCatDes=window.lang.convert('Descripcio area');	
			
			if(capaUsrActiva != null && capaUsrActiva.options.geometryType != t_polygon){
				capaUsrActiva.removeEventListener('layeradd');
				capaUsrActiva = new L.FeatureGroup();
				var index = parseInt(controlCapes._lastZIndex)+1;
				capaUsrActiva.options = {
					businessId : '-1',
					nom : 'capaPol '+index,
					zIndex :  -1,
					tipus : t_tematic,
					geometryType: t_polygon
				};
				map.addLayer(capaUsrActiva);				
				capaUsrActiva.on('layeradd',objecteUserAdded);
			}else if(capaUsrActiva == null){
				capaUsrActiva = new L.FeatureGroup();
				var index = parseInt(controlCapes._lastZIndex)+1;
				capaUsrActiva.options = {
					businessId : '-1',
					nom : 'capaPol '+index,
					zIndex :  -1,
					tipus : t_tematic,
					geometryType: t_polygon
				};
				map.addLayer(capaUsrActiva);
				capaUsrActiva.on('layeradd',objecteUserAdded);
			}
			layer.properties={'nom':tipusCat+' '+capaUsrActiva.getLayers().length,
					'text':tipusCatDes+' '+capaUsrActiva.getLayers().length,
					'capaNom':capaUsrActiva.options.nom,//TODO desactualitzat quan es canvii nom capa!
					'capaBusinessId':capaUsrActiva.options.businessId,
					'capaLeafletId': capaUsrActiva._leaflet_id,
					'tipusFeature':t_polygon};			
			
			layer.addTo(map);
			capaUsrActiva.addLayer(layer);			
		}
	});
	
}

function createPopupWindowVisor(player,type){
	
	var html='<div class="div_popup_visor">' 
		+'<div class="popup_pres">'							
		+'<div id="titol_pres_visor">'+player.properties.nom+'</div>'	
		+'<div id="des_pres_visor">'+player.properties.text+'</div>'	
		+'<div id="capa_pres_visor"><k>'+player.properties.capaNom+'</k></div>'
		+'</div></div>';
	
	player.bindPopup(html,{'offset':[0,-25]}).openPopup();	
	
}

function createPopupWindow(layer,type){
	//console.debug('createPopupWindow');
	
	var html = createPopUpContent(layer,type);
	layer.bindPopup(html,{'offset':[0,-25]}).openPopup();
	
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
			jQuery('#layer_accio').text(window.lang.convert('Canviar el nom de la capa'))
			jQuery('#capa_edit').val(jQuery('#cmbCapesUsr').val());
			modeLayerTextEdit();

		}else if(accio[0].indexOf("layer_add")!=-1){
			objEdicio.edicioPopup='nouCapa';
			jQuery('#layer_accio').text(window.lang.convert('Nom nova capa'))
			jQuery('#capa_edit').val("").attr('placeholder',window.lang.convert('Nova capa'));
			modeLayerTextEdit();
		}else{
			
		}
	});
	
	 jQuery(document).on('focus', ".bs-ncapa li select", function(e) {
		 $(this).data('cmbCapesUsr_old',$(this).val());
	 });	 
	 
	 jQuery(document).on('change', ".bs-ncapa li select", function(e) {
		    e.stopImmediatePropagation();
		    console.debug('on change select cmbusrcapa');
			var accio;
			if(jQuery(this).attr('id').indexOf('-')!=-1){			
				accio=jQuery(this).attr('id').split("-");				
			}
			objEdicio.featureID=accio[1];
			
			var toBusinessId = jQuery(this).val().split("#");
			var fromBusinessId = $(this).data('cmbCapesUsr_old').split("#");
			//Actualitzem valor antic
			$(this).data('cmbCapesUsr_old',$(this).val());
			
			objEdicio.featureID=accio[1];
			var obj = map._layers[objEdicio.featureID];
			
			//Accio de moure la feature a la nova capa tematic creada
			var data = {
					uid: $.cookie('uid'),
		            businessId: obj.properties.businessId, //businessId de la feature
		            fromBusinessId: fromBusinessId[0], //businessId del tematico de origen
		            toBusinessId: toBusinessId[0] //businessId del tematico de destino
		    }
			
			moveFeatureToTematic(data).then(function(results){
				if(results.status=='OK'){
					var toLayer = map._layers[''+toBusinessId[1]+''];
					var fromLayer = map._layers[''+fromBusinessId[1]+''];
					fromLayer.removeLayer(obj);
					toLayer.addLayer(obj);
					//Refresh de la capa
					controlCapes._map.removeLayer(toLayer);
					controlCapes._map.addLayer(toLayer);
					//Actualitzem capa activa
					capaUsrActiva.removeEventListener('layeradd');
					capaUsrActiva = toLayer;
					capaUsrActiva.on('layeradd',objecteUserAdded);	
					//Actualitzem properties de la layer
					obj.properties.capaBusinessId = capaUsrActiva.options.businessId;
					obj.properties.capaNom = capaUsrActiva.options.nom;
					obj.properties.capaLeafletId = capaUsrActiva._leaflet_id;
					//Actualitzem popup del marker
					var html = createPopUpContent(obj,obj.options.tipus);
					obj.setPopupContent(html);
					obj.openPopup();
					
					//update rangs
					getRangsFromLayer(capaUsrActiva);
					
				}else{
					console.debug("moveFeatureToTematic ERROR");
				}
			},function(results){
				console.debug("moveFeatureToTematic ERROR");
			});						
	 });
	 
	jQuery(document).on('click', ".bs-popup li a", function(e) {
		e.stopImmediatePropagation();
		var accio;
		if(jQuery(this).attr('id').indexOf('#')!=-1){			
			accio=jQuery(this).attr('id').split("#");				
		}
		objEdicio.featureID=accio[1];
		
		if(accio[0].indexOf("feature_edit")!=-1){

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
	            uid: $.cookie('uid')
	        };
			deleteFeature(data).then(function(results){
				if(results.status == 'OK'){
					console.debug("OK deletefeature");
					var capaLeafletId = map._layers[objEdicio.featureID].properties.capaLeafletId;
					map._layers[capaLeafletId].removeLayer(map._layers[objEdicio.featureID]);
					map.removeLayer(map._layers[objEdicio.featureID]);
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
			console.debug(objEdicio);
			var capaLeafletId = map._layers[objEdicio.featureID].properties.capaLeafletId;						
			//Actualitzem capa activa
			if (capaUsrActiva){
				capaUsrActiva.removeEventListener('layeradd');
			}
			capaUsrActiva = map._layers[capaLeafletId];
			
			
			var capaEdicio = new L.FeatureGroup();
			capaEdicio.addLayer(map._layers[objEdicio.featureID]);
			capaUsrActiva.removeLayer(map._layers[objEdicio.featureID]);
			map.addLayer(capaEdicio);
			
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
		
	//fi eventos popup
	
	layer.on('popupopen', function(e){
		//actualitzem popup
		jQuery('#cmbCapesUsr-'+layer._leaflet_id+'-'+layer.options.tipus+'').html(fillCmbCapesUsr(layer.options.tipus));
		if (layer.properties.nom){
			jQuery('#titol_pres').text(layer.properties.nom).append(' <i class="glyphicon glyphicon-pencil blau"></i>');
		}
		if (layer.properties.text){
			jQuery('#des_pres').text(layer.properties.text).append(' <i class="glyphicon glyphicon-pencil blau"></i>');
		}
	});
}

function finishAddFeatureToTematic(layer){
	//console.debug('finishAddFeatureToTematic');
	var type = layer.options.tipus;
	
	//Afegir capa edicio a control de capes en cas que sigui nova
	if (capaUsrActiva.toGeoJSON().features.length == 1) {
		//Actualitzeem zIndex abans d'afegir al control de capes
		capaUsrActiva.options.zIndex = controlCapes._lastZIndex+1; 								
		controlCapes.addOverlay(capaUsrActiva,	capaUsrActiva.options.nom, true);
		controlCapes._lastZIndex++;
//		capaUsrActiva.options.zIndex = controlCapes._lastZIndex;//+1; 
		//showEditText(layer);
		activaPanelCapes(true);
	}
		
	createPopupWindow(layer,type);	
}

function updateFeatureNameDescr(layer, titol, descr){
	//console.debug('updateFeatureNameDescr');
	layer.properties.nom=titol;
	layer.properties.text=descr;
	
	if (layer.properties.feature.properties){
		layer.properties.feature.properties.nom = titol;
		layer.properties.feature.properties.text = descr;
	}
		
	var feature = layer.toGeoJSON();
	feature.geometry = layer.properties.feature.geometry;
	if (layer.properties.feature.properties){	
		feature.properties = layer.properties.feature.properties;
	}else{
		feature.properties = layer.properties;
	}
    
	var features = JSON.stringify(feature);
	
    var data = {
		uid : jQuery.cookie('uid'),
		features : features,
		businessId: layer.properties.businessId
	};
    
    updateFeature(data).then(function(results){
    	if(results.status == 'OK'){
			jQuery('#titol_pres').text(titol).append(' <i class="glyphicon glyphicon-pencil blau"></i>');	
			jQuery('#des_pres').text(descr).append(' <i class="glyphicon glyphicon-pencil blau"></i>');
			jQuery('.popup_pres').show();
			jQuery('.popup_edit').hide();    		
    	}else{
    		console.debug("updateFeature ERROR");
    	}
    }, function(results){
    	console.debug("updateFeature ERROR");
    });
}

function updateFeatureMove(featureID, capaEdicioID){
    var layer = map._layers[featureID];
    var feature = layer.toGeoJSON();
    if (layer.properties.feature.properties){	
    	feature.properties = layer.properties.feature.properties;
    }else{
    	feature.properties = layer.properties;
    }
    feature.geometry = layer.properties.feature.geometry;      
        
    if(layer.properties.tipusFeature == t_marker){
        var newLatLng = layer.getLatLng();
        feature.geometry.coordinates[0] = newLatLng.lat;
        feature.geometry.coordinates[1] = newLatLng.lng;           
    }else{
	    var lcoordinates = [];
	    $.each(layer._latlngs, function(i,val) {
	    	lcoordinates.push([val.lat, val.lng]);
	    });              
	    if(layer.properties.tipusFeature == t_polyline){
	    	feature.geometry.coordinates = lcoordinates;
	    }else{
	    	lcoordinates.push(lcoordinates[0]);
	    	feature.geometry.coordinates[0] = lcoordinates;
	    }
    }
    
    var features = JSON.stringify(feature);
    
    var data = {
        uid : jQuery.cookie('uid'),
        features : features,
        businessId: layer.properties.businessId
    };
  
    updateFeature(data).then(function(results){
	    if(results.status == 'OK'){
	    	jQuery('.popup_pres').show();
	    	//jQuery('.popup_edit').hide();            
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

function fillCmbCapesUsr(type){
	var html = "";
	$.each( controlCapes._layers, function(i,val) {
		var layer = val.layer.options;
		if(layer.tipus==t_tematic && layer.geometryType==type){
	        html += "<option value=\"";
	        html += layer.businessId +"#"+val.layer._leaflet_id+"\"";
	        if(capaUsrActiva && (capaUsrActiva.options.businessId == layer.businessId)) html += " selected";
	        html += ">"+ layer.nom + "</option>";            		
		}
	});		
	return html;
}

function createPopUpContent(player,type){
	//console.debug("createPopUpContent");
	var html='<div class="div_popup">' 
	+'<div class="popup_pres">'							
	+'<div id="titol_pres">'+player.properties.nom+' <i class="glyphicon glyphicon-pencil blau"></i></div>'	
	+'<div id="des_pres">'+player.properties.text+' <i class="glyphicon glyphicon-pencil blau"></i></div>'	
	//+'<div id="capa_pres">'
	+'<ul class="bs-ncapa">'
		+'<li><span lang="ca" class="small">Capa actual: </span>'
			+'<select id="cmbCapesUsr-'+player._leaflet_id+'-'+type+'" data-leaflet_id='+player._leaflet_id+'>';
			html+= fillCmbCapesUsr(type);
			html+= '</select></li>'
		+'<li><a id="layer_edit#'+player._leaflet_id+'#'+type+'" lang="ca" title="Canviar el nom de la capa" href="#"><span class="glyphicon glyphicon-pencil blau12"></span></a></li>'
	+'<li><a id="layer_add#'+player._leaflet_id+'#'+type+'" lang="ca" title="Crear una nova capa" href="#"><span class="glyphicon glyphicon-plus verd12"></span></a></li>'
	+'</ul>'	
	//'</div>'	
	+'<div id="footer_edit"  class="modal-footer">'
	+'<ul class="bs-popup">'						
	+'<li><a id="feature_edit#'+player._leaflet_id+'#'+type+'" lang="ca" href="#">Estils<span class="glyphicon glyphicon-map-marker verd"></span></a>   </li>'
	+'<li><a id="feature_move#'+player._leaflet_id+'#'+type+'" lang="ca" href="#">Editar<span class="glyphicon glyphicon-move magenta"></span></a>   </li>'
	+'<li><a id="feature_remove#'+player._leaflet_id+'#'+type+'" lang="ca" href="#">Esborrar<span class="glyphicon glyphicon-trash vermell"></span></a>   </li>'													
	+'</ul>'														
	+'</div>'
	+'</div>'	
	+'<div class="popup_edit">'
	+'<div style="display:block" id="feature_txt">'
	+'<input class="form-control" id="titol_edit" type="text" value="'+player.properties.nom+'" placeholder="">'
	+'<textarea id="des_edit" class="form-control" rows="2">'+player.properties.text+'</textarea>'							
	+'</div>'	
	+'<div  style="display:block" id="capa_txt">'
	+'<div id="layer_accio"></div>'
	+'<input class="form-control" id="capa_edit" type="text" value="'+player.properties.capaGrup+'" placeholder="">'
	+'</div>'
	+'<div class="modal-footer">'
	+'<ul class="bs-popup">'
	+'<li><a id="feature_no#'+player._leaflet_id+'#'+type+'"  class="btn btn-default btn-xs">Cancel.lar</a></li>'			
	+'<li><a id="feature_ok#'+player._leaflet_id+'#'+type+'"  class="btn btn-success btn-xs">Acceptar</a></li>'								
	+'</ul>'														
	+'</div>'								
	+'</div>'								
	+'</div>';
	return html;
}

function generaNovaCapaUsuari(feature,nomNovaCapa){
	console.debug('generaNovaCapa');
	var data = {
        uid: $.cookie('uid'),
        description: jQuery('#des_edit').val(),
        nom: nomNovaCapa,
        geometryType: feature.options.tipus,
        publica: true,
        geomField: 'the_geom',
        idGeomField: 'nom',
        dataField: 'slotd1',
        idDataField: 'slotd1',
        mapBusinessId: url('?businessid')
    };
	//Creem nova capa tematic
	createTematicLayerEmpty(data).then(function(results){
			if(results.status==='OK'){
				console.debug("createTematicLayerEmpty OK");
				
				capaUsrActiva2= new L.FeatureGroup();
				capaUsrActiva2.options = {
					businessId : results.results.businessId,
					nom : nomNovaCapa,
					tipus: t_tematic,
					geometryType : feature.options.tipus
//					zIndex : controlCapes._lastZIndex//+1		
				};
				//Afegim nova capa al combo
				jQuery('#cmbCapesUsr-'+feature._leaflet_id+'-'+feature.options.tipus+'').append("<option selected value=\""+results.results.businessId+"\">"+nomNovaCapa+"</option>");	
				jQuery('.popup_pres').show();
				jQuery('.popup_edit').hide();
				
				map.addLayer(capaUsrActiva2);
				capaUsrActiva2.options.zIndex = controlCapes._lastZIndex+1;
				controlCapes.addOverlay(capaUsrActiva2,	capaUsrActiva2.options.nom, true);
				controlCapes._lastZIndex++;
				activaPanelCapes(true);
				
				//Accio de moure la feature a la nova capa tematic creada
				var data = {
					uid: $.cookie('uid'),
		            businessId: feature.properties.businessId, //businessId de la feature
		            fromBusinessId: capaUsrActiva.options.businessId, //businessId del tematico de origen
		            toBusinessId: capaUsrActiva2.options.businessId //businessId del tematico de destino
			    };
				
				moveFeatureToTematic(data).then(function(results){
						if(results.status=='OK'){
							console.debug("moveFeatureToTematic OK");
							capaUsrActiva.removeLayer(feature);
							capaUsrActiva2.addLayer(feature);//.on('layeradd', objecteUserAdded);
							//feature.openPopup();
							//Actualitzem capa activa
							capaUsrActiva.removeEventListener('layeradd');
							capaUsrActiva = capaUsrActiva2;//map._layers[capaUsrActiva2._leaflet_id];;
							capaUsrActiva.on('layeradd',objecteUserAdded);	
							//Actualitzem properties de la layer
							feature.properties.capaBusinessId = capaUsrActiva.options.businessId;
							feature.properties.capaNom = capaUsrActiva.options.nom;	
							feature.properties.capaLeafletId = capaUsrActiva._leaflet_id;
							//Actualitzem popup del marker
							var html = createPopUpContent(feature,feature.options.tipus);
							feature.setPopupContent(html);
							feature.openPopup();
							
							//update rangs
						    getRangsFromLayer(capaUsrActiva);
						    
						}else{
							console.debug("moveFeatureToTematic ERROR");
						}
					},function(results){
						console.debug("moveFeatureToTematic ERROR");
					});		
			}else{
				console.debug("createTematicLayerEmpty ERROR");
			}
		},function(results){
			console.debug("createTematicLayerEmpty ERROR");
		}
	);
}

function moveFeatureToLayer(feature_businessId,layer_fromBusinessId,layer_toBusinessId){
	var data = {
			uid: $.cookie('uid'),
            businessId: feature_businessId, //businessId de la feature
            fromBusinessId: layer_fromBusinessId, //businessId del tematico de origen
            toBusinessId: layer_toBusinessId //businessId del tematico de destino
        }				
		moveFeatureToTematic(data).then(function(results){
			if(results.status=='OK'){
				console.debug("moveFeatureToTematic OK");
				capaUsrActiva.removeLayer(feature);
				capaUsrActiva2.addLayer(feature);//.on('layeradd', objecteUserAdded);
				feature.openPopup();
				
				//update rangs
			    getRangsFromLayer(capaUsrActiva);
				
			}else{
				console.debug("moveFeatureToTematic ERROR");
			}
		},function(results){
			console.debug("moveFeatureToTematic ERROR");
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
	var txtDesc=jQuery('#des_pres').text();
	jQuery('#titol_edit').val(txtTitol);	
	jQuery('#des_edit').val(txtDesc);
	jQuery('.popup_pres').hide();
	jQuery('.popup_edit').show();	
}
